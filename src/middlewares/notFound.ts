import { NextFunction, Request, Response } from "express";
import { MESSAGES } from "../constants/messages";
import { AppError } from "../utils/AppError";

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(MESSAGES.notFound, 404));
}
