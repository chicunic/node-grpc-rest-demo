import { Request, Response, Router } from 'express';

import { createProduct, getProduct, searchProducts } from '../services/product.service';
import {
  CreateProductRequest,
  GetProductParams,
  Product,
  SearchProductsQuery,
  SearchProductsResponse,
} from '../types/product.types';
import { ErrorResponse, handleRouteError } from '../utils/error.handler';

const router = Router();

// Get product by ID
router.get('/products/:id', async (req: Request<GetProductParams>, res: Response<Product | ErrorResponse>) => {
  try {
    const { id } = req.params;
    const result = await getProduct(id);
    res.status(200).json(result);
  } catch (error) {
    handleRouteError(error, res, 'GET /products/:id endpoint');
  }
});

// Create new product
router.post('/products', async (req: Request<CreateProductRequest>, res: Response<Product | ErrorResponse>) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    const product = await createProduct({
      name,
      description,
      price,
      quantity,
      category,
    });
    res.status(201).json(product);
  } catch (error) {
    handleRouteError(error, res, 'POST /products endpoint');
  }
});

// Search products
router.get(
  '/products',
  async (
    req: Request<unknown, unknown, unknown, SearchProductsQuery>,
    res: Response<SearchProductsResponse | ErrorResponse>
  ) => {
    try {
      const { query, category, minPrice, maxPrice, page, pageSize } = req.query;
      const result = await searchProducts({
        query,
        category,
        minPrice,
        maxPrice,
        page,
        pageSize,
      });
      res.json(result);
    } catch (error) {
      handleRouteError(error, res, 'GET /products endpoint');
    }
  }
);

export const productRoutes: Router = router;
