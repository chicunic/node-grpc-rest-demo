import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import "reflect-metadata";

import { createStructuredLogger, logHttpRequest } from "./config/logger.js";
import { productRoutes } from "./routes/product.route.js";
import { userRoutes } from "./routes/user.route.js";

dotenv.config();
process.env.NODE_ENV ??= "development";

const logger = createStructuredLogger("http-server");

const app: express.Application = express();
const port = process.env.PORT ?? 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const startTime = Date.now();
  res.on("finish", () => {
    logHttpRequest(req, res, Date.now() - startTime);
  });
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("HTTP Error", err instanceof Error ? err : { error: err });

  const errorObj = err as { status?: number; message?: string; errors?: unknown };
  if (errorObj.status && errorObj.status < 500) {
    res.status(errorObj.status).json({
      error: errorObj.message ?? "Validation error",
      details: errorObj.errors,
    });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.listen(port, () => {
  logger.info(`HTTP server started on port ${port}`);
});

export default app;
