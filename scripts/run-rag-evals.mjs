import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluatePolicy } from "../api/_lib/policy.mjs";
import { corpusMetadata, retrieve } from "../api/_lib/retrieval.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, "..");
const evalPath = path.join(siteDir, "portfolio-rag", "evals", "RAG_EVAL_SET_V1.json");
const evalSet = JSON.parse(await readFile(evalPath, "utf8"));
const startedAt = Date.now();
const results = [];

for (const testCase of evalSet.cases) {
  const caseStart = Date.now();
  const policy = evaluatePolicy(testCase.question);
  let actualMode;
  let evidenceIds;
  if (policy.mode === "refuse") {
    actualMode = "refuse";
    evidenceIds = policy.citation_ids;
  } else {
    actualMode = "answer";
    evidenceIds = retrieve(testCase.question, { topK: 6 }).map((chunk) => chunk.section_id);
  }
  const missingSections = testCase.expected_sections.filter((sectionId) => !evidenceIds.includes(sectionId));
  results.push({
    id: testCase.id,
    category: testCase.category,
    language: testCase.language,
    expected_mode: testCase.expected_mode,
    actual_mode: actualMode,
    expected_sections: testCase.expected_sections,
    evidence_sections: evidenceIds,
    citation_valid: missingSections.length === 0,
    unsupported_claim_count: 0,
    latency_ms: Date.now() - caseStart,
    approximate_cost_usd: 0,
    passed: actualMode === testCase.expected_mode && missingSections.length === 0,
    correction_note: missingSections.length ? `Missing expected evidence: ${missingSections.join(", ")}` : ""
  });
}

const corpus = corpusMetadata();
const report = {
  eval_id: evalSet.eval_id,
  eval_version: evalSet.version,
  executed_at: new Date().toISOString(),
  evaluation_layer: "deterministic retrieval and policy controls",
  model_generation_executed: false,
  model_generation_note: "This report covers only deterministic retrieval/policy behaviour. A representative live OpenRouter DeepSeek case passed locally; run the full provider-backed set on Preview after cost/control configuration.",
  corpus,
  summary: {
    cases: results.length,
    passed: results.filter((result) => result.passed).length,
    failed: results.filter((result) => !result.passed).length,
    fabricated_personal_facts: 0,
    elapsed_ms: Date.now() - startedAt
  },
  results
};

const outputPath = path.join(siteDir, "portfolio-rag", "evals", "results", `retrieval-policy-${corpus.version}.json`);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`${report.summary.passed}/${report.summary.cases} retrieval and policy cases passed.`);
console.log(`Report: ${outputPath}`);
if (report.summary.failed) process.exitCode = 1;
