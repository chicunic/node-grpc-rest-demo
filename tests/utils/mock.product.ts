/**
 * Product Service Mock Utilities
 */
import type { jest } from '@jest/globals';

import type {
  CreateProductRequest,
  Product,
  SearchProductsQuery,
  SearchProductsResponse,
} from '../../src/types/product.types';
import { MOCK_PRODUCT_RESPONSE } from './data';
import { createJestMock, createModuleMock } from './mock.factory';

export const mockProductService = {
  createProduct: createJestMock() as jest.Mock<(data: CreateProductRequest) => Promise<Product>>,
  getProduct: createJestMock() as jest.Mock<(id: string) => Promise<Product>>,
  searchProducts: createJestMock() as jest.Mock<(options: SearchProductsQuery) => Promise<SearchProductsResponse>>,

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

export function enableProductServiceMock(): void {
  createModuleMock('../../src/services/product.service', {
    createProduct: mockProductService.createProduct,
    getProduct: mockProductService.getProduct,
    searchProducts: mockProductService.searchProducts,
  });
}
