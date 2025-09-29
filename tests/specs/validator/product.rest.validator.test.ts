/**
 * Product Service - REST Parameter Validator Tests
 * Tests parameter validation using real server implementation with service layer mocking
 */
// Enable service mocks BEFORE any other imports
import { beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import express from 'express';

import { TEST_FAKE_UUID } from '../../utils/data';
import { enableProductServiceMock, mockProductService } from '../../utils/mock.index';
import { RestTestHelper, createCompleteTestApp } from '../../utils/server.rest';

enableProductServiceMock();

describe('Product Service - REST Parameter Validator', () => {
  let app: express.Application;
  let helper: RestTestHelper;

  beforeAll(async () => {
    app = await createCompleteTestApp();
    helper = new RestTestHelper(app);
  });

  beforeEach(() => {
    mockProductService.reset();
    mockProductService.setup();
  });

  describe('POST /api/v1/products - Parameter Validator', () => {
    it('should reject request with missing name', async () => {
      const invalidRequest = {
        // name missing
        description: 'Test product description',
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("required property 'name'");
    });

    it('should reject request with empty name', async () => {
      const invalidRequest = {
        name: '',
        description: 'Test product description',
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('name');
    });

    it('should reject request with name too long', async () => {
      const invalidRequest = {
        name: 'a'.repeat(101), // Invalid: more than 100 characters
        description: 'Test product description',
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('name');
    });

    it('should reject request with non-string name', async () => {
      const invalidRequest = {
        name: 123,
        description: 'Test product description',
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('name');
      expect(response.body.error).toContain('string');
    });

    it('should reject request with missing description', async () => {
      const invalidRequest = {
        name: 'Test Product',
        // description missing
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("required property 'description'");
    });

    it('should reject request with description too long', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'a'.repeat(501), // Invalid: more than 500 characters
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('description');
    });

    it('should reject request with non-string description', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 123,
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('description');
      expect(response.body.error).toContain('string');
    });

    it('should reject request with missing price', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        // price missing
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("required property 'price'");
    });

    it('should reject request with negative price', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: -1, // Invalid: negative price
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('price');
    });

    it('should reject request with price exceeding maximum', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100000000, // Invalid: exceeds 99,999,999
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('price');
    });

    it('should reject request with non-number price', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 'not-a-number',
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('price');
      expect(response.body.error).toContain('integer');
    });

    it('should reject request with missing quantity', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        // quantity missing
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("required property 'quantity'");
    });

    it('should reject request with negative quantity', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        quantity: -1, // Invalid: negative quantity
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('quantity');
    });

    it('should reject request with quantity exceeding maximum', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        quantity: 100000, // Invalid: exceeds 99,999
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('quantity');
    });

    it('should reject request with non-integer quantity', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        quantity: 50.5, // Invalid: not an integer
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('quantity');
      expect(response.body.error).toContain('integer');
    });

    it('should reject request with missing category', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        quantity: 50,
        // category missing
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("required property 'category'");
    });

    it('should reject request with category too long', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        quantity: 50,
        category: 'a'.repeat(51), // Invalid: more than 50 characters
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('category');
    });

    it('should reject request with non-string category', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        quantity: 50,
        category: 123,
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('category');
      expect(response.body.error).toContain('string');
    });

    it('should accept valid CreateProduct request', async () => {
      const validRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', validRequest);

      expect(response.status).toBe(201);
    });

    it('should reject request with non-integer price', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99, // Invalid: must be integer
        quantity: 50,
        category: 'Electronics',
      };

      const response = await helper.post('/api/v1/products', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('price');
      expect(response.body.error).toContain('integer');
    });
  });

  describe('GET /api/v1/products/:id - Parameter Validator', () => {
    it('should reject request with missing id', async () => {
      const response = await helper.get('/api/v1/products/');

      expect(response.status).toBe(400); // Express returns 400 for missing required pagination parameters
    });

    it('should reject request with empty id', async () => {
      const response = await helper.get('/api/v1/products/');

      expect(response.status).toBe(400); // Express returns 400 for missing required pagination parameters
    });

    it('should reject request with invalid UUID format', async () => {
      const response = await helper.get('/api/v1/products/invalid-uuid-format');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('id');
    });

    it('should reject request with non-UUID string', async () => {
      const response = await helper.get('/api/v1/products/not-a-uuid');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('id');
    });

    it('should accept valid GetProduct request', async () => {
      const response = await helper.get(`/api/v1/products/${TEST_FAKE_UUID}`);

      // Should pass validation and call service (will return 200 with mock data or 404)
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/v1/products - Parameter Validator', () => {
    it('should reject request with query too long', async () => {
      const longQuery = 'a'.repeat(101);
      const response = await helper.get(`/api/v1/products?query=${longQuery}&page=1&pageSize=10`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('query');
    });

    it('should reject request with category too long', async () => {
      const longCategory = 'a'.repeat(51);
      const response = await helper.get(`/api/v1/products?category=${longCategory}&page=1&pageSize=10`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('category');
    });

    it('should reject request with negative minPrice', async () => {
      const response = await helper.get('/api/v1/products?minPrice=-1&page=1&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('minPrice');
    });

    it('should reject request with negative maxPrice', async () => {
      const response = await helper.get('/api/v1/products?maxPrice=-1&page=1&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('maxPrice');
    });

    it('should reject request with invalid minPrice type', async () => {
      const response = await helper.get('/api/v1/products?minPrice=not-a-number&page=1&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('minPrice');
    });

    it('should reject request with invalid maxPrice type', async () => {
      const response = await helper.get('/api/v1/products?maxPrice=not-a-number&page=1&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('maxPrice');
    });

    it('should reject request with invalid page type', async () => {
      const response = await helper.get('/api/v1/products?page=not-a-number&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('page');
    });

    it('should reject request with page less than 1', async () => {
      const response = await helper.get('/api/v1/products?page=0&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('page');
    });

    it('should reject request with page greater than 10000', async () => {
      const response = await helper.get('/api/v1/products?page=10001&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('page');
    });

    it('should reject request with invalid pageSize type', async () => {
      const response = await helper.get('/api/v1/products?pageSize=not-a-number&page=1');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pageSize');
    });

    it('should reject request with pageSize less than 1', async () => {
      const response = await helper.get('/api/v1/products?pageSize=0&page=1');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pageSize');
    });

    it('should reject request with pageSize greater than 100', async () => {
      const response = await helper.get('/api/v1/products?pageSize=101&page=1');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pageSize');
    });

    it('should reject request with negative page', async () => {
      const response = await helper.get('/api/v1/products?page=-1&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('page');
    });

    it('should reject request with negative pageSize', async () => {
      const response = await helper.get('/api/v1/products?pageSize=-1&page=1');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pageSize');
    });

    it('should reject request with decimal page', async () => {
      const response = await helper.get('/api/v1/products?page=1.5&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('page');
    });

    it('should reject request with decimal pageSize', async () => {
      const response = await helper.get('/api/v1/products?pageSize=10.5&page=1');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pageSize');
    });

    it('should accept valid SearchProducts request with all parameters', async () => {
      const response = await helper.get(
        '/api/v1/products?query=test&category=Electronics&minPrice=10&maxPrice=100&page=1&pageSize=10'
      );

      expect(response.status).toBe(200);
    });

    it('should accept valid SearchProducts request with minimal parameters', async () => {
      const response = await helper.get('/api/v1/products?page=1&pageSize=10');

      expect(response.status).toBe(200);
    });

    it('should accept valid SearchProducts request with some parameters', async () => {
      const response = await helper.get('/api/v1/products?query=smartphone&category=Electronics&page=2&pageSize=5');

      expect(response.status).toBe(200);
    });

    it('should accept valid SearchProducts request with price range', async () => {
      const response = await helper.get('/api/v1/products?minPrice=50&maxPrice=200&page=1&pageSize=10');

      expect(response.status).toBe(200);
    });

    it('should reject request with decimal minPrice', async () => {
      const response = await helper.get('/api/v1/products?minPrice=10.50&page=1&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('minPrice');
    });

    it('should reject request with decimal maxPrice', async () => {
      const response = await helper.get('/api/v1/products?maxPrice=99.99&page=1&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('maxPrice');
    });

    it('should accept valid SearchProducts request with zero minPrice', async () => {
      const response = await helper.get('/api/v1/products?minPrice=0&maxPrice=100&page=1&pageSize=10');

      expect(response.status).toBe(200);
    });
  });
});
