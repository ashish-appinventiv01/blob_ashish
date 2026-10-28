import { Router } from "express";
import { postController } from "../Modules/post/post.controller";
import { userController } from "../Modules/user/user.controller";
import { authMiddleware } from "../middlewares/auth";
import { requestValidator } from "../middlewares/validate";

class UserRoutes {
  public userRoute = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.userRoute.get("/me", authMiddleware.requireAuth, userController.getMe);
    this.userRoute.get("/me/posts", authMiddleware.requireAuth, postController.listMyPosts);
    this.userRoute.patch("/me", authMiddleware.requireAuth, requestValidator.validateNameUpdate, userController.updateMe);
  }
}

export const userRoutes = new UserRoutes().userRoute;
