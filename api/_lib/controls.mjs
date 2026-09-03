import { createHmac } from "node:crypto";
import { createConnection } from "node:net";

const memoryCounters = globalThis.__askJohnCounters || new Map();
globalThis.__askJohnCounters = memoryCounters;

const atomicLimitScript = `
local ip = tonumber(redis.call('GET', KEYS[1]) or '0')
local daily = tonumber(redis.call('GET', KEYS[2]) or '0')
if ip >= tonumber(ARGV[1]) then return {0, ip, daily, 1} end
if daily >= tonumber(ARGV[2]) then return {0, ip, daily, 2} end
ip = redis.call('INCR', KEYS[1])
if ip == 1 then redis.call('EXPIRE', KEYS[1], tonumber(ARGV[3])) end
daily = redis.call('INCR', KEYS[2])
if daily == 1 then redis.call('EXPIRE', KEYS[2], tonumber(ARGV[4])) end
return {1, ip, daily, 0}
`;

const aggregateTelemetryScript = `
redis.call('HINCRBY', KEYS[1], 'requests', 1)
redis.call('HINCRBY', KEYS[1], 'mode:' .. ARGV[1], 1)
redis.call('HINCRBY', KEYS[1], 'language:' .. ARGV[2], 1)
redis.call('HINCRBY', KEYS[1], 'country:' .. ARGV[3], 1)
redis.call('HINCRBY', KEYS[1], 'hour:' .. ARGV[4] .. ':requests', 1)
redis.call('HINCRBY', KEYS[1], 'hour:' .. ARGV[4] .. ':mode:' .. ARGV[1], 1)
redis.call('HINCRBY', KEYS[1], 'hour:' .. ARGV[4] .. ':language:' .. ARGV[2], 1)
redis.call('HINCRBY', KEYS[1], 'hour:' .. ARGV[4] .. ':country:' .. ARGV[3], 1)
redis.call('HSET', KEYS[1], 'corpus_version', ARGV[5])
redis.call('EXPIRE', KEYS[1], 2592000)
return 1
`;

function integerEnv(env, name, fallback, min, max) {
  const parsed = Number.parseInt(env[name] || "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function numberEnv(env, name, fallback, min, max) {
  const parsed = Number.parseFloat(env[name] || "");
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function secondsUntilUtcMidnight(now = new Date()) {
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(60, Math.ceil((midnight - now.getTime()) / 1000));
}

function dayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function hourKey(now = new Date()) {
  return now.toISOString().slice(11, 13);
}

function aggregateCountryCode(value) {
  const country = String(value || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : "unknown";
}

function aggregateLabel(value, fallback) {
  const label = String(value || "").trim();
  return /^[a-zA-Z0-9_-]{1,40}$/.test(label) ? label : fallback;
}

export function controlConfig(env = process.env) {
  const perIpLimit = integerEnv(env, "ASK_JOHN_PER_IP_LIMIT", 8, 1, 100);
  const windowSeconds = integerEnv(env, "ASK_JOHN_RATE_WINDOW_SECONDS", 600, 60, 86400);
  const dailyRequestLimit = integerEnv(env, "ASK_JOHN_DAILY_REQUEST_LIMIT", 100, 1, 10000);
  const dailyBudgetUsd = numberEnv(env, "ASK_JOHN_DAILY_BUDGET_USD", 0.5, 0.01, 100);
  const maximumRequestCostUsd = numberEnv(env, "ASK_JOHN_MAX_COST_PER_REQUEST_USD", 0.01, 0.0001, 1);
  const budgetDerivedLimit = Math.max(1, Math.floor(dailyBudgetUsd / maximumRequestCostUsd));
  const keyPrefix = (env.ASK_JOHN_REDIS_PREFIX || "ask-john").replace(/[^a-zA-Z0-9:_-]/g, "").slice(0, 80) || "ask-john";
  return {
    enabled: env.ASK_JOHN_ENABLED === "true",
    perIpLimit,
    windowSeconds,
    dailyBudgetUsd,
    maximumRequestCostUsd,
    dailyLimit: Math.min(dailyRequestLimit, budgetDerivedLimit),
    storeMode: env.ASK_JOHN_CONTROL_MODE || "upstash",
    keyPrefix
  };
}

export function hashClientAddress(address, env = process.env) {
  const salt = env.ASK_JOHN_IP_HASH_SALT || (env.NODE_ENV === "production" ? "" : "local-development-only");
  if (!salt) throw new Error("Missing ASK_JOHN_IP_HASH_SALT.");
  return createHmac("sha256", salt).update(String(address || "unknown")).digest("hex").slice(0, 24);
}

function memoryIncrement(key, ttlSeconds, nowMs) {
  const record = memoryCounters.get(key);
  if (!record || record.expiresAt <= nowMs) {
    memoryCounters.set(key, { count: 1, expiresAt: nowMs + ttlSeconds * 1000 });
    return 1;
  }
  record.count += 1;
  return record.count;
}

async function enforceMemory({ ipHash, config, now }) {
  if (process.env.NODE_ENV === "production") throw new Error("In-memory limits are forbidden in production.");
  const nowMs = now.getTime();
  const ip = memoryIncrement(`ask-john:ip:${ipHash}`, config.windowSeconds, nowMs);
  const daily = memoryIncrement(`ask-john:daily:${dayKey(now)}`, secondsUntilUtcMidnight(now), nowMs);
  return { allowed: ip <= config.perIpLimit && daily <= config.dailyLimit, reason: ip > config.perIpLimit ? "per_ip" : daily > config.dailyLimit ? "daily" : null, ipCount: ip, dailyCount: daily };
}

async function upstashCommand(command, env = process.env) {
  const url = (env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "");
  const token = env.UPSTASH_REDIS_REST_TOKEN || "";
  if (!url || !token) throw new Error("Missing global control-store configuration.");
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "desktop-codex-ask-john/1.0" },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(4000)
  });
  if (!response.ok) throw new Error("Global control store unavailable.");
  const payload = await response.json();
  if (payload.error) throw new Error("Global control store rejected the request.");
  return payload.result;
}

async function enforceUpstash({ ipHash, config, now, env }) {
  const result = await upstashCommand([
    "EVAL", atomicLimitScript, "2",
    `${config.keyPrefix}:ip:${ipHash}`,
    `${config.keyPrefix}:daily:${dayKey(now)}`,
    String(config.perIpLimit), String(config.dailyLimit), String(config.windowSeconds), String(secondsUntilUtcMidnight(now))
  ], env);
  if (!Array.isArray(result) || result.length < 4) throw new Error("Invalid global control-store response.");
  return {
    allowed: Number(result[0]) === 1,
    ipCount: Number(result[1]),
    dailyCount: Number(result[2]),
    reason: Number(result[3]) === 1 ? "per_ip" : Number(result[3]) === 2 ? "daily" : null
  };
}

function encodeRedisCommand(command) {
  const parts = command.map((item) => Buffer.from(String(item)));
  return Buffer.concat([
    Buffer.from(`*${parts.length}\r\n`),
    ...parts.flatMap((part) => [Buffer.from(`$${part.length}\r\n`), part, Buffer.from("\r\n")])
  ]);
}

function parseRedisReply(buffer, offset = 0) {
  if (offset >= buffer.length) return null;
  const prefix = String.fromCharCode(buffer[offset]);
  const lineEnd = buffer.indexOf("\r\n", offset + 1);
  if (lineEnd === -1) return null;
  const line = buffer.subarray(offset + 1, lineEnd).toString("utf8");
  const next = lineEnd + 2;
  if (prefix === "+") return { value: line, offset: next };
  if (prefix === "-") throw new Error("Local Redis rejected the command.");
  if (prefix === ":") return { value: Number(line), offset: next };
  if (prefix === "$") {
    const length = Number(line);
    if (length === -1) return { value: null, offset: next };
    if (!Number.isInteger(length) || length < 0 || buffer.length < next + length + 2) return null;
    return { value: buffer.subarray(next, next + length).toString("utf8"), offset: next + length + 2 };
  }
  if (prefix === "*") {
    const count = Number(line);
    if (!Number.isInteger(count) || count < 0) return count === -1 ? { value: null, offset: next } : null;
    const value = [];
    let cursor = next;
    for (let index = 0; index < count; index += 1) {
      const parsed = parseRedisReply(buffer, cursor);
      if (!parsed) return null;
      value.push(parsed.value);
      cursor = parsed.offset;
    }
    return { value, offset: cursor };
  }
  throw new Error("Unsupported local Redis response.");
}

async function localRedisCommand(command, env = process.env) {
  const host = env.ASK_JOHN_REDIS_HOST || "127.0.0.1";
  const port = integerEnv(env, "ASK_JOHN_REDIS_PORT", 6379, 1, 65535);
  const timeoutMs = integerEnv(env, "ASK_JOHN_REDIS_TIMEOUT_MS", 1500, 100, 5000);
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port });
    let settled = false;
    let received = Buffer.alloc(0);
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      if (error) reject(error); else resolve(value);
    };
    const timer = setTimeout(() => finish(new Error("Local Redis timed out.")), timeoutMs);
    socket.once("error", (error) => finish(error));
    socket.once("connect", () => socket.write(encodeRedisCommand(command)));
    socket.on("data", (chunk) => {
      received = Buffer.concat([received, chunk]);
      try {
        const parsed = parseRedisReply(received);
        if (parsed) finish(null, parsed.value);
      } catch (error) {
        finish(error);
      }
    });
  });
}

async function enforceLocalRedis({ ipHash, config, now, env }) {
  const result = await localRedisCommand([
    "EVAL", atomicLimitScript, "2",
    `${config.keyPrefix}:ip:${ipHash}`,
    `${config.keyPrefix}:daily:${dayKey(now)}`,
    String(config.perIpLimit), String(config.dailyLimit), String(config.windowSeconds), String(secondsUntilUtcMidnight(now))
  ], env);
  if (!Array.isArray(result) || result.length < 4) throw new Error("Invalid local Redis response.");
  return {
    allowed: Number(result[0]) === 1,
    ipCount: Number(result[1]),
    dailyCount: Number(result[2]),
    reason: Number(result[3]) === 1 ? "per_ip" : Number(result[3]) === 2 ? "daily" : null
  };
}

export async function enforceOperationalControls({ clientAddress, env = process.env, now = new Date() }) {
  const config = controlConfig(env);
  if (!config.enabled) return { allowed: false, mode: "disabled", config };
  const ipHash = hashClientAddress(clientAddress, env);
  try {
    const result = config.storeMode === "memory"
      ? await enforceMemory({ ipHash, config, now })
      : config.storeMode === "redis"
        ? await enforceLocalRedis({ ipHash, config, now, env })
        : await enforceUpstash({ ipHash, config, now, env });
    return { ...result, mode: result.allowed ? "allowed" : "rate_limited", config };
  } catch (error) {
    return { allowed: false, mode: "disabled", reason: "control_store_unavailable", config, internalError: error };
  }
}

export async function recordAggregateTelemetry({ mode, language, country, corpusVersion, env = process.env, now = new Date() }) {
  const storeMode = env.ASK_JOHN_CONTROL_MODE || "upstash";
  if (!["upstash", "redis"].includes(storeMode)) return;
  const keyPrefix = controlConfig(env).keyPrefix;
  const key = `${keyPrefix}:metrics:${dayKey(now)}`;
  try {
    const command = storeMode === "redis" ? localRedisCommand : upstashCommand;
    await command([
      "EVAL", aggregateTelemetryScript, "1", key,
      aggregateLabel(mode, "unknown"),
      aggregateLabel(language, "unknown"),
      aggregateCountryCode(country),
      hourKey(now),
      String(corpusVersion || "unknown").slice(0, 80)
    ], env);
  } catch (_) {
    // Aggregate telemetry is deliberately best-effort and never exposes request text or IP addresses.
  }
}

export function resetMemoryControlsForTest() {
  memoryCounters.clear();
}

export { aggregateCountryCode, encodeRedisCommand, hourKey, localRedisCommand, parseRedisReply };
