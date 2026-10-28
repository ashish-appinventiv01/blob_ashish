import cookieParser from "cookie-parser";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./docs/openapi";
import { errorHandler } from "./middlewares/errorHandler";
import { hideSecrets } from "./middlewares/hideSecrets";
import { notFound } from "./middlewares/notFound";
import apiRouter from "./routes";

export const app = express();

app.use(hideSecrets);
app.use(express.json());
app.use(cookieParser());
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    swaggerOptions: {
      withCredentials: true,
    },
  }),
);
app.get("/api-docs.json", (_req, res) => {
  res.type("application/json").send(JSON.stringify(openApiSpec));
});
app.use(apiRouter);
app.use(notFound);
app.use(errorHandler);
