import type * as grpc from '@grpc/grpc-js';

import { createProduct, getProduct, searchProducts } from '../../services/product.service';
import type {
  CreateProductRequest,
  GrpcProduct,
  GrpcProductResponse,
  GrpcSearchProductsResponse,
  Product,
} from '../../types/product.types';
import { handleGrpcError } from '../../utils/error.handler';
import {
  CreateProductRequestDto,
  GetProductRequestDto,
  SearchProductsRequestDto,
} from '../validators/product.validator';
import { createValidationError, validateRequest } from '../validators/validator.utils';

function toGrpcProduct(product: Product): GrpcProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    quantity: product.quantity,
    category: product.category,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  };
}

export const productServiceImplementation = {
  GetProduct: async (
    call: grpc.ServerUnaryCall<GetProductRequestDto, GrpcProductResponse>,
    callback: grpc.sendUnaryData<GrpcProductResponse>,
  ): Promise<void> => {
    try {
      const validation = await validateRequest(GetProductRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors!));
        return;
      }

      const result = await getProduct(call.request.id);
      callback(null, { product: toGrpcProduct(result) });
    } catch (error) {
      handleGrpcError(error, callback, 'GetProduct');
    }
  },

  CreateProduct: async (
    call: grpc.ServerUnaryCall<CreateProductRequest, GrpcProductResponse>,
    callback: grpc.sendUnaryData<GrpcProductResponse>,
  ): Promise<void> => {
    try {
      const validation = await validateRequest(CreateProductRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors!));
        return;
      }

      const { name, description, price, quantity, category } = call.request;
      const result = await createProduct({ name, description, price, quantity, category });
      callback(null, { product: toGrpcProduct(result) });
    } catch (error) {
      handleGrpcError(error, callback, 'CreateProduct');
    }
  },

  SearchProducts: async (
    call: grpc.ServerUnaryCall<SearchProductsRequestDto, GrpcSearchProductsResponse>,
    callback: grpc.sendUnaryData<GrpcSearchProductsResponse>,
  ): Promise<void> => {
    try {
      const validation = await validateRequest(SearchProductsRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors!));
        return;
      }

      const { query, category, min_price, max_price, page, page_size } = call.request;
      const result = await searchProducts({
        query,
        category,
        minPrice: min_price,
        maxPrice: max_price,
        page,
        pageSize: page_size,
      });

      callback(null, {
        products: result.products.map(toGrpcProduct),
        total_count: result.totalCount,
        page: page ?? 1,
        page_size: page_size ?? 10,
      });
    } catch (error) {
      handleGrpcError(error, callback, 'SearchProducts');
    }
  },
};
