import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const moduleRoot = process.env.CODEX_NODE_MODULES;
if (!moduleRoot) throw new Error("Set CODEX_NODE_MODULES to the bundled Node dependency directory.");
const { chromium } = require(path.join(moduleRoot, "playwright"));
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(scriptDir, "..", "previews");
const baseUrl = process.env.PORTFOLIO_BASE_URL || "http://127.0.0.1:4174";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined });
const errors = [];
const checks = [];
const routes = ["index.html", "projects.html", "about.html", "fightgame.html", "niulai.html"];

function monitor(page, name) {
  page.on("console", (message) => { if (message.type() === "error") errors.push(`${name} console: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`${name} page: ${error.message}`));
}

async function waitForAnswer(page) {
  await page.waitForFunction(() => !document.querySelector("[data-ask-widget-form]")?.getAttribute("aria-busy")?.includes("true"));
  await page.locator(".ask-widget-message--answer").last().waitFor({ state: "visible" });
}

async function inspectViewport(name, viewport, screenshotName) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  monitor(page, name);
  await page.goto(`${baseUrl}/index.html`, { waitUntil: "networkidle" });
  const initial = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    legacyLinks: document.querySelectorAll('a[href="ask.html"]').length,
    widget: Boolean(document.querySelector(".ask-widget-launcher")),
    panelHidden: document.querySelector(".ask-widget-panel")?.hidden
  }));
  checks.push({ name: `${name} clean responsive launcher`, passed: initial.viewport === initial.document && initial.legacyLinks === 0 && initial.widget && initial.panelHidden, details: initial });
  checks.push({ name: `${name} defaults dark`, passed: await page.locator("html").getAttribute("data-theme") === "dark" });

  await page.locator(".ask-widget-launcher").click();
  checks.push({ name: `${name} opens compact dialog`, passed: await page.locator(".ask-widget-panel").isVisible() && await page.locator(".ask-widget-launcher").getAttribute("aria-expanded") === "true" });
  const initialSuggestionIndexes = await page.locator("[data-ask-widget-suggestions] button").evaluateAll((buttons) => buttons.map((button) => button.dataset.suggestionIndex));
  checks.push({ name: `${name} shows three unique suggestions`, passed: initialSuggestionIndexes.length === 3 && new Set(initialSuggestionIndexes).size === 3, details: initialSuggestionIndexes });
  await page.locator("[data-ask-widget-suggestions] button").first().click();
  await waitForAnswer(page);
  checks.push({ name: `${name} LLM route returns cited answer`, passed: await page.locator('.ask-widget-message--answer[data-mode="answer"]').count() > 0 && await page.locator(".ask-widget-sources details").count() > 0 });
  await page.screenshot({ path: path.join(outputDir, screenshotName) });

  await page.locator("[data-language-toggle]").click();
  checks.push({ name: `${name} widget follows language switch`, passed: await page.locator("html").getAttribute("data-language") === "zh" && (await page.locator("#ask-widget-title").innerText()).includes("問問") });
  const translatedSuggestionIndexes = await page.locator("[data-ask-widget-suggestions] button").evaluateAll((buttons) => buttons.map((button) => button.dataset.suggestionIndex));
  checks.push({ name: `${name} keeps the same suggestion topics after translation`, passed: JSON.stringify(initialSuggestionIndexes) === JSON.stringify(translatedSuggestionIndexes) });
  await page.locator("[data-theme-toggle]").click();
  checks.push({ name: `${name} widget follows light theme`, passed: await page.locator("html").getAttribute("data-theme") === "light" });
  await page.locator("[data-ask-widget-close]").click();
  checks.push({ name: `${name} closes and restores focus`, passed: await page.locator(".ask-widget-panel").isHidden() && await page.evaluate(() => document.activeElement?.classList.contains("ask-widget-launcher")) });
  await page.close();
}

await inspectViewport("desktop", { width: 1440, height: 1000 }, "ask-widget-desktop.png");
await inspectViewport("mobile", { width: 390, height: 844 }, "ask-widget-mobile.png");

const keyboardPage = await browser.newPage({ viewport: { width: 1024, height: 768 } });
monitor(keyboardPage, "keyboard");
await keyboardPage.goto(`${baseUrl}/about.html`, { waitUntil: "networkidle" });
await keyboardPage.locator(".ask-widget-launcher").focus();
await keyboardPage.keyboard.press("Enter");
await keyboardPage.waitForFunction(() => document.activeElement?.id === "ask-widget-question");
checks.push({ name: "keyboard opens widget and focuses composer", passed: await keyboardPage.evaluate(() => document.activeElement?.id === "ask-widget-question") });
await keyboardPage.keyboard.type("What is FightGame?");
await keyboardPage.keyboard.press("Enter");
await waitForAnswer(keyboardPage);
const firstSource = keyboardPage.locator(".ask-widget-sources summary").first();
await firstSource.focus();
await keyboardPage.keyboard.press("Enter");
checks.push({ name: "citation disclosure works from keyboard", passed: await firstSource.evaluate((element) => element.parentElement.open) });
await keyboardPage.keyboard.press("Escape");
checks.push({ name: "escape closes widget", passed: await keyboardPage.locator(".ask-widget-panel").isHidden() });
await keyboardPage.close();

const failurePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
await failurePage.route("**/api/ask", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ mode: "disabled", answer: "Ask John is temporarily unavailable.", citations: [] }) }));
await failurePage.goto(`${baseUrl}/fightgame.html`, { waitUntil: "networkidle" });
await failurePage.locator(".ask-widget-launcher").click();
await failurePage.locator("#ask-widget-question").fill("What is FightGame?");
await failurePage.locator("[data-ask-widget-submit]").click();
await waitForAnswer(failurePage);
checks.push({ name: "disabled backend state is visible inside chat", passed: await failurePage.locator('.ask-widget-message--answer[data-mode="disabled"]').count() === 1 });
await failurePage.close();

const navigationPage = await browser.newPage({ viewport: { width: 320, height: 760 } });
monitor(navigationPage, "navigation");
for (const route of routes) {
  await navigationPage.goto(`${baseUrl}/${route}`, { waitUntil: "networkidle" });
  const audit = await navigationPage.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    widgetCount: document.querySelectorAll(".ask-widget").length,
    legacyLinks: document.querySelectorAll('a[href="ask.html"]').length
  }));
  checks.push({ name: `${route} remains usable at 320px`, passed: audit.width === audit.scrollWidth && audit.widgetCount === 1 && audit.legacyLinks === 0, details: audit });
}
const removedPage = await navigationPage.request.get(`${baseUrl}/ask.html`);
checks.push({ name: "standalone Ask page is removed", passed: removedPage.status() === 404 });
await navigationPage.close();

const niulaiPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
monitor(niulaiPage, "niulai-language");
await niulaiPage.goto(`${baseUrl}/niulai.html`, { waitUntil: "networkidle" });
const englishNiulai = await niulaiPage.locator("body").innerText();
checks.push({
  name: "Niulai case defaults to English public names",
  passed: ["Niulai Squad", "Lark", "Niulai Mama", "Baola"].every((name) => englishNiulai.includes(name)) && !/牛来生米小队|云雀|牛来妈妈|豹拉/.test(englishNiulai)
});
checks.push({
  name: "Niulai case links to the public repository",
  passed: await niulaiPage.locator('a[href="https://github.com/heyjohnc/niulai-shengmi-squad"]').count() === 1
});
await niulaiPage.locator("[data-language-toggle]").click();
const chineseNiulai = await niulaiPage.locator("body").innerText();
checks.push({
  name: "Niulai case restores original names in Chinese",
  passed: ["牛来生米小队", "云雀", "牛来", "牛来妈妈", "豹拉"].every((name) => chineseNiulai.includes(name))
});
await niulaiPage.close();

await browser.close();

for (const check of checks) console.log(`${check.passed ? "PASS" : "FAIL"} ${check.name}${check.details ? ` ${JSON.stringify(check.details)}` : ""}`);
for (const error of errors) console.error(`BROWSER ERROR ${error}`);
if (errors.length || checks.some((check) => !check.passed)) process.exitCode = 1;
