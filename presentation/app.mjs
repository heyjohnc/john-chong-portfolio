import { createHash, createHmac, randomBytes } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyTotp } from "./_lib/totp.mjs";

const presentationDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(presentationDir, "public");
const COOKIE_NAME = "__Host-john_present";
const BODY_LIMIT = 2048;
const SECURITY_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

function integer(value, fallback, min, max) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
}

export function presentationConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || "development";
  return {
    enabled: env.PRESENTATION_ENABLED === "true",
    secret: env.PRESENTATION_TOTP_SECRET || "",
    ipSalt: env.PRESENTATION_IP_HASH_SALT || (nodeEnv === "production" ? "" : "local-presentation-only"),
    sessionTtlSeconds: integer(env.PRESENTATION_SESSION_TTL_SECONDS, 1800, 300, 3600),
    perIpLimit: integer(env.PRESENTATION_ATTEMPT_LIMIT, 5, 1, 20),
    globalLimit: integer(env.PRESENTATION_GLOBAL_ATTEMPT_LIMIT, 30, 5, 200),
    attemptWindowSeconds: integer(env.PRESENTATION_ATTEMPT_WINDOW_SECONDS, 600, 60, 3600),
    totpWindow: integer(env.PRESENTATION_TOTP_WINDOW, 1, 0, 1),
    contentDir: env.PRESENTATION_CONTENT_DIR || "",
    allowedOrigins: new Set((env.PRESENTATION_ALLOWED_ORIGINS || "https://johnchong.info,https://www.johnchong.info").split(",").map((item) => item.trim()).filter(Boolean)),
    nodeEnv
  };
}

function responseHeaders(extra = {}) {
  return { ...SECURITY_HEADERS, ...extra };
}

function writeJson(response, status, payload, extra = {}) {
  response.writeHead(status, responseHeaders({ "Content-Type": "application/json; charset=utf-8", ...extra }));
  response.end(JSON.stringify(payload));
}

async function writeFile(response, filename, contentType) {
  const body = await readFile(path.join(publicDir, filename));
  response.writeHead(200, responseHeaders({ "Content-Type": contentType }));
  response.end(body);
}

async function readJsonBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > BODY_LIMIT) throw new Error("body_too_large");
  }
  try { return JSON.parse(body || "{}"); } catch { throw new Error("invalid_json"); }
}

function parseCookies(value = "") {
  return Object.fromEntries(value.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? [part, ""] : [part.slice(0, index), part.slice(index + 1)];
  }));
}

function sessionHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

function clientHash(request, salt) {
  const address = request.headers["x-real-ip"] || request.socket?.remoteAddress || "unknown";
  return createHmac("sha256", salt).update(String(address)).digest("hex").slice(0, 24);
}

function originAllowed(request, config) {
  const origin = request.headers.origin || "";
  return Boolean(origin && config.allowedOrigins.has(origin));
}

async function loadManifest(config) {
  if (!config.contentDir) return {
    version: "0.1.0",
    title: "Private presentation workspace",
    status: "ready-for-content",
    message: "The protected presentation workspace is ready. Reviewed interview material will be added in a later release.",
    sections: [],
    assets: []
  };
  const raw = JSON.parse(await readFile(path.join(config.contentDir, "manifest.json"), "utf8"));
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.sections) || !Array.isArray(raw.assets)) throw new Error("Invalid presentation manifest.");
  const assetIds = new Set();
  for (const asset of raw.assets) {
    if (!asset || !/^[a-z0-9][a-z0-9_-]{0,79}$/.test(asset.id || "") || typeof asset.file !== "string" || assetIds.has(asset.id)) throw new Error("Invalid presentation asset.");
    assetIds.add(asset.id);
  }
  return { ...raw, assets: raw.assets.map(({ id, label, type }) => ({ id, label, type, url: `./asset/${id}` })) };
}

async function protectedAsset(config, id) {
  if (!config.contentDir || !/^[a-z0-9][a-z0-9_-]{0,79}$/.test(id)) return null;
  const raw = JSON.parse(await readFile(path.join(config.contentDir, "manifest.json"), "utf8"));
  const asset = raw.assets?.find((entry) => entry.id === id);
  if (!asset || typeof asset.file !== "string") return null;
  const root = await realpath(config.contentDir);
  const target = await realpath(path.resolve(root, asset.file));
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) return null;
  return { body: await readFile(target), contentType: asset.type || "application/octet-stream" };
}

function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function createPresentationHandler({ env = process.env, store, now = () => Date.now(), tokenFactory = () => randomBytes(32).toString("base64url") } = {}) {
  if (!store) throw new Error("Presentation session store is required.");
  const config = presentationConfig(env);

  async function authenticated(request) {
    const token = parseCookies(request.headers.cookie)[COOKIE_NAME];
    if (!token || token.length > 128) return false;
    return store.hasSession(sessionHash(token));
  }

  return async function handler(request, response) {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    try {
      if (request.method === "GET" && url.pathname === "/healthz") return writeJson(response, 200, { status: "ok", service: "john-presentation" });
      if (request.method === "GET" && ["/", "/index.html"].includes(url.pathname)) return writeFile(response, "index.html", "text/html; charset=utf-8");
      if (request.method === "GET" && url.pathname === "/favicon.ico") {
        response.writeHead(204, responseHeaders());
        return response.end();
      }
      if (request.method === "GET" && url.pathname === "/presentation.css") return writeFile(response, "presentation.css", "text/css; charset=utf-8");
      if (request.method === "GET" && url.pathname === "/presentation.js") return writeFile(response, "presentation.js", "text/javascript; charset=utf-8");

      if (request.method === "GET" && url.pathname === "/api/session") {
        if (!config.enabled || !config.secret || !config.ipSalt) return writeJson(response, 503, { authenticated: false, available: false });
        return writeJson(response, 200, { authenticated: await authenticated(request), available: true });
      }

      if (request.method === "POST" && url.pathname === "/api/auth/totp") {
        if (!originAllowed(request, config)) return writeJson(response, 403, { error: "request_not_allowed" });
        if (!config.enabled || !config.secret || !config.ipSalt) return writeJson(response, 503, { error: "temporarily_unavailable" });
        const limit = await store.consumeAttempt(clientHash(request, config.ipSalt), { perIpLimit: config.perIpLimit, globalLimit: config.globalLimit, windowSeconds: config.attemptWindowSeconds });
        if (!limit.allowed) return writeJson(response, 429, { error: "try_again_later" }, { "Retry-After": String(config.attemptWindowSeconds) });
        const { code } = await readJsonBody(request);
        const counter = verifyTotp(code, config.secret, now(), { window: config.totpWindow });
        if (counter === null || !(await store.claimCounter(counter))) return writeJson(response, 401, { error: "invalid_or_expired_code" });
        const token = tokenFactory();
        const created = await store.createSession(sessionHash(token), config.sessionTtlSeconds);
        if (!created) return writeJson(response, 503, { error: "temporarily_unavailable" });
        return writeJson(response, 200, { authenticated: true, expires_in: config.sessionTtlSeconds }, { "Set-Cookie": `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${config.sessionTtlSeconds}` });
      }

      if (request.method === "POST" && url.pathname === "/api/logout") {
        if (!originAllowed(request, config)) return writeJson(response, 403, { error: "request_not_allowed" });
        const token = parseCookies(request.headers.cookie)[COOKIE_NAME];
        if (token) await store.revokeSession(sessionHash(token));
        return writeJson(response, 200, { authenticated: false }, { "Set-Cookie": clearCookie() });
      }

      if (request.method === "GET" && url.pathname === "/api/manifest") {
        if (!(await authenticated(request))) return writeJson(response, 401, { error: "authentication_required" });
        return writeJson(response, 200, await loadManifest(config));
      }

      const assetMatch = request.method === "GET" && url.pathname.match(/^\/asset\/([a-z0-9][a-z0-9_-]{0,79})$/);
      if (assetMatch) {
        if (!(await authenticated(request))) return writeJson(response, 401, { error: "authentication_required" });
        const asset = await protectedAsset(config, assetMatch[1]);
        if (!asset) return writeJson(response, 404, { error: "not_found" });
        response.writeHead(200, responseHeaders({ "Content-Type": asset.contentType, "Content-Length": asset.body.length }));
        return response.end(asset.body);
      }

      return writeJson(response, 404, { error: "not_found" });
    } catch (error) {
      const clientError = ["body_too_large", "invalid_json"].includes(error?.message);
      return writeJson(response, clientError ? 400 : 503, { error: clientError ? "invalid_request" : "temporarily_unavailable" });
    }
  };
}

export { COOKIE_NAME };
