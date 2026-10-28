import { Router } from "express";
import { listMyPosts } from "../Modules/post/post.controller";
import { getMe, updateMe } from "../Modules/user/user.controller";
import { requireAuth } from "../middlewares/auth";
import { validateNameUpdate } from "../middlewares/validate";

const userRouter = Router();

userRouter.get("/me", requireAuth, getMe);
userRouter.get("/me/posts", requireAuth, listMyPosts);
userRouter.patch("/me", requireAuth, validateNameUpdate, updateMe);

export default userRouter;
