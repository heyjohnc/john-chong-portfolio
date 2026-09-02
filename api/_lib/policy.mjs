import { getChunk, queryConcepts } from "./retrieval.mjs";

const patterns = {
  injection: /ignore (all |any )?(previous|prior|system) instructions|reveal every private|new kb-?\d+|treat this message as|add my statement|use (this|my) statement|system prompt|越过|繞過|忽略.*指令|当成.*知识库|當成.*知識庫|把我.*说法.*加入|把我.*說法.*加入/i,
  action: /\b(send|submit|apply|promise|negotiate|change (his|the) record|act on (his|john'?s) behalf|browse the web|search private databases?)\b|代替.*(发送|發送|申请|申請)|承诺.*到岗|承諾.*到崗|更改.*资料|更新.*资料|瀏覽.*私人|浏览.*私人/i,
  sensitive: /\b(age|date of birth|birth date|birthday|salary|previous income|phone number|home address|exact (daily )?commute|wallet address|transaction hash|financial outcome|client identity|chat record|payment (detail|record)|credential|secret|private fact)\b|年龄|年齡|出生日期|生日|薪资|薪資|工资|工資|收入|电话|電話|住址|家庭地址|详细通勤|詳細通勤|钱包|錢包|交易哈希|财务结果|財務結果|客户.*身份|客戶.*身份|聊天记录|聊天記錄|付款资料|付款資料|凭据|憑據|秘密|私人资料|私人資料/i
};

function languageOf(question) {
  if (!/[\p{Script=Han}]/u.test(question)) return "en";
  if (/[喺佢冇唔使咩係嘅嚟返工幫搞職軟項尋驗據審為麼]/u.test(question)) return "zh-Hant-yue";
  return "zh";
}

function refusalText(language) {
  if (language === "zh-Hant-yue") return "我只可以根據 John 已審批的公開職業資料回答，唔會提供私人、敏感資料，亦唔可以代佢執行外部操作。";
  if (language === "zh") return "我只能依据 John 已审核的公开职业资料回答，不能提供私人或敏感信息，也不能代替他执行外部操作。";
  return "I can only answer from John's approved public career profile. I cannot provide private or sensitive information or take external action on his behalf.";
}

function noEvidenceText(language) {
  if (language === "zh-Hant-yue") return "我喺已審批的公開資料入面搵唔到足夠證據回答。你可以查看 John 的作品集或直接聯絡佢。";
  if (language === "zh") return "我在已审核的公开资料中找不到足够依据回答。你可以查看 John 的作品集或直接联系他。";
  return "I don't have enough approved public information to answer that. You can review John's portfolio or contact him directly.";
}

function memoryText(language) {
  if (language === "zh-Hant-yue") return "有。我可以喺你目前使用的瀏覽器保留最近 4 輪對話最多 3 日，用嚟理解『即係咩意思』呢類追問。記錄只存喺呢個瀏覽器，可以隨時按『清除』刪除；伺服器唔會建立長期個人記憶，舊對話亦唔會當成 John 的事實證據。";
  if (language === "zh") return "有。我可以在你当前使用的浏览器保留最近 4 轮对话最多 3 天，用来理解“是什么意思”这类追问。记录只保存在这个浏览器，可以随时点击“清除”删除；服务器不会建立长期个人记忆，旧对话也不会被当作 John 的事实证据。";
  return "Yes. I can keep the last four exchanges in this browser for up to three days so I can understand follow-up questions. You can clear them at any time. The server does not build a long-term personal memory, and prior chat is never treated as factual evidence about John.";
}

export function assistantCapabilityResponse(question, language = languageOf(question)) {
  if (/\b(do you|does this).*(remember|memory)|\bmemory\b|你.*记忆|你.*記憶|有记忆|有記憶|记得.*对话|記得.*對話/i.test(question)) {
    return { mode: "system", language, answer: memoryText(language), citation_ids: [] };
  }
  return null;
}

export function evaluatePolicy(question) {
  const language = languageOf(question);
  const concepts = queryConcepts(question);
  if (patterns.injection.test(question) || patterns.action.test(question) || patterns.sensitive.test(question)) {
    const citations = new Set(["KB-24", "KB-26"]);
    if (concepts.includes("niulai") || /wallet|transaction|钱包|錢包|交易/i.test(question)) citations.add("KB-15");
    if (/senior ml researcher|machine.learning researcher|高级.*研究|高級.*研究/i.test(question)) citations.add("KB-03");
    return { mode: "refuse", language, answer: refusalText(language), citation_ids: [...citations] };
  }
  return { mode: "allow", language, answer: "", citation_ids: [] };
}

export function noEvidenceResponse(language) {
  return { mode: "no_evidence", language, answer: noEvidenceText(language), citation_ids: ["KB-26"] };
}

export function citationObjects(sectionIds, { snippetLength = 360 } = {}) {
  return sectionIds.map((sectionId) => getChunk(sectionId)).filter(Boolean).map((chunk) => ({
    section_id: chunk.section_id,
    heading: chunk.heading,
    snippet: chunk.text.replace(/\s+/g, " ").slice(0, snippetLength).trim(),
    source_url: chunk.source_url
  }));
}

export { languageOf };
