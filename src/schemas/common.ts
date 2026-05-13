import type { Env } from "hono";
import type { Hook } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";

export const EXAMPLE_UUID = "550e8400-e29b-41d4-a716-446655440000";
export const EXAMPLE_EMAIL = "alice@example.com";
export const EXAMPLE_USERNAME = "alice";
export const EXAMPLE_FULL_NAME = "Alice Smith";
export const EXAMPLE_PRODUCT_NAME = "iPhone 15 Pro";
export const EXAMPLE_PRODUCT_DESCRIPTION = "Latest Apple smartphone";
export const EXAMPLE_PRODUCT_CATEGORY = "Electronics";

export const ProblemDetailsSchema = z
  .object({
    type: z.string().meta({
      description: "URI reference identifying the problem type",
      example: "about:blank",
    }),
    title: z.string().meta({ description: "Short, human-readable summary", example: "Not Found" }),
    status: z.number().int().meta({ description: "HTTP status code", example: 404 }),
    detail: z.string().optional().meta({ description: "Human-readable explanation", example: "User not found" }),
    instance: z.string().optional().meta({ description: "URI reference identifying the specific occurrence" }),
    errors: z
      .array(
        z.object({
          path: z.string().meta({ example: "email" }),
          message: z.string().meta({ example: "Invalid email" }),
        }),
      )
      .optional()
      .meta({ description: "Field-level validation errors" }),
  })
  .meta({ id: "ProblemDetails" });

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;

export const PROBLEM_HEADERS = { "Content-Type": "application/problem+json" } as const;

export function problemDetails(status: number, title: string, detail?: string): ProblemDetails {
  return { type: "about:blank", title, status, ...(detail ? { detail } : {}) };
}

export const jsonError = (description: string) => ({
  content: { "application/problem+json": { schema: ProblemDetailsSchema } },
  description,
});

export const defaultHook =
  <E extends Env>(): Hook<unknown, E, string, unknown> =>
  (result, c) => {
    if (result.success) {
      return undefined;
    }
    const errors = result.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    const detail = errors[0]?.message ?? "Validation failed";
    return c.json({ ...problemDetails(400, "Bad Request", detail), errors }, 400, PROBLEM_HEADERS);
  };

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).meta({ description: "Page number", example: 1 }),
  pageSize: z.coerce.number().int().positive().max(100).default(10).meta({ description: "Items per page", example: 10 }),
});

export const PaginationResponseSchema = z.object({
  page: z.number().int().meta({ example: 1 }),
  pageSize: z.number().int().meta({ example: 10 }),
  totalCount: z.number().int().meta({ example: 0 }),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
