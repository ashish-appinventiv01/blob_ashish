import { NextFunction, Request, Response } from "express";
import { MESSAGES } from "../constants/messages";
import { AppError } from "../utils/AppError";
import { parsePageLimit } from "./validatePost";

export function validateCreateComment(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (text.length < 1 || text.length > 500) {
    next(new AppError(MESSAGES.commentLength, 400));
    return;
  }

  req.body = { text };
  next();
}

export function parseCommentListQuery(query: Request["query"]): { page: number; limit: number } {
  return parsePageLimit(query);
}
