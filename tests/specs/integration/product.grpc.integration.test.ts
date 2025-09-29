/**
 * Product - gRPC Integration Tests
 * Tests complete gRPC service using real server implementation with minimal mocking
 */
/* eslint-disable jest/no-conditional-expect */
import * as grpc from '@grpc/grpc-js';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { GrpcProductResponse, GrpcSearchProductsResponse } from '../../../src/types/product.types';
import { SEARCH_PRODUCTS, TEST_FAKE_UUID, TEST_PAGINATION, TEST_PRODUCT } from '../../utils/data';
import { expectValidISOString, expectValidUUID } from '../../utils/helpers';
import {
  GrpcTestClient,
  createGrpcTestClient,
  promisifyGrpcCall,
  shutdownGrpcTestClient,
} from '../../utils/server.grpc';

describe('Product - gRPC Integration', () => {
  let grpcClient: GrpcTestClient;

  beforeAll(async () => {
    grpcClient = await createGrpcTestClient();
  });

  afterAll(async () => {
    if (grpcClient) {
      await shutdownGrpcTestClient(grpcClient);
    }
  });

  describe('CreateProduct - gRPC Integration', () => {
    it('should create a new product successfully', async () => {
      const createRequest = TEST_PRODUCT;

      const createResponse = await promisifyGrpcCall<typeof createRequest, GrpcProductResponse>(
        grpcClient.productClient,
        'CreateProduct',
        createRequest
      );

      expect(createResponse).toBeDefined();
      expect(createResponse.product).toBeDefined();
      expectValidUUID(createResponse.product.id);
      expect(createResponse.product.name).toBe(createRequest.name);
      expect(createResponse.product.description).toBe(createRequest.description);
      expect(createResponse.product.price).toBe(createRequest.price);
      expect(createResponse.product.quantity).toBe(createRequest.quantity);
      expect(createResponse.product.category).toBe(createRequest.category);
      expectValidISOString(createResponse.product.created_at);
      expectValidISOString(createResponse.product.updated_at);
    });
  });

  describe('GetProduct - gRPC Integration', () => {
    it('should get a product by ID successfully', async () => {
      // First create a product
      const createRequest = TEST_PRODUCT;
      const createResponse = await promisifyGrpcCall<typeof createRequest, GrpcProductResponse>(
        grpcClient.productClient,
        'CreateProduct',
        createRequest
      );
      const productId = createResponse.product.id;

      // Then get the product
      const getRequest = { id: productId };
      const getResponse = await promisifyGrpcCall<typeof getRequest, GrpcProductResponse>(
        grpcClient.productClient,
        'GetProduct',
        getRequest
      );

      expect(getResponse).toBeDefined();
      expect(getResponse.product).toBeDefined();
      expect(getResponse.product.id).toBe(productId);
      expect(getResponse.product.name).toBe(createRequest.name);
      expect(getResponse.product.description).toBe(createRequest.description);
      expect(getResponse.product.price).toBe(createRequest.price);
      expect(getResponse.product.quantity).toBe(createRequest.quantity);
      expect(getResponse.product.category).toBe(createRequest.category);
    });

    it('should return NOT_FOUND for non-existent product', async () => {
      const notFoundRequest = { id: TEST_FAKE_UUID };

      try {
        await promisifyGrpcCall(grpcClient.productClient, 'GetProduct', notFoundRequest);
        throw new Error('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const grpcError = error as grpc.ServiceError;
        expect(grpcError.code).toBe(grpc.status.NOT_FOUND);
        expect(grpcError.details).toContain('Product not found');
      }
    });
  });

  describe('SearchProducts - gRPC Integration', () => {
    beforeAll(async () => {
      // Create multiple products for search testing
      const products = SEARCH_PRODUCTS;

      for (const product of products) {
        await promisifyGrpcCall(grpcClient.productClient, 'CreateProduct', product);
      }
    });

    it('should search products with default pagination', async () => {
      const request = {
        page: TEST_PAGINATION.DEFAULT_PAGE,
        page_size: TEST_PAGINATION.DEFAULT_PAGE_SIZE,
      };

      const response = await promisifyGrpcCall<typeof request, GrpcSearchProductsResponse>(
        grpcClient.productClient,
        'SearchProducts',
        request
      );

      expect(response).toBeDefined();
      expect(response.products).toBeInstanceOf(Array);
      expect(response.total_count).toBeGreaterThanOrEqual(5);
      expect(response.page).toBe(TEST_PAGINATION.DEFAULT_PAGE);
      expect(response.page_size).toBe(TEST_PAGINATION.DEFAULT_PAGE_SIZE);
    });

    it('should support custom pagination', async () => {
      const page = 2;
      const pageSize = 2;
      const request = {
        page,
        page_size: pageSize,
      };

      const response = await promisifyGrpcCall<typeof request, GrpcSearchProductsResponse>(
        grpcClient.productClient,
        'SearchProducts',
        request
      );

      expect(response.products).toBeInstanceOf(Array);
      expect(response.products.length).toBeLessThanOrEqual(pageSize);
      expect(response.page).toBe(page);
      expect(response.page_size).toBe(pageSize);
    });

    it('should search products by query', async () => {
      const query = 'iPhone';
      const request = {
        query,
        page: TEST_PAGINATION.DEFAULT_PAGE,
        page_size: TEST_PAGINATION.DEFAULT_PAGE_SIZE,
      };

      const response = await promisifyGrpcCall<typeof request, GrpcSearchProductsResponse>(
        grpcClient.productClient,
        'SearchProducts',
        request
      );

      expect(response.products).toBeInstanceOf(Array);

      // Check if results contain 'iPhone'
      response.products.forEach(product => {
        const productString = JSON.stringify(product).toLowerCase();
        expect(productString).toContain(query.toLowerCase());
      });
    });

    it('should filter products by category', async () => {
      const category = 'Books';
      const request = {
        category,
        page: TEST_PAGINATION.DEFAULT_PAGE,
        page_size: TEST_PAGINATION.DEFAULT_PAGE_SIZE,
      };

      const response = await promisifyGrpcCall<typeof request, GrpcSearchProductsResponse>(
        grpcClient.productClient,
        'SearchProducts',
        request
      );

      expect(response.products).toBeInstanceOf(Array);

      // Check if all results are in Books category
      response.products.forEach(product => {
        expect(product.category).toBe(category);
      });
      expect(response.products.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter products by price range', async () => {
      const minPrice = 100;
      const maxPrice = 300;
      const request = {
        min_price: minPrice,
        max_price: maxPrice,
        page: TEST_PAGINATION.DEFAULT_PAGE,
        page_size: TEST_PAGINATION.DEFAULT_PAGE_SIZE,
      };

      const response = await promisifyGrpcCall<typeof request, GrpcSearchProductsResponse>(
        grpcClient.productClient,
        'SearchProducts',
        request
      );

      expect(response.products).toBeInstanceOf(Array);

      // Check if all results are within price range
      response.products.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });
    });

    it('should combine multiple filters', async () => {
      const category = 'Electronics';
      const minPrice = 800;
      const request = {
        category,
        min_price: minPrice,
        page: TEST_PAGINATION.DEFAULT_PAGE,
        page_size: TEST_PAGINATION.DEFAULT_PAGE_SIZE,
      };

      const response = await promisifyGrpcCall<typeof request, GrpcSearchProductsResponse>(
        grpcClient.productClient,
        'SearchProducts',
        request
      );

      expect(response.products).toBeInstanceOf(Array);

      // Check if all results match both filters
      response.products.forEach(product => {
        expect(product.category).toBe(category);
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
      });
    });

    it('should return empty array for no matches', async () => {
      const nonexistentQuery = 'NonExistentProductXYZ123';
      const request = {
        query: nonexistentQuery,
        page: TEST_PAGINATION.DEFAULT_PAGE,
        page_size: TEST_PAGINATION.DEFAULT_PAGE_SIZE,
      };

      const response = await promisifyGrpcCall<typeof request, GrpcSearchProductsResponse>(
        grpcClient.productClient,
        'SearchProducts',
        request
      );

      expect(response.products).toEqual([]);
      expect(response.total_count).toBe(0);
    });
  });
});
