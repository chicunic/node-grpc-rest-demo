import { vi } from "vitest";

import type {
  CreateProductRequest,
  Product,
  SearchProductsQuery,
  SearchProductsResponse,
} from "../../src/schemas/product.js";
import { MOCK_PRODUCT_RESPONSE } from "./data.js";

export const mockProductService = {
  createProduct: vi.fn<(data: CreateProductRequest) => Promise<Product>>(),
  getProduct: vi.fn<(id: string) => Promise<Product>>(),
  searchProducts: vi.fn<(options: SearchProductsQuery) => Promise<SearchProductsResponse>>(),

  setup(): void {
    this.createProduct.mockResolvedValue(MOCK_PRODUCT_RESPONSE);
    this.getProduct.mockResolvedValue(MOCK_PRODUCT_RESPONSE);
    this.searchProducts.mockResolvedValue({
      products: [MOCK_PRODUCT_RESPONSE],
      totalCount: 1,
      page: 1,
      pageSize: 10,
    });
  },

  reset(): void {
    this.createProduct.mockReset();
    this.getProduct.mockReset();
    this.searchProducts.mockReset();
  },
};
