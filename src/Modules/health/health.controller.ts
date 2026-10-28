import { Request, Response } from "express";
import { healthService } from "./health.service";

class HealthController {
  getHealth = (_req: Request, res: Response): void => {
    res.status(200).json(healthService.getHealthStatus());
  };
}

export const healthController = new HealthController();
