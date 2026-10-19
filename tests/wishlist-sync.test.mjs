import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import test from "node:test";
import ts from "typescript";
const compile = (name) =>
  ts.transpileModule(
    readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
const data = (code) =>
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const config = data(compile("api-config"));
const account = data(
  compile("account-api").replace('"./api-config"', JSON.stringify(config)),
);
const api = data(
  compile("wishlist-api").replace('"./api-config"', JSON.stringify(config)),
);
const { WishlistSync, GUEST_WISHLIST } = await import(
  data(
    compile("wishlist-sync")
      .replace('"./account-api"', JSON.stringify(account))
      .replace('"./wishlist-api"', JSON.stringify(api)),
  )
);
const { wishlistRequest } = await import(api);
const { accountAction } = await import(account);
const a = randomUUID(),
  b = randomUUID(),
  c = randomUUID();
function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}
function setup() {
  const local = storage(),
    db = new Map(),
    receipts = new Map(),
    calls = [];
  let user = null,
    failAfterCommit = false;
  const view = (id) => ({
    data: [...(db.get(id) ?? [])].map((productId) => ({
      productId,
      available: true,
      createdAt: new Date().toISOString(),
    })),
    meta: { total: db.get(id)?.size ?? 0, limit: 200 },
  });
  const deps = {
    storage: () => local,
    randomId: randomUUID,
    session: async () =>
      user
        ? {
            user: {
              id: user,
              name: "Customer",
              email: "customer@example.test",
            },
          }
        : null,
    request: async (id, method = "GET", path = "", body = {}, key) => {
      calls.push({ id, method, path, body, key });
      if (id !== user) throw new Error("Account changed");
      const saved = db.get(id) ?? new Set();
      db.set(id, saved);
      if (method === "POST") {
        const receiptKey = id + key;
        if (!receipts.has(receiptKey)) {
          for (const value of body.productIds) saved.add(value);
          receipts.set(receiptKey, [...body.productIds]);
        }
        if (failAfterCommit) {
          failAfterCommit = false;
          throw new Error("Lost response");
        }
        return {
          ...view(id),
          acceptedProductIds: receipts.get(receiptKey),
          skippedProductIds: [],
        };
      }
      if (method === "PUT") saved.add(path.split("/").at(-1));
      if (method === "DELETE") saved.delete(path.split("/").at(-1));
      return view(id);
    },
  };
  return {
    deps,
    local,
    db,
    calls,
    receipts,
    setUser: (id) => {
      user = id;
    },
    failNext: () => {
      failAfterCommit = true;
    },
  };
}
test("guest favourites persist in the browser without account database writes", async () => {
  const f = setup(),
    one = new WishlistSync(f.deps);
  assert.equal(await one.refresh(), true);
  assert.equal(await one.toggle(a), true);
  assert.deepEqual(JSON.parse(f.local.getItem(GUEST_WISHLIST)), [a]);
  assert.equal(f.calls.length, 0);
  const reload = new WishlistSync(f.deps);
  await reload.refresh();
  assert.deepEqual(reload.getSnapshot().ids, [a]);
});
test("signup/login unions local favourites with account items and clears only after acknowledgement", async () => {
  const f = setup();
  f.local.setItem(GUEST_WISHLIST, JSON.stringify([a, b]));
  f.db.set("account", new Set([b, c]));
  const sync = new WishlistSync(f.deps);
  await sync.refresh();
  f.setUser("account");
  await sync.accountChanged();
  assert.deepEqual(new Set(sync.getSnapshot().ids), new Set([a, b, c]));
  assert.equal(f.receipts.size, 1);
  assert.deepEqual(JSON.parse(f.local.getItem(GUEST_WISHLIST)), []);
  f.setUser(null);
  await sync.accountChanged();
  assert.deepEqual(sync.getSnapshot().ids, []);
  assert.equal(sync.getSnapshot().mode, "guest");
  assert.ok(!f.local.getItem(GUEST_WISHLIST).includes(c));
});
test("two devices load the same database list and see additions/removals on refresh", async () => {
  const f = setup();
  f.setUser("account");
  const first = new WishlistSync(f.deps);
  const second = new WishlistSync({ ...f.deps, storage: () => storage() });
  await first.refresh();
  await first.toggle(a);
  await second.refresh();
  assert.deepEqual(second.getSnapshot().ids, [a]);
  await second.toggle(a);
  await first.refresh();
  assert.deepEqual(first.getSnapshot().ids, []);
});
test("failed imports preserve guest storage and the exact key; retry cannot resurrect a later cross-device removal", async () => {
  const f = setup();
  f.setUser("account");
  f.local.setItem(GUEST_WISHLIST, JSON.stringify([a, b]));
  f.failNext();
  const sync = new WishlistSync(f.deps);
  assert.equal(await sync.refresh(), false);
  assert.deepEqual(JSON.parse(f.local.getItem(GUEST_WISHLIST)), [a, b]);
  const pending = JSON.parse(f.local.getItem("wa:wishlist-import:account"));
  // Simulates removing an already imported product on another device before retry.
  f.db.get("account").delete(a);
  assert.equal(await sync.refresh(), true);
  assert.deepEqual(sync.getSnapshot().ids, [b]);
  const imports = f.calls.filter((call) => call.method === "POST");
  assert.equal(imports[0].key, pending.key);
  assert.equal(imports[1].key, pending.key);
  assert.deepEqual(JSON.parse(f.local.getItem(GUEST_WISHLIST)), []);
});
test("new guest additions in another tab survive acknowledgement of an older import snapshot", async () => {
  const f = setup();
  f.setUser("account");
  f.local.setItem(GUEST_WISHLIST, JSON.stringify([a]));
  const request = f.deps.request;
  f.deps.request = async (...args) => {
    const result = await request(...args);
    if (args[1] === "POST")
      f.local.setItem(GUEST_WISHLIST, JSON.stringify([a, b]));
    return result;
  };
  const sync = new WishlistSync(f.deps);
  await sync.refresh();
  assert.deepEqual(JSON.parse(f.local.getItem(GUEST_WISHLIST)), [b]);
});
test("account switch hides old private state and prevents a stale click writing to the new account", async () => {
  const f = setup();
  f.setUser("A");
  f.db.set("A", new Set([a]));
  f.db.set("B", new Set([b]));
  const sync = new WishlistSync(f.deps);
  await sync.refresh();
  f.setUser("B");
  assert.equal(await sync.toggle(a), false);
  assert.deepEqual([...f.db.get("B")], [b]);
  await sync.accountChanged();
  assert.deepEqual(sync.getSnapshot().ids, [b]);
  f.setUser(null);
  await sync.accountChanged();
  assert.deepEqual(sync.getSnapshot().ids, []);
});
test("delayed old-account reads cannot republish private favourites after an auth change", async () => {
  const f = setup();
  f.setUser("A");
  f.db.set("A", new Set([a]));
  f.db.set("B", new Set([b]));
  let release, started;
  const gate = new Promise((resolve) => {
      release = resolve;
    }),
    called = new Promise((resolve) => {
      started = resolve;
    });
  const original = f.deps.request;
  f.deps.request = async (...args) => {
    const result = await original(...args);
    if (args[0] === "A") {
      started();
      await gate;
    }
    return result;
  };
  const sync = new WishlistSync(f.deps);
  const old = sync.refresh();
  await called;
  f.setUser("B");
  const next = sync.accountChanged();
  const snapshots = [];
  sync.subscribe(() => snapshots.push(sync.getSnapshot()));
  release();
  await old;
  await next;
  assert.ok(snapshots.every((value) => !value.ids.includes(a)));
  assert.deepEqual(sync.getSnapshot().ids, [b]);
});
test("wishlist transport binds account precondition, cookie credentials and import key without exposing provider diagnostics", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
  const original = globalThis.fetch;
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return Response.json({
      data: [],
      meta: { total: 0, limit: 200 },
      acceptedProductIds: [a],
      skippedProductIds: [],
    });
  };
  try {
    await wishlistRequest("account", "POST", "/merge", { productIds: [a] }, b);
    assert.equal(captured.options.credentials, "include");
    assert.equal(captured.options.cache, "no-store");
    assert.equal(captured.options.headers["X-Wishlist-Account"], "account");
    assert.equal(captured.options.headers["Idempotency-Key"], b);
    assert.deepEqual(JSON.parse(captured.options.body), { productIds: [a] });
    globalThis.fetch = async () =>
      Response.json({ message: "private diagnostics" }, { status: 401 });
    await assert.rejects(wishlistRequest("account"), /sign in again/);
  } finally {
    globalThis.fetch = original;
  }
});
test("auth forms send credentials only to Better Auth with cookies and announce successful account changes", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
  const fetch = globalThis.fetch,
    win = globalThis.window;
  let captured,
    events = 0;
  globalThis.window = new EventTarget();
  window.addEventListener("wearables:account-changed", () => events++);
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return Response.json({});
  };
  try {
    await accountAction("sign-in/email", {
      email: "buyer@example.test",
      password: "not-a-real-password",
    });
    assert.equal(
      captured.url,
      "https://api.example.test/api/auth/sign-in/email",
    );
    assert.equal(captured.options.credentials, "include");
    assert.equal(events, 1);
    globalThis.fetch = async () =>
      Response.json({ message: "private diagnostics" }, { status: 400 });
    await assert.rejects(
      accountAction("sign-in/email", {}),
      /Check your email and password/,
    );
    assert.equal(events, 1);
  } finally {
    globalThis.fetch = fetch;
    globalThis.window = win;
  }
});
test("a failed capacity-limited import keeps the account list editable so the buyer can free space and retry", async () => {
  const f = setup();
  f.setUser("account");
  f.db.set("account", new Set([a]));
  f.local.setItem(GUEST_WISHLIST, JSON.stringify([b]));
  const original = f.deps.request;
  f.deps.request = async (...args) => {
    if (args[1] === "POST" && f.db.get("account").has(a))
      throw new Error("Wishlist limit reached");
    return original(...args);
  };
  const sync = new WishlistSync(f.deps);
  assert.equal(await sync.refresh(), false);
  assert.equal(sync.getSnapshot().mode, "account");
  assert.deepEqual(sync.getSnapshot().ids, [a]);
  assert.deepEqual(JSON.parse(f.local.getItem(GUEST_WISHLIST)), [b]);
  assert.equal(await sync.toggle(a), true);
  assert.equal(await sync.refresh(), true);
  assert.deepEqual(sync.getSnapshot().ids, [b]);
  assert.deepEqual(JSON.parse(f.local.getItem(GUEST_WISHLIST)), []);
});
