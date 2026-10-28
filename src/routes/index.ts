import { Router } from "express";
import authRouter from "./auth.routes";
import commentRouter from "./comment.routes";
import healthRouter from "./health.routes";
import postRouter from "./post.routes";
import statsRouter from "./stats.routes";
import userRouter from "./user.routes";

const apiRouter = Router();

apiRouter.use("/api", healthRouter);
apiRouter.use("/api/auth", authRouter);
apiRouter.use("/api/posts", postRouter);
apiRouter.use("/api/comments", commentRouter);
apiRouter.use("/api/stats", statsRouter);
apiRouter.use("/api/users", userRouter);

export default apiRouter;
