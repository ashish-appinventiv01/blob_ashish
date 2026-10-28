import { Request, Response } from "express";
import { MESSAGES } from "../../constants/messages";
import { cache, redisConfig } from "../../providers/redis";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { PublicUser } from "./user.interface";
import { userService } from "./user.service";

class UserController {
  getMe = asyncHandler.wrap(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError(MESSAGES.unauthorized, 401);

    const { value, cacheStatus } = await cache.aside(redisConfig.keys.user(req.user.id), redisConfig.ttl.user, async () => req.user as PublicUser);
    res.set("X-Cache", cacheStatus);
    res.status(200).json(value);
  });

  updateMe = asyncHandler.wrap(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(MESSAGES.unauthorized, 401);
    }

    const user = await userService.updateName({ userId: req.user.id, name: req.body.name as string });
    res.status(200).json(user);
  });
}

export const userController = new UserController();
