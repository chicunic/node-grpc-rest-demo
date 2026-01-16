/**
 * REST API test server utilities
 */

import express from 'express';
import request, { type Response } from 'supertest';

function createTestApp(): express.Application {
  const app = express();
  app.use(express.json());
  return app;
}

function addErrorHandling(app: express.Application): void {
  app.use(
    (
      err: Error & { status?: number; errors?: unknown },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (err.status && err.status < 500) {
        res.status(err.status).json({ error: err.message, details: err.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    },
  );
}

export async function createCompleteTestApp(): Promise<express.Application> {
  const app = createTestApp();

  const { productRoutes } = await import('../../src/routes/product.route');
  const { userRoutes } = await import('../../src/routes/user.route');

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1', productRoutes);
  app.use('/api/v1', userRoutes);

  addErrorHandling(app);
  return app;
}

export class RestTestHelper {
  constructor(private app: express.Application) {}

  get request(): ReturnType<typeof request> {
    return request(this.app);
  }

  async post<TResponse = unknown>(
    url: string,
    data: string | object | undefined,
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
