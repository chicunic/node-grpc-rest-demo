import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";

import { config } from "./config.js";
import { createStructuredLogger } from "./config/logger.js";
import { productRoutes } from "./routes/product.route.js";
import { userRoutes } from "./routes/user.route.js";
import { PROBLEM_HEADERS, defaultHook, problemDetails } from "./schemas/common.js";
import { ConflictError, NotFoundError, ValidationError } from "./utils/errors.js";

const logger = createStructuredLogger("http-server");

const app = new OpenAPIHono({ defaultHook: defaultHook() });

app.use("*", secureHeaders());
app.use("*", cors());

app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  logger.debug("HTTP Request", {
    method: c.req.method,
    url: c.req.url,
    status: c.res.status,
    duration: Date.now() - start,
  });
});

app.get("/", (c) => c.json({ name: "node-grpc-rest-demo", version: "1.0.0" }));
app.get("/health", (c) => c.json({ status: "ok" }));

app.route(config.ROUTE_PREFIX, userRoutes);
app.route(config.ROUTE_PREFIX, productRoutes);

app.notFound((c) => c.json(problemDetails(404, "Not Found", "Endpoint not found"), 404, PROBLEM_HEADERS));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(problemDetails(err.status, "HTTPException", err.message), err.status, PROBLEM_HEADERS);
  }
  if (err instanceof NotFoundError) {
    return c.json(problemDetails(404, "Not Found", err.message), 404, PROBLEM_HEADERS);
  }
  if (err instanceof ConflictError) {
    return c.json(problemDetails(409, "Conflict", err.message), 409, PROBLEM_HEADERS);
  }
  if (err instanceof ValidationError) {
    return c.json(problemDetails(400, "Bad Request", err.message), 400, PROBLEM_HEADERS);
  }
  logger.error("Unhandled error", err);
  return c.json(problemDetails(500, "Internal Server Error", "Internal server error"), 500, PROBLEM_HEADERS);
});

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Node gRPC REST Demo",
    version: "1.0.0",
    description: "REST API for the Node gRPC REST Demo. Errors follow RFC 9457 (Problem Details).",
    license: { name: "MIT" },
  },
  servers: [{ url: `http://localhost:${config.PORT}`, description: "Local" }],
});

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

export default app;
