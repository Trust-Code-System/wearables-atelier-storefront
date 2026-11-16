import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { probeImageProxy } from "./outside-image-proxy.mjs";

// Invoked by the backend outside-attack suite while its isolated fixtures live.
// Cookies travel through the child process environment, never a checked-in file.
const fixture = JSON.parse(process.env.SECURITY_BROWSER_FIXTURE || "null");
assert.ok(fixture, "Run from test/security-outside.e2e-spec.ts");
const origin = new URL(process.env.SECURITY_STOREFRONT_URL);
assert.ok(["localhost", "127.0.0.1"].includes(origin.hostname));
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.SECURITY_PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({
  headless: true,
  ...(process.env.SECURITY_CHROMIUM_PATH
    ? { executablePath: process.env.SECURITY_CHROMIUM_PATH }
    : {}),
});
const results = [];
try {
  results.push(await probeImageProxy(origin.href));
  for (const actor of ["a", "b", "anonymous"]) {
    const context = await browser.newContext();
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      return ["localhost", "127.0.0.1"].includes(url.hostname)
        ? route.continue()
        : route.abort();
    });
    if (fixture[actor]?.cookie) {
      await context.addCookies(fixture[actor].cookie.split("; ").map((pair) => {
        const separator = pair.indexOf("=");
        return {
          name: pair.slice(0, separator),
          value: pair.slice(separator + 1),
          domain: origin.hostname,
          path: "/",
          httpOnly: true,
          sameSite: "Lax",
        };
      }));
    }
    const page = await context.newPage();
    let alerts = 0;
    page.on("dialog", async (dialog) => { alerts++; await dialog.dismiss(); });
    const response = await page.goto(new URL("/account", origin).href);
    assert.equal(response.status(), 200);
    if (actor === "a") {
      await page.getByText(fixture.payload, { exact: true }).first().waitFor();
      await page.getByText(fixture.addressMarker, { exact: false }).first().waitFor();
      assert.equal(await page.locator("img[onerror]").count(), 0);
    } else if (actor === "b") {
      await page.getByText("Outside group B", { exact: true }).first().waitFor();
    } else {
      await page.getByRole("heading", { name: "A little more you." }).waitFor();
    }
    const text = await page.locator("body").innerText();
    if (actor !== "a") {
      assert.equal(text.includes(fixture.payload), false);
      assert.equal(text.includes(fixture.addressMarker), false);
    }
    assert.equal(alerts, 0);
    results.push({ actor, pageStatus: response.status(), payloadVisible: text.includes(fixture.payload), alerts });
    if (process.env.SECURITY_SCREENSHOT_DIR) {
      await mkdir(process.env.SECURITY_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.SECURITY_SCREENSHOT_DIR, `outside-${actor}.png`), fullPage: true });
    }
    await context.close();
  }
  // Sanity check: the same browser detects event-handler execution when HTML is
  // deliberately interpreted in a throwaway local document. This is a harness
  // control, not a claim that application protection was disabled.
  const control = await browser.newPage();
  let controlAlerts = 0;
  control.on("dialog", async (dialog) => { controlAlerts++; await dialog.dismiss(); });
  await control.setContent(fixture.payload);
  await control.waitForFunction(() => document.querySelector("img")?.complete);
  assert.equal(controlAlerts, 1);
  console.log(JSON.stringify({ browser: results, harnessControlAlerts: controlAlerts }));
} finally {
  await browser.close();
}
