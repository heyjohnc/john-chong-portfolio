(() => {
  "use strict";

  const OPT_OUT_KEY = "johnchong-web-analytics-opt-out";
  const CV_ENTRY_PATHS = [
    "/cv-application-20260907",
    "/cv-product-20260907"
  ];
  const GITHUB_ENTRY_PATHS = ["/from-github"];
  const PUBLIC_PATHS = new Set([
    "/from-stripe",
    "/",
    "/index.html",
    "/about",
    "/about.html",
    "/projects",
    "/projects.html",
    "/fightgame",
    "/fightgame.html",
    "/niulai",
    "/niulai.html",
    ...CV_ENTRY_PATHS,
    ...GITHUB_ENTRY_PATHS
  ]);

  let requestedOptOut = window.location.hash === "#analytics-opt-out";
  if (requestedOptOut) {
    try {
      window.localStorage.setItem(OPT_OUT_KEY, "1");
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    } catch {
      // The current page still remains opted out when browser storage is unavailable.
    }
  }

  const isOptedOut = () => {
    if (requestedOptOut) return true;
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
