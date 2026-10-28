import { Router } from "express";
import { getStatsHandler } from "../Modules/stats/stats.controller";

const statsRouter = Router();

statsRouter.get("/", getStatsHandler);

export default statsRouter;
