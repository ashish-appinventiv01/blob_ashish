import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import apiRouter from "./routes";

export const app = express();

app.use(express.json());
app.use(apiRouter);
app.use(notFound);
app.use(errorHandler);
