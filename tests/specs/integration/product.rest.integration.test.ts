/**
 * Product - REST API Integration Tests
 * Tests complete REST service using real server implementation with minimal mocking
 */
import { beforeAll, describe, expect, it } from '@jest/globals';
import express from 'express';

import { SEARCH_PRODUCTS, TEST_FAKE_UUID, TEST_PRODUCT } from '../../utils/data';
import { expectValidISOString, expectValidUUID, restAssert } from '../../utils/helpers';
import { RestTestHelper, createCompleteTestApp } from '../../utils/server.rest';

interface ProductData {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

interface ProductResponse extends ProductData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

describe('Product - REST Integration', () => {
  let app: express.Application;
  let helper: RestTestHelper;

  beforeAll(async () => {
    app = await createCompleteTestApp();
    helper = new RestTestHelper(app);
  });

  describe('CreateProduct - REST Integration', () => {
    it('should create a new product successfully', async () => {
      const productData = TEST_PRODUCT;
      const createResponse = await helper.post('/api/v1/products', productData);

      restAssert.expectSuccess(createResponse, 201);
      expect(createResponse.body.id).toBeDefined();
      expectValidUUID(createResponse.body.id);
      expect(createResponse.body.name).toBe(productData.name);
      expect(createResponse.body.description).toBe(productData.description);
      expect(createResponse.body.price).toBe(productData.price);
      expect(createResponse.body.quantity).toBe(productData.quantity);
      expect(createResponse.body.category).toBe(productData.category);
      expectValidISOString(createResponse.body.createdAt);
      expectValidISOString(createResponse.body.updatedAt);
    });
  });

  describe('GetProduct - REST Integration', () => {
    it('should get a product by ID successfully', async () => {
      // First create a product
      const productData = TEST_PRODUCT;
      const createResponse = await helper.post('/api/v1/products', productData);
      const productId = createResponse.body.id;

      // Then get the product
      const getResponse = await helper.get(`/api/v1/products/${productId}`);

      restAssert.expectSuccess(getResponse, 200);
      expect(getResponse.body.id).toBe(productId);
      expect(getResponse.body.name).toBe(productData.name);
      expect(getResponse.body.description).toBe(productData.description);
      expect(getResponse.body.price).toBe(productData.price);
      expect(getResponse.body.quantity).toBe(productData.quantity);
      expect(getResponse.body.category).toBe(productData.category);
    });

    it('should return 404 for non-existent product', async () => {
      const notFoundResponse = await helper.get(`/api/v1/products/${TEST_FAKE_UUID}`);

      restAssert.expectError(notFoundResponse, 404, 'Product not found');
    });
  });

  describe('SearchProducts - REST Integration', () => {
    beforeAll(async () => {
      // Create multiple products for search testing
      const products = SEARCH_PRODUCTS;

      for (const product of products) {
        await helper.post('/api/v1/products', product);
      }
    });

    it('should search products with default pagination', async () => {
      const response = await helper.get('/api/v1/products?page=1&pageSize=10');

      restAssert.expectSuccess(response, 200);
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.totalCount).toBeGreaterThanOrEqual(5);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
    });

    it('should support custom pagination', async () => {
      const page = 2;
      const pageSize = 2;
      const response = await helper.get(`/api/v1/products?page=${page}&pageSize=${pageSize}`);

      restAssert.expectSuccess(response, 200);
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.products.length).toBeLessThanOrEqual(pageSize);
      expect(response.body.page).toBe(page);
      expect(response.body.pageSize).toBe(pageSize);
    });

    it('should search products by query', async () => {
      const query = 'iPhone';
      const response = await helper.get(`/api/v1/products?query=${query}&page=1&pageSize=10`);

      restAssert.expectSuccess(response, 200);
      expect(response.body.products).toBeInstanceOf(Array);

      // Check if results contain 'iPhone'
      response.body.products.forEach((product: ProductResponse) => {
        const productString = JSON.stringify(product).toLowerCase();
        expect(productString).toContain(query.toLowerCase());
      });
    });

    it('should filter products by category', async () => {
      const category = 'Books';
      const response = await helper.get(`/api/v1/products?category=${category}&page=1&pageSize=10`);

      restAssert.expectSuccess(response, 200);
      expect(response.body.products).toBeInstanceOf(Array);

      // Check if all results are in Books category
      response.body.products.forEach((product: ProductResponse) => {
        expect(product.category).toBe(category);
      });
      expect(response.body.products.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter products by price range', async () => {
      const minPrice = 100;
      const maxPrice = 300;
      const response = await helper.get(
        `/api/v1/products?minPrice=${minPrice}&maxPrice=${maxPrice}&page=1&pageSize=10`
      );

      restAssert.expectSuccess(response, 200);
      expect(response.body.products).toBeInstanceOf(Array);

      // Check if all results are within price range
      response.body.products.forEach((product: ProductResponse) => {
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });
    });

    it('should combine multiple filters', async () => {
      const category = 'Electronics';
      const minPrice = 800;
      const response = await helper.get(
        `/api/v1/products?category=${category}&minPrice=${minPrice}&page=1&pageSize=10`
      );

      restAssert.expectSuccess(response, 200);
      expect(response.body.products).toBeInstanceOf(Array);

      // Check if all results match both filters
      response.body.products.forEach((product: ProductResponse) => {
        expect(product.category).toBe(category);
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
      });
    });

    it('should return empty array for no matches', async () => {
      const nonexistentQuery = 'NonExistentProductXYZ123';
      const response = await helper.get(`/api/v1/products?query=${nonexistentQuery}&page=1&pageSize=10`);

      restAssert.expectSuccess(response, 200);
      expect(response.body.products).toEqual([]);
      expect(response.body.totalCount).toBe(0);
    });
  });
});
