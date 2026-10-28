import { Router } from "express";
import { healthController } from "../Modules/health/health.controller";

const healthRouter = Router();

healthRouter.get("/health", healthController);

export default healthRouter;
