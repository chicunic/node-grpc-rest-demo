/**
 * REST API test server utilities
 */
import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import path, { dirname } from 'path';
import request, { Response } from 'supertest';
import { fileURLToPath } from 'url';

// Creates a test Express app with OpenAPI validation middleware
// This ensures all tests use the same validation logic as production
function createTestAppWithValidation(): express.Application {
  const app = express();

  // Middleware
  app.use(express.json());

  // OpenAPI validation middleware
  const __dirname = dirname(fileURLToPath(import.meta.url));
  app.use(
    OpenApiValidator.middleware({
      apiSpec: path.join(__dirname, '../../swagger.json'),
      validateRequests: true,
      validateResponses: false,
    })
  );

  return app;
}

// Adds error handling middleware to test app
// This should be called after adding routes
function addErrorHandlingToTestApp(app: express.Application): void {
  // Add error handling middleware
  app.use(
    (
      err: Error & { status?: number; errors?: unknown },
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      // Handle OpenAPI validation errors
      if (err.status && err.status < 500) {
        res.status(err.status).json({
          error: err.message,
          details: err.errors,
        });
        return;
      }

      // Handle other errors
      res.status(500).json({ error: 'Internal server error' });
    }
  );
}

// Creates a complete test app with production routes and error handling
// Automatically loads all production routes for integration testing
export async function createCompleteTestApp(): Promise<express.Application> {
  const app = createTestAppWithValidation();

  // Import and add production routes using dynamic ES6 imports
  const { productRoutes } = await import('../../src/routes/product.route');
  const { userRoutes } = await import('../../src/routes/user.route');

  // Health check endpoint (same as production)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Add API routes (same as production)
  app.use('/api/v1', productRoutes);
  app.use('/api/v1', userRoutes);

  // Add error handling
  addErrorHandlingToTestApp(app);

  return app;
}

// Helper functions for REST API testing
export class RestTestHelper {
  constructor(private app: express.Application) {}

  get request(): ReturnType<typeof request> {
    return request(this.app);
  }

  async post<TResponse = unknown>(
    url: string,
    data: string | object | undefined
  ): Promise<Response & { body: TResponse }> {
    return this.request.post(url).send(data) as Promise<Response & { body: TResponse }>;
  }

  async get(url: string): Promise<Response> {
    return this.request.get(url);
  }

  async put(url: string, data: string | object | undefined): Promise<Response> {
    return this.request.put(url).send(data);
  }

  async delete(url: string): Promise<Response> {
    return this.request.delete(url);
  }
}
