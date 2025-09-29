/**
 * Product Service Mock Utilities
 * Product service specific mocks and setup functions
 */
import { jest } from '@jest/globals';

import {
  CreateProductRequest,
  Product,
  SearchProductsQuery,
  SearchProductsResponse,
} from '../../src/types/product.types';
import { MOCK_PRODUCT_RESPONSE } from './data';
import { createJestMock, createSimpleModuleMock } from './mock.factory';

// Mock product service with all API functions
export const mockProductService = {
  createProduct: createJestMock() as jest.Mock<(data: CreateProductRequest) => Promise<Product>>,
  getProduct: createJestMock() as jest.Mock<(id: string) => Promise<Product>>,
  searchProducts: createJestMock() as jest.Mock<(options: SearchProductsQuery) => Promise<SearchProductsResponse>>,
  setup: (): void => {
    // Setup mock responses with test data
    mockProductService.createProduct.mockResolvedValue(MOCK_PRODUCT_RESPONSE);
    mockProductService.getProduct.mockResolvedValue(MOCK_PRODUCT_RESPONSE);
    mockProductService.searchProducts.mockResolvedValue({
      products: [MOCK_PRODUCT_RESPONSE],
      totalCount: 1,
      page: 1,
      pageSize: 10,
    });
  },
  reset: (): void => {
    mockProductService.createProduct.mockReset();
    mockProductService.getProduct.mockReset();
    mockProductService.searchProducts.mockReset();
  },
};

// Enable product service mock when needed
export function enableProductServiceMock(): void {
  createSimpleModuleMock('../../src/services/product.service', {
    createProduct: mockProductService.createProduct,
    getProduct: mockProductService.getProduct,
    searchProducts: mockProductService.searchProducts,
  });
}
