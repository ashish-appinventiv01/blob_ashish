import { NextFunction, Request, Response } from "express";
import { AUTH } from "../constants/auth";
import { MESSAGES } from "../constants/messages";
import { sessionCache } from "../providers/redis";
import { sessionRepository } from "../Modules/auth/session.repository";
import { userRepository } from "../Modules/user/user.repository";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { publicUser } from "../utils/publicUser";

class AuthMiddleware {
  private async attachUser(req: Request, token: string, userId: string): Promise<void> {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      await sessionRepository.deleteSessionByToken(token);
      await sessionCache.remove(token, userId);
      throw new AppError(MESSAGES.unauthorized, 401);
    }

    req.authToken = token;
    req.user = publicUser.toPublicUser(user);
  }

  requireAuth = asyncHandler.wrap(async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[AUTH.cookieName];
    if (typeof token !== "string" || token.length === 0) {
      throw new AppError(MESSAGES.unauthorized, 401);
    }

    let userId = await sessionCache.readUserId(token);
    let expiresAt: Date | undefined;

    if (!userId) {
      const session = await sessionRepository.findSessionByToken(token);
      if (!session || session.expiresAt.getTime() <= Date.now()) {
        if (session) await sessionRepository.deleteSessionByToken(token);
        throw new AppError(MESSAGES.unauthorized, 401);
      }

      userId = session.userId.toString();
      expiresAt = session.expiresAt;
    }

    await this.attachUser(req, token, userId);
    if (expiresAt) await sessionCache.save(token, userId, expiresAt);
    next();
  });
}

export const authMiddleware = new AuthMiddleware();
