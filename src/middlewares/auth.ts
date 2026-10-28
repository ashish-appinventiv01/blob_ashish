import { NextFunction, Request, Response } from "express";
import { MESSAGES } from "../constants/messages";
import { AppError } from "../utils/AppError";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(new AppError(MESSAGES.unauthorized, 401));
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    next(new AppError(MESSAGES.unauthorized, 401));
    return;
  }

  next();
}
