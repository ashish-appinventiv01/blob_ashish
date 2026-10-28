import { NextFunction, Request, Response } from "express";
import { AUTH } from "../constants/auth";
import { MESSAGES } from "../constants/messages";
import { deleteSessionByToken, findSessionByToken } from "../Modules/auth/session.repository";
import { findUserById } from "../Modules/user/user.repository";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { toPublicUser } from "../utils/publicUser";

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[AUTH.cookieName];

  if (typeof token !== "string" || token.length === 0) {
    throw new AppError(MESSAGES.unauthorized, 401);
  }

  const session = await findSessionByToken(token);

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) {
      await deleteSessionByToken(token);
    }
    throw new AppError(MESSAGES.unauthorized, 401);
  }

  const user = await findUserById(session.userId.toString());
  if (!user) {
    await deleteSessionByToken(token);
    throw new AppError(MESSAGES.unauthorized, 401);
  }

  req.authToken = token;
  req.user = toPublicUser(user);
  next();
});
