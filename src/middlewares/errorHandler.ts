import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { MESSAGES } from "../constants/messages";
import { AppError } from "../utils/AppError";
import { mongoError } from "../utils/mongoError";

class ErrorHandler {
  private readonly errorStatuses = new Set([400, 401, 403, 404, 409, 429, 500]);

  private sendError(res: Response, status: number, message: string): void {
    const statusCode = this.errorStatuses.has(status) ? status : 500;
    res.status(statusCode).json({ success: false, message });
  }

  private validationMessage(err: mongoose.Error.ValidationError): string {
    const messages = Object.values(err.errors).map((item) => {
      if (item.path === "password") {
        console.log(item.message);
        return MESSAGES.passwordLength;
      }
      return item.message;
    });

    return messages.join(", ") || "Validation failed";
  }

  handle = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof AppError) {
      this.sendError(res, err.statusCode, err.message);
      return;
    }

    if (err instanceof SyntaxError && "body" in err) {
      this.sendError(res, 400, MESSAGES.invalidJson);
      return;
    }

    if (err instanceof mongoose.Error.ValidationError) {
      this.sendError(res, 400, this.validationMessage(err));
      return;
    }

    if (err instanceof mongoose.Error.CastError) {
      this.sendError(res, 400, MESSAGES.invalidId);
      return;
    }

    if (mongoError.isDuplicateKeyError(err)) {
      const message = mongoError.duplicateKeyIncludes(err, "email") ? MESSAGES.emailTaken : MESSAGES.duplicate;
      this.sendError(res, 409, message);
      return;
    }

    console.error(err);
    this.sendError(res, 500, MESSAGES.internal);
  };
}

export const errorHandler = new ErrorHandler();
