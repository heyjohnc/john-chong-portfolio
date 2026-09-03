import { randomBytes } from "node:crypto";
import { mkdir, open } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { encodeBase32 } from "../presentation/_lib/totp.mjs";

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  throw new Error("Run this enrollment command yourself in an interactive SSH terminal.");
}

const configDir = process.env.PRESENTATION_CONFIG_DIR || "/home/ubuntu/.config/john-presentation";
const contentDir = process.env.PRESENTATION_CONTENT_DIR || "/home/ubuntu/.local/share/john-presentation";
const envPath = path.join(configDir, "presentation.env");
const secret = encodeBase32(randomBytes(20));
const ipSalt = randomBytes(32).toString("hex");

await mkdir(configDir, { recursive: true, mode: 0o700 });
await mkdir(contentDir, { recursive: true, mode: 0o700 });
const file = await open(envPath, "wx", 0o600);
try {
  await file.writeFile([
    "NODE_ENV=production",
    "PRESENTATION_ENABLED=true",
    "PRESENTATION_HOST=127.0.0.1",
    "PRESENTATION_PORT=8790",
    "PRESENTATION_STORE_MODE=redis",
    "PRESENTATION_REDIS_HOST=127.0.0.1",
    "PRESENTATION_REDIS_PORT=6379",
    "PRESENTATION_REDIS_PREFIX=john-presentation",
    "PRESENTATION_SESSION_TTL_SECONDS=1800",
    "PRESENTATION_ATTEMPT_LIMIT=5",
    "PRESENTATION_GLOBAL_ATTEMPT_LIMIT=30",
    "PRESENTATION_ATTEMPT_WINDOW_SECONDS=600",
    "PRESENTATION_TOTP_WINDOW=1",
    "PRESENTATION_ALLOWED_ORIGINS=https://johnchong.info,https://www.johnchong.info,https://present-john.37.187.136.100.sslip.io",
    `PRESENTATION_CONTENT_DIR=${contentDir}`,
    `PRESENTATION_TOTP_SECRET=${secret}`,
    `PRESENTATION_IP_HASH_SALT=${ipSalt}`,
    ""
  ].join("\n"));
} finally {
  await file.close();
}

console.log("Add a new time-based key in Google Authenticator:");
console.log("Account: John presentation");
console.log(`Setup key: ${secret}`);
console.log("Type: Time based");
console.log(`\nProtected configuration written to ${envPath}. Keep this key private.`);
