import app from "../../src/app.js";
import type { RestResponse } from "./helpers.js";

export type HonoApp = typeof app;

export async function createCompleteTestApp(): Promise<HonoApp> {
  return app;
}

async function parseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("json")) {
    return res.json();
  }
  const text = await res.text();
  return text.length ? text : undefined;
}

async function toResponse<T>(res: Response): Promise<RestResponse<T>> {
  return {
    status: res.status,
    body: (await parseBody(res)) as T,
    headers: res.headers,
  };
}

export class RestTestHelper {
  constructor(private app: HonoApp) {}

  async get<T = unknown>(url: string): Promise<RestResponse<T>> {
    return toResponse<T>(await this.app.request(url, { method: "GET" }));
  }

  async post<T = unknown>(url: string, data: unknown): Promise<RestResponse<T>> {
    return toResponse<T>(
      await this.app.request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );
  }

  async put<T = unknown>(url: string, data: unknown): Promise<RestResponse<T>> {
    return toResponse<T>(
      await this.app.request(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );
  }

  async delete<T = unknown>(url: string): Promise<RestResponse<T>> {
    return toResponse<T>(await this.app.request(url, { method: "DELETE" }));
  }
}
