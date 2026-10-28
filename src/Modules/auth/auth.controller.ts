import { Request, Response } from "express";
import { MESSAGES } from "../../constants/messages";
import { sessionCache } from "../../providers/redis";
import { authCookie } from "../../utils/authCookie";
import { asyncHandler } from "../../utils/asyncHandler";
import { authService } from "./auth.service";
import { sessionRepository } from "./session.repository";

class AuthController {
  signup = asyncHandler.wrap(async (req: Request, res: Response) => {
    const user = await authService.signupUser({
      name: req.body.name as string,
      email: req.body.email as string,
      password: req.body.password as string,
    });

    res.status(201).json(user);
  });

  login = asyncHandler.wrap(async (req: Request, res: Response) => {
    const { token, user } = await authService.loginUser({
      email: req.body.email as string,
      password: req.body.password as string,
      userAgent: req.get("user-agent") ?? "",
    });

    authCookie.set(res, token);
    res.status(200).json({ token, user });
  });

  logout = asyncHandler.wrap(async (req: Request, res: Response) => {
    if (req.authToken) {
      await sessionRepository.deleteSessionByToken(req.authToken);
      await sessionCache.remove(req.authToken, req.user?.id ?? "");
    }

    authCookie.clear(res);
    res.status(200).json({ success: true, message: MESSAGES.loggedOut });
  });
}

export const authController = new AuthController();
