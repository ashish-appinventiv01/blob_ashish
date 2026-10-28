import { Router } from "express";
import { login, logout, signup } from "../Modules/auth/auth.controller";
import { requireAuth } from "../middlewares/auth";
import { validateLogin, validateSignup } from "../middlewares/validate";

const authRouter = Router();

authRouter.post("/signup", validateSignup, signup);
authRouter.post("/login", validateLogin, login);
authRouter.post("/logout", requireAuth, logout);

export default authRouter;
