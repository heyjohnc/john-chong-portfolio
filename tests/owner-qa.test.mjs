import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { handleRequest } from "../api/ask.mjs";
import { recordAggregateTelemetry } from "../api/_lib/controls.mjs";
import { handleOwnerQaRevokeRequest, handleOwnerQaStatusRequest, ownerQaStatus, resetOwnerQaRevocationsForTest } from "../api/_lib/owner-qa.mjs";
import { issueOwnerQaToken } from "../presentation/_lib/owner-qa-token.mjs";
import { ownerQaTokenDigest, verifyOwnerQaToken } from "../api/_lib/owner-qa-token.mjs";
import { writeOwnerQaEnvFiles } from "../scripts/generate-owner-qa-keys.mjs";
import { createAskVpsHandler } from "../scripts/serve-bot14-ask-john.mjs";

const NOW = Date.UTC(2026, 8, 3, 14, 0, 0);
const keys = generateKeyPairSync("ed25519");
const privateKeyB64 = keys.privateKey.export({ format: "der", type: "pkcs8" }).toString("base64");
const publicKeyB64 = keys.publicKey.export({ format: "der", type: "spki" }).toString("base64");

function qaEnv(overrides = {}) {
  return {
    NODE_ENV: "test",
    ASK_JOHN_ENABLED: "true",
    ASK_JOHN_PROVIDER: "fixture",
    ASK_JOHN_CONTROL_MODE: "memory",
    ASK_JOHN_IP_HASH_SALT: "owner-qa-test",
    ASK_JOHN_REDIS_PREFIX: "ask-john-owner-qa-test",
    ASK_JOHN_PER_IP_LIMIT: "50",
    ASK_JOHN_DAILY_REQUEST_LIMIT: "100",
    ASK_JOHN_DAILY_BUDGET_USD: "10",
    ASK_JOHN_MAX_COST_PER_REQUEST_USD: "0.01",
    ASK_JOHN_ALLOWED_ORIGINS: "https://johnchong.info",
    ASK_JOHN_OWNER_QA_VERIFY_PUBLIC_KEY_B64: publicKeyB64,
    ...overrides
  };
}

function token(ttlSeconds = 3600, nowMs = NOW) {
  return issueOwnerQaToken({ privateKeyB64, nowMs, ttlSeconds, nonceFactory: () => "0123456789abcdefghijkl" }).token;
}

function tamperSignatureBytes(signed) {
  const [payload, signature] = signed.split(".");
  const index = signature.length - 2;
  const replacement = signature[index] === "A" ? "B" : "A";
  const changed = `${signature.slice(0, index)}${replacement}${signature.slice(index + 1)}`;
  assert.notEqual(changed, signature);
  assert.notDeepEqual(Buffer.from(changed, "base64url"), Buffer.from(signature, "base64url"));
  return `${payload}.${changed}`;
}

function equivalentNonCanonicalSignature(signed) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const [payload, signature] = signed.split(".");
  assert.equal(signature.length, 86);
  const lastIndex = alphabet.indexOf(signature.at(-1));
  assert.equal(lastIndex % 16, 0);
  const nonCanonical = `${signature.slice(0, -1)}${alphabet[lastIndex + 1]}`;
  assert.notEqual(nonCanonical, signature);
  assert.deepEqual(Buffer.from(nonCanonical, "base64url"), Buffer.from(signature, "base64url"));
  return `${payload}.${nonCanonical}`;
}

test("owner-only setup writes a matched key pair to protected files and refuses any residue", () => {
  const root = mkdtempSync(join(tmpdir(), "ask-owner-qa-keys-"));
  try {
    const directory = join(root, "fresh");
    const result = writeOwnerQaEnvFiles({ directory });
    assert.equal(statSync(directory).mode & 0o777, 0o700);
    assert.equal(statSync(result.presentation.path).mode & 0o777, 0o600);
    assert.equal(statSync(result.ask.path).mode & 0o777, 0o600);

    const privateKeyValue = readFileSync(result.presentation.path, "utf8")
      .match(/^PRESENTATION_OWNER_QA_SIGNING_PRIVATE_KEY_B64=([^\n]+)\n$/)?.[1];
    const publicKeyValue = readFileSync(result.ask.path, "utf8")
      .match(/^ASK_JOHN_OWNER_QA_VERIFY_PUBLIC_KEY_B64=([^\n]+)\n$/)?.[1];
    assert.ok(privateKeyValue);
    assert.ok(publicKeyValue);
    const issued = issueOwnerQaToken({
      privateKeyB64: privateKeyValue,
      nowMs: NOW,
      ttlSeconds: 300,
      nonceFactory: () => "0123456789abcdefghijkl"
    });
    assert.equal(verifyOwnerQaToken({ token: issued.token, publicKeyB64: publicKeyValue, nowMs: NOW }).valid, true);
    assert.throws(() => writeOwnerQaEnvFiles({ directory }), /file_exists_nothing_was_overwritten/);

    const residueDirectory = join(root, "residue");
    mkdirSync(residueDirectory, { mode: 0o700 });
    const residue = join(residueDirectory, "presentation.env");
    writeFileSync(residue, "residue-must-remain", { mode: 0o600 });
    assert.throws(() => writeOwnerQaEnvFiles({ directory: residueDirectory }), /file_exists_nothing_was_overwritten/);
    assert.equal(readFileSync(residue, "utf8"), "residue-must-remain");
    assert.equal(existsSync(join(residueDirectory, "ask.env")), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

async function withAskServer(options, run) {
  const server = http.createServer(createAskVpsHandler(options));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(origin);
  } finally {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
}

test("Ask classifies a valid signed capability as owner_qa and ordinary or forged requests as external", async () => {
  resetOwnerQaRevocationsForTest();
  const runtimeNow = Date.now();
  const signed = token(3600, runtimeNow);
  const status = await ownerQaStatus(signed, qaEnv(), runtimeNow);
  assert.equal(status.scope, "owner_qa");

  const ask = async (qaToken) => {
    const body = { question: "Hello", ...(qaToken ? { qa_token: qaToken } : {}) };
    const response = await handleRequest(new Request("https://ask.example/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.20" },
      body: JSON.stringify(body)
    }), qaEnv());
    return response.json();
  };
  assert.equal((await ask(signed)).request_scope, "owner_qa");
  assert.equal((await ask()).request_scope, "external");
  assert.equal((await ask(tamperSignatureBytes(signed))).request_scope, "external");
});

test("non-canonical signature text is rejected even when it decodes to the same Ed25519 bytes", () => {
  const signed = token();
  const equivalent = equivalentNonCanonicalSignature(signed);
  assert.equal(verifyOwnerQaToken({ token: signed, publicKeyB64, nowMs: NOW }).valid, true);
  assert.equal(verifyOwnerQaToken({ token: equivalent, publicKeyB64, nowMs: NOW }).valid, false);
});

test("a canonical revocation cannot be bypassed with equivalent non-canonical signature text", async () => {
  resetOwnerQaRevocationsForTest();
  const signed = token();
  const equivalent = equivalentNonCanonicalSignature(signed);
  assert.equal(ownerQaTokenDigest(equivalent), ownerQaTokenDigest(signed));
  const revoke = new Request("https://ask.example/api/owner-qa/revoke", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qa_token: signed })
  });
  assert.equal((await handleOwnerQaRevokeRequest(revoke, qaEnv(), NOW)).status, 200);
  assert.equal((await ownerQaStatus(signed, qaEnv(), NOW)).scope, "external");
  assert.equal((await ownerQaStatus(equivalent, qaEnv(), NOW)).scope, "external");
});

test("a valid signature over a non-canonical JSON representation is rejected", () => {
  const [payload] = token().split(".");
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  const reorderedJson = JSON.stringify({ aud: claims.aud, v: claims.v, iat: claims.iat, exp: claims.exp, nonce: claims.nonce });
  const reorderedPayload = Buffer.from(reorderedJson).toString("base64url");
  const signature = sign(null, Buffer.from(reorderedPayload), keys.privateKey).toString("base64url");
  assert.equal(verifyOwnerQaToken({ token: `${reorderedPayload}.${signature}`, publicKeyB64, nowMs: NOW }).valid, false);
});

test("QA status and revoke use a server-side digest and make the token inactive", async () => {
  resetOwnerQaRevocationsForTest();
  const signed = token();
  const request = (url) => new Request(url, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qa_token: signed })
  });
  const before = await (await handleOwnerQaStatusRequest(request("https://ask.example/api/owner-qa/status"), qaEnv(), NOW)).json();
  assert.equal(before.active, true);
  const revoked = await (await handleOwnerQaRevokeRequest(request("https://ask.example/api/owner-qa/revoke"), qaEnv(), NOW)).json();
  assert.deepEqual(revoked, { revoked: true, active: false });
  const after = await (await handleOwnerQaStatusRequest(request("https://ask.example/api/owner-qa/status"), qaEnv(), NOW)).json();
  assert.equal(after.active, false);
});

test("aggregate telemetry retains totals while splitting external and owner-QA daily and hourly fields", async () => {
  const originalFetch = globalThis.fetch;
  const commands = [];
  globalThis.fetch = async (_url, options) => {
    commands.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ result: 1 }) };
  };
  const env = {
    ASK_JOHN_CONTROL_MODE: "upstash",
    ASK_JOHN_REDIS_PREFIX: "ask-john-scope-test",
    UPSTASH_REDIS_REST_URL: "https://example.invalid",
    UPSTASH_REDIS_REST_TOKEN: "test-token"
  };
  try {
    for (const scope of ["external", "owner_qa"]) {
      await recordAggregateTelemetry({
        mode: "answer", language: "en", country: "HK", scope,
        corpusVersion: "test", env, now: new Date("2026-09-03T14:10:00.000Z")
      });
    }
    assert.equal(commands.length, 2);
    assert.equal(commands[0][8], "external");
    assert.equal(commands[1][8], "owner_qa");
    for (const command of commands) {
      assert.match(command[1], /'requests'/);
      assert.match(command[1], /ARGV\[5\] \.\. '_requests'/);
      assert.match(command[1], /hour:.*ARGV\[5\].*_requests/s);
      assert.match(command[1], /EXPIRE.*2592000/s);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("VPS QA endpoints enforce exact-origin CORS without credentials", async () => {
  resetOwnerQaRevocationsForTest();
  await withAskServer({ env: qaEnv() }, async (service) => {
    const allowed = await fetch(`${service}/api/owner-qa/status`, {
      method: "POST",
      headers: { Origin: "https://johnchong.info", "Content-Type": "application/json" },
      body: JSON.stringify({ qa_token: token(3600, Date.now()) })
    });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.headers.get("access-control-allow-origin"), "https://johnchong.info");
    assert.equal(allowed.headers.get("access-control-allow-credentials"), null);
    assert.equal((await allowed.json()).active, true);

    const preflight = await fetch(`${service}/api/owner-qa/revoke`, {
      method: "OPTIONS", headers: { Origin: "https://johnchong.info", "Access-Control-Request-Method": "POST" }
    });
    assert.equal(preflight.status, 204);
    assert.match(preflight.headers.get("access-control-allow-methods"), /POST/);

    const denied = await fetch(`${service}/api/owner-qa/status`, {
      method: "POST",
      headers: { Origin: "https://attacker.example", "Content-Type": "application/json" },
      body: JSON.stringify({ qa_token: token(3600, Date.now()) })
    });
    assert.equal(denied.status, 403);
    assert.equal(denied.headers.get("access-control-allow-origin"), null);
  });
});

test("browser integration carries only the signed marker and exposes a verified low-noise opt-out", async () => {
  const widget = await readFile(new URL("../ask-widget.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  const presentation = await readFile(new URL("../presentation/public/presentation.js", import.meta.url), "utf8");
  const askVerifier = await readFile(new URL("../api/_lib/owner-qa-token.mjs", import.meta.url), "utf8");
  const presentationIssuer = await readFile(new URL("../presentation/_lib/owner-qa-token.mjs", import.meta.url), "utf8");
  assert.match(widget, /john-chong-owner-qa-v1/);
  assert.match(widget, /\/api\/owner-qa\/status/);
  assert.match(widget, /\/api\/owner-qa\/revoke/);
  assert.match(widget, /qa_token: qaMarker\.qa_token/);
  assert.match(styles, /\.ask-widget-qa-status/);
  assert.match(presentation, /\.\/api\/owner-qa\/token/);
  assert.doesNotMatch(askVerifier, /createPrivateKey|\bsign\s*\(/);
  assert.doesNotMatch(presentationIssuer, /PRESENTATION_TOTP_SECRET|__Host-john_present/);
  assert.doesNotMatch(`${widget}\n${presentation}`, /fingerprint|hardware|device[_ -]?id|canvas\.toDataURL|navigator\.plugins/i);
});
