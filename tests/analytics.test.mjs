import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const PUBLIC_PAGES = ["index.html", "about.html", "projects.html", "fightgame.html", "niulai.html"];
const OPT_OUT_KEY = "johnchong-web-analytics-opt-out";
const analyticsSource = await readFile(new URL("../analytics.js", import.meta.url), "utf8");

function executeAnalytics({ pathname = "/about.html", optedOut = false, hash = "" } = {}) {
  const appendedScripts = [];
  const queuedCalls = [];
  const storageWrites = [];
  const historyWrites = [];
  const window = {
    location: { origin: "https://johnchong.info", pathname, search: "", hash },
    history: {
      replaceState(...args) {
        historyWrites.push(args);
      }
    },
    localStorage: {
      getItem(key) {
        assert.equal(key, OPT_OUT_KEY);
        return optedOut ? "1" : null;
      },
      setItem(key, value) {
        storageWrites.push([key, value]);
      }
    },
    va(...args) {
      queuedCalls.push(args);
    }
  };
  const document = {
    createElement(tagName) {
      assert.equal(tagName, "script");
      return { dataset: {} };
    },
    head: {
      append(script) {
        appendedScripts.push(script);
      }
    }
  };

  vm.runInNewContext(analyticsSource, { URL, document, window });
  return { appendedScripts, queuedCalls, storageWrites, historyWrites };
}

test("all and only public portfolio pages load the analytics bootstrap", async () => {
  for (const page of PUBLIC_PAGES) {
    const html = await readFile(new URL(`../${page}`, import.meta.url), "utf8");
    assert.equal((html.match(/<script src="analytics\.js" defer><\/script>/g) || []).length, 1, page);
    assert.equal((html.match(/<meta name="referrer" content="strict-origin-when-cross-origin">/g) || []).length, 1, page);
  }

  const presentationHtml = await readFile(new URL("../presentation/public/index.html", import.meta.url), "utf8");
  const presentationScript = await readFile(new URL("../presentation/public/presentation.js", import.meta.url), "utf8");
  assert.doesNotMatch(`${presentationHtml}\n${presentationScript}`, /analytics\.js|_vercel\/insights|window\.va/);
});

test("default public visits use Vercel page views with a privacy filter", () => {
  const { appendedScripts, queuedCalls } = executeAnalytics();
  assert.equal(appendedScripts.length, 1);
  assert.equal(appendedScripts[0].src, "/_vercel/insights/script.js");
  assert.equal(appendedScripts[0].defer, true);
  assert.deepEqual(Object.keys(appendedScripts[0].dataset), ["analytics"]);

  assert.equal(queuedCalls.length, 1);
  assert.equal(queuedCalls[0][0], "beforeSend");
  const beforeSend = queuedCalls[0][1];
  const filtered = beforeSend({ type: "pageview", url: "https://johnchong.info/about.html?email=private@example.com#private" });
  assert.equal(filtered.url, "https://johnchong.info/about.html");
  assert.equal(beforeSend({ type: "pageview", url: "https://johnchong.info/presentation/" }), null);
});

test("the browser-local owner opt-out prevents script and page-view reporting", () => {
  const { appendedScripts, queuedCalls } = executeAnalytics({ optedOut: true });
  assert.equal(appendedScripts.length, 0);
  assert.equal(queuedCalls.length, 1);
  assert.equal(queuedCalls[0][1]({ type: "pageview", url: "https://johnchong.info/" }), null);
});

test("the private opt-out fragment excludes the first owner setup visit", () => {
  const { appendedScripts, queuedCalls, storageWrites, historyWrites } = executeAnalytics({
    pathname: "/",
    hash: "#analytics-opt-out"
  });
  assert.equal(appendedScripts.length, 0);
  assert.deepEqual(storageWrites, [[OPT_OUT_KEY, "1"]]);
  assert.deepEqual(historyWrites, [[null, "", "/"]]);
  assert.equal(queuedCalls[0][1]({ type: "pageview", url: "https://johnchong.info/" }), null);
});

test("non-public paths never load or report analytics", () => {
  for (const pathname of ["/presentation/", "/presentation/api/manifest", "/asset/private-id", "/api/ask", "/api/country"]) {
    const { appendedScripts, queuedCalls } = executeAnalytics({ pathname });
    assert.equal(appendedScripts.length, 0, pathname);
    assert.equal(queuedCalls.length, 0, pathname);
  }
});

test("analytics code has no custom-event or Ask John data hooks", () => {
  assert.doesNotMatch(analyticsSource, /\btrack\s*\(|\bemail\b|\bphone\b|\bquestion\b|\banswer\b|\bsession\b|\btotp\b|\bip\b/i);
  assert.doesNotMatch(analyticsSource, /ask-widget|api\/ask|addEventListener\s*\(/i);
});
