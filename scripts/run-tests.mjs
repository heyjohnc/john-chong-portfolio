import { spawnSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const testsDirectory = new URL("../tests/", import.meta.url);
const testFiles = (await readdir(testsDirectory))
  .filter((name) => name.endsWith(".test.mjs"))
  .sort()
  .map((name) => fileURLToPath(new URL(name, testsDirectory)));

if (testFiles.length === 0) throw new Error("No test files found.");

const result = spawnSync(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit"
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
