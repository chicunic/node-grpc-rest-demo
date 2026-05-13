import { type Request, type Response, Router } from "express";

import { createProduct, getProduct, searchProducts } from "../services/product.service.js";
import type {
  CreateProductRequest,
  GetProductParams,
  Product,
  SearchProductsResponse,
} from "../types/product.types.js";
import { type ErrorResponse, handleRouteError } from "../utils/error.handler.js";

const router = Router();

router.get("/products/:id", async (req: Request<GetProductParams>, res: Response<Product | ErrorResponse>) => {
  try {
    const { id } = req.params;
    const result = await getProduct(id);
    res.status(200).json(result);
  } catch (error) {
    handleRouteError(error, res, "GET /products/:id endpoint");
  }
});

router.post(
  "/products",
  async (req: Request<unknown, unknown, CreateProductRequest>, res: Response<Product | ErrorResponse>) => {
    try {
      const product = await createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      handleRouteError(error, res, "POST /products endpoint");
    }
  },
);

router.get("/products", async (req: Request, res: Response<SearchProductsResponse | ErrorResponse>) => {
  try {
    const { query, category, minPrice, maxPrice, page, pageSize } = req.query;
    const result = await searchProducts({
      query: typeof query === "string" ? query : undefined,
      category: typeof category === "string" ? category : undefined,
      minPrice: typeof minPrice === "string" ? Number(minPrice) : undefined,
      maxPrice: typeof maxPrice === "string" ? Number(maxPrice) : undefined,
      page: Number(page),
      pageSize: Number(pageSize),
    });
    res.json(result);
  } catch (error) {
    handleRouteError(error, res, "GET /products endpoint");
  }
});

export const productRoutes: Router = router;
