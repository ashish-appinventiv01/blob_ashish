import { Request, Response } from "express";
import { MESSAGES } from "../../constants/messages";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { updateName } from "./user.service";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(MESSAGES.unauthorized, 401);
  }

  res.status(200).json(req.user);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(MESSAGES.unauthorized, 401);
  }

  const user = await updateName({ userId: req.user.id, name: req.body.name as string });
  res.status(200).json(user);
});
