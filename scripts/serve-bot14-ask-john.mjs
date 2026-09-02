import http from "node:http";
import askHandler from "../api/ask.mjs";

const host = process.env.ASK_JOHN_HOST || "127.0.0.1";
const port = Number(process.env.ASK_JOHN_PORT || 8788);
const bodyLimit = 8192;
const allowedOrigins = new Set((process.env.ASK_JOHN_ALLOWED_ORIGINS || "https://johnchong.info,https://www.johnchong.info")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean));

function corsHeaders(origin) {
  if (!origin || !allowedOrigins.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

function writeJson(response, status, payload, origin = "") {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...corsHeaders(origin) });
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > bodyLimit) throw new Error("body_too_large");
  }
  return body;
}

const server = http.createServer(async (request, response) => {
  const origin = request.headers.origin || "";
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (url.pathname === "/healthz" && request.method === "GET") {
    return writeJson(response, 200, { status: "ok", service: "ask-john" });
  }
  if (url.pathname !== "/api/ask") return writeJson(response, 404, { error: "not_found" }, origin);
  if (!origin || !allowedOrigins.has(origin)) return writeJson(response, 403, { error: "origin_not_allowed" });
  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders(origin));
    return response.end();
  }

  try {
    const body = request.method === "POST" ? await readBody(request) : undefined;
    const forwarded = new Request(url, { method: request.method, headers: request.headers, body });
    const result = await askHandler.fetch(forwarded);
    const headers = Object.fromEntries(result.headers.entries());
    response.writeHead(result.status, { ...headers, ...corsHeaders(origin) });
    response.end(Buffer.from(await result.arrayBuffer()));
  } catch (error) {
    writeJson(response, error?.message === "body_too_large" ? 413 : 500, { error: "request_failed" }, origin);
  }
});

server.requestTimeout = 45_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;
server.listen(port, host, () => console.log(`Ask John service listening on ${host}:${port}`));
