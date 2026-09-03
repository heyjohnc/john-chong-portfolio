import { createHash, createPublicKey, verify } from "node:crypto";

const OWNER_QA_AUDIENCE = "ask-john-owner-qa";
const OWNER_QA_MAX_TTL_SECONDS = 30 * 24 * 60 * 60;

function decodeCanonicalBase64url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("invalid_token");
  const decoded = Buffer.from(value, "base64url");
  if (decoded.toString("base64url") !== value) throw new Error("invalid_token");
  return decoded;
}

function publicKey(value) {
  if (!value) throw new Error("missing_verification_key");
  return createPublicKey({ key: Buffer.from(value, "base64"), format: "der", type: "spki" });
}

export function ownerQaTokenDigest(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2 || !parts[0]) throw new Error("invalid_token");
  return createHash("sha256").update(parts[0]).digest("hex");
}

export function verifyOwnerQaToken({ token, publicKeyB64, nowMs = Date.now() }) {
  try {
    if (typeof token !== "string" || token.length < 80 || token.length > 1024) return { valid: false, reason: "invalid" };
    const parts = token.split(".");
    if (parts.length !== 2 || !/^[A-Za-z0-9_-]{80,512}$/.test(parts[0]) || !/^[A-Za-z0-9_-]{86}$/.test(parts[1])) return { valid: false, reason: "invalid" };
    const signature = decodeCanonicalBase64url(parts[1]);
    if (signature.length !== 64) return { valid: false, reason: "invalid" };
    const payloadBytes = decodeCanonicalBase64url(parts[0]);
    if (payloadBytes.length < 60 || payloadBytes.length > 384) return { valid: false, reason: "invalid" };
    if (!verify(null, Buffer.from(parts[0]), publicKey(publicKeyB64), signature)) return { valid: false, reason: "invalid" };
    const payload = JSON.parse(payloadBytes.toString("utf8"));
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { valid: false, reason: "invalid" };
    if (Object.keys(payload).sort().join(",") !== "aud,exp,iat,nonce,v") return { valid: false, reason: "invalid" };
    const canonicalPayload = JSON.stringify({ v: payload.v, aud: payload.aud, iat: payload.iat, exp: payload.exp, nonce: payload.nonce });
    if (payloadBytes.toString("utf8") !== canonicalPayload) return { valid: false, reason: "invalid" };
    if (payload.v !== 1 || payload.aud !== OWNER_QA_AUDIENCE) return { valid: false, reason: "invalid" };
    if (!Number.isInteger(payload.iat) || !Number.isInteger(payload.exp) || payload.exp <= payload.iat) return { valid: false, reason: "invalid" };
    if (payload.exp - payload.iat > OWNER_QA_MAX_TTL_SECONDS) return { valid: false, reason: "invalid" };
    if (!/^[A-Za-z0-9_-]{22}$/.test(payload.nonce || "")) return { valid: false, reason: "invalid" };
    const now = Math.floor(nowMs / 1000);
    if (payload.iat > now + 60) return { valid: false, reason: "not_yet_valid" };
    if (payload.exp <= now) return { valid: false, reason: "expired" };
    return { valid: true, expiresAt: payload.exp * 1000, digest: ownerQaTokenDigest(token) };
  } catch (_) {
    return { valid: false, reason: "invalid" };
  }
}
