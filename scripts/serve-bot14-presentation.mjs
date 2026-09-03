import http from "node:http";
import { createPresentationHandler } from "../presentation/app.mjs";
import { MemoryPresentationStore, RedisPresentationStore } from "../presentation/_lib/store.mjs";

const host = process.env.PRESENTATION_HOST || "127.0.0.1";
const port = Number.parseInt(process.env.PRESENTATION_PORT || "8790", 10);
const mode = process.env.PRESENTATION_STORE_MODE || "redis";

if (process.env.NODE_ENV === "production" && mode !== "redis") throw new Error("Production presentation service requires Redis.");

const store = mode === "memory"
  ? new MemoryPresentationStore()
  : new RedisPresentationStore({
      host: process.env.PRESENTATION_REDIS_HOST || "127.0.0.1",
      port: Number.parseInt(process.env.PRESENTATION_REDIS_PORT || "6379", 10),
      prefix: process.env.PRESENTATION_REDIS_PREFIX || "john-presentation"
    });

const server = http.createServer(createPresentationHandler({ store }));
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;
server.listen(port, host, () => console.log(`Private presentation service listening on ${host}:${port}`));
