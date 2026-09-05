import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import askHandler from "../api/ask.mjs";
import countryHandler from "../api/country.mjs";
import { handleOwnerQaRevokeRequest, handleOwnerQaStatusRequest } from "../api/_lib/owner-qa.mjs";

const root = new URL("../", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1));
const port = Number(process.env.PORT || 4174);
const publicEntryRoutes = new Map([
  ["/from-stripe", "services.html"],
  ["/cv-application-20260907", "index.html"],
  ["/cv-product-20260907", "index.html"],
  ["/from-github", "index.html"]
]);
process.env.NODE_ENV = "development";
process.env.ASK_JOHN_ENABLED ||= "true";
process.env.ASK_JOHN_PROVIDER ||= "fixture";
process.env.ASK_JOHN_CONTROL_MODE ||= "memory";
process.env.ASK_JOHN_PER_IP_LIMIT ||= "100";
process.env.ASK_JOHN_DAILY_REQUEST_LIMIT ||= "1000";
process.env.ASK_JOHN_DAILY_BUDGET_USD ||= "100";

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg" };

async function readBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 4096) throw new Error("Body too large");
  }
  return body;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (["/api/ask", "/api/owner-qa/status", "/api/owner-qa/revoke"].includes(url.pathname)) {
      const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
      const request = new Request(url, { method: req.method, headers: req.headers, body });
      const response = url.pathname === "/api/owner-qa/status"
        ? await handleOwnerQaStatusRequest(request)
        : url.pathname === "/api/owner-qa/revoke"
          ? await handleOwnerQaRevokeRequest(request)
          : await askHandler.fetch(request);
      res.statusCode = response.status;
      response.headers.forEach((value, name) => res.setHeader(name, value));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if (url.pathname === "/api/country") {
      const request = new Request(url, { method: req.method, headers: req.headers });
      const response = await countryHandler.fetch(request);
      res.statusCode = response.status;
      response.headers.forEach((value, name) => res.setHeader(name, value));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    const relative = publicEntryRoutes.get(url.pathname)
      || (url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1)));
    const resolved = normalize(join(root, relative));
    if (!resolved.startsWith(normalize(root))) throw new Error("Invalid path");
    const fileStat = await stat(resolved);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const body = await readFile(resolved);
    res.statusCode = 200;
    res.setHeader("Content-Type", types[extname(resolved)] || "application/octet-stream");
    res.end(body);
  } catch (_) {
    res.statusCode = 404;
    res.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => console.log(`Portfolio dev server: http://127.0.0.1:${port}/`));
