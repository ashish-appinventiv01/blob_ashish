import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { statsService } from "./stats.service";

class StatsController {
  getStats = asyncHandler.wrap(async (_req: Request, res: Response) => {
    const result = await statsService.getStats();
    res.set("X-Cache", result.cacheStatus);
    res.status(200).json(result.stats);
  });
}

export const statsController = new StatsController();
