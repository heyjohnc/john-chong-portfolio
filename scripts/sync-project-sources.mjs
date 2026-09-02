import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, "..");
const allowlistPath = path.join(siteDir, "portfolio-rag", "project-source-allowlist.json");
const allowlist = JSON.parse(await readFile(allowlistPath, "utf8"));

function assertSafeSegment(value, label) {
  if (!/^[A-Za-z0-9_.-]+$/.test(value || "")) throw new Error(`Invalid ${label}.`);
}

function extractRange(markdown, section) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((line) => line.trim() === section.start_heading);
  if (start < 0) throw new Error(`${section.path}: missing start heading ${section.start_heading}`);
  const end = section.end_heading
    ? lines.findIndex((line, index) => index > start && line.trim() === section.end_heading)
    : lines.length;
  if (end < 0) throw new Error(`${section.path}: missing end heading ${section.end_heading}`);
  const text = lines.slice(start + 1, end).join("\n").trim();
  if (!text) throw new Error(`${section.path}: empty extracted section ${section.section_id}`);
  if (text.length > 9000) throw new Error(`${section.path}: extracted section ${section.section_id} exceeds 9000 characters`);
  return text;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "ask-john-public-source-sync/1.0" },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`GitHub public-source request failed with HTTP ${response.status}.`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { Accept: "text/plain", "User-Agent": "ask-john-public-source-sync/1.0" },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`GitHub raw-source request failed with HTTP ${response.status}.`);
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > 250_000) throw new Error("Public source exceeds the 250 KB response limit.");
  const text = await response.text();
  if (Buffer.byteLength(text, "utf8") > 250_000) throw new Error("Public source exceeds the 250 KB content limit.");
  return text;
}

for (const source of allowlist.sources || []) {
  if (source.type !== "github_public_markdown") throw new Error(`Unsupported source type: ${source.type}`);
  for (const [value, label] of [[source.owner, "owner"], [source.repository, "repository"], [source.ref, "ref"]]) assertSafeSegment(value, label);
  const repository = await fetchJson(`https://api.github.com/repos/${source.owner}/${source.repository}`);
  if (repository.private !== false || repository.visibility !== "public") throw new Error(`${source.owner}/${source.repository} is not a public repository.`);
  if (repository.full_name !== `${source.owner}/${source.repository}`) throw new Error("GitHub repository identity did not match the allowlist.");
  const commit = await fetchJson(`https://api.github.com/repos/${source.owner}/${source.repository}/commits/${source.ref}`);
  if (!/^[a-f0-9]{40}$/.test(commit.sha || "")) throw new Error("GitHub did not return a full public commit SHA.");

  const files = new Map();
  for (const section of source.sections || []) {
    if (!/^[A-Z]{2}-\d{2}$/.test(section.section_id || "")) throw new Error(`Invalid project section ID: ${section.section_id}`);
    if (section.path.startsWith("/") || section.path.includes("..") || !section.path.endsWith(".md")) throw new Error(`Unsafe allowlisted path: ${section.path}`);
    if (!files.has(section.path)) {
      const encodedPath = section.path.split("/").map(encodeURIComponent).join("/");
      const rawUrl = `https://raw.githubusercontent.com/${source.owner}/${source.repository}/${commit.sha}/${encodedPath}`;
      files.set(section.path, await fetchText(rawUrl));
    }
  }

  const syncedAt = new Date().toISOString();
  const repositoryUrl = `https://github.com/${source.owner}/${source.repository}/tree/${commit.sha}`;
  const output = [
    "---",
    `document_id: ${source.source_id}`,
    "version: 1.0.0",
    "status: synced-public-source",
    `last_updated: ${syncedAt.slice(0, 10)}`,
    `source_url: ${repositoryUrl}`,
    `source_revision: ${commit.sha}`,
    "---",
    "",
    `# ${source.owner}/${source.repository} — Approved Public Repository Snapshot`,
    "",
    `Synced from the allowlisted public repository at commit \`${commit.sha}\` on ${syncedAt}.`,
    "Only the explicitly selected public Markdown ranges below enter Ask John's evidence index.",
    ""
  ];
  for (const section of source.sections) {
    output.push(`## ${section.section_id} — ${section.title}`, "", extractRange(files.get(section.path), section), "");
  }
  const body = `${output.join("\n").trim()}\n`;
  const outputPath = path.resolve(siteDir, source.output_path);
  if (!outputPath.startsWith(`${path.join(siteDir, "portfolio-rag", "project-sources")}${path.sep}`)) throw new Error("Output path is outside the approved project-source directory.");
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, body, "utf8");
  console.log(`Synced ${source.source_id} at ${commit.sha.slice(0, 12)} (${createHash("sha256").update(body).digest("hex").slice(0, 12)}).`);
}
