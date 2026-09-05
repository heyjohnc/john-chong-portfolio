import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.dirname(scriptsDir);
const outputDir = path.join(siteDir, "public");

const publicFiles = [
  "index.html",
  "projects.html",
  "about.html",
  "fightgame.html",
  "niulai.html",
  "services.html",
  "styles.css",
  "site.js",
  "analytics.js",
  "ask-widget.js"
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await Promise.all(publicFiles.map((file) => (
  cp(path.join(siteDir, file), path.join(outputDir, file))
)));
await cp(path.join(siteDir, "assets"), path.join(outputDir, "assets"), { recursive: true });

console.log(`Built ${publicFiles.length} public files and the asset tree in ${outputDir}.`);
