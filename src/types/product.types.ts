import { PaginationQuery, PaginationResponse } from './pagination.types';

// REST API interfaces
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductParams {
  id: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

export interface SearchProductsQuery extends PaginationQuery {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface SearchProductsResponse extends PaginationResponse {
  products: Product[];
}

// gRPC interfaces
export interface GrpcProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface GrpcProductResponse {
  product: GrpcProduct;
}

export interface GrpcSearchProductsResponse {
  products: GrpcProduct[];
  total_count: number;
  page: number;
  page_size: number;
}
