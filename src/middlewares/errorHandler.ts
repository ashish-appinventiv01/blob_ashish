import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { config } from "../constants/config";
import { MESSAGES } from "../constants/messages";
import { AppError } from "../utils/AppError";

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === 11000;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ success: false, message: MESSAGES.invalidJson });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, message: MESSAGES.invalidId });
    return;
  }

  if (isDuplicateKeyError(err)) {
    res.status(409).json({ success: false, message: MESSAGES.duplicate });
    return;
  }

  console.error(err);

  const message =
    config.nodeEnv === "production" || !(err instanceof Error) ? MESSAGES.internal : err.message;

  res.status(500).json({ success: false, message });
}
