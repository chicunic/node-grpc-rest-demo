import { z } from "@hono/zod-openapi";
import {
  EXAMPLE_PRODUCT_CATEGORY,
  EXAMPLE_PRODUCT_DESCRIPTION,
  EXAMPLE_PRODUCT_NAME,
  EXAMPLE_UUID,
  PaginationQuerySchema,
  PaginationResponseSchema,
} from "./common.js";

export const ProductSchema = z
  .object({
    id: z.uuid().meta({ description: "Product ID (UUID)", example: EXAMPLE_UUID }),
    name: z.string().min(1).max(200).meta({ description: "Product name", example: EXAMPLE_PRODUCT_NAME }),
    description: z.string().min(1).max(2000).meta({ description: "Product description", example: EXAMPLE_PRODUCT_DESCRIPTION }),
    price: z.number().nonnegative().meta({ description: "Unit price", example: 1000 }),
    quantity: z.number().int().nonnegative().meta({ description: "Stock quantity", example: 25 }),
    category: z.string().min(1).max(100).meta({ description: "Product category", example: EXAMPLE_PRODUCT_CATEGORY }),
    createdAt: z.iso.datetime().meta({ description: "Creation timestamp (ISO 8601)" }),
    updatedAt: z.iso.datetime().meta({ description: "Last update timestamp (ISO 8601)" }),
  })
  .meta({ id: "Product" });

export const CreateProductSchema = ProductSchema.pick({
  name: true,
  description: true,
  price: true,
  quantity: true,
  category: true,
}).meta({ id: "CreateProductRequest" });

export const ProductIdParamSchema = z.object({
  id: z.uuid().meta({
    description: "Product ID (UUID)",
    param: { name: "id", in: "path" },
    example: EXAMPLE_UUID,
  }),
});

export const SearchProductsQuerySchema = PaginationQuerySchema.extend({
  query: z.string().optional().meta({ description: "Search keyword", example: "iPhone" }),
  category: z.string().optional().meta({ description: "Filter by category", example: "Electronics" }),
  minPrice: z.coerce.number().nonnegative().optional().meta({ description: "Minimum price (inclusive)" }),
  maxPrice: z.coerce.number().nonnegative().optional().meta({ description: "Maximum price (inclusive)" }),
});

export const SearchProductsResponseSchema = PaginationResponseSchema.extend({
  products: z.array(ProductSchema),
}).meta({ id: "SearchProductsResponse" });

export type Product = z.infer<typeof ProductSchema>;
export type CreateProductRequest = z.infer<typeof CreateProductSchema>;
export type SearchProductsQuery = z.infer<typeof SearchProductsQuerySchema>;
export type SearchProductsResponse = z.infer<typeof SearchProductsResponseSchema>;
