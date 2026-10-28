import { Router } from "express";
import { createComment, listComments } from "../Modules/comment/comment.controller";
import { createPost, deletePost, getPost, listPosts, updatePost } from "../Modules/post/post.controller";
import { requireAuth } from "../middlewares/auth";
import { validateCreateComment } from "../middlewares/validateComment";
import { validateCreatePost, validateUpdatePost } from "../middlewares/validatePost";

const postRouter = Router();

postRouter.get("/", listPosts);
postRouter.post("/", requireAuth, validateCreatePost, createPost);
postRouter.get("/:id/comments", listComments);
postRouter.post("/:id/comments", requireAuth, validateCreateComment, createComment);
postRouter.get("/:id", getPost);
postRouter.patch("/:id", requireAuth, validateUpdatePost, updatePost);
postRouter.delete("/:id", requireAuth, deletePost);

export default postRouter;
