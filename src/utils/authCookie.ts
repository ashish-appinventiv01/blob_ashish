import { CookieOptions, Response } from "express";
import { AUTH } from "../constants/auth";
import { config } from "../constants/config";

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: config.nodeEnv === "production",
    path: "/",
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH.cookieName, token, {
    ...baseCookieOptions(),
    maxAge: AUTH.sessionTtlMs,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH.cookieName, baseCookieOptions());
}
