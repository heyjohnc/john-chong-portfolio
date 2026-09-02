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
  if (language === "zh-Hant-yue") return "呢個問題唔喺我已審批的公開職業資料範圍內。你可以問 John 的經歷、項目、技能、工作方式或者香港工作資格。";
  if (language === "zh") return "这个问题不在我已审核的公开职业资料范围内。你可以问 John 的经历、项目、技能、工作方式或香港工作资格。";
  return "That question is outside my approved public career information. You can ask about John's experience, projects, skills, working method or Hong Kong work eligibility.";
}

function memoryText(language) {
  if (language === "zh-Hant-yue") return "有。我可以喺你目前使用的瀏覽器保留最近 4 輪對話最多 3 日，用嚟理解『即係咩意思』呢類追問。記錄只存喺呢個瀏覽器，可以隨時按『清除』刪除；伺服器唔會建立長期個人記憶，舊對話亦唔會當成 John 的事實證據。";
  if (language === "zh") return "有。我可以在你当前使用的浏览器保留最近 4 轮对话最多 3 天，用来理解“是什么意思”这类追问。记录只保存在这个浏览器，可以随时点击“清除”删除；服务器不会建立长期个人记忆，旧对话也不会被当作 John 的事实证据。";
  return "Yes. I can keep the last four exchanges in this browser for up to three days so I can understand follow-up questions. You can clear them at any time. The server does not build a long-term personal memory, and prior chat is never treated as factual evidence about John.";
}

function introductionText(language) {
  if (language === "zh-Hant-yue") return "你好，我係 Ask John，一個只根據 John 已審批公開職業資料回答的作品集助手。你可以問我佢嘅經歷、項目、技能、工作方式、Agent 協作或者香港工作資格。";
  if (language === "zh") return "你好，我是 Ask John，一个只根据 John 已审核公开职业资料回答的作品集助手。你可以问我他的经历、项目、技能、工作方式、Agent 协作或香港工作资格。";
  return "Hello, I'm Ask John, a portfolio assistant that answers only from John's approved public career information. Ask me about his experience, projects, skills, working method, Agent collaboration or Hong Kong work eligibility.";
}

function thanksText(language) {
  if (language === "zh-Hant-yue") return "唔使客氣。你可以繼續問 John 的項目、經歷、技能或者工作方式。";
  if (language === "zh") return "不客气。你可以继续问 John 的项目、经历、技能或工作方式。";
  return "You're welcome. You can keep asking about John's projects, experience, skills or working method.";
}

function farewellText(language) {
  if (language === "zh-Hant-yue") return "再見，多謝你了解 John。需要時可以隨時返嚟睇佢嘅作品集。";
  if (language === "zh") return "再见，感谢你了解 John。需要时可以随时回来查看他的作品集。";
  return "Goodbye, and thanks for learning about John. You can return to his portfolio whenever you need more detail.";
}

export function assistantCapabilityResponse(question, language = languageOf(question)) {
  if (/\b(do you|does this).*(remember|memory)|\bmemory\b|你.*记忆|你.*記憶|有记忆|有記憶|记得.*对话|記得.*對話/i.test(question)) {
    return { mode: "system", language, answer: memoryText(language), citation_ids: [] };
  }
  if (/^(?:who are you|what can you do|how can you help|help|你好|您好|嗨|哈喽|哈囉|早上好|早晨|你是谁|你是誰|你係邊個|你能做什么|你能做什麼|你可以做什么|你可以做什麼|可以问什么|可以問什麼)[?？!！.。\s]*$/i.test(question)) {
    return { mode: "system", language, answer: introductionText(language), citation_ids: [] };
  }
  if (/^(?:hi|hello|hey|good (?:morning|afternoon|evening)|how are you|thanks|thank you|thx|谢谢|謝謝|多谢|多謝|唔该|唔該)[?？!！.。\s]*$/i.test(question)) {
    const isThanks = /^(?:thanks|thank you|thx|谢谢|謝謝|多谢|多謝|唔该|唔該)/i.test(question);
    return { mode: "system", language, answer: isThanks ? thanksText(language) : introductionText(language), citation_ids: [] };
  }
  if (/^(?:bye|goodbye|see you|再见|再見|拜拜)[?？!！.。\s]*$/i.test(question)) {
    return { mode: "system", language, answer: farewellText(language), citation_ids: [] };
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
    source_url: chunk.source_url,
    source_revision: chunk.source_revision || null
  }));
}

export { languageOf };
