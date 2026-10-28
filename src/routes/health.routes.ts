import { Router } from "express";
import { healthController } from "../Modules/health/health.controller";

class HealthRoutes {
  public healthRoute = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.healthRoute.get("/health", healthController.getHealth);
  }
}

export const healthRoutes = new HealthRoutes().healthRoute;
