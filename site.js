(function () {
  "use strict";

  const LANGUAGE_KEY = "csy-portfolio-language";
  const THEME_KEY = "csy-portfolio-theme";

  const zh = {
    "Primary navigation": "主要導覽",
    "Display controls": "顯示設定",
    "Home": "首頁",
    "Projects": "項目",
    "Work": "作品",
    "About": "關於",
    "Contact": "聯絡",
    "Presentation": "演示",
    "Project archive": "項目檔案",
    "Selected product work": "精選產品項目",
    "← Home": "← 首頁",
    "← My responsibility": "← 我的責任",
    "Nine working systems, organized by evidence depth: two flagship case studies, five focused AI systems and two public developer tools.": "九個可運作系統，按證據深度整理：兩個旗艦案例、五個聚焦 AI 系統及兩個公開開發者工具。",
    "Flagship cases": "旗艦案例",
    "AI systems": "AI 系統",
    "Public tools": "公開工具",
    "AI Product & Solutions Builder": "AI 產品與解決方案建構者",
    "Hello, I’m": "你好，我是",
    "I turn unclear business needs into working, testable AI products. I define the product, direct Agent-assisted delivery, inspect failures and personally validate the result.": "我把模糊的業務需求轉化為可運作、可測試的 AI 產品。我定義產品、指導 Agent 輔助交付、檢查失敗情況，並親自驗收結果。",
    "View projects": "查看項目",
    "About me": "關於我",
    "Profile summary": "個人簡介",
    "Product": "產品",
    "Systems": "系統",
    "UAT": "驗收",
    "Open to Hong Kong roles": "尋找香港職位機會",
    "Founder experience.": "創業經驗。",
    "Product responsibility.": "產品責任。",
    "AI-assisted execution.": "AI 輔助執行。",
    "Based": "所在地",
    "Shenzhen": "深圳",
    "Work right": "工作權利",
    "Hong Kong permanent resident": "香港永久性居民",
    "Languages": "語言",
    "Cantonese · Mandarin · English": "粵語 · 普通話 · 英語",
    "Working systems.": "可運作的系統。",
    "Not concept screens.": "不只是概念畫面。",
    "Nine selected projects show both depth and range: two named flagship cases, five functional AI systems and two public developer tools. Every item separates my decisions from Agent-accelerated implementation.": "九項精選作品同時展示深度與廣度：兩個具名旗艦案例、五個功能型 AI 系統，以及兩個公開開發者工具。每一項都清楚區分我的決策與 Agent 加速實作。",
    "Selected AI systems": "精選 AI 系統",
    "Five ways I turn complex workflows into controlled products.": "五種把複雜流程轉化為受控產品的方式。",
    "Compact evidence of workflow design, safety boundaries, data provenance and acceptance—not five more flagship claims.": "以精簡證據呈現工作流程設計、安全邊界、資料來源及驗收，而不是再包裝五個旗艦案例。",
    "03 · AI workflow": "03 · AI 工作流程",
    "Validated workflow": "已驗證流程",
    "Draft": "草稿",
    "Approve": "批准",
    "Queue": "佇列",
    "Render": "渲染",
    "Human-Gated AI Video Production": "人工把關的 AI 影片製作",
    "A guarded two-machine workflow that moves AI video projects from storyboarding and approval through queued generation, monitoring, synchronisation and final rendering.": "一套具防護邊界的雙機工作流程，把 AI 影片項目從分鏡與審批，推進至排隊生成、監控、同步及最終渲染。",
    "Workflow Automation": "工作流程自動化",
    "Human Approval": "人工審批",
    "FFmpeg": "FFmpeg",
    "My contribution": "我的貢獻",
    "Workflow direction, approval and cost boundaries, integration decisions, review and delivery acceptance.": "工作流程方向、審批與成本邊界、整合決策、審查及交付驗收。",
    "Real generation-to-render workflow validated": "真實生成至渲染流程已驗證",
    "04 · Reference runtime": "04 · 參考運行系統",
    "Simulated P0": "模擬 P0",
    "Moderate": "內容審核",
    "Plan": "規劃",
    "QC": "品質檢查",
    "Playout": "播出",
    "Observable AI Channel Orchestration": "可觀測 AI 頻道編排",
    "A simulated reference runtime that turns moderated input into shot plans, generation and quality-control states, playout buffering, replay fallback and auditable budget control.": "一個模擬參考運行系統，把經審核的輸入轉化為鏡頭規劃、生成及品質控制狀態、播出緩衝、重播回退與可審計預算控制。",
    "Moderation": "內容審核",
    "State Machine": "狀態機",
    "Quality Control": "品質控制",
    "Budget Guard": "預算防護",
    "Product direction, state and safety boundaries, acceptance criteria, verification and limitation review.": "產品方向、狀態與安全邊界、驗收標準、驗證及限制審查。",
    "Tested simulated P0": "已測試的模擬 P0",
    "05 · Document system": "05 · 文件系統",
    "Public framework": "公開框架",
    "Source": "來源",
    "OCR": "OCR",
    "Timeline": "時間線",
    "Cite": "引用",
    "Evidence-First Document Intelligence": "證據優先的文件智能",
    "A source-linked document system that turns complex records into searchable timelines, relationships and reviewable evidence while preserving page-level provenance.": "一個連結來源的文件系統，把複雜記錄轉化為可搜尋的時間線、關係及可審查證據，同時保留頁面層級的來源脈絡。",
    "Document Intelligence": "文件智能",
    "Provenance": "來源脈絡",
    "Human Review": "人工審查",
    "Product model, evidence and privacy rules, review workflow, release boundaries and acceptance.": "產品模型、證據與私隱規則、審查流程、發佈邊界及驗收。",
    "Public framework and live demonstration available": "公開框架及線上示範可用",
    "View public framework": "查看公開框架",
    "06 · Data product": "06 · 資料產品",
    "Local milestone": "本地里程碑",
    "Sources": "資料來源",
    "Method": "方法",
    "Explainable Public-Data Dashboard": "可解釋公共資料儀表板",
    "A static-first data product that transforms multiple official sources into explainable project timelines without confusing observed, estimated and projected values.": "一個靜態優先的資料產品，把多個官方來源轉化為可解釋的項目時間線，並清楚區分觀察值、估算值及預測值。",
    "Data Pipeline": "資料管線",
    "Source Tracking": "來源追蹤",
    "Explainable Metrics": "可解釋指標",
    "Browser QA": "瀏覽器品質檢查",
    "Product direction, source and language constraints, cross-Agent review, defect interception and acceptance.": "產品方向、來源與語言限制、跨 Agent 審查、缺陷攔截及驗收。",
    "Tested local data-product milestone": "已測試的本地資料產品里程碑",
    "07 · Production workflow": "07 · 製作流程",
    "Package validated": "套件已驗證",
    "Validate": "驗證",
    "Stage": "暫存",
    "Deterministic NFT Collection Production & QA": "確定性 NFT 系列製作與品質驗證",
    "A deterministic workflow that turns approved visual layers into quota-controlled NFT collections, marketplace metadata, visual QA reports and safely gated platform staging.": "一套確定性工作流程，把已批准視覺圖層轉化為配額受控的 NFT 系列、市場中繼資料、視覺品質報告及具安全閘門的平台暫存。",
    "Generative Pipeline": "生成管線",
    "Metadata": "中繼資料",
    "Deterministic QA": "確定性品質驗證",
    "Safety Gates": "安全閘門",
    "Product direction, collection rules, visual approval, launch parameters, Agent coordination, QA and final acceptance.": "產品方向、系列規則、視覺審批、發佈參數、Agent 協調、品質驗證及最終驗收。",
    "888-item package validated · platform draft staged": "888 項套件已驗證 · 平台草稿已暫存",
    "Open-source tools": "開源工具",
    "Small public utilities with inspectable code and CI.": "具可查閱程式碼及 CI 的小型公開工具。",
    "Focused tools, released with documentation and explicit limitations.": "聚焦單一用途，並連同文件及明確限制公開發佈。",
    "GitHub data tool · Public release": "GitHub 資料工具 · 公開發佈",
    "AI Developer-Tool Trend Radar": "AI 開發工具趨勢雷達",
    "A GitHub data tool that discovers and ranks fast-growing AI Agent skills and plugins using recent star activity and transparent relevance scoring.": "一個 GitHub 資料工具，利用近期 Star 活動及透明相關性評分，發現並排列快速成長的 AI Agent 技能與外掛。",
    "GitHub API": "GitHub API",
    "Data Collection": "資料收集",
    "Ranking": "排名",
    "Python": "Python",
    "Public release · CI tested": "公開發佈 · CI 已測試",
    "View repository": "查看程式庫",
    "Maintainer CLI · Public release": "維護者 CLI · 公開發佈",
    "Open-Source Repository Readiness Audit": "開源程式庫就緒度審計",
    "A CLI that audits documentation, contribution workflow, CI, testing, release hygiene and basic secret safety before a repository is shared publicly.": "一個 CLI，在程式庫公開分享前審計文件、貢獻流程、CI、測試、發佈規範及基本秘密資料安全。",
    "CLI": "CLI",
    "Repository Audit": "程式庫審計",
    "Maintainer Workflow": "維護者流程",
    "Public release · Multi-version CI": "公開發佈 · 多版本 CI",
    "Capabilities": "能力標籤",
    "Illustrative workflow from draft and approval to generation, monitoring and rendering": "流程示意：從草稿與審批到生成、監控及渲染",
    "Illustrative workflow from moderation and shot planning to quality control and playout fallback": "流程示意：從內容審核與鏡頭規劃到品質控制及播出回退",
    "Illustrative path from source pages through provenance to a reviewable timeline": "流程示意：從來源頁面與來源脈絡到可審查時間線",
    "Illustrative public-data path from official sources to explainable timelines and browser quality assurance": "流程示意：從官方來源到可解釋時間線及瀏覽器品質驗證",
    "Illustrative deterministic workflow from approved layers and quota planning to rendering, validation and a gated platform draft": "流程示意：從已批准圖層與配額規劃到渲染、驗證及具閘門的平台草稿",
    "Flagship · playable milestone": "旗艦案例 · 已達可玩里程碑",
    "01 · Flagship case": "01 · 旗艦案例",
    "A personalized-avatar multiplayer pixel RPG with a shared world and synchronized online skill-card battles.": "一款支援個人化角色、共享世界及同步線上技能卡對戰的多人像素 RPG。",
    "My role:": "我的角色：",
    "My role": "我的角色",
    "product direction, system boundaries, Agent coordination, review and end-to-end acceptance.": "產品方向、系統邊界、Agent 協調、審查及端到端驗收。",
    "Milestone": "里程碑",
    "Core playability": "基本可玩性",
    "Ownership": "負責範圍",
    "Product direction + UAT": "產品方向 + 驗收",
    "Evidence": "證據",
    "Full-flow acceptance + code": "完整流程驗收 + 程式碼",
    "Read case study": "閱讀案例",
    "One shared timeline": "一條共享時間線",
    "Stage": "階段",
    "System": "系統",
    "My responsibility": "我的責任",
    "What I personally own.": "我親自負責的部分。",
    "Agents accelerate implementation. I remain responsible for the product definition, boundaries, review, correction and final acceptance decision.": "Agent 加速實作；產品定義、邊界、審查、修正及最終驗收決定仍由我負責。",
    "Define": "定義",
    "Users, scope, product rules and acceptance criteria.": "使用者、範圍、產品規則及驗收標準。",
    "Bound": "設限",
    "System constraints, permissions and Agent responsibilities.": "系統限制、權限及 Agent 職責。",
    "Review": "審查",
    "Implementation, integration and product-level consistency.": "實作、整合及產品層面的一致性。",
    "Correct": "修正",
    "Failure analysis, detailed feedback and iterative fixes.": "失敗分析、具體回饋及反覆修正。",
    "Accept": "驗收",
    "Full-flow UAT and the decision on what is actually ready.": "完整流程驗收，以及判斷哪些成果真正可用。",
    "Show how I translate a request into a product": "查看我如何把需求轉化為產品",
    "Hide how I translate a request into a product": "隱藏我如何把需求轉化為產品",
    "See the translation": "查看轉化過程",
    "Hide the translation": "隱藏轉化過程",
    "From ambiguity to an accepted result": "從模糊需求到獲驗收的成果",
    "I turn a broad request into a product that has users, rules, boundaries and a way to prove it works.": "我把概括要求轉化為具備使用者、規則、邊界及可驗證方式的產品。",
    "How a broad request becomes a product": "概括要求如何變成產品",
    "Broad request": "概括要求",
    "Make it useful": "讓它真正有用",
    "for real users.": "給真實使用者。",
    "Start with the outcome, not a screen or a model.": "先定義成果，而不是先畫畫面或選模型。",
    "Product shape": "產品形狀",
    "Users · rules": "使用者 · 規則",
    "· boundaries · proof": "· 邊界 · 證據",
    "Turn the unclear part into decisions that can be reviewed.": "把不清晰的部分轉化為可供審查的決策。",
    "Delivery system": "交付系統",
    "Flow · Agent roles": "流程 · Agent 角色",
    "· integrations · UAT": "· 整合 · UAT",
    "Give implementation a bounded path, then inspect what comes back.": "為實作提供清晰邊界，再檢查交付回來的結果。",
    "Accepted result": "獲驗收的成果",
    "Working, testable": "可運作、可測試",
    "and explainable.": "而且可解釋。",
    "I make the final call on what is ready, what needs correction and what remains open.": "我判斷哪些已經就緒、哪些需要修正，以及哪些仍然開放。",
    "In the work": "在實際工作中",
    "Two examples of the same translation layer:": "兩個使用同一轉化方法的例子：",
    "Avatar identity → shared world → skill-card battle": "角色身份 → 共享世界 → 技能卡對戰",
    "Market evidence → bounded Agents → one timeline": "市場證據 → 有邊界的 Agent → 一條時間線",
    "Watch one translation": "看一個真實轉化例子",
    "See one real translation": "看一個真實轉化例子",
    "Close product translation": "關閉產品轉化案例",
    "The translation layer": "產品轉化層",
    "A request is not yet a product.": "需求本身還不是產品。",
    "My work is deciding what the idea must become before implementation can move with confidence.": "我的工作，是先判斷一個想法必須變成甚麼，讓實作可以在清晰方向下推進。",
    "Client direction": "客戶方向",
    "“Build a multiplayer game where every player feels like themselves.”": "「打造一個多人遊戲，讓每位玩家都能在遊戲中感受到自己的身份。」",
    "Product decisions made from the client direction": "從客戶方向轉化而成的產品決策",
    "Identity": "身份",
    "Photo → personal avatar": "照片 → 個人化角色",
    "World": "世界",
    "Shared map → visible players": "共享地圖 → 可見玩家",
    "Battle": "對戰",
    "Skill cards → real-time 1v1": "技能卡 → 即時 1v1",
    "My decision layer": "我的決策層",
    "turns an ambition into product rules, connected systems and acceptance criteria.": "把願景轉化為產品規則、互相連接的系統及驗收標準。",
    "Explore the FightGame case": "查看 FightGame 案例",
    "FightGame shared world showing customised player avatars and NPCs": "FightGame 共享世界，呈現個人化玩家角色與 NPC",
    "Working product": "可運作產品",
    "Identity becomes part of the game system.": "個人身份成為遊戲系統的一部分。",
    "The work between request and code": "需求與程式碼之間的工作",
    "Turning ambiguity into product structure.": "把模糊概念轉化為產品結構。",
    "Watch one broad direction become a set of decisions a team can implement and test.": "看看一個概括方向，如何變成團隊可以實作及測試的一組決策。",
    "Animation showing a client direction becoming a FightGame product structure": "展示客戶方向如何轉化為 FightGame 產品結構的動畫",
    "Input": "輸入",
    "Judgment": "判斷",
    "Product": "產品",
    "“A multiplayer game where every player can appear as themselves.”": "「一個讓每位玩家都能以個人形象出現的多人遊戲。」",
    "Photo → avatar": "照片 → 角色",
    "Product structure": "產品結構",
    "Avatar identity layer": "角色身份層",
    "Persistent shared world": "持續運作的共享世界",
    "Real-time battle system": "即時對戰系統",
    "Playable · testable · extensible": "可玩 · 可測試 · 可擴展",
    "What I add": "我加入的價值",
    "Product judgment that connects an ambition to a buildable system.": "以產品判斷，把願景連接到可以建構的系統。",
    "Real project example · FightGame": "真實項目例子 · FightGame",
    "Replay transformation": "重新播放轉化過程",
    "FightGame shared world with customised player avatars": "FightGame 共享世界與個人化玩家角色",
    "Product translation": "產品轉化",
    "System translation": "系統轉化",
    "Show how I translate a multi-Agent requirement into a controlled system": "查看我如何把多 Agent 要求轉化為受控系統",
    "Hide the multi-Agent system translation": "隱藏多 Agent 系統轉化",
    "Close system translation": "關閉系統轉化案例",
    "The work between Agents and a product": "Agent 與產品之間的工作",
    "Turning many voices into one controlled system.": "把多個角色轉化為一個受控系統。",
    "A multi-Agent product needs shared evidence and chronology, but different responsibilities and permission boundaries.": "多 Agent 產品需要共享證據和時間脈絡，同時保留不同職責及權限邊界。",
    "Animation showing four Agent roles becoming a permission-controlled canonical timeline": "展示四個 Agent 角色如何形成權限受控統一時間線的動畫",
    "Agents": "Agent",
    "Product rules": "產品規則",
    "One timeline": "一條時間線",
    "Research": "研究",
    "Decision": "決策",
    "X draft": "X 草稿",
    "Binance draft": "Binance 草稿",
    "Evidence": "證據",
    "Fact · inference · open": "事實 · 推論 · 待確認",
    "Independent roles · 3-of-4": "獨立角色 · 四取三門檻",
    "Action": "行動",
    "Explicit permission gate": "明確權限閘門",
    "Canonical system": "標準系統",
    "One shared timeline": "一條共享時間線",
    "Candidate evidence": "候選證據",
    "Agent discussion": "Agent 討論",
    "Recorded decision": "已記錄決策",
    "Permitted action": "獲准行動",
    "Addressable · auditable · bounded": "可定位 · 可審計 · 有邊界",
    "Product rules that keep collaboration useful, traceable and under control.": "以產品規則，讓協作保持有效、可追蹤及受控。",
    "Real project example · Niulai Squad": "真實項目例子 · 牛来生米小队",
    "From a broad brief to a product decision": "從概括要求到產品決策",
    "One moving object shows the layer I add between an unclear idea and something a team can actually build and test.": "一個持續變形的物件，展示我如何在模糊想法與團隊可以真正構建、測試的成果之間加入產品判斷。",
    "How I translate a broad brief into a product decision": "我如何把概括要求轉化為產品決策",
    "Broad brief": "概括要求",
    "Make this useful": "讓它真正有用",
    "A direction, not yet a product.": "這是一個方向，還不是產品。",
    "Product decisions": "產品決策",
    "in focus": "正在聚焦",
    "Users": "使用者",
    "Rules": "規則",
    "Boundaries": "邊界",
    "Proof": "證據",
    "One product direction": "一個產品方向",
    "Working, testable": "可運作、可測試",
    "and explainable.": "而且可解釋。",
    "Ready for implementation, review and UAT.": "準備進入實作、審查及 UAT。",
    "The result is not a one-click miracle. I make the decisions that give implementation a direction, then verify what comes back.": "成果不是一鍵生成的奇蹟。我作出讓實作有方向的決策，再驗證交付回來的結果。",
    "Hong Kong opportunities": "香港職位機會",
    "Open to AI product and application roles in Hong Kong.": "尋找香港的 AI 產品及應用職位。",
    "I am based in Shenzhen and available for Hong Kong full-time roles. I hold Hong Kong permanent residency and do not require visa sponsorship.": "我現居深圳，可接受香港全職職位。我持有香港永久性居民身份，毋須僱主提供工作簽證擔保。",
    "Email John": "電郵聯絡 John",
    "View GitHub": "查看 GitHub",
    "Read my background": "了解我的背景",
    "Back to top ↑": "返回頂部 ↑",

    "← Home": "← 首頁",
    "The tools changed.": "工具改變了。",
    "The responsibility did not.": "責任沒有改變。",
    "My work has consistently sat between an unclear request and an accepted result. AI gives me a wider technical toolset for the same responsibility.": "我的工作一直處於模糊需求與獲客戶驗收的成果之間。AI 讓我用更廣泛的技術工具承擔同一份責任。",
    "From client delivery to AI product building.": "從客戶交付走向 AI 產品建構。",
    "I began in marketing data and business coordination, then co-founded a small digital studio in 2015. I worked directly with clients, translated broad requirements into deliverables, coordinated suppliers and implementation, and stayed responsible through final acceptance.": "我從營銷數據及業務協調起步，並於 2015 年與夥伴共同經營一間小型數碼工作室。我直接與客戶合作，把概括需求轉化為交付成果，協調供應商及執行團隊，並負責至最終驗收。",
    "Since 2024, I have increasingly applied that experience to AI applications. Development Agents complete substantial implementation and testing; I define the product, set boundaries, choose workflows and integrations, review failures, direct corrections and personally validate the full flow.": "自 2024 年起，我逐步把這些經驗應用於 AI 應用。開發 Agent 完成大量實作及測試；我則定義產品、設定邊界、選擇工作流程與整合方案、審查失敗、指導修正，並親自驗證完整流程。",
    "I am not presenting myself as an ML researcher or as someone who manually wrote every line. My value is connecting business ambiguity, product judgment and technical delivery.": "我不把自己包裝成機器學習研究員，也不聲稱每一行程式碼都由我手寫。我的價值在於連結模糊的業務需求、產品判斷與技術交付。",
    "Experience": "經驗",
    "Marketing Specialist · Ping An P&C Shenzhen": "營銷專員 · 深圳平安產險",
    "Analysed auto-insurance marketing and conversion data, prepared internal reports and coordinated with telephone-sales teams. Left after approximately six months to continue postgraduate study.": "分析車險營銷及轉化數據、撰寫內部報告，並與電話銷售團隊協調。工作約半年後離職，繼續修讀碩士課程。",
    "Co-founder · Digital studio": "共同經營者 · 數碼工作室",
    "Led end-to-end delivery for community and public-sector projects across websites and campaign pages, visual communication, WeChat operations, public events and spatial installations. I translated multi-level stakeholder needs into scopes and schedules, coordinated designers, suppliers and on-site teams, managed revisions and delivery communication, and stayed accountable through client acceptance; my business partner focused primarily on business development and client acquisition.": "負責社區及公共部門項目的端到端交付，範圍涵蓋網站與宣傳頁、視覺傳達、微信公眾號營運、公眾活動及空間安裝。我把多層級干系人的需求轉化為工作範圍與時程，協調設計師、供應商及現場團隊，管理修改與交付溝通，並負責至客戶驗收；業務夥伴主要負責業務拓展與客戶開發。",
    "AI product and application projects": "AI 產品及應用項目",
    "Made AI products the main focus from 2024, carrying the same end-to-end ownership into product definition, workflow and system design, API integration, automation and deployment. Development Agents accelerate implementation and testing; I set requirements and boundaries, coordinate work, inspect failures, direct corrections and personally validate each full user flow before acceptance.": "自 2024 年起把 AI 產品作為主要投入方向，把同一套端到端負責方式延伸至產品定義、工作流程與系統設計、API 整合、自動化及部署。開發 Agent 加速實作與測試；我設定需求和邊界、協調工作、檢查失敗、指導修正，並在驗收前親自驗證每一條完整使用者流程。",
    "2015–Present": "2015–至今",
    "2024–Present": "2024–至今",
    "Skills": "技能",
    "Product & delivery": "產品與交付",
    "Turn ambiguous requests into product scope, workflows, acceptance criteria and staged priorities, then carry the work through stakeholder alignment and end-to-end UAT.": "把模糊要求轉化為產品範圍、工作流程、驗收標準及分階段優先次序，再透過持份者協調與端到端驗收推進至完成。",
    "Problem framing · Product scoping · Workflow design · Stakeholder coordination · Acceptance testing": "問題定義 · 產品範圍 · 工作流程設計 · 持份者協調 · 驗收測試",
    "AI & Agent workflows": "AI 與 Agent 工作流程",
    "Use OpenAI Codex, ChatGPT/GPT and Grok in structured development workflows, then design Agent responsibilities, permissions, hand-offs and human decision points. Review outputs, inspect failure paths, direct corrections and keep simulated, read-only and production actions distinct.": "在結構化開發流程中使用 OpenAI Codex、ChatGPT/GPT 和 Grok，並設計 Agent 的職責、權限、交接及人工決策節點；審查成果、檢查失敗路徑、指導修正，並清楚區分模擬、只讀及正式操作。",
    "OpenAI Codex · ChatGPT/GPT · Grok · Multi-Agent coordination · Task decomposition · Permission boundaries · Model/API selection · Failure review": "OpenAI Codex · ChatGPT/GPT · Grok · 多 Agent 協調 · 任務拆解 · 權限邊界 · 模型／API 選擇 · 失敗審查",
    "Application delivery": "應用交付",
    "Work across frontend, APIs, state, data, tests and deployment through Agent-assisted implementation, hands-on review and debugging, with contribution boundaries stated clearly.": "透過 Agent 輔助實作、親自審查與除錯，連接前端、API、狀態、數據、測試及部署，並清楚說明個人貢獻邊界。",
    "JavaScript/TypeScript · React/Next.js · Node.js/Express · Python · SQL/Redis · REST APIs · Playwright · Git/Linux/Vercel": "JavaScript/TypeScript · React/Next.js · Node.js/Express · Python · SQL/Redis · REST APIs · Playwright · Git/Linux/Vercel",
    "Design & client delivery": "設計與客戶交付",
    "Combine an advertising and visual-communication background with websites, campaign pages, WeChat operations, public events and spatial installations, including supplier and on-site coordination.": "結合廣告與視覺傳達背景，交付網站、宣傳頁、微信公眾號營運、公眾活動及空間安裝項目，當中包括供應商與現場協調。",
    "Web and campaign pages · Visual direction · Content operations · Supplier coordination · On-site delivery": "網站與宣傳頁 · 視覺方向 · 內容營運 · 供應商協調 · 現場交付",
    "Education": "教育背景",
    "Master of Information Technology Studies": "資訊科技研究碩士",
    "University of Wollongong. English-taught coursework covering programming, web technologies, databases, systems analysis, networks and information security.": "澳洲伍倫貢大學。全英語授課，課程涵蓋程式設計、網絡技術、資料庫、系統分析、網絡及資訊安全。",
    "Bachelor of Arts in Advertising": "廣告學文學學士",
    "Shenzhen University. Began in Physics and later changed major to Advertising; Physics was not a completed second degree.": "深圳大學。入學時修讀物理學，其後轉讀廣告學；物理學並非已完成的第二學位。",
    "At a glance": "概覽",
    "Role direction": "職位方向",
    "AI Application, Prototype / POC, Solutions, Automation and Technical Product roles where delivery judgment matters.": "重視交付判斷的 AI 應用、原型／POC、解決方案、自動化及技術產品職位。",
    "Hong Kong work right": "香港工作權利",
    "Hong Kong permanent resident. No visa sponsorship required. Currently based in Shenzhen.": "香港永久性居民，毋須工作簽證擔保，目前居於深圳。",
    "Cantonese and Mandarin at native level. Professional English reading and written communication; actively improving spoken interview fluency.": "粵語及普通話達母語水平。英語具備專業閱讀及書面溝通能力，並正積極提升面試口語流暢度。",
    "Working model": "工作模式",
    "Agent-assisted implementation with human product direction, constraints, review, correction and acceptance.": "由 Agent 輔助實作，並由人負責產品方向、限制、審查、修正及驗收。",
    "Selected projects": "精選項目",
    "See how this approach works in practice.": "了解這套方法如何實際運作。",

    "← Projects": "← 項目",
    "Case study · Multiplayer product system": "案例研究 · 多人產品系統",
    "A personalized-avatar multiplayer pixel RPG where player identity, online presence, skill-card state and turn resolution have to remain coherent across a branching client–server product.": "一款支援個人化角色的多人像素 RPG；玩家身份、線上狀態、技能卡狀態及回合結算，必須在多分支的客戶端—伺服器產品中保持一致。",
    "Status": "狀態",
    "Core playability completed": "基本可玩性階段已完成",
    "Product direction & acceptance": "產品方向及驗收",
    "Delivery": "交付模式",
    "Persistent multi-Agent workflow": "常駐多 Agent 工作流程",
    "Code paths, checks & browser captures": "程式碼路徑、檢查及瀏覽器截圖",
    "The challenge": "挑戰",
    "The difficult part was not producing another game screen. The same player identity had to survive the profile, overworld, remote-player and battle contexts. Two online players also needed to submit different actions but receive one shared, authoritative round result.": "難點並不是再製作一個遊戲畫面。同一個玩家身份必須貫穿個人資料、世界地圖、其他玩家及戰鬥場景；兩名線上玩家亦要能提交不同操作，但共同接收一個具權威性的回合結果。",
    "I translated the broad game direction into staged systems, set module boundaries and acceptance priorities, coordinated persistent Agent ownership, and reviewed the actual playable flows as the product grew.": "我把整體遊戲方向拆成分階段系統，設定模組邊界與驗收優先次序，協調常駐 Agent 的負責範圍，並在產品發展過程中持續審查實際可玩流程。",
    "Shared world and NPC layer": "共享世界及 NPC 層",
    "Persistent identity and card loadout": "持續一致的身份及技能卡配置",
    "How one round works": "一個回合如何運作",
    "Player actions are treated as submitted intentions. The server waits for the required inputs, validates and stores them, resolves the rules and persists the round. Both clients then render the same result.": "玩家操作會被視為提交的意圖。伺服器等待所需輸入，驗證並儲存資料，再按規則結算及保存回合；兩個客戶端最後呈現同一結果。",
    "Player A": "玩家 A",
    "Submit command": "提交指令",
    "Server authority": "伺服器權威",
    "Validate · resolve · persist": "驗證 · 結算 · 保存",
    "Both clients": "兩個客戶端",
    "Render one outcome": "呈現同一結果",
    "Three product decisions": "三項產品決策",
    "Separate intention from resolution": "把操作意圖與結果結算分開",
    "Each player submits a command; the server owns the authoritative round result instead of trusting either client.": "每名玩家提交指令，由伺服器產生具權威性的回合結果，而不是信任任何一方的客戶端。",
    "Keep identity consistent": "保持身份一致",
    "Profile, overworld, remote-player and battle views use the same player identity rather than disconnected representations.": "個人資料、世界地圖、其他玩家及戰鬥畫面均使用同一玩家身份，而非互不相連的呈現。",
    "Make mechanical depth readable": "讓機制深度保持易懂",
    "A code-verified 79-card catalogue supports limits, elements, counters, statuses and combo setup/payoff while preserving an explainable core loop.": "經程式碼核實的 79 張技能卡支援限制、元素、克制、狀態及連招鋪墊／收益，同時保持核心循環清晰可解釋。",
    "Contribution": "我的貢獻",
    "What I owned": "我負責的部分",
    "Product direction and staged priorities": "產品方向及分階段優先次序",
    "System and Agent ownership boundaries": "系統及 Agent 負責邊界",
    "Review of multiplayer, battle, cards, identity, map and interface results": "審查多人連線、戰鬥、技能卡、身份、地圖及介面成果",
    "Playable-flow acceptance and correction decisions": "可玩流程驗收及修正決策",
    "What Agents accelerated": "Agent 加速的部分",
    "Substantial client, server and tooling implementation": "大量客戶端、伺服器及工具實作",
    "Tests, contract checks, documentation and handoffs": "測試、合約檢查、文件及交接",
    "Module debugging and integration corrections": "模組除錯及整合修正",
    "Authorised deployment and operational tasks": "獲授權的部署及營運工作",
    "Status and boundary": "狀態與邊界",
    "The core-playability milestone was completed.": "基本可玩性里程碑已完成。",
    "A later phase covering tournaments, live streaming and operations was planned or partially scaffolded, but the client did not commission that expansion.": "後續原已規劃或初步搭建賽事、直播及營運功能，但客戶未委託繼續擴展。",
    "This case does not claim public launch, production readiness, revenue, user count or verified business impact. The selected captures use an ephemeral guest identity and contain no wallet address, credential, client material or transaction data.": "本案例不聲稱已公開上線、達到正式生產就緒、取得收入、使用者數量或經核實的商業成效。所選截圖使用臨時訪客身份，不包含錢包地址、登入憑證、客戶資料或交易數據。",
    "Next case": "下一個案例",
    "Four Agents. One shared timeline.": "四個 Agent，一條共享時間線。",
    "View next case": "查看下一個案例",
    "All projects": "全部項目",
    "FightGame case study": "FightGame 案例研究",

    "Case study · Multi-Agent product": "案例研究 · 多 Agent 產品",
    "Product rules, permissions & UAT": "產品規則、權限及驗收",
    "Four Agents · one timeline": "四個 Agent · 一條時間線",
    "Four Agent roles around one shared timeline": "四個 Agent 角色圍繞一條共享時間線",
    "One room · One Case · One timeline": "一個房間 · 一個 Case · 一條時間線",
    "The product problem": "產品問題",
    "A multi-Agent interface can easily become four disconnected chat windows. This project instead treats roles, votes, permissions and evidence as product rules. Candidate evidence, discussion, decisions, paper results, content drafts and outcomes remain addressable from one event history.": "多 Agent 介面很容易變成四個互不相連的聊天視窗。本項目則把角色、投票、權限及證據視為產品規則；候選證據、討論、決策、模擬結果、內容草稿及結果，都能從同一事件歷史中追溯。",
    "I designed the role split around the actual project need rather than using one fixed Agent template. I remain responsible for product direction, permission boundaries, key trade-offs, failure review and full-flow acceptance.": "我根據實際項目需要設計角色分工，而不是套用固定 Agent 模板。我仍負責產品方向、權限邊界、關鍵取捨、失敗審查及完整流程驗收。",
    "Four roles": "四個角色",
    "Read only": "只讀",
    "Finds public hotspot candidates and records provenance. It can nominate; it cannot decide or execute alone.": "尋找公開熱點候選項並記錄來源。它可以提名，但不能單獨決策或執行。",
    "Consumes an eligible structured decision and writes the paper result back to the timeline only after the configured threshold.": "接收符合條件的結構化決策，只有達到設定門檻後，才把模擬結果寫回時間線。",
    "Produces X content from canonical events. Publishing is isolated from ordinary model work and requires explicit lifecycle authority.": "根據標準事件產生 X 平台內容。發佈與一般模型工作分離，並需要明確的生命週期權限。",
    "Creates Binance Square drafts from the same evidence trail. Drafting does not become login, posting or execution authority.": "根據同一證據鏈建立 Binance Square 草稿。撰寫草稿不等於取得登入、發佈或執行權限。",
    "System spine": "系統主幹",
    "Each stage records what happened and what authority was available. Facts, inferences and open questions remain distinguishable; decisions require the configured threshold; actions remain permission-gated; unsafe failure paths close rather than silently continue.": "每個階段都記錄發生了甚麼，以及當時具備哪些權限。事實、推論及未解問題保持可區分；決策須達設定門檻；操作受權限控制；不安全的失敗路徑會關閉，而非默默繼續。",
    "Fact · inference · open": "事實 · 推論 · 未解",
    "Decision": "決策",
    "Independent roles · 3-of-4 threshold": "獨立角色 · 四取三門檻",
    "Action": "操作",
    "Permission-gated record": "受權限控制的記錄",
    "What is already evidenced": "目前已有證據支持的部分",
    "External signal": "外部訊號",
    "Early public reactions.": "早期公開反應。",
    "After the public launch, several third-party X users commented on the working interface and documented system design. The three product observations below come from separate public accounts; they are paraphrased and linked to the original posts.": "項目公開後，數名第三方 X 使用者評論了可運作介面及已公開的系統設計。以下三項產品觀察來自不同的公開帳號；內容經轉述，並連結至原帖。",
    "01 · Working interface": "01 · 可運作介面",
    "One observer described the AI conversation interface as live and interactive rather than a static presentation.": "一名觀察者認為 AI 對話介面具備即時互動，而不是靜態展示。",
    "02 · Understandable control model": "02 · 容易理解的控制模型",
    "Another independently restated the four roles, 3-of-4 voting threshold and PAPER_ONLY boundary—evidence that the mechanism was understandable outside the project team.": "另一名觀察者獨立重述四個角色、四取三投票門檻及 PAPER_ONLY 邊界，顯示項目團隊以外的人也能理解其機制。",
    "03 · Visible role separation": "03 · 清楚可見的角色分工",
    "A third observer noticed that the four Agents had distinct jobs and connected that separation to the product's developer-and-AI approach.": "第三名觀察者留意到四個 Agent 各有不同工作，並把這種分工與產品的開發者加 AI 方法連繫起來。",
    "Open public post": "查看公開原帖",
    "Repository observation · Same observer as 01": "程式庫觀察 · 與 01 為同一觀察者",
    "The same observer also used AI to review the public repository and highlighted its zero-dependency design, defensive LLM contracts, permission separation, immutable public projections and CI structure.": "同一名觀察者亦使用 AI 檢視公開程式庫，並提到零依賴設計、防禦式 LLM 合約、權限分離、不可變公開投影及 CI 結構。",
    "Open repository comment": "查看程式庫評論",
    "Evidence boundary": "證據邊界",
    "These are early public observations—not customer testimonials, formal user research, or a code or security audit. They do not establish adoption, long-term reliability, revenue or business impact. Redacted captures dated 1 September 2026 are retained privately in case a public post is later removed.": "這些只是早期公開觀察，並非客戶推薦、正式使用者研究、程式碼審計或安全審計；亦不能證明採用規模、長期可靠性、收入或商業影響。已脫敏的 2026 年 9 月 1 日截圖會作私人留底，以備公開帖子日後被刪除。",
    "Permissions are explicit": "權限界線清楚",
    "Model work, data reading, drafting, publishing and controlled execution are separated rather than inherited from a generic Agent role.": "模型工作、資料讀取、草稿、發佈及受控執行彼此分開，而不是由通用 Agent 角色自動承接。",
    "Failures become product records": "把失敗轉化為產品記錄",
    "Model fallback, state leakage, identity collision, stale deployment output and terminal-sync gaps are documented instead of hidden.": "模型回退、狀態洩漏、身份衝突、過時部署輸出及終端同步缺口均有記錄，而非被隱藏。",
    "Verification has a dated boundary": "驗證具有明確日期邊界",
    "The 2026-08-25 repository audit recorded 352/352 automated tests passing plus the complete offline validation command.": "2026 年 8 月 25 日的程式庫審計記錄了 352/352 項自動化測試通過，並附有完整離線驗證指令。",
    "Owner UAT is full-flow and iterative": "負責人的驗收覆蓋完整流程並持續迭代",
    "I ran the complete flow, found detail issues after Agent implementations, directed corrections and re-verified the results.": "我親自執行完整流程，在 Agent 實作後找出細節問題，指導修正並重新驗證結果。",
    "Product purpose and role design": "產品目的及角色設計",
    "Voting and permission rules": "投票及權限規則",
    "Model, API and workflow trade-offs": "模型、API 及工作流程取捨",
    "Failure review, corrections and acceptance": "失敗審查、修正及驗收",
    "Substantial implementation and tests": "大量實作及測試",
    "Integration, evidence documents and regression checks": "整合、證據文件及回歸檢查",
    "Deployment tasks under project rules": "按項目規則執行部署工作",
    "Draft product outputs within configured permissions": "在設定權限內產生產品草稿",
    "A formal release freeze, unified cost ledger, some recovery-path closure and external user or business outcomes remain pending.": "正式版本凍結、統一成本帳本、部分復原路徑收尾，以及外部使用者或商業成果，仍有待完成。",
    "The project is an unofficial fan-parody work and does not claim an official relationship, cooperation, sponsorship or endorsement. Public visuals and deeper transaction evidence remain subject to separate IP and privacy review.": "本項目屬非官方同人二創，不聲稱與相關方存在官方關係、合作、贊助或認可。公開視覺素材及更深入的交易證據，仍須另行進行知識產權及私隱審查。",
    "See the completed core-playability case.": "查看已完成基本可玩性階段的案例。",
    "View FightGame": "查看 FightGame",
    "Niulai Squad": "牛来生米小队",
    "Lark": "云雀",
    "Niulai": "牛来",
    "Niulai Mama": "牛来妈妈",
    "Baola": "豹拉",
    "Niulai Squad case study": "牛来生米小队案例研究",

    "FightGame shared pixel world with player characters and NPCs": "FightGame 共享像素世界、玩家角色及 NPC",
    "FightGame personalized player profile and equipped skill-card loadout": "FightGame 個人化玩家資料及已裝備技能卡組",
    "FightGame synchronized turn battle with two player states": "FightGame 顯示兩名玩家狀態的同步回合戰鬥",
    "Read the FightGame case study": "閱讀 FightGame 案例研究",
    "Read the Niulai Squad case study": "閱讀牛来生米小队案例研究",
    "FightGame synchronized online battle showing two player states and a Guard Break action": "FightGame 同步線上戰鬥，顯示兩名玩家狀態及 Guard Break 操作",
    "FightGame shared world with a player and named NPCs": "FightGame 共享世界，包含玩家及具名稱的 NPC",
    "FightGame profile with avatar and equipped cards": "FightGame 玩家資料、角色形象及已裝備技能卡",

    "Product delivery map": "產品交付地圖",
    "From a broad game idea to an accepted playable system.": "從概括的遊戲想法，到獲驗收的可玩系統。",
    "The difficult work sits between the brief and the build: defining what “playable” means, dividing persistent ownership, integrating the parts and sending failures back through the loop.": "最困難的工作位於需求與實作之間：定義「可玩」的標準、劃分常駐責任、整合各部分，並把失敗送回修正循環。",
    "Client intent": "客戶意向",
    "Personalized multiplayer retro game": "個人化多人復古遊戲",
    "Scope & acceptance": "範圍與驗收",
    "Identity, world, cards and synchronized battle": "身份、世界、卡牌及同步戰鬥",
    "Persistent Agent owners": "常駐 Agent 負責人",
    "Five bounded workstreams": "五條有邊界的工作線",
    "Client & interface": "客戶端與介面",
    "Server & contracts": "伺服器與合約",
    "Battle & cards": "戰鬥與卡牌",
    "World & NPCs": "世界與 NPC",
    "QA & integration": "品質驗證與整合",
    "Integrate": "整合",
    "One coherent client–server product": "一個連貫的客戶端—伺服器產品",
    "Cross-device UAT": "跨裝置驗收",
    "Desktop, mobile and two-player flows": "桌面、流動裝置及雙人流程",
    "Reproduce, fix and regress": "重現、修正及回歸測試",
    "Accepted milestone": "獲驗收里程碑",
    "Core playability completed": "基本可玩性階段已完成",
    "UAT feedback loop": "驗收回饋循環",
    "Integration failures return to the responsible workstream until the full flow—not an isolated screen—passes acceptance.": "整合失敗會回到相應工作線，直至完整流程（而非單一畫面）通過驗收。",
    "Hands-on acceptance": "親自驗收",
    "My UAT correction loop": "我的驗收修正循環",
    "I personally tested the complete flows. When an Agent-delivered feature looked finished but failed inside the product, I turned the failure into a specific correction cycle.": "我親自測試完整流程。當 Agent 交付的功能表面完成、卻在產品內失效時，我會把問題轉化為具體修正循環。",
    "User acceptance testing correction loop": "使用者驗收測試修正循環",
    "Observe": "觀察",
    "See the failure in context": "在實際情境中發現失敗",
    "Reproduce": "重現",
    "Make the defect repeatable": "讓缺陷可重複出現",
    "Assign": "分派",
    "Route it to the right owner": "交給正確的負責人",
    "Fix": "修正",
    "Correct the bounded cause": "修正已界定的原因",
    "Re-test": "重新測試",
    "Check the flow and regression": "檢查流程與回歸",
    "Decide what is actually ready": "判斷哪些成果真正就緒",

    "Decision & control map": "決策與控制地圖",
    "One timeline, with every authority boundary visible.": "一條時間線，清楚呈現每一道權限邊界。",
    "The system keeps evidence, decision, expression and external action separate. A model can narrate a frozen outcome, but it cannot invent the evidence or rewrite the decision.": "系統把證據、決策、表達與外部行動分開。模型可以演繹已凍結的結果，但不能創造證據或改寫決策。",
    "Read-only signals": "只讀訊號",
    "Public sources with provenance and freshness": "具來源脈絡及新鮮度的公開資料",
    "Canonical timeline": "標準時間線",
    "One addressable history for each Case": "每個 Case 都有一段可定位的歷史",
    "Eligibility & evidence": "資格與證據",
    "Rules decide whether a round may open": "規則決定一輪是否可以開始",
    "Four frozen votes": "四個已凍結投票",
    "Independent random choices recorded before dialogue": "對話前記錄獨立隨機選擇",
    "Business decision": "業務決策",
    "3-of-4 or 4-of-4 becomes the fixed result": "四取三或四取四成為固定結果",
    "Permission gate": "權限閘門",
    "Server-only checks isolate external authority": "僅限伺服器的檢查隔離外部權限",
    "Act or stop": "行動或停止",
    "Execute, publish or fail closed": "執行、發佈或安全關閉",
    "Audit & recovery": "審計與復原",
    "Receipts, lifecycle events and correction evidence return to the timeline": "收據、生命週期事件及修正證據回到時間線",
    "Control principles": "控制原則",
    "Expression boundary": "表達邊界",
    "Models express the decision. They do not make or rewrite it.": "模型負責表達決策；它們不會作出或改寫決策。",
    "Safety boundary": "安全邊界",
    "Ambiguous state → stop safely, never guess.": "狀態含糊 → 安全停止，絕不猜測。",
    "Decision": "決策",
    "Record": "記錄",
    "Failure becomes evidence": "失敗成為證據",
    "Recovery without rewriting history.": "在不改寫歷史的前提下復原。",
    "An unexpected asset-unit projection exposed a gap between a receipt and its interpretation. Instead of patching the displayed result, I used the incident to tighten the product rule and re-accept the affected scope.": "一次意外的資產單位預測揭示了收據與解讀之間的落差。我沒有只修補顯示結果，而是利用事件收緊產品規則，並重新驗收受影響範圍。",
    "Failure review and recovery sequence": "失敗審查與復原流程",
    "Observed": "觀察",
    "Unexpected projection": "意外預測",
    "Traced": "追查",
    "Receipt interpretation": "收據解讀",
    "Bounded": "設限",
    "Tighter evidence rule": "更嚴格的證據規則",
    "Protected": "保護",
    "Regression coverage": "回歸測試覆蓋",
    "Re-run": "重新運行",
    "Controlled lifecycle": "受控生命週期",
    "Accepted": "已驗收",
    "Scoped re-acceptance": "按範圍重新驗收",

    "Two current cases show different parts of my work: a playable multiplayer product and a Level 3 multi-Agent system in active operation. Each case separates my decisions from Agent-accelerated implementation.": "目前兩個案例呈現我工作的不同面向：一個已達基本可玩階段的多人產品，以及一個已凍結 Level 3 技術基線並持續運作的多 Agent 系統。每個案例都清楚區分我的決策與 Agent 加速的實作。",
    "Validated baseline · Active operations": "已驗證基線 · 持續運作",
    "02 · Multi-Agent system": "02 · 多 Agent 系統",
    "A four-Agent BNB Smart Chain product that turns sourced market signals into a traceable story while keeping voting, execution and publishing independently controlled.": "一個四 Agent 的 BNB Smart Chain 產品，把有來源的市場訊號轉化為可追溯故事，同時讓投票、執行及發佈保持獨立受控。",
    "product architecture, operating rules, permission boundaries, failure review, release decisions and iterative full-flow UAT.": "產品架構、運作規則、權限邊界、失敗審查、發佈決策及反覆完整流程驗收。",
    "Validated baseline · active": "已驗證基線 · 持續運作",
    "Four Agents · one timeline": "四個 Agent · 一條時間線",
    "779/779 baseline tests + funded UAT": "779/779 項基線測試 + 小額實測驗收",
    "The work between an idea and an operating system": "概念與可運作系統之間的工作",
    "Turning a market-show concept into governed operations.": "把市場節目概念轉化為具治理邊界的運作系統。",
    "I separated signal eligibility, random choice, model dialogue, money movement and publishing so each path can be tested, traced and stopped independently.": "我把訊號資格、隨機選擇、模型對話、資金操作及內容發佈拆分，讓每條路徑都可以獨立測試、追蹤及停止。",
    "Animation showing four Agent roles flowing through decision and authority gates into one canonical timeline": "展示四個 Agent 角色如何經過決策及權限閘門，匯入同一條標準時間線的動畫",
    "Signal & roles": "訊號與角色",
    "Decision & authority": "決策與權限",
    "Read-only signal": "只讀訊號",
    "Vote · gated execute": "投票 · 受控執行",
    "X publishing": "X 發佈",
    "Square publishing": "Square 發佈",
    "Eligibility": "資格判定",
    "Fresh sourced signal opens a round": "有來源且新鮮的訊號才會開啟一輪",
    "Four frozen 50% votes · 3-of-4": "四票各自以 50% 隨機並先凍結 · 四取三",
    "Authority": "權限",
    "Separate server-side execution and channel gates": "伺服器執行與渠道發佈各有獨立閘門",
    "Sourced candidate evidence": "有來源的候選證據",
    "Frozen four-Agent vote": "已凍結的四 Agent 投票",
    "Bounded lifecycle result": "具邊界的生命週期結果",
    "Dialogue and channel record": "對話與渠道記錄",
    "Product rules that keep evidence, models, funds and external channels independently controllable.": "以產品規則，讓證據、模型、資金及外部渠道保持獨立可控。",
    "FightGame demonstrates a completed core-playability milestone. Niulai Squad demonstrates a Level 3 multi-Agent technical baseline that remains in active operation.": "FightGame 展示已完成的基本可玩性里程碑；牛来生米小队則展示已凍結 Level 3 技術基線、並持續運作的多 Agent 系統。",
    "Continue with the Level 3 Niulai Squad multi-Agent system and its active operating model.": "繼續了解已達 Level 3 技術基線、並持續運作的牛来生米小队多 Agent 系統。",

    "A four-Agent product that turns live BNB Smart Chain market signals into a traceable story—from sourced evidence and voting to controlled execution and channel publishing.": "一個四 Agent 產品，把 BNB Smart Chain 即時市場訊號轉化為可追溯的故事，由有來源的證據與投票，延伸至受控執行及渠道發佈。",
    "Validated technical baseline · active operations": "已驗證技術基線 · 持續運作",
    "Product & architecture owner": "產品與架構負責人",
    "Four Agents · separated control planes": "四個 Agent · 分離的控制面",
    "Frozen evidence": "凍結證據",
    "779 / 779 baseline tests + funded UAT": "779 / 779 項基線測試 + 小額實測驗收",
    "Open live read-only demo ↗": "開啟線上只讀 Demo ↗",
    "View public repository ↗": "查看公開程式庫 ↗",
    "Market monitoring can surface metrics, but it does not naturally create an entertaining, replayable story—and adding models can easily blur facts, opinions, decisions and external permissions. I designed the product so every sourced candidate, vote, lifecycle result, role reaction and channel record remains addressable from one event history.": "市場監控可以呈現指標，卻不會自然形成有娛樂性、可回看的故事；加入模型後，更容易混淆事實、意見、決策及外部權限。我把產品設計成每個有來源的候選、投票、生命週期結果、角色反應及渠道記錄，都能從同一事件歷史中定位。",
    "The central product decision was to separate random choice from model expression, and public presentation from money and publishing authority. I remain responsible for the product direction, architecture boundaries, strategy revisions, failure review, release decisions and full-flow acceptance.": "核心產品決策，是把隨機選擇與模型表達分開，也把公開展示與資金及發佈權限分開。我仍負責產品方向、架構邊界、策略修訂、失敗審查、發佈決策及完整流程驗收。",
    "Read-only discovery": "只讀發現",
    "Finds public GMGN hotspot candidates and records provenance, freshness and evidence labels. It can nominate a Case; it cannot decide or execute alone.": "尋找公開 GMGN 熱點候選，並記錄來源、新鮮度及證據標籤。它可以提名 Case，但不能單獨決策或執行。",
    "Vote · gated execution": "投票 · 受控執行",
    "Votes with the other three Agents. In the show it records paper outcomes; a separate server-side worker may consume an eligible decision only after every execution gate passes.": "與另外三個 Agent 一同投票。在節目層只記錄模擬結果；獨立的伺服器 worker 只有在全部執行閘門通過後，才可接收合資格決議。",
    "Controlled X publishing": "受控 X 發佈",
    "Turns canonical lifecycle events and validated room dialogue into X content. Lifecycle and editorial publishing use narrow, idempotent workers with explicit activation and stop boundaries.": "把標準生命週期事件及經驗證的房間對話轉化為 X 內容。生命週期與日常內容發佈均使用窄化、冪等的 worker，並具明確啟動及停止邊界。",
    "Controlled Square publishing": "受控 Square 發佈",
    "Builds Binance Square posts from the same lifecycle evidence. A standing entry/exit publisher is enabled, while its first natural lifecycle-event UAT remains explicitly pending.": "從同一生命週期證據建立 Binance Square 帖子。常駐入場／退出發佈器已啟用，但首個自然生命週期事件的驗收仍明確標記為待完成。",
    "Eligibility rules decide when a round may open. Four independent 50% votes are frozen before model dialogue, and a 3-of-4 or 4-of-4 result becomes the business decision. Any real action then passes a separate server-only authority path; pending or ambiguous results fail closed instead of being guessed or blindly retried.": "資格規則決定何時可以開啟一輪。四次各自 50% 的獨立投票會在模型對話前凍結，四取三或四取四結果才成為業務決議。任何真實操作其後仍須通過獨立的伺服器權限路徑；待確認或模糊結果會失敗關閉，不會猜測或盲目重試。",
    "Signal": "訊號",
    "Sourced · fresh · read only": "有來源 · 新鮮 · 只讀",
    "Four frozen random votes · 3-of-4": "四個已凍結隨機票 · 四取三",
    "Execution and channels isolated": "執行與渠道彼此隔離",
    "Decision and expression are separated": "決策與表達彼此分離",
    "Models speak only after the four random votes are frozen. A model timeout, fallback or weak line cannot alter candidate eligibility, the vote or execution authority.": "模型只有在四個隨機票凍結後才會發言。模型逾時、回退或文案不理想，都不能改變候選資格、投票或執行權限。",
    "Controlled real lifecycles were validated": "受控真實生命週期已有驗證",
    "The frozen baseline records three funded route UATs, real TP, SL and time-exit outcomes, one confirmed-revert recovery path, and zero-exposure closure checks.": "凍結基線記錄了三次小額路由驗收、真實止盈、止損及到時退出結果、一次已確認回退的復原路徑，以及零敞口收口檢查。",
    "The technical baseline is frozen and deployed": "技術基線已凍結並部署",
    "The Owner-accepted 29 August 2026 baseline recorded 779/779 automated tests, full validation and a verified responsive read-only deployment.": "2026 年 8 月 29 日由負責人接受的基線，記錄了 779/779 項自動化測試、完整驗證及經核實的響應式只讀部署。",
    "Publishing has its own control plane": "發佈具備獨立控制面",
    "Real X entry/exit posts were validated. Later evidence adds a bounded X editorial cadence and a standing Square lifecycle service without granting general social-account authority.": "真實 X 入場／退出帖子已有驗證。其後證據再加入有邊界的 X 日常內容節奏及常駐 Square 生命週期服務，而不授予一般社交帳號操作權限。",
    "Failures become product evidence": "把失敗轉化為產品證據",
    "A real asset-unit projection error was traced to receipt interpretation, corrected with stricter evidence rules and regression tests, then re-accepted without rewriting unsupported history.": "一次真實資產單位投影錯誤被追溯至回執解讀，之後以更嚴格的證據規則及回歸測試修正，並在不改寫缺乏證據的歷史下重新驗收。",
    "Product purpose, four-Agent structure and single-timeline architecture": "產品目的、四 Agent 結構及單時間線架構",
    "Voting, strategy revisions and permission boundaries": "投票、策略修訂及權限邊界",
    "Go / no-go decisions for real actions and public release": "真實操作與公開發佈的執行／停止決策",
    "Failure review, iterative full-flow UAT and milestone acceptance": "失敗審查、反覆完整流程驗收及里程碑接受",
    "Substantial implementation, tests and evidence records": "大量實作、測試及證據記錄",
    "Provider adapters, isolated workers and regression checks": "服務供應者 adapter、隔離 worker 及回歸檢查",
    "Incident diagnosis and recovery-path implementation": "事故診斷及復原路徑實作",
    "Deployment and operating tasks inside explicit project rules": "在明確項目規則內執行部署及運作任務",
    "The Level 3 technical portfolio baseline is frozen; the product remains in active operation and development.": "Level 3 技術作品集基線已凍結；產品仍在持續運作及開發。",
    "Post-baseline work has added a controlled project-token lifecycle, a bounded X editorial cadence and standing Square lifecycle publishing. These are separately evidenced increments, not a claim of unrestricted autonomy.": "基線之後的工作加入了受控項目 Token 生命週期、有邊界的 X 日常內容節奏及常駐 Square 生命週期發佈。這些是分開留證的增量工作，並不代表不受限制的自主操作。",
    "The public website is a read-only view and never receives the protected signer. I do not claim long-term unattended reliability, formal SLA, verified user adoption, revenue or business impact; unified cost and stable-window operating metrics remain incomplete.": "公開網站只提供只讀視圖，絕不接收受保護的簽名器。我不聲稱已達長期無人值守可靠性、正式 SLA、經核實的使用者採用、收入或商業影響；統一成本及穩定時間窗運作指標仍未完整。",
    "The project is an unofficial fan-parody work and does not claim an official relationship, cooperation, sponsorship or endorsement. Public portfolio material excludes credentials, private infrastructure, raw provider responses and sensitive transaction data.": "本項目屬非官方粉絲二創，不聲稱存在官方關係、合作、贊助或認可。公開作品集內容不包含憑證、私有基礎設施、原始服務回應或敏感交易資料。",
    "Compare another product shape": "比較另一種產品形態",
    "See the completed core-playability game case.": "查看已完成基本可玩性階段的遊戲案例。",
    "FightGame shows how the same product-direction and acceptance role applies to a branching multiplayer product.": "FightGame 展示相同的產品方向與驗收角色，如何應用於多分支的多人產品。"
  };

  const pageMetaZh = {
    "John Chong — AI Product & Solutions Builder": "John Chong — AI 產品與解決方案建構者",
    "Projects — John Chong": "項目 — John Chong",
    "About — John Chong": "關於 — John Chong",
    "FightGame Case Study — John Chong": "FightGame 案例研究 — John Chong",
    "Niulai Squad Case Study — John Chong": "牛来生米小队案例研究 — John Chong",
    "John Chong (Shing Yip Chong) turns unclear business needs into testable AI products through product judgment, Agent-assisted delivery and hands-on validation.": "John Chong（Shing Yip Chong）透過產品判斷、Agent 輔助交付及親自驗收，把模糊業務需求轉化為可測試的 AI 產品。",
    "Nine selected projects by John Chong: two flagship case studies, five focused AI systems and two public developer tools.": "John Chong 的九個精選項目：兩個旗艦案例、五個聚焦 AI 系統及兩個公開開發者工具。",
    "Background, experience and working approach of John Chong (Shing Yip Chong), an AI Product and Solutions Builder.": "AI 產品與解決方案建構者 John Chong（Shing Yip Chong）的背景、經驗及工作方法。",
    "FightGame case study: a personalized-avatar multiplayer pixel RPG with synchronized online skill-card battles.": "FightGame 案例研究：一款支援個人化角色及同步線上技能卡對戰的多人像素 RPG。",
    "Niulai Squad case study: a four-Agent BNB Smart Chain market-event product with traceable evidence, controlled execution and coordinated publishing.": "牛来生米小队案例研究：一個四 Agent 的 BNB Smart Chain 市場事件產品，具可追溯證據、受控執行及協調發佈。"
  };

  const textRecords = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style")) return NodeFilter.FILTER_REJECT;
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  while (walker.nextNode()) textRecords.push({ node: walker.currentNode, value: walker.currentNode.nodeValue });

  const attributeRecords = [];
  document.querySelectorAll("[alt], [aria-label], [title]").forEach((element) => {
    ["alt", "aria-label", "title"].forEach((name) => {
      if (element.hasAttribute(name)) attributeRecords.push({ element, name, value: element.getAttribute(name) });
    });
  });

  const originalTitle = document.title;
  const description = document.querySelector('meta[name="description"]');
  const originalDescription = description ? description.content : "";
  const themeColor = document.querySelector('meta[name="theme-color"]');

  const controls = document.createElement("div");
  controls.className = "site-tools";
  controls.setAttribute("aria-label", "Display controls");
  controls.innerHTML = [
    '<button class="site-tool" type="button" data-language-toggle><span aria-hidden="true">中</span></button>',
    '<button class="site-tool" type="button" data-theme-toggle><span aria-hidden="true">☾</span></button>'
  ].join("");
  document.querySelector(".site-nav")?.appendChild(controls);

  const languageButton = controls.querySelector("[data-language-toggle]");
  const themeButton = controls.querySelector("[data-theme-toggle]");

  function readPreference(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; }
  }

  function savePreference(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* Preferences remain session-local. */ }
  }

  function translatedValue(value, language) {
    if (language !== "zh") return value;
    const trimmed = value.trim();
    if (!trimmed || !zh[trimmed]) return value;
    const start = value.match(/^\s*/)?.[0] || "";
    const end = value.match(/\s*$/)?.[0] || "";
    return `${start}${zh[trimmed]}${end}`;
  }

  function applyLanguage(language, persist) {
    const next = language === "zh" ? "zh" : "en";
    document.documentElement.lang = next === "zh" ? "zh-Hant-HK" : "en";
    document.documentElement.dataset.language = next;
    textRecords.forEach(({ node, value }) => { node.nodeValue = translatedValue(value, next); });
    attributeRecords.forEach(({ element, name, value }) => {
      element.setAttribute(name, next === "zh" ? (zh[value] || value) : value);
    });
    document.title = next === "zh" ? (pageMetaZh[originalTitle] || originalTitle) : originalTitle;
    if (description) description.content = next === "zh" ? (pageMetaZh[originalDescription] || originalDescription) : originalDescription;
    controls.setAttribute("aria-label", next === "zh" ? "顯示設定" : "Display controls");
    languageButton.querySelector("span").textContent = next === "zh" ? "EN" : "中";
    languageButton.setAttribute("aria-label", next === "zh" ? "Switch to English" : "切換至中文");
    languageButton.title = next === "zh" ? "Switch to English" : "切換至中文";
    if (persist) savePreference(LANGUAGE_KEY, next);
    updateThemeButton(next, document.documentElement.dataset.theme || "dark");
  }

  function updateThemeButton(language, theme) {
    const isDark = theme === "dark";
    themeButton.querySelector("span").textContent = isDark ? "☾" : "☀";
    const label = language === "zh"
      ? (isDark ? "切換至明亮模式" : "切換至暗色模式")
      : (isDark ? "Switch to light theme" : "Switch to dark theme");
    themeButton.setAttribute("aria-label", label);
    themeButton.title = label;
  }

  function applyTheme(theme, persist) {
    const next = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    if (themeColor) themeColor.content = next === "dark" ? "#101116" : "#f7f7f4";
    updateThemeButton(document.documentElement.dataset.language || "en", next);
    if (persist) savePreference(THEME_KEY, next);
  }

  function setupOwnershipToggle() {
    const toggles = [...document.querySelectorAll("[data-translation-toggle]")];
    const scrim = document.querySelector("[data-owner-scrim]");
    if (!toggles.length || !scrim) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const MorphEngineClass = window.MorphEngine && window.MorphEngine.MorphEngine;
    const records = toggles.map((toggle) => {
      const panel = document.getElementById(toggle.getAttribute("aria-controls"));
      if (!panel) return null;
      const close = panel.querySelector("[data-translation-close]");
      const stage = panel.querySelector("[data-translation-stage]");
      const replay = panel.querySelector("[data-translation-replay]");
      if (!close || !stage || !replay) return null;
      const morph = MorphEngineClass && !reducedMotion.matches
        ? new MorphEngineClass({
            attraction: 0.095,
            friction: 0.34,
            revealAt: 0.7,
            sourceRevealUntil: 0.2,
            cloneFadeUntil: 0.2,
            hide: { attraction: 0.14, friction: 0.38 },
            zIndex: 10020
          })
        : null;
      return { toggle, panel, close, stage, replay, morph };
    }).filter(Boolean);
    if (!records.length) return;

    let active = null;
    let isTransitioning = false;

    function setLabels(record, open) {
      record.toggle.setAttribute("aria-expanded", String(open));
      const label = open ? record.toggle.dataset.labelOpen : record.toggle.dataset.labelClosed;
      record.toggle.setAttribute("aria-label", translatedValue(label, document.documentElement.dataset.language || "en"));
    }

    function playStage(record) {
      record.stage.classList.remove("is-playing");
      void record.stage.offsetWidth;
      record.stage.classList.add("is-playing");
    }

    async function openPanel(record) {
      if (active || isTransitioning) return;
      active = record;
      isTransitioning = true;
      setLabels(record, true);
      record.panel.setAttribute("aria-hidden", "false");
      scrim.hidden = false;
      requestAnimationFrame(() => scrim.classList.add("is-active"));

      await document.fonts.ready;
      if (record.morph) {
        await record.morph.show({ from: record.toggle, to: record.panel, display: "block" });
      } else {
        record.panel.classList.add("is-fallback-open");
      }
      isTransitioning = false;
      if (active === record) {
        playStage(record);
        record.close.focus({ preventScroll: true });
      }
    }

    async function closePanel() {
      if (!active || isTransitioning) return;
      const record = active;
      isTransitioning = true;
      setLabels(record, false);
      scrim.classList.remove("is-active");

      if (record.morph) {
        await record.morph.hide();
      } else {
        record.panel.classList.remove("is-fallback-open");
      }
      record.panel.setAttribute("aria-hidden", "true");
      scrim.hidden = true;
      record.stage.classList.remove("is-playing");
      active = null;
      isTransitioning = false;
      record.toggle.focus({ preventScroll: true });
    }

    records.forEach((record) => {
      record.toggle.addEventListener("click", () => openPanel(record));
      record.close.addEventListener("click", closePanel);
      record.replay.addEventListener("click", () => playStage(record));
    });
    scrim.addEventListener("click", closePanel);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && active) closePanel();
    });
  }

  languageButton.addEventListener("click", () => {
    applyLanguage(document.documentElement.dataset.language === "zh" ? "en" : "zh", true);
  });
  themeButton.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
  });

  applyTheme(readPreference(THEME_KEY, "dark"), false);
  applyLanguage(readPreference(LANGUAGE_KEY, "en"), false);

  setupOwnershipToggle();
  function setupIndexNavigation() {
    const homeLink = document.querySelector('.nav-links a[href="#top"]');
    const contactLink = document.querySelector('.nav-links a[href="#contact"]');
    const contact = document.querySelector("#contact");
    if (!homeLink || !contactLink || !contact) return;

    const links = [homeLink, contactLink];
    let frame = 0;
    const sync = () => {
      const readingLine = window.scrollY + Math.min(180, window.innerHeight * .28);
      const active = readingLine >= contact.offsetTop ? contactLink : homeLink;
      links.forEach((link) => link.classList.toggle("active", link === active));
      frame = 0;
    };
    const requestSync = () => {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync, { passive: true });
    window.addEventListener("hashchange", requestSync);
  }

  setupIndexNavigation();
  function setupMotion() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    document.documentElement.classList.add("motion-enabled");

    const introElements = [...document.querySelectorAll(
      ".hero-copy > *, .hero > .profile-card, .page-hero > *, .projects-hero > *"
    )];
    introElements.forEach((element, index) => {
      element.classList.add("motion-reveal", "motion-intro");
      element.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 70}ms`);
    });

    const revealSelectors = [
      ".section-heading",
      ".project-card",
      ".tier-heading",
      ".system-project-card",
      ".tool-project-card",
      ".ownership-flow",
      ".contact",
      ".about-intro",
      ".resume-section .content-grid > h2",
      ".education-section .detail-card",
      ".experience-section .timeline-list li",
      ".skills-section .skill-row",
      ".case-facts",
      ".case-visual",
      ".case-section:not(.resume-section) > .content-grid",
      ".case-map-heading",
      ".fight-delivery-map",
      ".decision-control-map",
      ".recovery-trace"
    ];
    const revealElements = [...new Set(
      revealSelectors.flatMap((selector) => [...document.querySelectorAll(selector)])
    )].filter((element) => !introElements.includes(element));

    revealElements.forEach((element) => element.classList.add("motion-reveal"));

    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.documentElement.classList.add("motion-started");
      introElements.forEach((element) => element.classList.add("is-visible"));
    }));

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9% 0px", threshold: .08 });

    revealElements.forEach((element) => observer.observe(element));

    if (window.matchMedia("(pointer: fine)").matches) {
      let pointerFrame = 0;
      let pointerX = window.innerWidth * .08;
      let pointerY = 0;
      window.addEventListener("pointermove", (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (pointerFrame) return;
        pointerFrame = requestAnimationFrame(() => {
          document.body.style.setProperty("--pointer-x", `${pointerX}px`);
          document.body.style.setProperty("--pointer-y", `${pointerY}px`);
          pointerFrame = 0;
        });
      }, { passive: true });
    }
  }

  setupMotion();
})();
