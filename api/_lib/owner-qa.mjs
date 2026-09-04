import { verifyOwnerQaToken } from "./owner-qa-token.mjs";
import { controlConfig, localRedisCommand, upstashCommand } from "./controls.mjs";

const memoryRevocations = globalThis.__askJohnOwnerQaRevocations || new Map();
globalThis.__askJohnOwnerQaRevocations = memoryRevocations;

function verificationKey(env) {
  return env.ASK_JOHN_OWNER_QA_VERIFY_PUBLIC_KEY_B64 || "";
}

function revocationKey(digest, env) {
  return `${controlConfig(env).keyPrefix}:owner-qa-revoked:${digest}`;
}

function pruneMemory(nowMs) {
  for (const [key, expiresAt] of memoryRevocations) if (expiresAt <= nowMs) memoryRevocations.delete(key);
}

async function revoked(digest, env, nowMs) {
  const mode = controlConfig(env).storeMode;
  const key = revocationKey(digest, env);
  if (mode === "memory") {
    pruneMemory(nowMs);
    return memoryRevocations.has(key);
  }
  const command = mode === "redis" ? localRedisCommand : upstashCommand;
  return (await command(["GET", key], env)) === "1";
}

async function persistRevocation(digest, expiresAt, env, nowMs) {
  const ttl = Math.max(1, Math.ceil((expiresAt - nowMs) / 1000));
  const mode = controlConfig(env).storeMode;
  const key = revocationKey(digest, env);
  if (mode === "memory") {
    if (env.NODE_ENV === "production") throw new Error("In-memory revocation is forbidden in production.");
    memoryRevocations.set(key, nowMs + ttl * 1000);
    return;
  }
  const command = mode === "redis" ? localRedisCommand : upstashCommand;
  const result = await command(["SET", key, "1", "EX", String(ttl)], env);
  if (result !== "OK") throw new Error("Unable to persist QA revocation.");
}

export async function ownerQaStatus(token, env = process.env, nowMs = Date.now()) {
  const verified = verifyOwnerQaToken({ token, publicKeyB64: verificationKey(env), nowMs });
  if (!verified.valid) return { active: false, scope: "external", reason: verified.reason };
  try {
    if (await revoked(verified.digest, env, nowMs)) return { active: false, scope: "external", reason: "revoked" };
    return { active: true, scope: "owner_qa", expiresAt: verified.expiresAt };
  } catch (_) {
    return { active: false, scope: "external", reason: "verification_store_unavailable" };
  }
}

export async function revokeOwnerQaToken(token, env = process.env, nowMs = Date.now()) {
  const verified = verifyOwnerQaToken({ token, publicKeyB64: verificationKey(env), nowMs });
  if (!verified.valid) return { revoked: true, active: false };
  await persistRevocation(verified.digest, verified.expiresAt, env, nowMs);
  return { revoked: true, active: false };
}

function json(status, payload) {
  return Response.json(payload, { status, headers: { "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff" } });
}

async function tokenBody(request) {
  if (request.method !== "POST") return null;
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) return null;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || typeof body.qa_token !== "string" || body.qa_token.length > 1024) return null;
  return body.qa_token;
}

export async function handleOwnerQaStatusRequest(request, env = process.env, nowMs = Date.now()) {
  const token = await tokenBody(request);
  if (token === null) return json(request.method === "POST" ? 400 : 405, { active: false });
  const status = await ownerQaStatus(token, env, nowMs);
  return json(200, { active: status.active, ...(status.active ? { expires_at: new Date(status.expiresAt).toISOString() } : {}) });
}

export async function handleOwnerQaRevokeRequest(request, env = process.env, nowMs = Date.now()) {
  const token = await tokenBody(request);
  if (token === null) return json(request.method === "POST" ? 400 : 405, { revoked: false, active: false });
  try {
    return json(200, await revokeOwnerQaToken(token, env, nowMs));
  } catch (_) {
    return json(503, { revoked: false, active: true });
  }
}

export function resetOwnerQaRevocationsForTest() {
  memoryRevocations.clear();
}
