import { createHash, createPublicKey, verify } from "node:crypto";

const OWNER_QA_AUDIENCE = "ask-john-owner-qa";
const OWNER_QA_MAX_TTL_SECONDS = 30 * 24 * 60 * 60;

function decodeBase64urlJson(value) {
  if (!/^[A-Za-z0-9_-]{1,768}$/.test(value)) throw new Error("invalid_token");
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function publicKey(value) {
  if (!value) throw new Error("missing_verification_key");
  return createPublicKey({ key: Buffer.from(value, "base64"), format: "der", type: "spki" });
}

export function ownerQaTokenDigest(token) {
  return createHash("sha256").update(String(token || "")).digest("hex");
}

export function verifyOwnerQaToken({ token, publicKeyB64, nowMs = Date.now() }) {
  try {
    if (typeof token !== "string" || token.length < 80 || token.length > 1024) return { valid: false, reason: "invalid" };
    const parts = token.split(".");
    if (parts.length !== 2 || !/^[A-Za-z0-9_-]{80,100}$/.test(parts[1])) return { valid: false, reason: "invalid" };
    const payload = decodeBase64urlJson(parts[0]);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { valid: false, reason: "invalid" };
    if (Object.keys(payload).sort().join(",") !== "aud,exp,iat,nonce,v") return { valid: false, reason: "invalid" };
    if (payload.v !== 1 || payload.aud !== OWNER_QA_AUDIENCE) return { valid: false, reason: "invalid" };
    if (!Number.isInteger(payload.iat) || !Number.isInteger(payload.exp) || payload.exp <= payload.iat) return { valid: false, reason: "invalid" };
    if (payload.exp - payload.iat > OWNER_QA_MAX_TTL_SECONDS) return { valid: false, reason: "invalid" };
    if (!/^[A-Za-z0-9_-]{22}$/.test(payload.nonce || "")) return { valid: false, reason: "invalid" };
    const now = Math.floor(nowMs / 1000);
    if (payload.iat > now + 60) return { valid: false, reason: "not_yet_valid" };
    if (payload.exp <= now) return { valid: false, reason: "expired" };
    if (!verify(null, Buffer.from(parts[0]), publicKey(publicKeyB64), Buffer.from(parts[1], "base64url"))) return { valid: false, reason: "invalid" };
    return { valid: true, expiresAt: payload.exp * 1000, digest: ownerQaTokenDigest(token) };
  } catch (_) {
    return { valid: false, reason: "invalid" };
  }
}
