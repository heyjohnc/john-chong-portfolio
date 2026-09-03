(() => {
  "use strict";

  const OPT_OUT_KEY = "johnchong-web-analytics-opt-out";
  const PUBLIC_PATHS = new Set([
    "/",
    "/index.html",
    "/about",
    "/about.html",
    "/projects",
    "/projects.html",
    "/fightgame",
    "/fightgame.html",
    "/niulai",
    "/niulai.html"
  ]);

  const isOptedOut = () => {
    try {
      return window.localStorage.getItem(OPT_OUT_KEY) === "1";
    } catch {
      return false;
    }
  };

  if (!PUBLIC_PATHS.has(window.location.pathname)) return;

  window.va = window.va || function (...args) {
    (window.vaq = window.vaq || []).push(args);
  };

  window.va("beforeSend", (event) => {
    if (isOptedOut()) return null;

    let url;
    try {
      url = new URL(event.url, window.location.origin);
    } catch {
      return null;
    }

    if (!PUBLIC_PATHS.has(url.pathname)) return null;
    url.search = "";
    url.hash = "";

    return { ...event, url: url.toString() };
  });

  if (isOptedOut()) return;

  const script = document.createElement("script");
  script.defer = true;
  script.src = "/_vercel/insights/script.js";
  script.dataset.analytics = "vercel";
  document.head.append(script);
})();
