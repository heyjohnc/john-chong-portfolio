import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { aggregateCountryCode, encodeRedisCommand, enforceOperationalControls, hashClientAddress, hourKey, parseRedisReply, recordAggregateTelemetry, resetMemoryControlsForTest } from "../api/_lib/controls.mjs";
import { citationObjects, evaluatePolicy, noEvidenceResponse } from "../api/_lib/policy.mjs";
import { answerWithOpenAI, answerWithOpenRouter, estimateProviderCostUsd } from "../api/_lib/provider.mjs";
import { corpusMetadata, index, queryConcepts, retrieve } from "../api/_lib/retrieval.mjs";
import { contextualQuestion, handleRequest, isContextDependent, normaliseHistory, routedChunks, semanticRouterCatalog, validProviderAnswer } from "../api/ask.mjs";
import { handleCountryRequest } from "../api/country.mjs";

const evalSet = JSON.parse(await readFile(new URL("../portfolio-rag/evals/RAG_EVAL_SET_V1.json", import.meta.url), "utf8"));

test("built index is pinned to the approved corpus contract", () => {
  assert.equal(evalSet.cases.length, evalSet.release_requirements.case_count);
  assert.equal(index.document_id, "john-chong-public-career-kb");
  assert.equal(index.document_version, "1.2.0-draft");
  assert.equal(index.last_updated, "2026-09-04");
  assert.equal(index.chunk_count, 40);
  assert.equal(new Set(index.chunks.map((chunk) => chunk.section_id)).size, 40);
  assert.match(index.source_hash, /^[a-f0-9]{64}$/);
  assert.equal(index.source_documents.length, 3);
  const documentHashes = new Map(index.source_documents.map((document) => [document.document_id, document.source_hash]));
  assert.ok(index.chunks.every((chunk) => chunk.source_hash === documentHashes.get(chunk.document_id)));
});

test("project evidence is limited to a public Niulai snapshot and a sanitized FightGame pack", async () => {
  const niulai = index.source_documents.find((document) => document.document_id === "niulai-public-repository");
  const fightgame = index.source_documents.find((document) => document.document_id === "fightgame-public-project-evidence");
  assert.equal(niulai.section_count, 7);
  assert.match(niulai.source_url, /^https:\/\/github\.com\/heyjohnc\/niulai-shengmi-squad\/tree\/[a-f0-9]{40}$/);
  assert.match(niulai.source_revision, /^[a-f0-9]{40}$/);
  assert.equal(fightgame.section_count, 4);
  assert.equal(fightgame.source_url, "/fightgame.html");
  for (const sectionId of ["FG-01", "FG-02", "FG-03", "FG-04", "NL-01", "NL-03", "NL-05", "NL-07"]) {
    assert.ok(index.chunks.some((chunk) => chunk.section_id === sectionId), `missing project evidence ${sectionId}`);
  }
  const allowlist = await readFile(new URL("../portfolio-rag/project-source-allowlist.json", import.meta.url), "utf8");
  assert.match(allowlist, /"repository": "niulai-shengmi-squad"/);
  assert.doesNotMatch(allowlist, /token|credential|private[_ -]?key/i);
  const fightgameEvidence = await readFile(new URL("../portfolio-rag/project-sources/FIGHTGAME_PUBLIC_EVIDENCE.md", import.meta.url), "utf8");
  assert.doesNotMatch(fightgameEvidence, /ghp_[A-Za-z0-9]+|-----BEGIN [A-Z ]*PRIVATE KEY-----|0x[a-f0-9]{40}/i);
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
  for (const [label, count] of [["End-to-End Products", "02"], ["Applied AI Workflows", "05"], ["Open-Source Utilities", "02"]]) {
    assert.match(projects, new RegExp(`<dt>${label}</dt><dd>${count}</dd>`));
  }
  for (const retiredLabel of ["Flagship cases", "Selected AI systems", "Open-source tools", "Flagship · playable milestone", "01 · Flagship case"]) {
    assert.doesNotMatch(projects, new RegExp(retiredLabel, "i"));
  }
  assert.doesNotMatch(projects, /AI Video Factory|MiniMax H3|Build Clock|Pumpnuts|prepare-nft-collection/i);
});

test("end-to-end cases lead with product type while retaining project names as labels", async () => {
  const projects = await readFile(new URL("../projects.html", import.meta.url), "utf8");
  const fightgame = await readFile(new URL("../fightgame.html", import.meta.url), "utf8");
  const niulai = await readFile(new URL("../niulai.html", import.meta.url), "utf8");
  const knowledgeBase = await readFile(new URL("../portfolio-rag/JOHN_CHONG_PUBLIC_KNOWLEDGE_BASE_V1.md", import.meta.url), "utf8");

  assert.match(projects, /<p class="project-name">FightGame<\/p>\s*<h3>Personalized-Avatar Multiplayer Pixel RPG<\/h3>/);
  assert.match(projects, /<p class="project-name">Niulai Squad<\/p>\s*<h3>Four-Agent Decision &amp; Publishing System<\/h3>/);
  assert.match(fightgame, /<p class="eyebrow">FightGame · End-to-End Product<\/p>\s*<h1>Personalized-Avatar Multiplayer Pixel RPG<\/h1>/);
  assert.match(niulai, /<p class="eyebrow">Niulai Squad · End-to-End Product<\/p>\s*<h1>Four-Agent Decision &amp; Publishing System<\/h1>/);
  assert.match(knowledgeBase, /FightGame is a \*\*Personalized-Avatar Multiplayer Pixel RPG\*\*/);
  assert.match(knowledgeBase, /Niulai Squad is a \*\*Four-Agent Decision & Publishing System\*\*/);
});

test("public repository links stay explicit and limited to verified targets", async () => {
  const publicPages = await Promise.all(["index.html", "about.html", "projects.html", "fightgame.html", "niulai.html"]
    .map((page) => readFile(new URL(`../${page}`, import.meta.url), "utf8")));
  const projects = publicPages[2];
  const knowledgeBase = await readFile(new URL("../portfolio-rag/JOHN_CHONG_PUBLIC_KNOWLEDGE_BASE_V1.md", import.meta.url), "utf8");
  const siteSource = '<a href="https://github.com/heyjohnc/john-chong-portfolio" target="_blank" rel="noreferrer">Site source</a>';

  for (const page of publicPages) assert.equal((page.match(new RegExp(siteSource, "g")) || []).length, 1);
  assert.equal((projects.match(/href="https:\/\/github\.com\/heyjohnc\/niulai-shengmi-squad" target="_blank" rel="noreferrer"/g) || []).length, 1);
  assert.match(knowledgeBase, /\*\*End-to-End Products · 02:\*\*/);
  assert.match(knowledgeBase, /\*\*Applied AI Workflows · 05:\*\*/);
  assert.match(knowledgeBase, /\*\*Open-Source Utilities · 02:\*\*/);
  assert.match(knowledgeBase, /Site source: <https:\/\/github\.com\/heyjohnc\/john-chong-portfolio>/);

  const projectGitHubTargets = [...projects.matchAll(/href="(https:\/\/github\.com\/heyjohnc\/[^"#?]+)"/g)].map((match) => match[1]).sort();
  assert.deepEqual(projectGitHubTargets, [
    "https://github.com/heyjohnc/codex-skill-radar",
    "https://github.com/heyjohnc/diary-exe-framework",
    "https://github.com/heyjohnc/john-chong-portfolio",
    "https://github.com/heyjohnc/niulai-shengmi-squad",
    "https://github.com/heyjohnc/oss-readiness-checker"
  ].sort());
});

test("flagship visuals lead with architecture while retaining real product evidence", async () => {
  const projects = await readFile(new URL("../projects.html", import.meta.url), "utf8");
  const fightgame = await readFile(new URL("../fightgame.html", import.meta.url), "utf8");
  const niulai = await readFile(new URL("../niulai.html", import.meta.url), "utf8");
  const niulaiDecisionLayer = await readFile(new URL("../assets/niulai/in-game-decision-layer.png", import.meta.url));
  const niulaiDialogueWindow = await readFile(new URL("../assets/niulai/agent-dialogue-window.png", import.meta.url));

  for (const page of [projects, fightgame]) {
    assert.match(page, /flagship-architecture--fight/);
    for (const asset of ["profile-and-loadout.png", "world-and-npcs.png", "turn-battle.png"]) assert.match(page, new RegExp(asset));
    assert.match(page, /Server authority/);
  }

  for (const page of [projects, niulai]) {
    assert.match(page, /flagship-architecture--niulai/);
    assert.match(page, /assets\/niulai\/in-game-decision-layer\.png/);
    assert.match(page, /assets\/niulai\/agent-dialogue-window\.png/);
    assert.match(page, /Four roles vote before the shared result\./);
    assert.match(page, /Distinct voices react to one recorded state\./);
    assert.doesNotMatch(page, /assets\/niulai\/agent-window\.png/);
  }

  for (const image of [niulaiDecisionLayer, niulaiDialogueWindow]) {
    assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  }
});

test("FightGame presents the custom-skin product flow and complete 79-card collection board", async () => {
  const fightgame = await readFile(new URL("../fightgame.html", import.meta.url), "utf8");
  const flowAssets = [
    "01-select-custom-skin.png",
    "02-upload-reference.png",
    "03-generation-status.png",
    "04-generated-avatar.png",
    "05-shared-world.png",
    "06-battle-identity.png"
  ];

  for (const filename of flowAssets) {
    assert.match(fightgame, new RegExp(`assets/fightgame/avatar-flow/${filename.replaceAll(".", "\\.")}`));
    const image = await readFile(new URL(`../assets/fightgame/avatar-flow/${filename}`, import.meta.url));
    assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  }

  assert.match(fightgame, /One reference image becomes one identity across the game\./);
  assert.match(fightgame, /One identity, three contexts\./);
  assert.match(fightgame, /assets\/fightgame\/skill-card-collection-board\.webp/);
  assert.match(fightgame, /Complete collection board/);
  assert.match(fightgame, /40 Common, 30 Uncommon and nine Premium/);
  assert.doesNotMatch(fightgame, /Illustrative collection view|skill-card-library-illustration/);
  const skillCards = await readFile(new URL("../assets/fightgame/skill-card-collection-board.webp", import.meta.url));
  assert.equal(skillCards.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(skillCards.subarray(8, 12).toString("ascii"), "WEBP");

  const cardEvidence = retrieve("How are the 79 FightGame skill cards divided by rarity?", { topK: 6 });
  assert.ok(cardEvidence.some((chunk) => ["KB-12", "FG-01"].includes(chunk.section_id)
    && /40 Common, 30 Uncommon and 9 Premium/.test(chunk.text)));
});

test("Ask John launcher uses the approved Ask label on desktop and mobile", async () => {
  const widget = await readFile(new URL("../ask-widget.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  assert.equal((widget.match(/launcher: "Ask"/g) || []).length, 2);
  assert.doesNotMatch(widget, /launcher: "(?:Ask me|問問我)"/);
  assert.match(styles, /\.ask-widget-launcher::after \{ content: "Ask";/);
  assert.doesNotMatch(styles, /\.ask-widget-launcher::after \{ content: "AI";/);
});

test("Ask John resolves only a coarse Vercel country code for aggregate telemetry", async () => {
  const widget = await readFile(new URL("../ask-widget.js", import.meta.url), "utf8");
  const countryEndpoint = await readFile(new URL("../api/country.mjs", import.meta.url), "utf8");
  assert.match(widget, /const COUNTRY_ENDPOINT = "\/api\/country"/);
  assert.match(widget, /country: await visitorCountry\(\)/);
  assert.match(countryEndpoint, /x-vercel-ip-country/);
  assert.doesNotMatch(widget, /ipify|ipinfo|ipapi|geolocation/i);
  assert.doesNotMatch(countryEndpoint, /x-forwarded-for|x-real-ip|latitude|longitude|city/i);
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

test("Niulai public feedback stays traceable, deduplicated and bounded", async () => {
  const caseStudy = await readFile(new URL("../niulai.html", import.meta.url), "utf8");
  const translations = await readFile(new URL("../site.js", import.meta.url), "utf8");
  assert.equal((caseStudy.match(/class="public-feedback-card"/g) || []).length, 3);
  for (const statusId of ["2094721262237131064", "2094719033992220858", "2094723001459851689", "2094719626714497353"]) {
    assert.equal((caseStudy.match(new RegExp(statusId, "g")) || []).length, 1);
  }
  assert.match(caseStudy, /Same observer as 01/);
  assert.match(caseStudy, /not customer testimonials, formal user research, or a code or security audit/i);
  assert.doesNotMatch(caseStudy, /SiMaYi|Bakaaaa|Saitama|0x[a-f0-9]{40}/i);
  for (const mapping of [
    '"Early public reactions.": "早期公開反應。"',
    '"Another independently restated the four roles, 3-of-4 voting threshold and PAPER_ONLY boundary—evidence that the mechanism was understandable outside the project team.": "另一名觀察者獨立重述四個角色、四取三投票門檻及 PAPER_ONLY 邊界，顯示項目團隊以外的人也能理解其機制。"',
    '"Evidence boundary": "證據邊界"'
  ]) assert.ok(translations.includes(mapping));
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

test("natural recruiter phrasing maps to public career evidence", () => {
  const examples = [
    ["他做过什么？", "portfolio_hierarchy", "KB-27"],
    ["他有什么经验？", "background", "KB-02"],
    ["他可以为团队带来什么？", "strengths", "KB-20"],
    ["有没有交付经验？", "delivery", "KB-08"],
    ["他会不会只依赖 AI？", "agents", "KB-11"],
    ["Which project should I look at first?", "flagship", "KB-12"],
    ["Can he deliver to clients?", "delivery", "KB-08"],
    ["What business problems can he solve?", "strengths", "KB-20"]
  ];
  for (const [question, concept, expected] of examples) {
    assert.ok(queryConcepts(question).includes(concept), `${question} did not map to ${concept}`);
    assert.ok(retrieve(question, { topK: 6 }).some((chunk) => chunk.section_id === expected), `${question} did not retrieve ${expected}`);
  }
  assert.deepEqual(retrieve("他做过什么？", { topK: 6 }).map((chunk) => chunk.section_id), ["KB-27"]);
});

test("bounded history resolves short follow-ups without becoming profile evidence", () => {
  const history = normaliseHistory([
    { role: "user", content: "你了解 John 吗？" },
    { role: "assistant", content: "John 是 AI 产品与应用构建者。" }
  ]);
  assert.equal(history.length, 2);
  assert.match(contextualQuestion("什么意思？", history), /你了解 John/);
  assert.equal(isContextDependent("它用了什么技术？"), true);
  assert.match(contextualQuestion("它用了什么技术？", [
    { role: "user", content: "What is FightGame?" },
    { role: "assistant", content: "FightGame is a multiplayer project." }
  ]), /What is FightGame/);
  assert.equal(contextualQuestion("What is his favourite restaurant?", history), "What is his favourite restaurant?");
  assert.equal(normaliseHistory([{ role: "system", content: "not allowed" }]), null);
  assert.equal(normaliseHistory(Array.from({ length: 7 }, () => ({ role: "user", content: "x" }))), null);
});

test("provider citations must stay inside retrieved evidence", () => {
  const retrieved = retrieve("What is FightGame?", { topK: 6 });
  assert.equal(validProviderAnswer({ answer: "Grounded answer", citations: [retrieved[0].section_id] }, retrieved), true);
  assert.equal(validProviderAnswer({ answer: "Unverified answer", citations: ["KB-99"] }, retrieved), false);
  assert.equal(validProviderAnswer({ answer: "No citation", citations: [] }, retrieved), false);
});

test("project-source citations retain an auditable public revision", () => {
  const citations = citationObjects(["NL-06", "FG-03"]);
  assert.match(citations[0].source_url, /^https:\/\/github\.com\/heyjohnc\/niulai-shengmi-squad\/tree\//);
  assert.match(citations[0].source_revision, /^[a-f0-9]{40}$/);
  assert.equal(citations[1].source_url, "/fightgame.html");
});

test("semantic routing catalog exposes career topics but excludes policy-only sections", () => {
  const catalogIds = semanticRouterCatalog().map((item) => item.section_id);
  for (const sectionId of ["KB-22", "KB-24", "KB-26"]) assert.ok(!catalogIds.includes(sectionId));
  for (const sectionId of ["FG-01", "NL-01", "NL-07"]) assert.ok(catalogIds.includes(sectionId));
  assert.deepEqual(
    routedChunks({ supported: true, boundary: "career_supported", section_ids: ["KB-20", "KB-24", "KB-99"] }).map((chunk) => chunk.section_id),
    ["KB-20"]
  );
  assert.deepEqual(routedChunks({ supported: false, boundary: "off_topic", section_ids: ["KB-20"] }), []);
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

test("country endpoint exposes only a validated aggregate country code", async () => {
  const known = await handleCountryRequest(new Request("https://portfolio.example/api/country", {
    headers: { "x-vercel-ip-country": "jp", "x-forwarded-for": "203.0.113.42" }
  })).json();
  const invalid = await handleCountryRequest(new Request("https://portfolio.example/api/country", {
    headers: { "x-vercel-ip-country": "Japan", "x-forwarded-for": "203.0.113.42" }
  })).json();
  assert.deepEqual(known, { country: "JP" });
  assert.deepEqual(invalid, { country: "unknown" });
  assert.doesNotMatch(JSON.stringify(known), /203\.0\.113\.42/);
});

test("aggregate telemetry stores bounded UTC-hour, language and country counters without raw IP", async () => {
  const originalFetch = globalThis.fetch;
  let command;
  globalThis.fetch = async (_url, options) => {
    command = JSON.parse(options.body);
    return { ok: true, json: async () => ({ result: 1 }) };
  };
  try {
    const now = new Date("2026-09-03T07:24:00.000Z");
    await recordAggregateTelemetry({
      mode: "answer",
      language: "zh-Hant-yue",
      country: "jp",
      corpusVersion: "1.2.0-draft",
      now,
      env: {
        ASK_JOHN_CONTROL_MODE: "upstash",
        ASK_JOHN_REDIS_PREFIX: "ask-john-test",
        UPSTASH_REDIS_REST_URL: "https://example.invalid",
        UPSTASH_REDIS_REST_TOKEN: "not-a-real-token"
      }
    });
    assert.equal(hourKey(now), "07");
    assert.equal(aggregateCountryCode("jp"), "JP");
    assert.equal(aggregateCountryCode("Japan"), "unknown");
    assert.equal(command[0], "EVAL");
    assert.equal(command[2], "1");
    assert.deepEqual(command.slice(3), ["ask-john-test:metrics:2026-09-03", "answer", "zh-Hant-yue", "JP", "07", "external", "1.2.0-draft"]);
    assert.match(command[1], /hour:.*:country:/s);
    assert.match(command[1], /owner_qa.*_requests|ARGV\[5\].*_requests/s);
    assert.doesNotMatch(JSON.stringify(command), /203\.0\.113\.42|question|answer text/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
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

test("owner-operated VPS control path speaks bounded Redis RESP", () => {
  const command = encodeRedisCommand(["INCR", "ask-john:test"]);
  assert.equal(command.toString("utf8"), "*2\r\n$4\r\nINCR\r\n$13\r\nask-john:test\r\n");
  assert.deepEqual(parseRedisReply(Buffer.from("*4\r\n:1\r\n:2\r\n:3\r\n:0\r\n")), { value: [1, 2, 3, 0], offset: 20 });
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
    assert.match(request.body.messages[0].content, /Distinguish the person John from the portfolio assistant named Ask John/);
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

test("API uses an LLM semantic router for colloquial intent and bounded redirection", async () => {
  resetMemoryControlsForTest();
  const originalFetch = globalThis.fetch;
  const providerBodies = [];
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://openrouter.ai/api/v1/chat/completions");
    const body = JSON.parse(options.body);
    providerBodies.push(body);
    const isRouter = body.response_format.json_schema.name === "ask_john_semantic_route";
    if (!isRouter) {
      return { ok: true, json: async () => ({
        model: "deepseek/deepseek-v4-flash-0731",
        choices: [{ message: { content: '{"answer":"John can turn unclear needs into testable AI products and lead review and acceptance.","citations":["KB-20"]}' } }],
        usage: { prompt_tokens: 100, completion_tokens: 20 }
      }) };
    }
    const prompt = body.messages[1].content;
    let route = { supported: false, boundary: "off_topic", section_ids: [] };
    if (prompt.includes("John 能干嘛")) route = { supported: true, boundary: "career_supported", section_ids: ["KB-20", "KB-02"] };
    if (prompt.includes("帮我联系 John")) route = { supported: false, boundary: "external_action", section_ids: [] };
    return { ok: true, json: async () => ({
      model: "deepseek/deepseek-v4-flash-0731",
      choices: [{ message: { content: JSON.stringify(route) } }],
      usage: { prompt_tokens: 80, completion_tokens: 12 }
    }) };
  };
  try {
    const env = {
      NODE_ENV: "test", ASK_JOHN_ENABLED: "true", ASK_JOHN_CONTROL_MODE: "memory", ASK_JOHN_IP_HASH_SALT: "semantic-router-test",
      OPENROUTER_API_KEY: "server-test-key", ASK_JOHN_MODEL: "deepseek/deepseek-v4-flash-0731", ASK_JOHN_PER_IP_LIMIT: "10",
      ASK_JOHN_DAILY_REQUEST_LIMIT: "10", ASK_JOHN_DAILY_BUDGET_USD: "1", ASK_JOHN_MAX_COST_PER_REQUEST_USD: "0.01"
    };
    const ask = async (question) => {
      const request = new Request("https://portfolio.example/api/ask", {
        method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.77" }, body: JSON.stringify({ question })
      });
      return (await handleRequest(request, env)).json();
    };

    const capability = await ask("John 能干嘛？");
    assert.equal(capability.mode, "answer");
    assert.equal(capability.retrieval_path, "semantic_router");
    assert.equal(capability.citations[0].section_id, "KB-20");

    const offTopic = await ask("今天天气怎么样？");
    assert.equal(offTopic.mode, "no_evidence");
    assert.equal(offTopic.retrieval_path, "semantic_router");
    assert.match(offTopic.answer, /不是通用聊天机器人/);

    const externalAction = await ask("帮我联系 John");
    assert.equal(externalAction.mode, "refuse");
    assert.match(externalAction.answer, /不能代替他联系/);
    assert.ok(externalAction.citations.some((item) => item.section_id === "KB-24"));

    assert.equal(providerBodies.length, 4);
    const routingBody = providerBodies[0];
    assert.equal(routingBody.response_format.json_schema.strict, true);
    assert.equal(routingBody.temperature, 0);
    assert.deepEqual(routingBody.tools, []);
    assert.match(routingBody.messages[1].content, /KB-20 — Strengths relevant to employers/);
    assert.doesNotMatch(routingBody.messages[1].content, /translating unclear requirements into an executable product scope/);
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

test("API handles bounded small talk locally and redirects off-topic chat", async () => {
  resetMemoryControlsForTest();
  const env = {
    NODE_ENV: "test", ASK_JOHN_ENABLED: "true", ASK_JOHN_PROVIDER: "fixture", ASK_JOHN_CONTROL_MODE: "memory", ASK_JOHN_IP_HASH_SALT: "small-talk-test",
    ASK_JOHN_PER_IP_LIMIT: "20", ASK_JOHN_DAILY_REQUEST_LIMIT: "20", ASK_JOHN_DAILY_BUDGET_USD: "1", ASK_JOHN_MAX_COST_PER_REQUEST_USD: "0.01"
  };
  const ask = async (question) => {
    const request = new Request("https://portfolio.example/api/ask", {
      method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.55" }, body: JSON.stringify({ question })
    });
    return (await handleRequest(request, env)).json();
  };
  for (const question of ["你好", "你是谁？", "谢谢", "How are you?", "Goodbye"]) {
    const response = await ask(question);
    assert.equal(response.mode, "system", question);
    assert.equal(response.citations.length, 0, question);
  }
  const offTopic = await ask("今天天气怎么样？");
  assert.equal(offTopic.mode, "no_evidence");
  assert.match(offTopic.answer, /不是通用聊天机器人/);
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
  assert.equal(supported.corpus.version, "1.2.0-draft");
});
