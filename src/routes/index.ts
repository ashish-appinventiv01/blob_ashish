import { Router } from "express";
import healthRouter from "./health.routes";

const apiRouter = Router();

apiRouter.use("/api", healthRouter);

export default apiRouter;
