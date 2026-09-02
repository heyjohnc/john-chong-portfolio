(function () {
  "use strict";

  const copy = {
    en: {
      launcher: "Ask me",
      closeShort: "Close",
      title: "Ask about John",
      subtitle: "Verified portfolio assistant",
      notice: "Answers use John's approved public profile. Recent chat stays in this browser for up to 3 days and can be cleared anytime.",
      greeting: "Hi — ask about my work, experience, projects or fit for an AI product role.",
      suggestions: [
        "What did John personally own in FightGame?",
        "How does John manage multiple AI Agents?",
        "Why is John a fit for an AI product role?"
      ],
      placeholder: "Ask a question…",
      send: "Send question",
      close: "Close assistant",
      answer: "Verified profile answer",
      refuse: "Private boundary",
      no_evidence: "No approved evidence",
      rate_limited: "Request limit",
      disabled: "Temporarily unavailable",
      error: "Answer unavailable",
      system: "Assistant capability",
      clear: "Clear",
      clearTitle: "Clear recent conversation",
      loading: "Reviewing the approved profile",
      loadingScope: "Search scope",
      loadingBoundary: "Public evidence only · no browsing or private files",
      loadingSteps: [
        "Understand the question and its evidence boundary",
        "Search 29 approved profile sections",
        "Rank relevant project and career evidence",
        "Cross-check claims and prepare citations"
      ],
      focus: {
        fightgame: ["FightGame", "Owner evidence"],
        niulai: ["Niulai Squad", "Owner UAT"],
        agents: ["Agent delivery", "Control model"],
        fit: ["Role fit", "Career evidence"],
        default: ["Career profile", "Project evidence"]
      },
      grounded: (count) => `Grounded in ${count} approved ${count === 1 ? "section" : "sections"}`,
      bounded: "Approved public profile only",
      sources: "Sources",
      openSource: "Open related page",
      retry: "The answer service could not be reached. Please try again later."
    },
    zh: {
      launcher: "問問我",
      closeShort: "關閉",
      title: "問問 John",
      subtitle: "已審核作品集助手",
      notice: "回答以 John 已審核的公開資料為依據；最近對話可在這個瀏覽器保留最多 3 日，並可隨時清除。",
      greeting: "你好——你可以詢問我的工作經歷、項目、工作方法，或我與 AI 產品職位的匹配度。",
      suggestions: [
        "John 在 FightGame 中親自負責了甚麼？",
        "John 如何管理多個 AI Agent？",
        "John 為甚麼適合 AI 產品職位？"
      ],
      placeholder: "輸入你的問題…",
      send: "發送問題",
      close: "關閉助手",
      answer: "已核實檔案回答",
      refuse: "私隱邊界",
      no_evidence: "沒有已審核依據",
      rate_limited: "請求次數限制",
      disabled: "暫時不可用",
      error: "暫時無法回答",
      system: "助手功能",
      clear: "清除",
      clearTitle: "清除最近對話",
      loading: "正在查閱已審核檔案",
      loadingScope: "檢索範圍",
      loadingBoundary: "只使用公開證據 · 不瀏覽網頁或私人檔案",
      loadingSteps: [
        "理解問題及可使用的證據邊界",
        "檢索 29 個已審核檔案章節",
        "排序相關項目與履歷證據",
        "交叉核對陳述並準備引用"
      ],
      focus: {
        fightgame: ["FightGame", "本人職責證據"],
        niulai: ["牛來生米小隊", "本人驗收"],
        agents: ["Agent 協作", "控制機制"],
        fit: ["職位匹配", "經歷證據"],
        default: ["職業檔案", "項目證據"]
      },
      grounded: (count) => `依據 ${count} 個已審核章節`,
      bounded: "僅使用已審核公開檔案",
      sources: "資料來源",
      openSource: "查看相關頁面",
      retry: "目前無法連接問答服務，請稍後再試。"
    }
  };

  const widget = document.createElement("div");
  widget.className = "ask-widget";
  widget.innerHTML = `
    <section class="ask-widget-panel" id="ask-widget-panel" role="dialog" aria-modal="false" aria-labelledby="ask-widget-title" hidden>
      <header class="ask-widget-header">
        <div class="ask-widget-identity">
          <span class="ask-widget-mark" aria-hidden="true">JC</span>
          <span><strong id="ask-widget-title"></strong><small data-ask-widget-subtitle></small></span>
        </div>
        <div class="ask-widget-header-actions">
          <button class="ask-widget-clear" type="button" data-ask-widget-clear hidden></button>
          <button class="ask-widget-close" type="button" data-ask-widget-close aria-label=""></button>
        </div>
      </header>
      <p class="ask-widget-notice" data-ask-widget-notice></p>
      <div class="ask-widget-messages" data-ask-widget-messages aria-live="polite" aria-relevant="additions">
        <article class="ask-widget-message ask-widget-message--assistant" data-ask-widget-greeting></article>
        <div class="ask-widget-suggestions" data-ask-widget-suggestions></div>
      </div>
      <form class="ask-widget-composer" data-ask-widget-form>
        <label class="sr-only" for="ask-widget-question">Ask about John</label>
        <textarea id="ask-widget-question" name="question" rows="1" maxlength="600" required></textarea>
        <button type="submit" data-ask-widget-submit aria-label="">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4"/></svg>
        </button>
      </form>
    </section>
    <button class="ask-widget-launcher" type="button" aria-controls="ask-widget-panel" aria-expanded="false">
      <span class="ask-widget-signal" aria-hidden="true"></span><span data-ask-widget-launcher></span>
    </button>`;
  document.body.appendChild(widget);

  const launcher = widget.querySelector(".ask-widget-launcher");
  const panel = widget.querySelector(".ask-widget-panel");
  const closeButton = widget.querySelector("[data-ask-widget-close]");
  const clearButton = widget.querySelector("[data-ask-widget-clear]");
  const title = widget.querySelector("#ask-widget-title");
  const subtitle = widget.querySelector("[data-ask-widget-subtitle]");
  const notice = widget.querySelector("[data-ask-widget-notice]");
  const greeting = widget.querySelector("[data-ask-widget-greeting]");
  const suggestions = widget.querySelector("[data-ask-widget-suggestions]");
  const messages = widget.querySelector("[data-ask-widget-messages]");
  const form = widget.querySelector("[data-ask-widget-form]");
  const question = widget.querySelector("#ask-widget-question");
  const submit = widget.querySelector("[data-ask-widget-submit]");
  let isOpen = false;
  let isLoading = false;
  const MEMORY_KEY = "john-chong-ask-memory-v1";
  const MEMORY_TTL_MS = 3 * 24 * 60 * 60 * 1000;
  const MEMORY_TURN_LIMIT = 4;
  const ASK_ENDPOINT = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "/api/ask"
    : "https://ask-john.37.187.136.100.sslip.io/api/ask";

  function loadConversation() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(MEMORY_KEY) || "null");
      if (!stored || !Array.isArray(stored.turns) || Number(stored.expiresAt) <= Date.now()) {
        window.localStorage.removeItem(MEMORY_KEY);
        return [];
      }
      return stored.turns.slice(-MEMORY_TURN_LIMIT);
    } catch (_) {
      return [];
    }
  }

  let conversation = loadConversation();

  function saveConversation() {
    try {
      window.localStorage.setItem(MEMORY_KEY, JSON.stringify({ expiresAt: Date.now() + MEMORY_TTL_MS, turns: conversation.slice(-MEMORY_TURN_LIMIT) }));
    } catch (_) {
      // The assistant still works when local storage is unavailable.
    }
    clearButton.hidden = conversation.length === 0;
  }

  function conversationHistory() {
    return conversation.slice(-3).flatMap((turn) => [
      { role: "user", content: String(turn.question || "").slice(0, 650) },
      { role: "assistant", content: String(turn.payload?.answer || "").slice(0, 650) }
    ]).filter((item) => item.content);
  }

  function rememberTurn(text, payload) {
    if (!["answer", "no_evidence", "system"].includes(payload.mode)) return;
    conversation.push({
      question: text,
      payload: {
        mode: payload.mode,
        answer: payload.answer,
        timing_ms: payload.timing_ms,
        citations: Array.isArray(payload.citations) ? payload.citations.slice(0, 6) : []
      }
    });
    conversation = conversation.slice(-MEMORY_TURN_LIMIT);
    saveConversation();
  }

  function language() {
    return document.documentElement.dataset.language === "zh" ? "zh" : "en";
  }

  function labels() {
    return copy[language()];
  }

  function setOpen(next) {
    isOpen = next;
    launcher.setAttribute("aria-expanded", String(next));
    widget.querySelector("[data-ask-widget-launcher]").textContent = next ? labels().closeShort : labels().launcher;
    panel.hidden = !next;
    widget.classList.toggle("is-open", next);
    if (next) {
      window.setTimeout(() => question.focus(), 80);
    } else {
      launcher.focus();
    }
  }

  function syncCopy() {
    const current = labels();
    widget.querySelector("[data-ask-widget-launcher]").textContent = isOpen ? current.closeShort : current.launcher;
    launcher.setAttribute("aria-label", current.title);
    title.textContent = current.title;
    subtitle.textContent = current.subtitle;
    notice.textContent = current.notice;
    greeting.textContent = current.greeting;
    closeButton.setAttribute("aria-label", current.close);
    clearButton.textContent = current.clear;
    clearButton.setAttribute("aria-label", current.clearTitle);
    clearButton.title = current.clearTitle;
    clearButton.hidden = conversation.length === 0;
    question.placeholder = current.placeholder;
    submit.setAttribute("aria-label", current.send);
    suggestions.replaceChildren();
    current.suggestions.forEach((text) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = text;
      button.addEventListener("click", () => void ask(text));
      suggestions.appendChild(button);
    });
  }

  function scrollMessages() {
    window.requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  }

  function appendUserMessage(text, remembered = true) {
    const article = document.createElement("article");
    article.className = "ask-widget-message ask-widget-message--user";
    if (remembered) article.dataset.askWidgetTurn = "";
    article.textContent = text;
    messages.appendChild(article);
  }

  function focusTags(text) {
    const normalized = text.toLowerCase();
    const current = labels().focus;
    if (/fight\s*game|fightgame|寶可夢|pokemon/.test(normalized)) return current.fightgame;
    if (/牛來|牛来|niulai|shengmi|生米/.test(normalized)) return current.niulai;
    if (/agent|智能體|智能体|代理/.test(normalized)) return current.agents;
    if (/\bfit\b|\brole\b|職位|职位|適合|适合|hire/.test(normalized)) return current.fit;
    return current.default;
  }

  function appendLoading(text) {
    const current = labels();
    const article = document.createElement("article");
    article.className = "ask-widget-message ask-widget-message--assistant ask-widget-message--loading";
    article.dataset.askWidgetLoading = "";
    article.setAttribute("role", "status");

    const head = document.createElement("div");
    head.className = "ask-widget-thinking-head";
    const signal = document.createElement("i");
    signal.className = "ask-widget-thinking-signal";
    signal.setAttribute("aria-hidden", "true");
    const heading = document.createElement("strong");
    heading.textContent = current.loading;
    head.append(signal, heading);

    const scope = document.createElement("div");
    scope.className = "ask-widget-thinking-scope";
    const scopeLabel = document.createElement("span");
    scopeLabel.textContent = current.loadingScope;
    const tags = document.createElement("div");
    focusTags(text).forEach((tag) => {
      const item = document.createElement("b");
      item.textContent = tag;
      tags.appendChild(item);
    });
    scope.append(scopeLabel, tags);

    const steps = document.createElement("ol");
    steps.className = "ask-widget-thinking-steps";
    current.loadingSteps.forEach((step, index) => {
      const item = document.createElement("li");
      item.dataset.step = String(index);
      const marker = document.createElement("i");
      marker.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.textContent = step;
      item.append(marker, label);
      steps.appendChild(item);
    });

    const boundary = document.createElement("small");
    boundary.className = "ask-widget-thinking-boundary";
    boundary.textContent = current.loadingBoundary;
    article.append(head, scope, steps, boundary);
    messages.appendChild(article);

    const stepElements = Array.from(steps.children);
    let activeStep = 0;
    const updateSteps = () => {
      stepElements.forEach((item, index) => {
        item.classList.toggle("is-complete", index < activeStep);
        item.classList.toggle("is-active", index === activeStep);
      });
    };
    updateSteps();
    const timer = window.setInterval(() => {
      if (activeStep < stepElements.length - 1) activeStep += 1;
      updateSteps();
      scrollMessages();
    }, 1250);
    article.stop = () => window.clearInterval(timer);
    scrollMessages();
    return article;
  }

  function appendAnswer(payload, remembered = true) {
    const current = labels();
    const article = document.createElement("article");
    article.className = "ask-widget-message ask-widget-message--assistant ask-widget-message--answer";
    if (remembered) article.dataset.askWidgetTurn = "";
    article.dataset.mode = payload.mode || "error";

    const meta = document.createElement("small");
    meta.className = "ask-widget-answer-meta";
    const modeLabel = current[payload.mode] || current.error;
    meta.textContent = Number.isFinite(payload.timing_ms) ? `${modeLabel} · ${payload.timing_ms} ms` : modeLabel;
    const body = document.createElement("p");
    body.textContent = payload.answer || current.retry;
    article.append(meta, body);

    if (payload.mode === "answer" && Array.isArray(payload.citations) && payload.citations.length) {
      const trace = document.createElement("div");
      trace.className = "ask-widget-answer-trace";
      const grounded = document.createElement("span");
      grounded.textContent = current.grounded(payload.citations.length);
      const bounded = document.createElement("span");
      bounded.textContent = current.bounded;
      trace.append(grounded, bounded);
      article.appendChild(trace);
    }

    if (payload.mode !== "no_evidence" && Array.isArray(payload.citations) && payload.citations.length) {
      const sourceList = document.createElement("div");
      sourceList.className = "ask-widget-sources";
      const heading = document.createElement("strong");
      heading.textContent = current.sources;
      sourceList.appendChild(heading);
      payload.citations.forEach((item) => {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = `${item.section_id} · ${item.heading}`;
        const snippet = document.createElement("p");
        snippet.textContent = item.snippet;
        const link = document.createElement("a");
        link.href = item.source_url;
        link.textContent = `${current.openSource} ↗`;
        details.append(summary, snippet, link);
        sourceList.appendChild(details);
      });
      article.appendChild(sourceList);
    }

    messages.appendChild(article);
    window.requestAnimationFrame(() => { messages.scrollTop = Math.max(0, article.offsetTop - messages.offsetTop + 4); });
  }

  function setLoading(next) {
    isLoading = next;
    question.disabled = next;
    submit.disabled = next;
    form.setAttribute("aria-busy", String(next));
  }

  function restoreConversation() {
    conversation.forEach((turn) => {
      appendUserMessage(turn.question, true);
      appendAnswer(turn.payload, true);
    });
    if (conversation.length) scrollMessages();
  }

  function clearConversation() {
    conversation = [];
    try { window.localStorage.removeItem(MEMORY_KEY); } catch (_) { /* Ignore storage restrictions. */ }
    messages.querySelectorAll("[data-ask-widget-turn]").forEach((item) => item.remove());
    clearButton.hidden = true;
    question.focus();
  }

  async function ask(value) {
    const text = String(value || question.value).trim();
    if (!text || isLoading) return;
    appendUserMessage(text);
    const history = conversationHistory();
    question.value = "";
    question.style.height = "auto";
    setLoading(true);
    const loading = appendLoading(text);
    try {
      const response = await fetch(ASK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history })
      });
      const payload = await response.json();
      loading.stop?.();
      loading.remove();
      appendAnswer(payload);
      rememberTurn(text, payload);
    } catch (_) {
      loading.stop?.();
      loading.remove();
      appendAnswer({ mode: "error", answer: labels().retry, citations: [] });
    } finally {
      setLoading(false);
      question.focus();
    }
  }

  launcher.addEventListener("click", () => setOpen(!isOpen));
  closeButton.addEventListener("click", () => setOpen(false));
  clearButton.addEventListener("click", clearConversation);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void ask(question.value);
  });
  question.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void ask(question.value);
    }
  });
  question.addEventListener("input", () => {
    question.style.height = "auto";
    question.style.height = `${Math.min(question.scrollHeight, 104)}px`;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) setOpen(false);
  });
  new MutationObserver(syncCopy).observe(document.documentElement, { attributes: true, attributeFilter: ["data-language"] });
  syncCopy();
  restoreConversation();
})();
