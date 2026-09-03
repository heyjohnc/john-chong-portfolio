import { createConnection } from "node:net";

const RATE_SCRIPT = `
local ip = tonumber(redis.call('GET', KEYS[1]) or '0')
local global = tonumber(redis.call('GET', KEYS[2]) or '0')
if ip >= tonumber(ARGV[1]) then return {0, ip, global, 1} end
if global >= tonumber(ARGV[2]) then return {0, ip, global, 2} end
ip = redis.call('INCR', KEYS[1])
if ip == 1 then redis.call('EXPIRE', KEYS[1], tonumber(ARGV[3])) end
global = redis.call('INCR', KEYS[2])
if global == 1 then redis.call('EXPIRE', KEYS[2], tonumber(ARGV[3])) end
return {1, ip, global, 0}
`;

function encode(command) {
  const parts = command.map((part) => Buffer.from(String(part)));
  return Buffer.concat([Buffer.from(`*${parts.length}\r\n`), ...parts.flatMap((part) => [Buffer.from(`$${part.length}\r\n`), part, Buffer.from("\r\n")])]);
}

function parse(buffer, offset = 0) {
  if (offset >= buffer.length) return null;
  const prefix = String.fromCharCode(buffer[offset]);
  const lineEnd = buffer.indexOf("\r\n", offset + 1);
  if (lineEnd === -1) return null;
  const line = buffer.subarray(offset + 1, lineEnd).toString("utf8");
  const next = lineEnd + 2;
  if (prefix === "+") return { value: line, offset: next };
  if (prefix === "-") throw new Error("Redis rejected the command.");
  if (prefix === ":") return { value: Number(line), offset: next };
  if (prefix === "$") {
    const length = Number(line);
    if (length === -1) return { value: null, offset: next };
    if (!Number.isInteger(length) || length < 0 || buffer.length < next + length + 2) return null;
    return { value: buffer.subarray(next, next + length).toString("utf8"), offset: next + length + 2 };
  }
  if (prefix === "*") {
    const count = Number(line);
    if (count === -1) return { value: null, offset: next };
    if (!Number.isInteger(count) || count < 0) return null;
    const values = [];
    let cursor = next;
    for (let index = 0; index < count; index += 1) {
      const parsed = parse(buffer, cursor);
      if (!parsed) return null;
      values.push(parsed.value);
      cursor = parsed.offset;
    }
    return { value: values, offset: cursor };
  }
  throw new Error("Unsupported Redis response.");
}

export class RedisPresentationStore {
  constructor({ host = "127.0.0.1", port = 6379, prefix = "john-presentation", timeoutMs = 1500 } = {}) {
    this.host = host;
    this.port = port;
    this.prefix = prefix;
    this.timeoutMs = timeoutMs;
  }

  command(command) {
    return new Promise((resolve, reject) => {
      const socket = createConnection({ host: this.host, port: this.port });
      let settled = false;
      let received = Buffer.alloc(0);
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.destroy();
        if (error) reject(error); else resolve(value);
      };
      const timer = setTimeout(() => finish(new Error("Redis timed out.")), this.timeoutMs);
      socket.once("error", (error) => finish(error));
      socket.once("connect", () => socket.write(encode(command)));
      socket.on("data", (chunk) => {
        received = Buffer.concat([received, chunk]);
        try {
          const parsed = parse(received);
          if (parsed) finish(null, parsed.value);
        } catch (error) {
          finish(error);
        }
      });
    });
  }

  async consumeAttempt(ipHash, { perIpLimit, globalLimit, windowSeconds }) {
    const window = Math.floor(Date.now() / (windowSeconds * 1000));
    const result = await this.command(["EVAL", RATE_SCRIPT, "2", `${this.prefix}:attempt:${ipHash}:${window}`, `${this.prefix}:attempt:global:${window}`, perIpLimit, globalLimit, windowSeconds]);
    return { allowed: Number(result?.[0]) === 1, reason: Number(result?.[3]) === 1 ? "per_ip" : Number(result?.[3]) === 2 ? "global" : null };
  }

  async claimCounter(counter) {
    return (await this.command(["SET", `${this.prefix}:counter:${counter}`, "1", "NX", "EX", "120"])) === "OK";
  }

  async createSession(hash, ttlSeconds) {
    return (await this.command(["SET", `${this.prefix}:session:${hash}`, "1", "EX", ttlSeconds])) === "OK";
  }

  async hasSession(hash) {
    return (await this.command(["GET", `${this.prefix}:session:${hash}`])) === "1";
  }

  async revokeSession(hash) {
    await this.command(["DEL", `${this.prefix}:session:${hash}`]);
  }
}

export class MemoryPresentationStore {
  constructor() {
    this.attempts = new Map();
    this.counters = new Map();
    this.sessions = new Map();
  }

  prune(now = Date.now()) {
    for (const collection of [this.attempts, this.counters, this.sessions]) {
      for (const [key, record] of collection) if (record.expiresAt <= now) collection.delete(key);
    }
  }

  async consumeAttempt(ipHash, { perIpLimit, globalLimit, windowSeconds }) {
    const now = Date.now();
    this.prune(now);
    const bucket = Math.floor(now / (windowSeconds * 1000));
    const increment = (key) => {
      const record = this.attempts.get(key) || { count: 0, expiresAt: now + windowSeconds * 1000 };
      record.count += 1;
      this.attempts.set(key, record);
      return record.count;
    };
    const ip = increment(`ip:${ipHash}:${bucket}`);
    const global = increment(`global:${bucket}`);
    return { allowed: ip <= perIpLimit && global <= globalLimit, reason: ip > perIpLimit ? "per_ip" : global > globalLimit ? "global" : null };
  }

  async claimCounter(counter) {
    this.prune();
    if (this.counters.has(counter)) return false;
    this.counters.set(counter, { expiresAt: Date.now() + 120_000 });
    return true;
  }

  async createSession(hash, ttlSeconds) {
    this.sessions.set(hash, { expiresAt: Date.now() + ttlSeconds * 1000 });
    return true;
  }

  async hasSession(hash) {
    this.prune();
    return this.sessions.has(hash);
  }

  async revokeSession(hash) {
    this.sessions.delete(hash);
  }
}
