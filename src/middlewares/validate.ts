import { NextFunction, Request, Response } from "express";
import { MESSAGES } from "../constants/messages";
import { AppError } from "../utils/AppError";

type FieldSource = Record<string, unknown> | undefined;

export type ValidationRules = {
  body?: string[];
  query?: string[];
  params?: string[];
};

class RequestValidator {
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private missingFields(source: FieldSource, fields: string[]): string[] {
    return fields.filter((field) => {
      const value = source?.[field];
      return value === undefined || value === null || value === "";
    });
  }

  validate(rules: ValidationRules) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const missing = [
        ...this.missingFields(req.body as FieldSource, rules.body ?? []),
        ...this.missingFields(req.query as FieldSource, rules.query ?? []),
        ...this.missingFields(req.params as FieldSource, rules.params ?? []),
      ];

      if (missing.length > 0) {
        next(new AppError(`Missing required fields: ${missing.join(", ")}`, 400));
        return;
      }

      next();
    };
  }

  validateSignup = (req: Request, _res: Response, next: NextFunction): void => {
    const body = req.body as Record<string, unknown> | undefined;
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = body?.password;

    if (name.length < 2 || name.length > 50) {
      next(new AppError(MESSAGES.nameLength, 400));
      return;
    }

    if (!this.emailPattern.test(email)) {
      next(new AppError(MESSAGES.emailInvalid, 400));
      return;
    }

    if (typeof password !== "string" || password.length < 8) {
      next(new AppError(MESSAGES.passwordLength, 400));
      return;
    }

    req.body = { name, email, password };
    next();
  };

  validateLogin = (req: Request, _res: Response, next: NextFunction): void => {
    const body = req.body as Record<string, unknown> | undefined;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      next(new AppError(MESSAGES.loginRequired, 400));
      return;
    }

    req.body = { email, password };
    next();
  };

  validateNameUpdate = (req: Request, _res: Response, next: NextFunction): void => {
    const body = req.body as Record<string, unknown> | undefined;
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (name.length < 2 || name.length > 50) {
      next(new AppError(MESSAGES.nameLength, 400));
      return;
    }

    req.body = { name };
    next();
  };
}

export const requestValidator = new RequestValidator();
