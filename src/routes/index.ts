import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { commentRoutes } from "./comment.routes";
import { healthRoutes } from "./health.routes";
import { postRoutes } from "./post.routes";
import { statsRoutes } from "./stats.routes";
import { userRoutes } from "./user.routes";

class ApiRoutes {
  public apiRoute = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.apiRoute.use("/api", healthRoutes);
    this.apiRoute.use("/api/auth", authRoutes);
    this.apiRoute.use("/api/posts", postRoutes);
    this.apiRoute.use("/api/comments", commentRoutes);
    this.apiRoute.use("/api/stats", statsRoutes);
    this.apiRoute.use("/api/users", userRoutes);
  }
}

export const apiRoutes = new ApiRoutes().apiRoute;
