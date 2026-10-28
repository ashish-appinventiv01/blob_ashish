import dotenv from "dotenv";
import { MESSAGES } from "./messages";

dotenv.config();

const DB_NAME = "blog_ashish";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT must be a positive integer");
}

export const config = {
  port,
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongodbUri: requiredEnv("MONGODB_URI"),
  dbName: DB_NAME,
} as const;

export { MESSAGES };
