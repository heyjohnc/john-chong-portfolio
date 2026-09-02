import index from "../../data/ask-john-index.mjs";

const conceptRules = [
  ["identity", /\b(name|identity|called|professional name|formal name)\b|姓名|名字|中文名|英文名/i],
  ["roles", /\b(role|roles|job|position|target|looking for|career direction|role fit|job fit)\b|岗位|職位|求职|求職|职业方向|職業方向|适合.*岗位|適合.*職位|胜任.*岗位|勝任.*職位/i],
  ["visa", /\b(visa|sponsor|sponsorship|work right|permanent resident)\b|签证|簽證|工作权|工作權|永久居民|永居/i],
  ["availability", /\b(start|join|available|availability|on-site|onsite)\b|入职|入職|到岗|到崗|上班|返工|几时|幾時/i],
  ["languages", /\b(language|cantonese|mandarin|english|fluency)\b|语言|語言|广东话|廣東話|粤语|粵語|普通话|普通話|英语|英語/i],
  ["education", /\b(education|degrees?|university|master|bachelor|advertising|physics|wollongong|shenzhen university)\b|学历|學歷|学位|學位|大学|大學|硕士|碩士|本科|广告学|廣告學/i],
  ["pingan", /\b(ping an|insurance|motor insurance|auto insurance|marketing specialist)\b|平安|车险|車險|保险|保險/i],
  ["studio", /\b(studio|founder|co-founder|client delivery|business partner|supplier|stakeholder|requirement clarification|client communication)\b|工作室|创业|創業|客户|客戶|供应商|供應商|需求沟通|需求溝通|交付沟通|交付溝通/i],
  ["fightgame", /\b(fightgame|fight game|phaser|colyseus|pvp|skill card|battle coach|quinn)\b|对战|對戰|技能卡|游戏|遊戲|教练|教練/i],
  ["niulai", /\b(niulai|shengmi|market-event|canonical timeline|four-agent|four agent)\b|牛来|牛來|生米|四个 agent|四個 agent|时间线|時間線/i],
  ["rag", /\b(rag|retrieval|grounded|grounding|vector|embedding|knowledge base)\b|检索|檢索|知识库|知識庫|有根据|有根據/i],
  ["agents", /\b(agent|agents|multi-agent|development agents|human contribution|rely on ai|depend on ai|manually coded?|write all the code)\b|智能体|代理|多 agent|多个 agent|多個 agent|本人|亲自|親自|依赖 ai|依賴 ai|全靠 ai|手写代码|手寫代碼/i],
  ["uat", /\b(uat|test|testing|accept|acceptance|validate|validation|verify|verification|failure|recover|recovery|regression)\b|测试|測試|验收|驗收|验证|驗證|核验|核驗|失败|失敗|恢复|恢復|修复|修復/i],
  ["project_evidence", /\b(public repository|public repo|project evidence|evidence pack|proof|what.*(?:verify|prove))\b|公开仓库|公開倉庫|公开证据|公開證據|项目证据|項目證據|证明|證明/i],
  ["video", /\b(video|seedance|ffmpeg|storyboard|render|channel|playout)\b|视频|影片|影像|分镜|分鏡|渲染/i],
  ["document_intelligence", /\b(document intelligence|evidence.first|ocr|provenance|diary|source.linked)\b|文件智能|文件智慧|证据优先|證據優先|来源脉络|來源脈絡/i],
  ["public_data", /\b(public.data|data dashboard|explainable metrics|official sources)\b|公共数据|公共資料|数据仪表板|資料儀表板|可解释指标|可解釋指標/i],
  ["nft_workflow", /\b(nft|collection production|metadata package|mint|deterministic qa)\b|数字藏品|數字藏品|系列制作|系列製作|确定性.*验证|確定性.*驗證/i],
  ["developer_tools", /\b(developer.tool|trend radar|skill radar|repository readiness|readiness audit|open.source tools?)\b|开发工具|開發工具|趋势雷达|趨勢雷達|仓库就绪|程式庫就緒|开源工具|開源工具/i],
  ["portfolio_hierarchy", /\b(nine projects?|portfolio projects?|selected systems|all projects?|project portfolio|what (?:has|did) (?:john|he) (?:built|build|made|create|created|work(?:ed)? on)|project examples?|case studies|showcase|tell me about (?:his|john'?s) projects?)\b|九个项目|九個項目|作品集项目|作品集項目|所有项目|所有項目|有哪些项目|有哪些項目|有哪些作品|有咩作品|做过(?:什么|哪些)(?:项目|产品)?|做過(?:什麼|哪些)(?:項目|產品)?|做了什么(?:项目|产品)?|做咗咩(?:項目|產品)?|介绍.*(?:项目|作品)|介紹.*(?:項目|作品)|项目案例|項目案例|作品案例/i],
  ["flagship", /\b(flagship|best project|strongest project|most relevant project|project.*look at first|start with.*project)\b|旗舰项目|旗艦項目|代表项目|代表項目|哪个项目.*(?:先看|最值得)|哪個項目.*(?:先睇|最值得)|最值得看.*项目|最值得睇.*項目/i],
  ["project_classification", /\b(which selected projects|project types?|client delivery|self-directed|delivered workflow|commissioned)\b|项目类型|項目類型|客户项目|客戶項目|自主项目|自主項目/i],
  ["ml_research", /\b(machine.learning research|ml research|researcher|model training|applied ai product)\b|机器学习研究|機器學習研究|模型训练|模型訓練|应用型 ai|應用型 ai/i],
  ["enterprise_readiness", /\b(?:enterprise|corporate).*(?:ai|team|work|environment|ready|readiness|contribute)|(?:ai|ready|readiness|contribute).*(?:enterprise|corporate)\b|企业.*(?:ai|岗位|職位|工作|团队|團隊|环境|環境|胜任|勝任)|公司.*(?:ai|岗位|職位|工作|团队|團隊|环境|環境|胜任|勝任)|入职后.*(?:工作|能做|需要补|要补)|入職後.*(?:工作|做到|需要補|要補)/i],
  ["background", /\b(career background|professional background|introduce john|about john|know john|who is john|profile|positioning|career story|career history|work history|professional experience|ai experience|experience in ai|tell me about (?:john|him|his experience))\b|职业背景|職業背景|核心定位|工作经历|工作經歷|职业经历|職業經歷|从业经历|從業經歷|有什么经验|有什麼經驗|AI.*经验|AI.*經驗|介绍\s*john|介紹\s*john|了解\s*john|john\s*是谁|john\s*是誰|关于\s*john|關於\s*john/i],
  ["delivery", /\b(deliver(?:y|ed|ing)?|client-facing|ship(?:ped|ping)?|end-to-end|from requirement to acceptance)\b|交付|落地|从需求到验收|從需求到驗收|端到端|完整流程/i],
  ["technical", /\b(technology|technologies|technical|tech stack|architecture|frontend|front-end|backend|back-end|built with|what does (?:it|this|that).*(?:use|run on)|javascript|typescript|react|node|postgres|redis|playwright|vercel)\b|技术|技術|技能|技术栈|技術棧|架构|架構|前端|后端|後端|用了什么|用了什麼|使用什么技术|使用咩技術/i],
  ["strengths", /\b(strengths?|capabilit(?:y|ies)|competenc(?:e|ies)|what can (?:john|he) do|value|valuable|positioned|why hire|contribution|fit for|suitable for|qualified for|help (?:our|the) team|bring to (?:our|the) team|problems? can (?:john|he) solve)\b|能力|本领|本領|优势|優勢|强项|強項|价值|價值|贡献|貢獻|为什么适合|為什麼適合|适合我们|適合我們|能否胜任|能否勝任|可以胜任|可以勝任|团队带来|團隊帶來|解决什么问题|解決什麼問題|能做什么|能做什麼|会做什么|會做什麼/i],
  ["gaps", /\b(gap|gaps|weakness|development area|lack|limitations?|need to learn|need to improve|onboarding|not yet)\b|短板|差距|不足|缺口|弱点|弱點|限制|局限|还需要学|還需要學|需要补|需要補|入职后要补|入職後要補/i],
  ["salary", /\b(salary|income|pay|compensation)\b|薪资|薪資|工资|工資|收入/i],
  ["private", /\b(age|birth|birthday|phone|address|commute|wallet|transaction|private|secret|credential|client identity|payment)\b|年龄|年齡|出生|电话|電話|地址|通勤|钱包|錢包|交易|隐私|隱私|秘密|凭据|憑據|客户身份|客戶身份|付款/i],
  ["action", /\b(send|submit|apply|promise|negotiate|change|update|browse|search private|act on behalf)\b|发送|發送|申请|申請|承诺|承諾|代替|代表|更改|更新资料|更新資料|浏览|瀏覽/i]
];

const sectionConcepts = new Map([
  ["KB-01", ["identity"]], ["KB-02", ["roles", "agents", "strengths", "ml_research", "background"]], ["KB-03", ["roles", "gaps", "ml_research"]],
  ["KB-04", ["visa", "availability"]], ["KB-05", ["languages"]], ["KB-06", ["education"]],
  ["KB-07", ["pingan", "background"]], ["KB-08", ["studio", "background", "delivery"]], ["KB-09", ["studio", "roles", "gaps", "background"]],
  ["KB-10", ["agents", "uat", "technical", "delivery", "enterprise_readiness"]], ["KB-11", ["agents", "strengths", "delivery"]],
  ["KB-12", ["fightgame", "project_classification", "flagship", "delivery"]], ["KB-13", ["fightgame", "rag", "technical"]], ["KB-14", ["fightgame", "agents", "uat", "delivery"]],
  ["KB-15", ["niulai", "agents", "uat", "private", "project_classification", "flagship", "delivery"]], ["KB-16", ["video", "uat", "project_classification", "delivery"]],
  ["KB-17", ["video", "uat", "project_classification", "delivery"]], ["KB-18", ["technical"]], ["KB-19", ["technical", "rag"]],
  ["KB-20", ["strengths", "agents", "uat", "ml_research", "delivery", "enterprise_readiness"]], ["KB-21", ["gaps", "rag", "ml_research", "enterprise_readiness"]], ["KB-22", ["roles", "enterprise_readiness"]],
  ["KB-23", ["roles", "agents", "visa", "studio"]], ["KB-24", ["private", "salary", "action"]],
  ["KB-25", ["identity"]], ["KB-26", ["private", "action", "rag"]],
  ["KB-27", ["portfolio_hierarchy", "flagship", "video", "nft_workflow", "developer_tools"]],
  ["KB-28", ["document_intelligence", "public_data", "nft_workflow", "uat"]],
  ["KB-29", ["developer_tools", "technical"]],
  ["FG-01", ["fightgame", "technical", "delivery", "project_evidence"]], ["FG-02", ["fightgame", "rag", "technical", "project_evidence"]],
  ["FG-03", ["fightgame", "agents", "uat", "delivery", "project_evidence"]], ["FG-04", ["fightgame", "agents", "project_classification", "delivery", "project_evidence"]],
  ["NL-01", ["niulai", "project_classification", "technical", "project_evidence"]], ["NL-02", ["niulai", "agents", "technical"]],
  ["NL-03", ["niulai", "uat", "technical", "project_evidence"]], ["NL-04", ["niulai", "agents", "delivery", "project_evidence"]],
  ["NL-05", ["niulai", "uat", "delivery", "project_evidence"]], ["NL-06", ["niulai", "uat", "technical", "project_evidence"]],
  ["NL-07", ["niulai", "gaps", "technical", "project_evidence"]]
]);

function normalise(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase("en").replace(/<[^>]+>/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function tokenise(value) {
  const clean = normalise(value);
  const words = clean.match(/[a-z0-9]+(?:['-][a-z0-9]+)*/g) || [];
  const hanRuns = clean.match(/[\p{Script=Han}]+/gu) || [];
  const han = hanRuns.flatMap((run) => [...run, ...Array.from({ length: Math.max(0, run.length - 1) }, (_, item) => run.slice(item, item + 2))]);
  return [...words, ...han];
}

export function queryConcepts(question) {
  return conceptRules.filter(([, pattern]) => pattern.test(question)).map(([name]) => name);
}

function bm25Score(chunk, queryTerms) {
  const uniqueTerms = [...new Set(queryTerms)];
  const k1 = 1.35;
  const b = 0.72;
  return uniqueTerms.reduce((score, term) => {
    const frequency = chunk.retrieval.frequencies[term] || 0;
    if (!frequency) return score;
    const documentsWithTerm = index.document_frequency[term] || 0;
    const idf = Math.log(1 + (index.chunk_count - documentsWithTerm + 0.5) / (documentsWithTerm + 0.5));
    const denominator = frequency + k1 * (1 - b + b * chunk.retrieval.length / index.average_chunk_terms);
    return score + idf * (frequency * (k1 + 1)) / denominator;
  }, 0);
}

export function retrieve(question, { topK = 6 } = {}) {
  const queryTerms = tokenise(question);
  const concepts = queryConcepts(question);
  const cleanQuestion = normalise(question);
  const results = index.chunks.map((chunk) => {
    const tags = sectionConcepts.get(chunk.section_id) || [];
    const matchedConcepts = concepts.filter((concept) => tags.includes(concept));
    const conceptScore = matchedConcepts.reduce((sum, concept) => sum + (concept === "portfolio_hierarchy" ? 12 : concept === "flagship" ? 10 : concept === "project_classification" ? 9 : concept === "ml_research" ? 9.5 : concept === "enterprise_readiness" ? 8 : concept === "project_evidence" ? 6 : 3.2), 0);
    const headingMatch = cleanQuestion.includes(normalise(chunk.heading)) ? 2.5 : 0;
    const sectionMatch = cleanQuestion.includes(chunk.section_id.toLocaleLowerCase("en")) ? 5 : 0;
    const policyFactor = chunk.section_id === "KB-22" ? 0.24 : chunk.section_id === "KB-23" ? 0.78 : 1;
    const mentionsFightgame = concepts.includes("fightgame");
    const mentionsNiulai = concepts.includes("niulai");
    const projectFactor = mentionsFightgame && mentionsNiulai
      ? 1
      : mentionsFightgame
        ? tags.includes("fightgame") ? 1.35 : tags.includes("niulai") ? 0.18 : 1
        : mentionsNiulai
        ? tags.includes("niulai") ? 1.35 : tags.includes("fightgame") ? 0.18 : 1
        : 1;
    const isProjectSource = /^(?:FG|NL)-/.test(chunk.section_id);
    const sourceScopeFactor = !isProjectSource
      ? 1
      : mentionsFightgame && mentionsNiulai
        ? 0.48
        : mentionsFightgame || mentionsNiulai || concepts.includes("project_evidence")
          ? 1
          : 0.28;
    const sectionFactor = policyFactor * projectFactor * sourceScopeFactor;
    const score = (bm25Score(chunk, queryTerms) + conceptScore + headingMatch + sectionMatch) * sectionFactor;
    return { ...chunk, score: Number(score.toFixed(6)), matched_concepts: matchedConcepts };
  });
  const positive = results.filter((result) => result.score > 0);
  const scoped = concepts.includes("portfolio_hierarchy") && !concepts.includes("fightgame") && !concepts.includes("niulai")
    ? positive.filter((result) => (sectionConcepts.get(result.section_id) || []).includes("portfolio_hierarchy"))
    : positive;
  return scoped.sort((a, b) => b.score - a.score || a.section_id.localeCompare(b.section_id)).slice(0, topK);
}

export function getChunk(sectionId) {
  return index.chunks.find((chunk) => chunk.section_id === sectionId) || null;
}

export function corpusMetadata() {
  return {
    document_id: index.document_id,
    version: index.document_version,
    last_updated: index.last_updated,
    source_hash: index.source_hash,
    built_at: index.built_at,
    retrieval_method: index.retrieval_method,
    source_documents: index.source_documents || []
  };
}

export { index };
