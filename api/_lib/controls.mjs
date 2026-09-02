import { createHmac } from "node:crypto";

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

export function controlConfig(env = process.env) {
  const perIpLimit = integerEnv(env, "ASK_JOHN_PER_IP_LIMIT", 8, 1, 100);
  const windowSeconds = integerEnv(env, "ASK_JOHN_RATE_WINDOW_SECONDS", 600, 60, 86400);
  const dailyRequestLimit = integerEnv(env, "ASK_JOHN_DAILY_REQUEST_LIMIT", 100, 1, 10000);
  const dailyBudgetUsd = numberEnv(env, "ASK_JOHN_DAILY_BUDGET_USD", 0.5, 0.01, 100);
  const maximumRequestCostUsd = numberEnv(env, "ASK_JOHN_MAX_COST_PER_REQUEST_USD", 0.01, 0.0001, 1);
  const budgetDerivedLimit = Math.max(1, Math.floor(dailyBudgetUsd / maximumRequestCostUsd));
  return {
    enabled: env.ASK_JOHN_ENABLED === "true",
    perIpLimit,
    windowSeconds,
    dailyBudgetUsd,
    maximumRequestCostUsd,
    dailyLimit: Math.min(dailyRequestLimit, budgetDerivedLimit),
    storeMode: env.ASK_JOHN_CONTROL_MODE || "upstash"
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
    `ask-john:ip:${ipHash}`,
    `ask-john:daily:${dayKey(now)}`,
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

export async function enforceOperationalControls({ clientAddress, env = process.env, now = new Date() }) {
  const config = controlConfig(env);
  if (!config.enabled) return { allowed: false, mode: "disabled", config };
  const ipHash = hashClientAddress(clientAddress, env);
  try {
    const result = config.storeMode === "memory"
      ? await enforceMemory({ ipHash, config, now })
      : await enforceUpstash({ ipHash, config, now, env });
    return { ...result, mode: result.allowed ? "allowed" : "rate_limited", config };
  } catch (error) {
    return { allowed: false, mode: "disabled", reason: "control_store_unavailable", config, internalError: error };
  }
}

export async function recordAggregateTelemetry({ mode, language, corpusVersion, env = process.env, now = new Date() }) {
  if ((env.ASK_JOHN_CONTROL_MODE || "upstash") !== "upstash") return;
  const key = `ask-john:metrics:${dayKey(now)}`;
  try {
    await upstashCommand(["HINCRBY", key, `mode:${mode}`, "1"], env);
    await upstashCommand(["HINCRBY", key, `language:${language}`, "1"], env);
    await upstashCommand(["HSET", key, "corpus_version", corpusVersion], env);
    await upstashCommand(["EXPIRE", key, "2592000"], env);
  } catch (_) {
    // Aggregate telemetry is deliberately best-effort and never exposes request text.
  }
}

export function resetMemoryControlsForTest() {
  memoryCounters.clear();
}
