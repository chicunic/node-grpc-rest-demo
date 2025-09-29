import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import helmet from 'helmet';
import path from 'path';
import 'reflect-metadata';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';

import * as swaggerDocument from '../swagger.json';
import { createStructuredLogger, logHttpRequest } from './config/logger';
import { productRoutes } from './routes/product.route';
import { userRoutes } from './routes/user.route';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Set default NODE_ENV if not specified
process.env.NODE_ENV ??= 'development';

const logger = createStructuredLogger('http-server');

const app: express.Application = express();
const port = process.env.PORT ?? 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// HTTP request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logHttpRequest(req, res, duration);
  });

  next();
});

// OpenAPI validation middleware
app.use(
  OpenApiValidator.middleware({
    apiSpec: path.join(__dirname, '../swagger.json'),
    validateRequests: true,
    validateResponses: false, // Set to true if you want response validation too
    ignorePaths: /(.*\/api-docs.*|.*\.well-known.*)/,
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger documentation (only enabled in development environment)
if (process.env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// API Routes
app.use('/api/v1', userRoutes);
app.use('/api/v1', productRoutes);

// Error handling middleware
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('HTTP Error', err instanceof Error ? err : { error: err });

  // Handle OpenAPI validation errors
  const errorObj = err as { status?: number; message?: string; errors?: unknown };
  if (errorObj.status && errorObj.status < 500) {
    res.status(errorObj.status).json({
      error: errorObj.message ?? 'Validation error',
      details: errorObj.errors,
    });
    return;
  }

  // Handle other errors
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, () => {
  logger.info(`HTTP server started on port ${port}`);
});

export default app;
