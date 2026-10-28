import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getStats } from "./stats.service";

export const getStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getStats();
  res.status(200).json(stats);
});
