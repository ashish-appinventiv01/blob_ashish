import dotenv from "dotenv";
import { MESSAGES } from "./messages";

dotenv.config();

class AppConfig {
  readonly port: number;
  readonly nodeEnv: string;
  readonly mongodbUri: string;
  readonly dbName: string;
  readonly redisUrl: string;

  constructor() {
    this.port = this.readPort();
    this.nodeEnv = process.env.NODE_ENV ?? "development";
    this.mongodbUri = this.requiredEnv("MONGODB_URI");
    this.dbName = this.requiredEnv("DB_NAME");
    this.redisUrl = this.requiredEnv("REDIS_URL");
  }

  private requiredEnv(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) {
      throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
  }

  private readPort(): number {
    const port = Number(process.env.PORT ?? 3000);
    if (!Number.isInteger(port) || port <= 0) {
      throw new Error("PORT must be a positive integer");
    }
    return port;
  }
}

export const config = new AppConfig();
export { MESSAGES };
