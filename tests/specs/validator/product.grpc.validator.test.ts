/**
 * Product Service - gRPC Parameter Validator Tests
 * Tests parameter validation using real server implementation with service layer mocking
 */
// Enable service mocks BEFORE any other imports
import * as grpc from '@grpc/grpc-js';

import {
  CreateProductRequestDto,
  GetProductRequestDto,
  SearchProductsRequestDto,
} from '../../../src/grpc/validators/product.validator';
import { GrpcProductResponse, GrpcSearchProductsResponse } from '../../../src/types/product.types';
import { TEST_FAKE_UUID } from '../../utils/data';
import { enableProductServiceMock, mockProductService } from '../../utils/mock.index';
import {
  type GrpcTestClient,
  createGrpcTestClient,
  promisifyGrpcCall,
  shutdownGrpcTestClient,
} from '../../utils/server.grpc';

enableProductServiceMock();

describe('Product Service - gRPC Parameter Validator', () => {
  let testClient: GrpcTestClient;

  beforeAll(async () => {
    testClient = await createGrpcTestClient();
  });

  beforeEach(() => {
    mockProductService.reset();
    mockProductService.setup();
  });

  afterAll(async () => {
    await shutdownGrpcTestClient(testClient);
  });

  describe('CreateProduct - Parameter Validator', () => {
    it('should reject request with missing name', async () => {
      const invalidRequest = {
        // name missing
        description: 'Test product description',
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      await expect(
        promisifyGrpcCall<object, GrpcProductResponse>(testClient.productClient, 'CreateProduct', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('name is required'),
      });
    });

    it('should reject request with empty name', async () => {
      const invalidRequest = {
        name: '',
        description: 'Test product description',
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      await expect(
        promisifyGrpcCall<CreateProductRequestDto, GrpcProductResponse>(
          testClient.productClient,
          'CreateProduct',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('name is required'),
      });
    });

    it('should reject request with name too long', async () => {
      const invalidRequest = {
        name: 'a'.repeat(101), // Invalid: more than 100 characters
        description: 'Test product description',
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      await expect(
        promisifyGrpcCall<CreateProductRequestDto, GrpcProductResponse>(
          testClient.productClient,
          'CreateProduct',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('name must be at most 100 characters'),
      });
    });

    it('should reject request with missing description', async () => {
      const invalidRequest = {
        name: 'Test Product',
        // description missing
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      await expect(
        promisifyGrpcCall<object, GrpcProductResponse>(testClient.productClient, 'CreateProduct', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('description is required'),
      });
    });

    it('should reject request with description too long', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'a'.repeat(501), // Invalid: more than 500 characters
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      await expect(
        promisifyGrpcCall<CreateProductRequestDto, GrpcProductResponse>(
          testClient.productClient,
          'CreateProduct',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('description must be at most 500 characters'),
      });
    });

    it('should reject request with negative price', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: -1, // Invalid: negative price
        quantity: 50,
        category: 'Electronics',
      };

      await expect(
        promisifyGrpcCall<CreateProductRequestDto, GrpcProductResponse>(
          testClient.productClient,
          'CreateProduct',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('price cannot be negative'),
      });
    });

    it('should reject request with price exceeding maximum', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100000000, // Invalid: exceeds 99,999,999
        quantity: 50,
        category: 'Electronics',
      };

      await expect(
        promisifyGrpcCall<CreateProductRequestDto, GrpcProductResponse>(
          testClient.productClient,
          'CreateProduct',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('price cannot exceed 99,999,999'),
      });
    });

    it('should reject request with non-integer price', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99, // Invalid: not an integer
        quantity: 50,
        category: 'Electronics',
      };

      await expect(
        promisifyGrpcCall<CreateProductRequestDto, GrpcProductResponse>(
          testClient.productClient,
          'CreateProduct',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('price must be an integer'),
      });
    });

    it('should reject request with negative quantity', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        quantity: -1, // Invalid: negative quantity
        category: 'Electronics',
      };

      await expect(
        promisifyGrpcCall<CreateProductRequestDto, GrpcProductResponse>(
          testClient.productClient,
          'CreateProduct',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('quantity cannot be negative'),
      });
    });

    it('should reject request with quantity exceeding maximum', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        quantity: 100000, // Invalid: exceeds 99,999
        category: 'Electronics',
      };

      await expect(
        promisifyGrpcCall<CreateProductRequestDto, GrpcProductResponse>(
          testClient.productClient,
          'CreateProduct',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('quantity cannot exceed 99,999'),
      });
    });

    it('should reject request with missing category', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        quantity: 50,
        // category missing
      };

      await expect(
        promisifyGrpcCall<object, GrpcProductResponse>(testClient.productClient, 'CreateProduct', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('category is required'),
      });
    });

    it('should reject request with category too long', async () => {
      const invalidRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        quantity: 50,
        category: 'a'.repeat(51), // Invalid: more than 50 characters
      };

      await expect(
        promisifyGrpcCall<CreateProductRequestDto, GrpcProductResponse>(
          testClient.productClient,
          'CreateProduct',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('category must be at most 50 characters'),
      });
    });

    it('should accept valid CreateProduct request', async () => {
      const validRequest = {
        name: 'Test Product',
        description: 'Test product description',
        price: 100,
        quantity: 50,
        category: 'Electronics',
      };

      const response = await promisifyGrpcCall<CreateProductRequestDto, GrpcProductResponse>(
        testClient.productClient,
        'CreateProduct',
        validRequest
      );

      expect(response).toBeDefined();
    });
  });

  describe('GetProduct - Parameter Validator', () => {
    it('should reject request with missing id', async () => {
      const invalidRequest = {
        // id missing
      };

      await expect(
        promisifyGrpcCall<object, GrpcProductResponse>(testClient.productClient, 'GetProduct', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('id is required'),
      });
    });

    it('should reject request with empty id', async () => {
      const invalidRequest = {
        id: '',
      };

      await expect(
        promisifyGrpcCall<GetProductRequestDto, GrpcProductResponse>(
          testClient.productClient,
          'GetProduct',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('id is required'),
      });
    });

    it('should reject request with invalid UUID format', async () => {
      const invalidRequest = {
        id: 'invalid-uuid-format',
      };

      await expect(
        promisifyGrpcCall<GetProductRequestDto, GrpcProductResponse>(
          testClient.productClient,
          'GetProduct',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('id must be a valid UUID v4'),
      });
    });

    it('should reject request with non-UUID string', async () => {
      const invalidRequest = {
        id: 'not-a-uuid',
      };

      await expect(
        promisifyGrpcCall<GetProductRequestDto, GrpcProductResponse>(
          testClient.productClient,
          'GetProduct',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('id must be a valid UUID v4'),
      });
    });

    it('should accept valid GetProduct request', async () => {
      expect.assertions(0);
      const validRequest = {
        id: TEST_FAKE_UUID,
      };

      await promisifyGrpcCall<GetProductRequestDto, GrpcProductResponse>(
        testClient.productClient,
        'GetProduct',
        validRequest
      );
    });
  });

  describe('SearchProducts - Parameter Validator', () => {
    it('should reject request with query too long', async () => {
      const invalidRequest = {
        query: 'a'.repeat(101), // Invalid: more than 100 characters
        page: 1,
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('query must be at most 100 characters'),
      });
    });

    it('should reject request with category too long', async () => {
      const invalidRequest = {
        category: 'a'.repeat(51), // Invalid: more than 50 characters
        page: 1,
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('category must be at most 50 characters'),
      });
    });

    it('should reject request with negative min_price', async () => {
      const invalidRequest = {
        min_price: -1, // Invalid: negative price
        page: 1,
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('min_price cannot be negative'),
      });
    });

    it('should reject request with invalid min_price type', async () => {
      const invalidRequest = {
        min_price: 'not-a-number' as unknown as number,
      };

      await expect(
        promisifyGrpcCall<object, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('min_price must be an integer'),
      });
    });

    it('should reject request with negative max_price', async () => {
      const invalidRequest = {
        max_price: -1, // Invalid: negative price
        page: 1,
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('max_price cannot be negative'),
      });
    });

    it('should reject request with invalid max_price type', async () => {
      const invalidRequest = {
        max_price: 'not-a-number' as unknown as number,
      };

      await expect(
        promisifyGrpcCall<object, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('max_price must be an integer'),
      });
    });

    it('should reject request with page less than 1', async () => {
      const invalidRequest = {
        page: 0, // Invalid: must be at least 1
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('page must be at least 1'),
      });
    });

    it('should reject request with page greater than 10000', async () => {
      const invalidRequest = {
        page: 10001, // Invalid: must be at most 10000
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('page must be at most 10000'),
      });
    });

    it('should reject request with pageSize less than 1', async () => {
      const invalidRequest = {
        page: 1,
        page_size: 0, // Invalid: must be at least 1
      };

      await expect(
        promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('page_size must be at least 1'),
      });
    });

    it('should reject request with pageSize greater than 100', async () => {
      const invalidRequest = {
        page: 1,
        page_size: 101, // Invalid: must be at most 100
      };

      await expect(
        promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('page_size must be at most 100'),
      });
    });

    it('should reject request with negative page', async () => {
      const invalidRequest = {
        page: -1, // Invalid: must be at least 1
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('page must be at least 1'),
      });
    });

    it('should reject request with negative pageSize', async () => {
      const invalidRequest = {
        page: 1,
        page_size: -1, // Invalid: must be at least 1
      };

      await expect(
        promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('page_size must be at least 1'),
      });
    });

    it('should reject request with decimal min_price', async () => {
      const invalidRequest = {
        min_price: 10.5, // Invalid: must be integer
        page: 1,
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('min_price must be an integer'),
      });
    });

    it('should reject request with decimal max_price', async () => {
      const invalidRequest = {
        max_price: 99.99, // Invalid: must be integer
        page: 1,
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
          testClient.productClient,
          'SearchProducts',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('max_price must be an integer'),
      });
    });

    it('should accept valid SearchProducts request with all parameters', async () => {
      const validRequest = {
        query: 'test',
        category: 'Electronics',
        min_price: 10,
        max_price: 100,
        page: 1,
        page_size: 10,
      };

      const response = await promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
        testClient.productClient,
        'SearchProducts',
        validRequest
      );

      expect(response).toBeDefined();
    });

    it('should accept valid SearchProducts request with minimal parameters', async () => {
      const validRequest = {
        page: 1,
        page_size: 10,
      };

      const response = await promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
        testClient.productClient,
        'SearchProducts',
        validRequest
      );

      expect(response).toBeDefined();
    });

    it('should accept valid SearchProducts request with some parameters', async () => {
      const validRequest = {
        query: 'smartphone',
        category: 'Electronics',
        page: 2,
        page_size: 5,
      };

      const response = await promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
        testClient.productClient,
        'SearchProducts',
        validRequest
      );

      expect(response).toBeDefined();
    });

    it('should accept valid SearchProducts request with price range', async () => {
      const validRequest = {
        min_price: 50,
        max_price: 200,
        page: 1,
        page_size: 10,
      };

      const response = await promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
        testClient.productClient,
        'SearchProducts',
        validRequest
      );

      expect(response).toBeDefined();
    });

    it('should accept valid SearchProducts request with zero minPrice', async () => {
      const validRequest = {
        min_price: 0,
        max_price: 100,
        page: 1,
        page_size: 10,
      };

      const response = await promisifyGrpcCall<SearchProductsRequestDto, GrpcSearchProductsResponse>(
        testClient.productClient,
        'SearchProducts',
        validRequest
      );

      expect(response).toBeDefined();
    });
  });
});
