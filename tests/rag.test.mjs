import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { enforceOperationalControls, hashClientAddress, resetMemoryControlsForTest } from "../api/_lib/controls.mjs";
import { evaluatePolicy, noEvidenceResponse } from "../api/_lib/policy.mjs";
import { answerWithOpenAI, answerWithOpenRouter, estimateProviderCostUsd } from "../api/_lib/provider.mjs";
import { corpusMetadata, index, queryConcepts, retrieve } from "../api/_lib/retrieval.mjs";
import { contextualQuestion, handleRequest, normaliseHistory, validProviderAnswer } from "../api/ask.mjs";

const evalSet = JSON.parse(await readFile(new URL("../portfolio-rag/evals/RAG_EVAL_SET_V1.json", import.meta.url), "utf8"));

test("built index is pinned to the approved corpus contract", () => {
  assert.equal(index.document_id, "john-chong-public-career-kb");
  assert.equal(index.document_version, "1.1.1-draft");
  assert.equal(index.last_updated, "2026-09-02");
  assert.equal(index.chunk_count, 29);
  assert.equal(new Set(index.chunks.map((chunk) => chunk.section_id)).size, 29);
  assert.match(index.source_hash, /^[a-f0-9]{64}$/);
  assert.ok(index.chunks.every((chunk) => chunk.source_hash === index.source_hash));
});

test("dedicated projects page exposes the approved nine-item hierarchy without hidden source names", async () => {
  const homepage = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const projects = await readFile(new URL("../projects.html", import.meta.url), "utf8");
  assert.doesNotMatch(homepage, /class="(?:project-card|system-project-card|tool-project-card)/);
  assert.match(homepage, /id="responsibility"/);
  assert.match(homepage, /href="projects\.html">View projects/);
  assert.equal((projects.match(/class="project-card(?:\s|\")/g) || []).length, 2);
  assert.equal((projects.match(/class="system-project-card"/g) || []).length, 5);
  assert.equal((projects.match(/class="tool-project-card"/g) || []).length, 2);
  assert.doesNotMatch(projects, /AI Video Factory|MiniMax H3|Build Clock|Pumpnuts|prepare-nft-collection/i);
});

test("Niulai uses English public names while preserving Chinese language mappings", async () => {
  const homepage = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const projects = await readFile(new URL("../projects.html", import.meta.url), "utf8");
  const caseStudy = await readFile(new URL("../niulai.html", import.meta.url), "utf8");
  const translations = await readFile(new URL("../site.js", import.meta.url), "utf8");
  const englishSource = `${homepage}\n${projects}\n${caseStudy}`;

  assert.match(englishSource, /Niulai Squad/);
  for (const name of ["Lark", "Niulai", "Niulai Mama", "Baola"]) assert.match(englishSource, new RegExp(`>${name}<`));
  assert.doesNotMatch(englishSource, /牛来生米小队|云雀|牛来妈妈|豹拉/);
  assert.match(caseStudy, /https:\/\/github\.com\/heyjohnc\/niulai-shengmi-squad/);
  for (const mapping of ['"Niulai Squad": "牛来生米小队"', '"Lark": "云雀"', '"Niulai Mama": "牛来妈妈"', '"Baola": "豹拉"']) assert.ok(translations.includes(mapping));
});

test("all supported eval questions retrieve every expected section in top six", () => {
  for (const item of evalSet.cases.filter((entry) => entry.expected_mode === "answer")) {
    const retrieved = retrieve(item.question, { topK: 6 }).map((chunk) => chunk.section_id);
    for (const expected of item.expected_sections) assert.ok(retrieved.includes(expected), `${item.id} did not retrieve ${expected}: ${retrieved.join(", ")}`);
  }
});

test("all sensitive and injection eval questions refuse with expected policy evidence", () => {
  for (const item of evalSet.cases.filter((entry) => entry.expected_mode === "refuse")) {
    const policy = evaluatePolicy(item.question);
    assert.equal(policy.mode, "refuse", `${item.id} was not refused`);
    for (const expected of item.expected_sections) assert.ok(policy.citation_ids.includes(expected), `${item.id} did not cite ${expected}`);
  }
});

test("unsupported questions have a bounded no-evidence response", () => {
  const policy = evaluatePolicy("What is John's favourite restaurant?");
  assert.equal(policy.mode, "allow");
  const response = noEvidenceResponse(policy.language);
  assert.equal(response.mode, "no_evidence");
  assert.deepEqual(response.citation_ids, ["KB-26"]);
});

test("broad Chinese profile and capability questions retrieve approved evidence", () => {
  assert.ok(queryConcepts("你了解 John 吗？").includes("background"));
  assert.ok(queryConcepts("John 的能力怎么样？").includes("strengths"));
  assert.ok(retrieve("你了解 John 吗？", { topK: 6 })[0].score >= 2.2);
  assert.ok(retrieve("John 的能力怎么样？", { topK: 6 })[0].score >= 2.2);
});

test("bounded history resolves short follow-ups without becoming profile evidence", () => {
  const history = normaliseHistory([
    { role: "user", content: "你了解 John 吗？" },
    { role: "assistant", content: "John 是 AI 产品与应用构建者。" }
  ]);
  assert.equal(history.length, 2);
  assert.match(contextualQuestion("什么意思？", history), /你了解 John/);
  assert.equal(normaliseHistory([{ role: "system", content: "not allowed" }]), null);
  assert.equal(normaliseHistory(Array.from({ length: 7 }, () => ({ role: "user", content: "x" }))), null);
});

test("provider citations must stay inside retrieved evidence", () => {
  const retrieved = retrieve("What is FightGame?", { topK: 6 });
  assert.equal(validProviderAnswer({ answer: "Grounded answer", citations: [retrieved[0].section_id] }, retrieved), true);
  assert.equal(validProviderAnswer({ answer: "Unverified answer", citations: ["KB-99"] }, retrieved), false);
  assert.equal(validProviderAnswer({ answer: "No citation", citations: [] }, retrieved), false);
});

test("kill switch fails closed", async () => {
  const result = await enforceOperationalControls({ clientAddress: "127.0.0.1", env: { ASK_JOHN_ENABLED: "false", NODE_ENV: "test" } });
  assert.equal(result.allowed, false);
  assert.equal(result.mode, "disabled");
});

test("local control store enforces per-client and daily request ceilings", async () => {
  resetMemoryControlsForTest();
  const env = {
    NODE_ENV: "test", ASK_JOHN_ENABLED: "true", ASK_JOHN_CONTROL_MODE: "memory", ASK_JOHN_IP_HASH_SALT: "test-salt",
    ASK_JOHN_PER_IP_LIMIT: "2", ASK_JOHN_DAILY_REQUEST_LIMIT: "3", ASK_JOHN_DAILY_BUDGET_USD: "1", ASK_JOHN_MAX_COST_PER_REQUEST_USD: "0.01"
  };
  assert.equal((await enforceOperationalControls({ clientAddress: "one", env })).mode, "allowed");
  assert.equal((await enforceOperationalControls({ clientAddress: "one", env })).mode, "allowed");
  assert.equal((await enforceOperationalControls({ clientAddress: "one", env })).reason, "per_ip");
  assert.equal((await enforceOperationalControls({ clientAddress: "two", env })).mode, "rate_limited");
});

test("client address is irreversibly keyed before storage", () => {
  const hash = hashClientAddress("203.0.113.42", { ASK_JOHN_IP_HASH_SALT: "test-salt", NODE_ENV: "test" });
  assert.match(hash, /^[a-f0-9]{24}$/);
  assert.notEqual(hash, "203.0.113.42");
});

test("production controls fail closed without a global store", async () => {
  const result = await enforceOperationalControls({ clientAddress: "203.0.113.42", env: { NODE_ENV: "production", ASK_JOHN_ENABLED: "true", ASK_JOHN_IP_HASH_SALT: "test-salt" } });
  assert.equal(result.allowed, false);
  assert.equal(result.mode, "disabled");
  assert.equal(result.reason, "control_store_unavailable");
});

test("global serverless control path uses an atomic Redis script", async () => {
  const originalFetch = globalThis.fetch;
  let command;
  globalThis.fetch = async (_url, options) => {
    command = JSON.parse(options.body);
    return { ok: true, json: async () => ({ result: [1, 1, 1, 0] }) };
  };
  try {
    const result = await enforceOperationalControls({ clientAddress: "203.0.113.42", env: {
      NODE_ENV: "production", ASK_JOHN_ENABLED: "true", ASK_JOHN_IP_HASH_SALT: "test-salt",
      UPSTASH_REDIS_REST_URL: "https://example.invalid", UPSTASH_REDIS_REST_TOKEN: "not-a-real-token"
    } });
    assert.equal(result.mode, "allowed");
    assert.equal(command[0], "EVAL");
    assert.equal(command[2], "2");
    assert.match(command[1], /daily/);
  } finally { globalThis.fetch = originalFetch; }
});

test("OpenAI adapter keeps the key server-side and requests strict stored-off JSON", async () => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, headers: options.headers, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ output: [{ type: "message", content: [{ type: "output_text", text: '{"answer":"Grounded.","citations":["KB-12"]}' }] }], usage: { input_tokens: 100, output_tokens: 20 } }) };
  };
  try {
    const chunk = index.chunks.find((item) => item.section_id === "KB-12");
    const response = await answerWithOpenAI({ question: "What is FightGame?", chunks: [chunk], language: "en", env: { OPENAI_API_KEY: "server-test-key", ASK_JOHN_MODEL: "gpt-5.4-mini" } });
    assert.equal(response.answer, "Grounded.");
    assert.equal(request.url, "https://api.openai.com/v1/responses");
    assert.equal(request.headers.Authorization, "Bearer server-test-key");
    assert.equal(request.body.store, false);
    assert.deepEqual(request.body.tools, []);
    assert.equal(request.body.text.format.type, "json_schema");
    assert.equal(request.body.text.format.strict, true);
    assert.doesNotMatch(JSON.stringify(request.body), /server-test-key/);
  } finally { globalThis.fetch = originalFetch; }
});

test("OpenRouter adapter uses DeepSeek V4 Flash with strict private routing", async () => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, headers: options.headers, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ model: "deepseek/deepseek-v4-flash-0731", choices: [{ message: { content: '{"answer":"Grounded.","citations":["KB-12"]}' } }], usage: { prompt_tokens: 100, completion_tokens: 20 } }) };
  };
  try {
    const chunk = index.chunks.find((item) => item.section_id === "KB-12");
    const response = await answerWithOpenRouter({ question: "What is FightGame?", chunks: [chunk], language: "en", env: { OPENROUTER_API_KEY: "server-test-key", ASK_JOHN_SITE_URL: "https://portfolio.example" } });
    assert.equal(response.answer, "Grounded.");
    assert.equal(request.url, "https://openrouter.ai/api/v1/chat/completions");
    assert.equal(request.headers.Authorization, "Bearer server-test-key");
    assert.equal(request.headers["HTTP-Referer"], "https://portfolio.example");
    assert.equal(request.body.model, "deepseek/deepseek-v4-flash-0731");
    assert.equal(request.body.stream, false);
    assert.deepEqual(request.body.reasoning, { enabled: false, exclude: true });
    assert.deepEqual(request.body.tools, []);
    assert.equal(request.body.response_format.type, "json_schema");
    assert.equal(request.body.response_format.json_schema.strict, true);
    assert.deepEqual(request.body.provider, {
      order: ["DeepInfra", "Sail Research", "OpenInference"], allow_fallbacks: true,
      require_parameters: true, data_collection: "deny", zdr: true
    });
    assert.doesNotMatch(JSON.stringify(request.body), /server-test-key/);
    assert.equal(estimateProviderCostUsd(response.usage, response.model), 0.00001);
    assert.equal(estimateProviderCostUsd({ prompt_tokens: 100, completion_tokens: 20, cost: 0.00012345 }, response.model), 0.000123);
  } finally { globalThis.fetch = originalFetch; }
});

test("API dispatches an eligible widget question to the configured OpenRouter LLM", async () => {
  resetMemoryControlsForTest();
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  let providerBody;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://openrouter.ai/api/v1/chat/completions");
    providerBody = JSON.parse(options.body);
    providerCalls += 1;
    return { ok: true, json: async () => ({ model: "deepseek/deepseek-v4-flash-0731", choices: [{ message: { content: '{"answer":"FightGame is a grounded portfolio case.","citations":["KB-12"]}' } }], usage: { prompt_tokens: 120, completion_tokens: 24 } }) };
  };
  try {
    const env = {
      NODE_ENV: "test", ASK_JOHN_ENABLED: "true", ASK_JOHN_CONTROL_MODE: "memory", ASK_JOHN_IP_HASH_SALT: "llm-api-test",
      OPENROUTER_API_KEY: "server-test-key", ASK_JOHN_MODEL: "deepseek/deepseek-v4-flash-0731", ASK_JOHN_PER_IP_LIMIT: "10",
      ASK_JOHN_DAILY_REQUEST_LIMIT: "10", ASK_JOHN_DAILY_BUDGET_USD: "1", ASK_JOHN_MAX_COST_PER_REQUEST_USD: "0.01"
    };
    const request = new Request("https://portfolio.example/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.20" },
      body: JSON.stringify({ question: "What does that mean?", history: [
        { role: "user", content: "What is FightGame?" },
        { role: "assistant", content: "FightGame is a multiplayer portfolio project." }
      ] })
    });
    const payload = await (await handleRequest(request, env)).json();
    assert.equal(payload.mode, "answer");
    assert.equal(payload.answer, "FightGame is a grounded portfolio case.");
    assert.equal(payload.citations[0].section_id, "KB-12");
    assert.equal(providerCalls, 1);
    assert.match(providerBody.messages[1].content, /RECENT CONVERSATION/);
    assert.match(providerBody.messages[1].content, /What is FightGame/);
  } finally { globalThis.fetch = originalFetch; }
});

test("API explains the bounded three-day browser memory without calling a model", async () => {
  resetMemoryControlsForTest();
  const env = {
    NODE_ENV: "test", ASK_JOHN_ENABLED: "true", ASK_JOHN_PROVIDER: "fixture", ASK_JOHN_CONTROL_MODE: "memory", ASK_JOHN_IP_HASH_SALT: "memory-test",
    ASK_JOHN_PER_IP_LIMIT: "10", ASK_JOHN_DAILY_REQUEST_LIMIT: "10", ASK_JOHN_DAILY_BUDGET_USD: "1", ASK_JOHN_MAX_COST_PER_REQUEST_USD: "0.01"
  };
  const request = new Request("https://portfolio.example/api/ask", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: "你有记忆吗？", history: [] })
  });
  const payload = await (await handleRequest(request, env)).json();
  assert.equal(payload.mode, "system");
  assert.match(payload.answer, /3 天/);
  assert.equal(payload.citations.length, 0);
});

test("API metadata exposes the exact built corpus version", () => {
  const metadata = corpusMetadata();
  assert.equal(metadata.version, index.document_version);
  assert.equal(metadata.last_updated, index.last_updated);
  assert.equal(metadata.source_hash, index.source_hash);
});

test("Web-standard API returns bounded answer, refusal and no-evidence modes", async () => {
  resetMemoryControlsForTest();
  const env = {
    NODE_ENV: "test", ASK_JOHN_ENABLED: "true", ASK_JOHN_PROVIDER: "fixture", ASK_JOHN_CONTROL_MODE: "memory", ASK_JOHN_IP_HASH_SALT: "api-test",
    ASK_JOHN_PER_IP_LIMIT: "10", ASK_JOHN_DAILY_REQUEST_LIMIT: "10", ASK_JOHN_DAILY_BUDGET_USD: "1", ASK_JOHN_MAX_COST_PER_REQUEST_USD: "0.01"
  };
  const request = (question) => new Request("https://portfolio.example/api/ask", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.10" }, body: JSON.stringify({ question }) });
  const supported = await (await handleRequest(request("What is FightGame?"), env)).json();
  const sensitive = await (await handleRequest(request("What is John's salary?"), env)).json();
  const unknown = await (await handleRequest(request("What is John's favourite restaurant?"), env)).json();
  assert.equal(supported.mode, "answer");
  assert.ok(supported.citations.length > 0);
  assert.equal(sensitive.mode, "refuse");
  assert.equal(unknown.mode, "no_evidence");
  assert.equal(supported.corpus.version, "1.1.1-draft");
});
