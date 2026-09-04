import { generateKeyPairSync } from "node:crypto";
import {
  chmodSync,
  closeSync,
  fchmodSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_ENV_DIRECTORY = "/home/ubuntu/.config/john-owner-qa";

function metadata(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function writeProtectedFile(path, contents, created) {
  const descriptor = openSync(path, "wx", 0o600);
  created.push(path);
  try {
    writeFileSync(descriptor, contents, "utf8");
    fchmodSync(descriptor, 0o600);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function permission(path) {
  return (metadata(path).mode & 0o777).toString(8).padStart(4, "0");
}

export function writeOwnerQaEnvFiles({
  directory = DEFAULT_ENV_DIRECTORY,
  keyPairFactory = () => generateKeyPairSync("ed25519")
} = {}) {
  const existingDirectory = metadata(directory);
  if (existingDirectory && (!existingDirectory.isDirectory() || existingDirectory.isSymbolicLink())) {
    throw new Error("owner_qa_env_directory_is_not_a_real_directory");
  }
  if (!existingDirectory) mkdirSync(directory, { recursive: true, mode: 0o700 });
  chmodSync(directory, 0o700);

  const presentationFile = join(directory, "presentation.env");
  const askFile = join(directory, "ask.env");
  if (metadata(presentationFile) || metadata(askFile)) {
    throw new Error("owner_qa_env_file_exists_nothing_was_overwritten");
  }

  const { privateKey, publicKey } = keyPairFactory();
  const privateKeyB64 = privateKey.export({ format: "der", type: "pkcs8" }).toString("base64");
  const publicKeyB64 = publicKey.export({ format: "der", type: "spki" }).toString("base64");
  const created = [];

  try {
    writeProtectedFile(
      presentationFile,
      `PRESENTATION_OWNER_QA_SIGNING_PRIVATE_KEY_B64=${privateKeyB64}\n`,
      created
    );
    writeProtectedFile(
      askFile,
      `ASK_JOHN_OWNER_QA_VERIFY_PUBLIC_KEY_B64=${publicKeyB64}\n`,
      created
    );
  } catch (error) {
    for (const path of created.reverse()) {
      try {
        unlinkSync(path);
      } catch (_) {
        // Preserve the original write error without exposing key material.
      }
    }
    throw error;
  }

  return {
    directory: { path: directory, permission: permission(directory) },
    presentation: { path: presentationFile, permission: permission(presentationFile) },
    ask: { path: askFile, permission: permission(askFile) }
  };
}

const invokedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (invokedDirectly) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error("Owner QA environment setup failed: run it in a private interactive terminal.");
    process.exitCode = 1;
  } else if (process.argv.length !== 3 || process.argv[2] !== "--write-env-files") {
    console.error("Owner QA environment setup failed: use --write-env-files.");
    process.exitCode = 1;
  } else {
    try {
      const result = writeOwnerQaEnvFiles();
      console.log("Owner QA environment files created; key values were not printed.");
      console.log(`${result.directory.permission} ${result.directory.path}`);
      console.log(`${result.presentation.permission} ${result.presentation.path}`);
      console.log(`${result.ask.permission} ${result.ask.path}`);
    } catch (error) {
      console.error(`Owner QA environment setup failed: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
