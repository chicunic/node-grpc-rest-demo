import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import "reflect-metadata";

import { createStructuredLogger, logHttpRequest } from "./config/logger";
import { productRoutes } from "./routes/product.route";
import { userRoutes } from "./routes/user.route";

dotenv.config();

// Set default NODE_ENV if not specified
process.env.NODE_ENV ??= "development";

const logger = createStructuredLogger("http-server");

const app: express.Application = express();
const port = process.env.PORT ?? 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// HTTP request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logHttpRequest(req, res, duration);
  });

  next();
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);

// Error handling middleware
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("HTTP Error", err instanceof Error ? err : { error: err });

  // Handle OpenAPI validation errors
  const errorObj = err as { status?: number; message?: string; errors?: unknown };
  if (errorObj.status && errorObj.status < 500) {
    res.status(errorObj.status).json({
      error: errorObj.message ?? "Validation error",
      details: errorObj.errors,
    });
    return;
  }

  // Handle other errors
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.listen(port, () => {
  logger.info(`HTTP server started on port ${port}`);
});

export default app;
