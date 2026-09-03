import { createHmac, timingSafeEqual } from "node:crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function encodeBase32(input) {
  const bytes = Buffer.from(input);
  let bits = "";
  for (const byte of bytes) bits += byte.toString(2).padStart(8, "0");
  let result = "";
  for (let index = 0; index < bits.length; index += 5) {
    result += BASE32[Number.parseInt(bits.slice(index, index + 5).padEnd(5, "0"), 2)];
  }
  return result;
}

export function decodeBase32(value) {
  const normalized = String(value || "").toUpperCase().replace(/[\s=-]/g, "");
  if (!normalized || /[^A-Z2-7]/.test(normalized)) throw new Error("Invalid base32 secret.");
  let bits = "";
  for (const character of normalized) bits += BASE32.indexOf(character).toString(2).padStart(5, "0");
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  return Buffer.from(bytes);
}

export function totpAt(secret, timeMs = Date.now(), { digits = 6, period = 30, algorithm = "sha1" } = {}) {
  const counter = Math.floor(timeMs / 1000 / period);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac(algorithm, decodeBase32(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24)
    | ((digest[offset + 1] & 0xff) << 16)
    | ((digest[offset + 2] & 0xff) << 8)
    | (digest[offset + 3] & 0xff);
  return String(binary % (10 ** digits)).padStart(digits, "0");
}

export function verifyTotp(code, secret, timeMs = Date.now(), { digits = 6, period = 30, window = 1 } = {}) {
  if (!new RegExp(`^\\d{${digits}}$`).test(String(code || ""))) return null;
  const submitted = Buffer.from(String(code));
  const currentCounter = Math.floor(timeMs / 1000 / period);
  for (let drift = -window; drift <= window; drift += 1) {
    const candidateTime = (currentCounter + drift) * period * 1000;
    const candidate = Buffer.from(totpAt(secret, candidateTime, { digits, period }));
    if (candidate.length === submitted.length && timingSafeEqual(candidate, submitted)) return currentCounter + drift;
  }
  return null;
}
