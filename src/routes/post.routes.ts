import { Router } from "express";
import { commentController } from "../Modules/comment/comment.controller";
import { postController } from "../Modules/post/post.controller";
import { authMiddleware } from "../middlewares/auth";
import { commentValidator } from "../middlewares/validateComment";
import { postValidator } from "../middlewares/validatePost";

class PostRoutes {
  public postRoute = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.postRoute.get("/", postController.listPosts);
    this.postRoute.post("/", authMiddleware.requireAuth, postValidator.validateCreatePost, postController.createPost);
    this.postRoute.get("/:id/comments", commentController.listComments);
    this.postRoute.post("/:id/comments", authMiddleware.requireAuth, commentValidator.validateCreateComment, commentController.createComment);
    this.postRoute.get("/:id", postController.getPost);
    this.postRoute.patch("/:id", authMiddleware.requireAuth, postValidator.validateUpdatePost, postController.updatePost);
    this.postRoute.delete("/:id", authMiddleware.requireAuth, postController.deletePost);
  }
}

export const postRoutes = new PostRoutes().postRoute;
