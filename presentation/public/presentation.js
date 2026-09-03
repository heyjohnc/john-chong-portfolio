(function () {
  "use strict";
  const loginView = document.querySelector("#login-view");
  const workspaceView = document.querySelector("#workspace-view");
  const form = document.querySelector("#auth-form");
  const codeInput = document.querySelector("#auth-code");
  const status = document.querySelector("#auth-status");
  const logout = document.querySelector("#logout-button");

  async function request(path, options = {}) {
    const response = await fetch(path, { credentials: "same-origin", ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(payload.error || "request_failed"), { status: response.status });
    return payload;
  }

  function showLogin(message = "") {
    workspaceView.hidden = true;
    loginView.hidden = false;
    status.textContent = message;
    codeInput.value = "";
    codeInput.focus();
  }

  async function showWorkspace() {
    const manifest = await request("./api/manifest");
    document.querySelector("#workspace-title").textContent = manifest.title || "Private presentation workspace";
    document.querySelector("#workspace-message").textContent = manifest.message || "";
    const sections = document.querySelector("#workspace-sections");
    sections.replaceChildren(...(manifest.sections || []).map((section) => {
      const card = document.createElement("article");
      card.className = "section-card";
      const heading = document.createElement("h2");
      heading.textContent = section.title || "Presentation section";
      const copy = document.createElement("p");
      copy.textContent = section.summary || "";
      card.append(heading, copy);
      return card;
    }));
    loginView.hidden = true;
    workspaceView.hidden = false;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const code = codeInput.value.replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6) return showLogin("Enter all six digits.");
    const button = form.querySelector("button");
    button.disabled = true;
    status.textContent = "Checking code…";
    try {
      await request("./api/auth/totp", { method: "POST", body: JSON.stringify({ code }) });
      await showWorkspace();
    } catch (error) {
      showLogin(error.status === 429 ? "Too many attempts. Please wait before trying again." : error.status === 503 ? "The presentation is not available yet." : "That code is invalid or has expired.");
    } finally {
      button.disabled = false;
    }
  });

  codeInput.addEventListener("input", () => { codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 6); });
  logout.addEventListener("click", async () => {
    try { await request("./api/logout", { method: "POST", body: "{}" }); } finally { showLogin("Presentation locked."); }
  });

  request("./api/session").then((session) => session.authenticated ? showWorkspace() : showLogin()).catch(() => showLogin("The presentation is not available yet."));
}());
