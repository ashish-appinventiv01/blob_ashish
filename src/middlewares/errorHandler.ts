import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { MESSAGES } from "../constants/messages";
import { AppError } from "../utils/AppError";
import { duplicateKeyIncludes, isDuplicateKeyError } from "../utils/mongoError";

const ERROR_STATUSES = new Set([400, 401, 403, 404, 409, 500]);

function sendError(res: Response, status: number, message: string): void {
  const statusCode = ERROR_STATUSES.has(status) ? status : 500;
  res.status(statusCode).json({ success: false, message });
}

function validationMessage(err: mongoose.Error.ValidationError): string {
  const messages = Object.values(err.errors).map((item) => {
    if (item.path === "password") {
      console.log(item.message);
      return MESSAGES.passwordLength;
    }
    return item.message;
  });

  return messages.join(", ") || "Validation failed";
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    sendError(res, 400, MESSAGES.invalidJson);
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    sendError(res, 400, validationMessage(err));
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    sendError(res, 400, MESSAGES.invalidId);
    return;
  }

  if (isDuplicateKeyError(err)) {
    const message = duplicateKeyIncludes(err, "email") ? MESSAGES.emailTaken : MESSAGES.duplicate;
    sendError(res, 409, message);
    return;
  }

  console.error(err);
  sendError(res, 500, MESSAGES.internal);
}
