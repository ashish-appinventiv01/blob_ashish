import { Router } from "express";
import { deleteComment } from "../Modules/comment/comment.controller";
import { requireAuth } from "../middlewares/auth";

const commentRouter = Router();

commentRouter.delete("/:id", requireAuth, deleteComment);

export default commentRouter;
