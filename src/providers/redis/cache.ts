import { redisConnection } from "./connection";
import { redisConfig } from "./redis";

export type CacheStatus = "HIT" | "MISS";

const client = redisConnection.client;

async function call<T>(action: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Redis error";
    console.error(`Redis ${action} failed: ${message}`);
    return fallback;
  }
}

const get = (key: string) => call("get", () => client.get(key), null);
const set = async (key: string, value: string, ttlSeconds: number) => {
  if (ttlSeconds < 1) return;
  await call("set", () => client.set(key, value, "EX", ttlSeconds), null);
};
const delKeys = async (keys: readonly string[]) => {
  if (keys.length === 0) return;
  await call("del", () => client.del(...keys), 0);
};
const incr = (key: string) => call("incr", () => client.incr(key), null);
const expire = async (key: string, ttlSeconds: number) => {
  if (ttlSeconds < 1) return;
  await call("expire", () => client.expire(key, ttlSeconds), 0);
};
const ttl = (key: string) => call("ttl", () => client.ttl(key), null);

export const cache = {
  get,
  set,
  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await get(key);
    if (raw === null) return null;
    const value = await call("getJSON", async () => JSON.parse(raw) as T, null);
    if (value !== null) console.log(`Redis HIT ${key}`);
    return value;
  },
  setJSON: (key: string, value: unknown, ttlSeconds: number) =>
    call("setJSON", async () => set(key, JSON.stringify(value), ttlSeconds), undefined),
  delKeys,
  incr,
  expire,
  ttl,
  async aside<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<{ value: T; cacheStatus: CacheStatus }> {
    const hit = await this.getJSON<T>(key);
    if (hit) return { value: hit, cacheStatus: "HIT" };
    const value = JSON.parse(JSON.stringify(await load())) as T;
    await this.setJSON(key, value, ttlSeconds);
    return { value, cacheStatus: "MISS" };
  },
};

export const sessionCache = {
  async save(token: string, userId: string, expiresAt: Date) {
    const seconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    if (seconds < 1) return;
    const setKey = redisConfig.keys.userSessions(userId);
    await set(redisConfig.keys.session(token), userId, seconds);
    await call("sadd", () => client.sadd(setKey, token), 0);
    const current = await ttl(setKey);
    if (current !== null && current < seconds) await expire(setKey, seconds);
  },
  readUserId: (token: string) => get(redisConfig.keys.session(token)),
  async remove(token: string, userId: string) {
    await delKeys([redisConfig.keys.session(token)]);
    if (!userId) return;
    const setKey = redisConfig.keys.userSessions(userId);
    await call("srem", () => client.srem(setKey, token), 0);
    if ((await call("scard", () => client.scard(setKey), null)) === 0) await delKeys([setKey]);
  },
};

export const postCache = {
  bumpListVersion: () => incr(redisConfig.keys.postListVersion()),
  async invalidate(postId: string) {
    await delKeys([redisConfig.keys.post(postId)]);
    await incr(redisConfig.keys.postListVersion());
  },
};
