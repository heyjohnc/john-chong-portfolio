import { randomUUID } from "node:crypto";
import { enforceOperationalControls, recordAggregateTelemetry } from "./_lib/controls.mjs";
import { estimateProviderCostUsd, generateAnswer, routeQuestion } from "./_lib/provider.mjs";
import { assistantCapabilityResponse, citationObjects, evaluatePolicy, noEvidenceResponse } from "./_lib/policy.mjs";
import { corpusMetadata, getChunk, index, queryConcepts, retrieve } from "./_lib/retrieval.mjs";

const QUESTION_LIMIT = 600;
const HISTORY_LIMIT = 6;
const HISTORY_ITEM_LIMIT = 700;
const HISTORY_TOTAL_LIMIT = 3600;
const MINIMUM_SCORE = 2.2;
const ROUTER_EXCLUDED_SECTIONS = new Set(["KB-22", "KB-24", "KB-26"]);
export const maxDuration = 35;

function json(status, payload, extraHeaders = {}) {
  return Response.json(payload, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff", ...extraHeaders }
  });
}

function clientAddress(request) {
  return (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
}

function basePayload(requestId) {
  return { request_id: requestId, corpus: corpusMetadata() };
}

function normaliseHistory(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > HISTORY_LIMIT) return null;
  let total = 0;
  const history = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") return null;
    const content = item.content.trim();
    if (!content || content.length > HISTORY_ITEM_LIMIT) return null;
    total += content.length;
    if (total > HISTORY_TOTAL_LIMIT) return null;
    history.push({ role: item.role, content });
  }
  return history;
}

function isContextDependent(question) {
  const shortFollowUp = /^(?:what does (?:that|this) mean|why|how so|tell me more|can you explain|and (?:what|how|why) about (?:it|that|this)|什么意思|甚麼意思|什麼意思|即係咩|为什么|為甚麼|點解|具体点|具體啲|继续|繼續|那呢|咁呢)[?？.!。\s]*$/i;
  const referencedFollowUp = /\b(?:it|that|this|they|them|those|these|the former|the latter|that project|this project|the project)\b|(?:这个|這個|那个|那個|这些|這些|那些|它|它们|它們|上述|前面|刚才|剛才|呢個|嗰個|佢|佢哋)(?:项目|項目|系统|系統|工具|技术|技術|做法|流程|又|还|還|呢|有什么|有什麼|用了|使用|如何|怎么|怎麼|點樣)?/i;
  return shortFollowUp.test(question) || referencedFollowUp.test(question);
}

function contextualQuestion(question, history) {
  if (!history.length) return question;
  if (!isContextDependent(question)) return question;
  const previousUser = [...history].reverse().find((item) => item.role === "user");
  return previousUser ? `${previousUser.content}\nFollow-up: ${question}` : question;
}

function operationalText(mode, language) {
  if (language === "zh-Hant-yue") {
    if (mode === "rate_limited") return "Ask John 已達到目前請求次數限制，請稍後再試。";
    if (mode === "disabled") return "Ask John 暫時未能使用，正在配置安全及費用控制。";
    return "Ask John 未能產生經驗證的回答，因此沒有顯示未經驗證的模型輸出。";
  }
  if (language === "zh") {
    if (mode === "rate_limited") return "Ask John 已达到当前请求次数限制，请稍后再试。";
    if (mode === "disabled") return "Ask John 暂时不可用，正在配置安全与费用控制。";
    return "Ask John 无法生成经过验证的回答，因此没有显示未经验证的模型输出。";
  }
  if (mode === "rate_limited") return "Ask John has reached its current request limit. Please try again later.";
  if (mode === "disabled") return "Ask John is currently unavailable while its safety and cost controls are being configured.";
  return "Ask John could not produce a verified answer. No unverified model output was shown.";
}

function validProviderAnswer(answer, retrieved) {
  if (!answer || typeof answer.answer !== "string" || answer.answer.length < 1 || answer.answer.length > 1800) return false;
  if (!Array.isArray(answer.citations) || answer.citations.length < 1 || answer.citations.length > 6) return false;
  const allowed = new Set(retrieved.map((chunk) => chunk.section_id));
  return answer.citations.every((sectionId) => allowed.has(sectionId));
}

function semanticRouterCatalog() {
  return index.chunks
    .filter((chunk) => !ROUTER_EXCLUDED_SECTIONS.has(chunk.section_id))
    .map((chunk) => ({ section_id: chunk.section_id, heading: chunk.heading }));
}

function routedChunks(route) {
  if (!route || route.supported !== true || route.boundary !== "career_supported" || !Array.isArray(route.section_ids)) return [];
  const allowed = new Set(semanticRouterCatalog().map((item) => item.section_id));
  return [...new Set(route.section_ids)]
    .filter((sectionId) => allowed.has(sectionId))
    .map((sectionId) => getChunk(sectionId))
    .filter(Boolean)
    .slice(0, 6);
}

function semanticBoundaryResponse(boundary, language) {
  const cantonese = language === "zh-Hant-yue";
  const chinese = language === "zh";
  if (["private_or_sensitive", "external_action"].includes(boundary)) {
    return {
      mode: "refuse",
      answer: cantonese
        ? "我只可以根據 John 已審批的公開求職資料回答，唔會提供私人資料，亦唔可以代佢聯絡、申請或執行外部操作。你可以改問佢嘅公開經歷、項目、能力或者工作方式。"
        : chinese
          ? "我只能依据 John 已审核的公开求职资料回答，不能提供私人资料，也不能代替他联系、申请或执行外部操作。你可以改问他的公开经历、项目、能力或工作方式。"
          : "I can only use John's approved public career information. I cannot provide private information or contact, apply or act on his behalf. You can instead ask about his public experience, projects, capabilities or working method.",
      citation_ids: ["KB-24", "KB-26"]
    };
  }
  if (boundary === "missing_public_fact") {
    return {
      mode: "no_evidence",
      answer: cantonese
        ? "你問緊 John，但呢項資料唔喺已審批的公開求職資料入面，所以我唔會估。你可以改問：佢做過咩、擅長咩、適合咩職位，或者邊個項目最值得先睇。"
        : chinese
          ? "你问的是 John，但这项内容不在已审核的公开求职资料里，所以我不会猜。你可以改问：他做过什么、擅长什么、适合哪些岗位，或者应该先看哪个项目。"
          : "That is about John, but the requested detail is not in his approved public career profile, so I will not guess. Try asking what he has built, what he is good at, which roles fit him, or which project to review first.",
      citation_ids: ["KB-26"]
    };
  }
  return {
    mode: "no_evidence",
    answer: cantonese
      ? "我主要幫你了解 John 的求職背景，唔係一般聊天機械人。你可以問：John 可以做咩、適合咩團隊、點樣同 Agent 協作，或者佢有咩代表項目。"
      : chinese
        ? "我主要帮助你了解 John 的求职背景，不是通用聊天机器人。你可以问：John 能做什么、适合什么团队、怎样与 Agent 协作，或者有哪些代表项目。"
        : "I focus on John's career profile rather than general chat. You can ask what John can do, what teams suit him, how he works with Agents, or which projects best represent his work.",
    citation_ids: ["KB-26"]
  };
}

export async function handleRequest(request, env = process.env) {
  const startedAt = Date.now();
  const requestId = randomUUID();
  if (request.method !== "POST") return json(405, { ...basePayload(requestId), mode: "error", answer: "This endpoint accepts POST requests only.", citations: [] }, { Allow: "POST" });
  const contentType = (request.headers.get("content-type") || "").toLowerCase();
  if (!contentType.startsWith("application/json")) return json(415, { ...basePayload(requestId), mode: "error", answer: "Use application/json.", citations: [] });
  const declaredSize = Number(request.headers.get("content-length") || 0);
  if (declaredSize > 8192) return json(413, { ...basePayload(requestId), mode: "error", answer: "Request body is too large.", citations: [] });

  let body;
  try { body = await request.json(); } catch (_) { body = null; }
  if (!body || typeof body !== "object" || JSON.stringify(body).length > 8192) return json(400, { ...basePayload(requestId), mode: "error", answer: "Enter one valid question.", citations: [] });
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const history = normaliseHistory(body.history);
  if (!question || question.length > QUESTION_LIMIT || history === null) {
    return json(400, { ...basePayload(requestId), mode: "error", answer: `Enter one question of ${QUESTION_LIMIT} characters or fewer with valid bounded conversation context.`, citations: [] });
  }

  const visitorContext = [...history.filter((item) => item.role === "user").map((item) => item.content), question].join("\n");
  const policy = evaluatePolicy(visitorContext);
  const controls = await enforceOperationalControls({ clientAddress: clientAddress(request), env });
  if (!controls.allowed) {
    const mode = controls.mode === "rate_limited" ? "rate_limited" : "disabled";
    return json(mode === "rate_limited" ? 429 : 503, { ...basePayload(requestId), mode, answer: operationalText(mode, policy.language), citations: [] });
  }

  if (policy.mode === "refuse") {
    const payload = { ...basePayload(requestId), mode: "refuse", answer: policy.answer, citations: citationObjects(policy.citation_ids), timing_ms: Date.now() - startedAt };
    void recordAggregateTelemetry({ mode: payload.mode, language: policy.language, corpusVersion: payload.corpus.version, env });
    return json(200, payload);
  }

  const capability = assistantCapabilityResponse(question, policy.language);
  if (capability) {
    const payload = { ...basePayload(requestId), mode: capability.mode, answer: capability.answer, citations: [], timing_ms: Date.now() - startedAt };
    void recordAggregateTelemetry({ mode: payload.mode, language: policy.language, corpusVersion: payload.corpus.version, env });
    return json(200, payload);
  }

  const retrievalQuestion = contextualQuestion(question, history);
  let retrieved = retrieve(retrievalQuestion, { topK: 6 });
  let semanticRoute = null;
  let retrievalPath = "lexical";
  const needsSemanticRouting = !queryConcepts(retrievalQuestion).length || !retrieved.length || retrieved[0].score < MINIMUM_SCORE;
  if (needsSemanticRouting) {
    try {
      semanticRoute = await routeQuestion({
        question: retrievalQuestion,
        catalog: semanticRouterCatalog(),
        language: policy.language
      }, env);
      retrieved = routedChunks(semanticRoute);
      retrievalPath = "semantic_router";
    } catch (_) {
      const payload = { ...basePayload(requestId), mode: "error", answer: operationalText("error", policy.language), citations: [], timing_ms: Date.now() - startedAt };
      void recordAggregateTelemetry({ mode: payload.mode, language: policy.language, corpusVersion: payload.corpus.version, env });
      return json(503, payload);
    }
  }

  if (!retrieved.length) {
    const empty = semanticRoute
      ? semanticBoundaryResponse(semanticRoute.boundary, policy.language)
      : noEvidenceResponse(policy.language);
    const payload = { ...basePayload(requestId), mode: empty.mode, answer: empty.answer, citations: citationObjects(empty.citation_ids), retrieval_path: retrievalPath, timing_ms: Date.now() - startedAt };
    void recordAggregateTelemetry({ mode: payload.mode, language: policy.language, corpusVersion: payload.corpus.version, env });
    return json(200, payload);
  }

  try {
    const generated = await generateAnswer({ question, history, chunks: retrieved, language: policy.language }, env);
    if (!validProviderAnswer(generated, retrieved)) throw new Error("Provider answer failed citation validation.");
    const payload = { ...basePayload(requestId), mode: "answer", answer: generated.answer, citations: citationObjects(generated.citations), retrieval_path: retrievalPath, timing_ms: Date.now() - startedAt };
    const answerCost = estimateProviderCostUsd(generated.usage, generated.model);
    const routeCost = semanticRoute ? estimateProviderCostUsd(semanticRoute.usage, semanticRoute.model) : 0;
    const cost = answerCost === null || (semanticRoute && routeCost === null) ? null : Number((answerCost + routeCost).toFixed(6));
    if (cost !== null) payload.approximate_cost_usd = cost;
    void recordAggregateTelemetry({ mode: payload.mode, language: policy.language, corpusVersion: payload.corpus.version, env });
    return json(200, payload);
  } catch (_) {
    const payload = { ...basePayload(requestId), mode: "error", answer: operationalText("error", policy.language), citations: [], timing_ms: Date.now() - startedAt };
    void recordAggregateTelemetry({ mode: payload.mode, language: policy.language, corpusVersion: payload.corpus.version, env });
    return json(503, payload);
  }
}

export default { fetch: handleRequest };
export { HISTORY_LIMIT, MINIMUM_SCORE, QUESTION_LIMIT, contextualQuestion, isContextDependent, normaliseHistory, routedChunks, semanticRouterCatalog, validProviderAnswer };
