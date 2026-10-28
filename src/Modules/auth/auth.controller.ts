import { Request, Response } from "express";
import { MESSAGES } from "../../constants/messages";
import { deleteSessionByToken } from "./session.repository";
import { clearAuthCookie, setAuthCookie } from "../../utils/authCookie";
import { asyncHandler } from "../../utils/asyncHandler";
import { loginUser, signupUser } from "./auth.service";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const user = await signupUser({
    name: req.body.name as string,
    email: req.body.email as string,
    password: req.body.password as string,
  });

  res.status(201).json(user);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { token, user } = await loginUser({
    email: req.body.email as string,
    password: req.body.password as string,
    userAgent: req.get("user-agent") ?? "",
  });

  setAuthCookie(res, token);
  res.status(200).json({ token, user });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.authToken) {
    await deleteSessionByToken(req.authToken);
  }

  clearAuthCookie(res);
  res.status(200).json({ success: true, message: MESSAGES.loggedOut });
});
