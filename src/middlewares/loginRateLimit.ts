import { NextFunction, Request, Response } from "express";
import { MESSAGES } from "../constants/messages";
import { cache, redisConfig } from "../providers/redis";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

class LoginRateLimiter {
  private loginIdentity(req: Request): string | null {
    const email = req.body?.email;
    if (typeof email !== "string") {
      return null;
    }

    const normalized = email.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }

  private minutesLeft(seconds: number): number {
    const remaining = seconds > 0 ? seconds : redisConfig.ttl.loginAttempt;
    return Math.max(1, Math.ceil(remaining / 60));
  }

  limit = asyncHandler.wrap(async (req: Request, _res: Response, next: NextFunction) => {
    const email = this.loginIdentity(req);
    if (!email) {
      next();
      return;
    }

    const raw = await cache.get(redisConfig.keys.loginAttempts(email));
    const attempts = Number(raw ?? 0);
    if (!Number.isFinite(attempts) || attempts < redisConfig.limits.loginAttempts) {
      next();
      return;
    }

    const seconds = await cache.ttl(redisConfig.keys.loginAttempts(email));
    if (seconds === null || seconds === -2) {
      next();
      return;
    }

    const minutes = this.minutesLeft(seconds);
    throw new AppError(`${MESSAGES.tooManyLoginAttempts} ${minutes} minutes`, 429);
  });

  async recordFailedLogin(email: string): Promise<void> {
    const key = redisConfig.keys.loginAttempts(email.trim().toLowerCase());
    const attempts = await cache.incr(key);
    if (attempts === 1) {
      await cache.expire(key, redisConfig.ttl.loginAttempt);
    }
  }

  async clearLoginAttempts(email: string): Promise<void> {
    await cache.delKeys([redisConfig.keys.loginAttempts(email.trim().toLowerCase())]);
  }
}

export const loginRateLimiter = new LoginRateLimiter();
