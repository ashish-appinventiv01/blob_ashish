import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

type FieldSource = Record<string, unknown> | undefined;

export type ValidationRules = {
  body?: string[];
  query?: string[];
  params?: string[];
};

function missingFields(source: FieldSource, fields: string[]): string[] {
  return fields.filter((field) => {
    const value = source?.[field];
    return value === undefined || value === null || value === "";
  });
}

export function validate(rules: ValidationRules) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const missing = [
      ...missingFields(req.body as FieldSource, rules.body ?? []),
      ...missingFields(req.query as FieldSource, rules.query ?? []),
      ...missingFields(req.params as FieldSource, rules.params ?? []),
    ];

    if (missing.length > 0) {
      next(new AppError(`Missing required fields: ${missing.join(", ")}`, 400));
      return;
    }

    next();
  };
}
