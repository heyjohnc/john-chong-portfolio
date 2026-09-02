import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, "..");
const outputDir = path.join(siteDir, "data");
const sourceDefinitions = [
  {
    path: path.join(siteDir, "portfolio-rag", "JOHN_CHONG_PUBLIC_KNOWLEDGE_BASE_V1.md"),
    kind: "primary"
  },
  {
    path: path.join(siteDir, "portfolio-rag", "project-sources", "FIGHTGAME_PUBLIC_EVIDENCE.md"),
    kind: "project"
  },
  {
    path: path.join(siteDir, "portfolio-rag", "project-sources", "NIULAI_PUBLIC_REPOSITORY.generated.md"),
    kind: "project"
  }
];

const sourceLinks = new Map([
  ["KB-12", "/fightgame.html"], ["KB-13", "/fightgame.html"], ["KB-14", "/fightgame.html"],
  ["KB-15", "/niulai.html"],
  ["KB-16", "/projects.html"], ["KB-17", "/projects.html"], ["KB-18", "/projects.html"],
  ["KB-22", "/projects.html"], ["KB-23", "/about.html"], ["KB-24", "/about.html"], ["KB-25", "/about.html"], ["KB-26", "/projects.html"],
  ["KB-27", "/projects.html"], ["KB-28", "/projects.html"], ["KB-29", "/projects.html"]
]);

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error("The approved corpus must begin with YAML front matter.");
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([a-z_]+):\s*(.+)$/);
    if (item) meta[item[1]] = item[2].trim();
  }
  return { meta, body: markdown.slice(match[0].length) };
}

function parseSections(body) {
  const matches = [...body.matchAll(/^##\s+((?:KB|FG|NL)-\d{2})\s+—\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
    return {
      section_id: match[1],
      heading: match[2].trim(),
      text: body.slice(start, end).trim()
    };
  });
}

function normalise(value) {
  return value.normalize("NFKC").toLocaleLowerCase("en").replace(/<[^>]+>/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function terms(value) {
  const clean = normalise(value);
  const words = clean.match(/[a-z0-9]+(?:['-][a-z0-9]+)*/g) || [];
  const hanRuns = clean.match(/[\p{Script=Han}]+/gu) || [];
  const han = hanRuns.flatMap((run) => [...run, ...Array.from({ length: Math.max(0, run.length - 1) }, (_, index) => run.slice(index, index + 2))]);
  return [...words, ...han];
}

const documents = [];
for (const definition of sourceDefinitions) {
  const markdown = await readFile(definition.path, "utf8");
  const sourceHash = createHash("sha256").update(markdown).digest("hex");
  const { meta, body } = parseFrontMatter(markdown);
  const sections = parseSections(body);
  if (!meta.document_id) throw new Error(`${definition.path}: missing document_id.`);
  if (!/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/i.test(meta.version || "")) throw new Error(`${definition.path}: invalid version.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.last_updated || "")) throw new Error(`${definition.path}: invalid last_updated date.`);
  if (!sections.length) throw new Error(`${definition.path}: no indexed sections found.`);
  if (definition.kind === "primary") {
    if (meta.document_id !== "john-chong-public-career-kb") throw new Error("Unexpected primary corpus document_id.");
    if (sections.length !== 29) throw new Error(`Expected 29 KB sections, found ${sections.length}.`);
    const ids = sections.map((section) => section.section_id);
    for (let index = 1; index <= 29; index += 1) {
      const expected = `KB-${String(index).padStart(2, "0")}`;
      if (!ids.includes(expected)) throw new Error(`Missing ${expected}.`);
    }
  } else if (!meta.source_url) {
    throw new Error(`${definition.path}: project evidence requires source_url.`);
  }
  documents.push({ ...definition, markdown, sourceHash, meta, sections });
}

const ids = documents.flatMap((document) => document.sections.map((section) => section.section_id));
if (new Set(ids).size !== ids.length) throw new Error("Duplicate section IDs found across public evidence sources.");
const primary = documents.find((document) => document.kind === "primary");
const sourceHash = createHash("sha256")
  .update(documents.map((document) => `${document.meta.document_id}:${document.sourceHash}`).join("\n"))
  .digest("hex");

const builtAt = new Date().toISOString();
const chunks = documents.flatMap((document) => document.sections.map((section) => {
  const source_url = document.kind === "primary"
    ? sourceLinks.get(section.section_id) || "/about.html"
    : document.meta.source_url;
  const retrievalTerms = terms(`${section.section_id} ${section.heading} ${section.text}`);
  const frequencies = Object.fromEntries([...new Set(retrievalTerms)].sort().map((term) => [term, retrievalTerms.filter((item) => item === term).length]));
  return {
    document_id: document.meta.document_id,
    document_version: document.meta.version,
    last_updated: document.meta.last_updated,
    section_id: section.section_id,
    heading: section.heading,
    text: section.text,
    source_url,
    source_revision: document.meta.source_revision || null,
    source_hash: document.sourceHash,
    retrieval: { length: retrievalTerms.length, frequencies }
  };
}));

const documentFrequency = {};
for (const chunk of chunks) {
  for (const term of Object.keys(chunk.retrieval.frequencies)) documentFrequency[term] = (documentFrequency[term] || 0) + 1;
}

const index = {
  schema_version: "1.1.0",
  retrieval_method: "multilingual lexical BM25 + curated concept expansion + allowlisted public project evidence",
  document_id: primary.meta.document_id,
  document_version: primary.meta.version,
  last_updated: primary.meta.last_updated,
  source_hash: sourceHash,
  source_documents: documents.map((document) => ({
    document_id: document.meta.document_id,
    version: document.meta.version,
    last_updated: document.meta.last_updated,
    source_url: document.kind === "primary" ? "/about.html" : document.meta.source_url,
    source_revision: document.meta.source_revision || null,
    source_hash: document.sourceHash,
    section_count: document.sections.length
  })),
  built_at: builtAt,
  chunk_count: chunks.length,
  average_chunk_terms: chunks.reduce((sum, chunk) => sum + chunk.retrieval.length, 0) / chunks.length,
  document_frequency: documentFrequency,
  chunks
};

await mkdir(outputDir, { recursive: true });
const baseName = `ask-john-index.${primary.meta.version}`;
await writeFile(path.join(outputDir, `${baseName}.json`), `${JSON.stringify(index, null, 2)}\n`, "utf8");
await writeFile(path.join(outputDir, `${baseName}.mjs`), `// Generated by scripts/build-rag-index.mjs. Do not edit.\nexport default ${JSON.stringify(index, null, 2)};\n`, "utf8");
await writeFile(path.join(outputDir, "ask-john-index.mjs"), `export { default } from "./${baseName}.mjs";\n`, "utf8");

console.log(`Built ${chunks.length} traceable chunks from ${documents.length} approved public evidence documents.`);
console.log(`Aggregate source SHA-256: ${sourceHash}`);
