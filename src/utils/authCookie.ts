import { CookieOptions, Response } from "express";
import { AUTH } from "../constants/auth";
import { config } from "../constants/config";

class AuthCookie {
  private baseCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: "lax",
      secure: config.nodeEnv === "production",
      path: "/",
    };
  }

  set(res: Response, token: string): void {
    res.cookie(AUTH.cookieName, token, {
      ...this.baseCookieOptions(),
      maxAge: AUTH.sessionTtlMs,
    });
  }

  clear(res: Response): void {
    res.clearCookie(AUTH.cookieName, this.baseCookieOptions());
  }
}

export const authCookie = new AuthCookie();
