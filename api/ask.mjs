import { randomUUID } from "node:crypto";
import { enforceOperationalControls, recordAggregateTelemetry } from "./_lib/controls.mjs";
import { estimateProviderCostUsd, generateAnswer } from "./_lib/provider.mjs";
import { assistantCapabilityResponse, citationObjects, evaluatePolicy, noEvidenceResponse } from "./_lib/policy.mjs";
import { corpusMetadata, queryConcepts, retrieve } from "./_lib/retrieval.mjs";

const QUESTION_LIMIT = 600;
const HISTORY_LIMIT = 6;
const HISTORY_ITEM_LIMIT = 700;
const HISTORY_TOTAL_LIMIT = 3600;
const MINIMUM_SCORE = 2.2;
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
  const retrieved = retrieve(retrievalQuestion, { topK: 6 });
  if (!queryConcepts(retrievalQuestion).length || !retrieved.length || retrieved[0].score < MINIMUM_SCORE) {
    const empty = noEvidenceResponse(policy.language);
    const payload = { ...basePayload(requestId), mode: empty.mode, answer: empty.answer, citations: citationObjects(empty.citation_ids), timing_ms: Date.now() - startedAt };
    void recordAggregateTelemetry({ mode: payload.mode, language: policy.language, corpusVersion: payload.corpus.version, env });
    return json(200, payload);
  }

  try {
    const generated = await generateAnswer({ question, history, chunks: retrieved, language: policy.language }, env);
    if (!validProviderAnswer(generated, retrieved)) throw new Error("Provider answer failed citation validation.");
    const payload = { ...basePayload(requestId), mode: "answer", answer: generated.answer, citations: citationObjects(generated.citations), timing_ms: Date.now() - startedAt };
    const cost = estimateProviderCostUsd(generated.usage, generated.model);
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
export { HISTORY_LIMIT, MINIMUM_SCORE, QUESTION_LIMIT, contextualQuestion, isContextDependent, normaliseHistory, validProviderAnswer };
