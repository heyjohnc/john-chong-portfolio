import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createPresentationHandler } from "../presentation/app.mjs";
import { MemoryPresentationStore } from "../presentation/_lib/store.mjs";
import { encodeBase32, totpAt, verifyTotp } from "../presentation/_lib/totp.mjs";

const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
const TEST_SECRET = encodeBase32(Buffer.from("presentation-test-key"));
const TEST_TIME = Date.UTC(2026, 8, 3, 12, 0, 0);

function env(overrides = {}) {
  return {
    NODE_ENV: "test",
    PRESENTATION_ENABLED: "true",
    PRESENTATION_TOTP_SECRET: TEST_SECRET,
    PRESENTATION_IP_HASH_SALT: "test-ip-salt",
    PRESENTATION_ALLOWED_ORIGINS: "https://johnchong.info",
    PRESENTATION_ATTEMPT_LIMIT: "5",
    PRESENTATION_GLOBAL_ATTEMPT_LIMIT: "30",
    ...overrides
  };
}

async function withServer(options, run) {
  const server = http.createServer(createPresentationHandler(options));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(origin);
  } finally {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
}

async function auth(origin, code, cookie = "") {
  return fetch(`${origin}/api/auth/totp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://johnchong.info", Cookie: cookie },
    body: JSON.stringify({ code })
  });
}

test("TOTP implementation matches the RFC 6238 SHA-1 vector", () => {
  assert.equal(totpAt(RFC_SECRET, 59_000, { digits: 8 }), "94287082");
  assert.equal(verifyTotp("94287082", RFC_SECRET, 59_000, { digits: 8, window: 0 }), 1);
});

test("public shell contains no protected manifest or asset", async () => {
  const html = await readFile(new URL("../presentation/public/index.html", import.meta.url), "utf8");
  const script = await readFile(new URL("../presentation/public/presentation.js", import.meta.url), "utf8");
  assert.match(html, /Authenticator code/);
  assert.match(html, /rel="icon" href="\.\/favicon\.ico"/);
  assert.doesNotMatch(`${html}\n${script}`, /PRESENTATION_TOTP_SECRET|manifest\.json|private[_ -]?key/i);
});

test("every public page exposes one restrained presentation entry and Vercel keeps it server-backed", async () => {
  for (const page of ["index.html", "projects.html", "about.html", "fightgame.html", "niulai.html"]) {
    const html = await readFile(new URL(`../${page}`, import.meta.url), "utf8");
    assert.equal((html.match(/href="\/presentation\/"/g) || []).length, 1, `${page} presentation entry`);
  }
  const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.deepEqual(vercel.rewrites, [
    { source: "/presentation", destination: "https://present-john.37.187.136.100.sslip.io/" },
    { source: "/presentation/", destination: "https://present-john.37.187.136.100.sslip.io/" },
    { source: "/presentation/:path*", destination: "https://present-john.37.187.136.100.sslip.io/:path*" }
  ]);
});

test("protected routes require a valid server session", async () => {
  const store = new MemoryPresentationStore();
  await withServer({ env: env(), store, now: () => TEST_TIME, tokenFactory: () => "fixed-session-token" }, async (origin) => {
    assert.equal((await fetch(`${origin}/api/manifest`)).status, 401);
    const response = await auth(origin, totpAt(TEST_SECRET, TEST_TIME));
    assert.equal(response.status, 200);
    const cookie = response.headers.get("set-cookie");
    assert.match(cookie, /__Host-john_present=fixed-session-token/);
    assert.match(cookie, /HttpOnly; Secure; SameSite=Strict; Path=\/; Max-Age=1800/);
    const manifest = await fetch(`${origin}/api/manifest`, { headers: { Cookie: cookie.split(";")[0] } });
    assert.equal(manifest.status, 200);
    assert.equal((await manifest.json()).status, "ready-for-content");
  });
});

test("an enrolled service with an empty private content directory returns the protected placeholder", async () => {
  const store = new MemoryPresentationStore();
  const missingContentDir = `/tmp/john-presentation-missing-${process.pid}`;
  await withServer({ env: env({ PRESENTATION_CONTENT_DIR: missingContentDir }), store, now: () => TEST_TIME, tokenFactory: () => "empty-content-token" }, async (origin) => {
    const response = await auth(origin, totpAt(TEST_SECRET, TEST_TIME));
    const cookie = response.headers.get("set-cookie").split(";")[0];
    const manifest = await fetch(`${origin}/api/manifest`, { headers: { Cookie: cookie } });
    assert.equal(manifest.status, 200);
    assert.equal((await manifest.json()).status, "ready-for-content");
  });
});

test("accepted TOTP steps cannot be replayed", async () => {
  const store = new MemoryPresentationStore();
  await withServer({ env: env(), store, now: () => TEST_TIME }, async (origin) => {
    const code = totpAt(TEST_SECRET, TEST_TIME);
    assert.equal((await auth(origin, code)).status, 200);
    assert.equal((await auth(origin, code)).status, 401);
  });
});

test("attempt limits reject repeated guesses", async () => {
  const store = new MemoryPresentationStore();
  await withServer({ env: env({ PRESENTATION_ATTEMPT_LIMIT: "2" }), store, now: () => TEST_TIME }, async (origin) => {
    assert.equal((await auth(origin, "000000")).status, 401);
    assert.equal((await auth(origin, "000001")).status, 401);
    assert.equal((await auth(origin, "000002")).status, 429);
  });
});

test("logout revokes the server-side session", async () => {
  const store = new MemoryPresentationStore();
  await withServer({ env: env(), store, now: () => TEST_TIME, tokenFactory: () => "revoked-token" }, async (origin) => {
    const login = await auth(origin, totpAt(TEST_SECRET, TEST_TIME));
    const cookie = login.headers.get("set-cookie").split(";")[0];
    assert.equal((await fetch(`${origin}/api/manifest`, { headers: { Cookie: cookie } })).status, 200);
    const logout = await fetch(`${origin}/api/logout`, { method: "POST", headers: { Origin: "https://johnchong.info", Cookie: cookie } });
    assert.equal(logout.status, 200);
    assert.equal((await fetch(`${origin}/api/manifest`, { headers: { Cookie: cookie } })).status, 401);
  });
});

test("disabled or incomplete production configuration fails closed", async () => {
  for (const config of [env({ PRESENTATION_ENABLED: "false" }), env({ PRESENTATION_TOTP_SECRET: "" })]) {
    await withServer({ env: config, store: new MemoryPresentationStore() }, async (origin) => {
      assert.equal((await fetch(`${origin}/api/session`)).status, 503);
      assert.equal((await auth(origin, "123456")).status, 503);
    });
  }
});

test("asset route rejects unauthenticated and traversal-shaped requests", async () => {
  await withServer({ env: env(), store: new MemoryPresentationStore() }, async (origin) => {
    assert.equal((await fetch(`${origin}/asset/example`)).status, 401);
    assert.equal((await fetch(`${origin}/asset/..%2Fsecret`)).status, 404);
  });
});
