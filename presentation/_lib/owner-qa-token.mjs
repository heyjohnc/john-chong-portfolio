import { createPrivateKey, randomBytes, sign } from "node:crypto";

export const OWNER_QA_AUDIENCE = "ask-john-owner-qa";
export const OWNER_QA_MAX_TTL_SECONDS = 30 * 24 * 60 * 60;

function privateKey(value) {
  if (!value) throw new Error("missing_signing_key");
  return createPrivateKey({ key: Buffer.from(value, "base64"), format: "der", type: "pkcs8" });
}

export function issueOwnerQaToken({
  privateKeyB64,
  nowMs = Date.now(),
  ttlSeconds = OWNER_QA_MAX_TTL_SECONDS,
  nonceFactory = () => randomBytes(16).toString("base64url")
}) {
  const ttl = Number(ttlSeconds);
  if (!Number.isInteger(ttl) || ttl < 300 || ttl > OWNER_QA_MAX_TTL_SECONDS) throw new Error("invalid_token_ttl");
  const issuedAt = Math.floor(nowMs / 1000);
  const nonce = nonceFactory();
  if (!/^[A-Za-z0-9_-]{22}$/.test(nonce)) throw new Error("invalid_token_nonce");
  const payload = { v: 1, aud: OWNER_QA_AUDIENCE, iat: issuedAt, exp: issuedAt + ttl, nonce };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(null, Buffer.from(encodedPayload), privateKey(privateKeyB64)).toString("base64url");
  return { token: `${encodedPayload}.${signature}`, expiresAt: payload.exp * 1000 };
}
