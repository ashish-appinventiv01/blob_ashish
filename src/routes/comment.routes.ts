import { Router } from "express";
import { commentController } from "../Modules/comment/comment.controller";
import { authMiddleware } from "../middlewares/auth";

class CommentRoutes {
  public commentRoute = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.commentRoute.delete("/:id", authMiddleware.requireAuth, commentController.deleteComment);
  }
}

export const commentRoutes = new CommentRoutes().commentRoute;
