import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./docs/openapi";
import { errorHandler } from "./middlewares/errorHandler";
import { secretMiddleware } from "./middlewares/hideSecrets";
import { notFoundMiddleware } from "./middlewares/notFound";
import { apiRoutes } from "./routes";

class App {
  public readonly expressApp: Express = express();

  constructor() {
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.expressApp.use(secretMiddleware.hide);
    this.expressApp.use(express.json());
    this.expressApp.use(cookieParser());
    this.expressApp.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(openApiSpec, {
        swaggerOptions: {
          withCredentials: true,
        },
      }),
    );
    this.expressApp.get("/api-docs.json", (_req, res) => {
      res.type("application/json").send(JSON.stringify(openApiSpec));
    });
  }

  private initializeRoutes(): void {
    this.expressApp.use(apiRoutes);
  }

  private initializeErrorHandling(): void {
    this.expressApp.use(notFoundMiddleware.handle);
    this.expressApp.use(errorHandler.handle);
  }
}

export const app = new App().expressApp;
