import app from "../../src/app.js";

describe("App-level routes", () => {
  it("GET / returns app info", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ name: "node-grpc-rest-demo", version: "1.0.0" });
  });

  it("GET /health returns ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("GET /openapi.json returns OpenAPI 3.1 spec", async () => {
    const res = await app.request("/openapi.json");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      openapi: string;
      info: { title: string };
      paths: Record<string, unknown>;
    };
    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("Node gRPC REST Demo");
    expect(body.paths).toHaveProperty("/api/v1/users");
    expect(body.paths).toHaveProperty("/api/v1/products");
  });

  it("GET /docs returns Swagger UI HTML", async () => {
    const res = await app.request("/docs");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("swagger");
  });

  it("GET /unknown returns 404 Problem Details", async () => {
    const res = await app.request("/unknown");
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("application/problem+json");
    const body = await res.json();
    expect(body).toEqual({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: "Endpoint not found",
    });
  });

  it("GET /api/v1/users/not-a-uuid returns 400 Problem Details", async () => {
    const res = await app.request("/api/v1/users/not-a-uuid");
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toContain("application/problem+json");
    const body = (await res.json()) as { title: string; status: number; errors?: unknown };
    expect(body.title).toBe("Bad Request");
    expect(body.status).toBe(400);
    expect(body.errors).toBeInstanceOf(Array);
  });
});
