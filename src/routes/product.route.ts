import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import {
  CreateProductSchema,
  ProductIdParamSchema,
  ProductSchema,
  SearchProductsQuerySchema,
  SearchProductsResponseSchema,
} from "../schemas/product.js";
import { createProduct, getProduct, searchProducts } from "../services/product.service.js";
import { defaultHook, jsonError } from "../schemas/common.js";

const app = new OpenAPIHono({ defaultHook: defaultHook() });

app.openapi(
  createRoute({
    method: "get",
    path: "/products/{id}",
    summary: "Get a product by ID",
    tags: ["Products"],
    request: { params: ProductIdParamSchema },
    responses: {
      200: { content: { "application/json": { schema: ProductSchema } }, description: "Product found" },
      400: jsonError("Validation error"),
      404: jsonError("Product not found"),
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const product = await getProduct(id);
    return c.json(product, 200);
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/products",
    summary: "Create a new product",
    tags: ["Products"],
    request: {
      body: {
        content: { "application/json": { schema: CreateProductSchema } },
        description: "Product data to create",
        required: true,
      },
    },
    responses: {
      201: { content: { "application/json": { schema: ProductSchema } }, description: "Product created" },
      400: jsonError("Validation error"),
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const product = await createProduct(body);
    return c.json(product, 201);
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/products",
    summary: "Search products",
    tags: ["Products"],
    request: { query: SearchProductsQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: SearchProductsResponseSchema } },
        description: "Paginated list of products",
      },
      400: jsonError("Validation error"),
    },
  }),
  async (c) => {
    const query = c.req.valid("query");
    const result = await searchProducts(query);
    return c.json(result, 200);
  },
);

export const productRoutes = app;
