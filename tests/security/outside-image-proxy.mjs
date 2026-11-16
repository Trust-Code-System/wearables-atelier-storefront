import assert from "node:assert/strict";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

export async function probeImageProxy(origin) {
  assert.ok(["localhost", "127.0.0.1"].includes(new URL(origin).hostname));
  let sentinelHits = 0;
  const sentinel = createServer((_req, res) => {
    sentinelHits++;
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end("disposable-loopback-sentinel");
  });
  await new Promise((resolve) => sentinel.listen(0, resolve));
  try {
    const target = `http://localhost:${sentinel.address().port}/ssrf-probe.png`;
    await fetch(target);
    assert.equal(sentinelHits, 1);
    sentinelHits = 0;
    const probe = new URL("/_next/image", origin);
    probe.searchParams.set("url", target);
    probe.searchParams.set("w", "64");
    probe.searchParams.set("q", "75");
    const response = await fetch(probe);
    const body = await response.text();
    assert.equal(response.status, 400);
    assert.match(body, /not allowed/);
    assert.equal(sentinelHits, 0);
    return { attack: 11, target: "disposable localhost sentinel", status: response.status, response: body, sentinelHits, sentinelPositiveControlHits: 1, metadataLeg: "not run; server egress isolation unavailable" };
  } finally {
    await new Promise((resolve, reject) => sentinel.close((error) => error ? reject(error) : resolve()));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await probeImageProxy(process.env.SECURITY_STOREFRONT_URL)));
}
