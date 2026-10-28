import { Router } from "express";
import { authController } from "../Modules/auth/auth.controller";
import { authMiddleware } from "../middlewares/auth";
import { loginRateLimiter } from "../middlewares/loginRateLimit";
import { requestValidator } from "../middlewares/validate";

class AuthRoutes {
  public authRoute = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.authRoute.post("/signup", requestValidator.validateSignup, authController.signup);
    this.authRoute.post("/login", requestValidator.validateLogin, loginRateLimiter.limit, authController.login);
    this.authRoute.post("/logout", authMiddleware.requireAuth, authController.logout);
  }
}

export const authRoutes = new AuthRoutes().authRoute;
