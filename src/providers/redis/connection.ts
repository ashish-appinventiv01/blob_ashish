import Redis from "ioredis";
import { config } from "../../constants/config";

const message = (error: unknown) => (error instanceof Error ? error.message || error.name : "Unknown Redis error");

class RedisConnection {
  readonly client = new Redis(config.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 1000,
    commandTimeout: 1000,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });

  constructor() {
    this.client.on("error", (error: unknown) => console.error(`Redis error: ${message(error)}`));
  }

  async initConnection(): Promise<void> {
    try {
      if (this.client.status === "wait") await this.client.connect();
      console.log("Redis connected");
    } catch (error) {
      console.error(`Redis unavailable, continuing with MongoDB: ${message(error)}`);
    }
  }
}

export const redisConnection = new RedisConnection();
