import { Router } from "express";
import { statsController } from "../Modules/stats/stats.controller";

class StatsRoutes {
  public statsRoute = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.statsRoute.get("/", statsController.getStats);
  }
}

export const statsRoutes = new StatsRoutes().statsRoute;
