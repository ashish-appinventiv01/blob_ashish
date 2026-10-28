import { NextFunction, Request, Response } from "express";
import { MESSAGES } from "../constants/messages";
import { AppError } from "../utils/AppError";
import { postValidator } from "./validatePost";

class CommentValidator {
  validateCreateComment = (req: Request, _res: Response, next: NextFunction): void => {
    const body = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (text.length < 1 || text.length > 500) {
      next(new AppError(MESSAGES.commentLength, 400));
      return;
    }

    req.body = { text };
    next();
  };

  parseCommentListQuery(query: Request["query"]): { page: number; limit: number } {
    return postValidator.parsePageLimit(query);
  }
}

export const commentValidator = new CommentValidator();
