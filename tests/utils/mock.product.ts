/**
 * Product Service Mock Utilities
 */
import type { Mock } from "vitest";

import type {
  CreateProductRequest,
  Product,
  SearchProductsQuery,
  SearchProductsResponse,
} from "../../src/types/product.types";
import { MOCK_PRODUCT_RESPONSE } from "./data";
import { createMock } from "./mock.factory";

export const mockProductService = {
  createProduct: createMock() as Mock<(data: CreateProductRequest) => Promise<Product>>,
  getProduct: createMock() as Mock<(id: string) => Promise<Product>>,
  searchProducts: createMock() as Mock<(options: SearchProductsQuery) => Promise<SearchProductsResponse>>,

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
