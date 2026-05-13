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
