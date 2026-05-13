import { serve } from "@hono/node-server";

import app from "./app.js";
import { config } from "./config.js";
import { createStructuredLogger } from "./config/logger.js";

const logger = createStructuredLogger("http-server");

serve({ fetch: app.fetch, port: config.PORT }, () => {
  const baseUrl = `http://localhost:${config.PORT}`;
  logger.info("HTTP server started", { server: baseUrl, docs: `${baseUrl}/docs` });
});

export default app;
