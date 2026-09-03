import { generateKeyPairSync } from "node:crypto";

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  throw new Error("Run this command yourself in a private interactive terminal. Do not paste its output into chat or logs.");
}

const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const privateKeyB64 = privateKey.export({ format: "der", type: "pkcs8" }).toString("base64");
const publicKeyB64 = publicKey.export({ format: "der", type: "spki" }).toString("base64");

console.log("Add each value only to the named protected service environment:");
console.log(`PRESENTATION_OWNER_QA_SIGNING_PRIVATE_KEY_B64=${privateKeyB64}`);
console.log(`ASK_JOHN_OWNER_QA_VERIFY_PUBLIC_KEY_B64=${publicKeyB64}`);
console.log("Do not commit, paste, screenshot or reuse the private value.");
