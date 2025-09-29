import { v4 as uuidv4 } from 'uuid';

import { CreateProductRequest, Product, SearchProductsQuery, SearchProductsResponse } from '../types/product.types';

// In-memory storage for products
const products = new Map<string, Product>();

export async function getProduct(id: string): Promise<Product> {
  const product = products.get(id);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
}

export async function createProduct(data: CreateProductRequest): Promise<Product> {
  const now = new Date().toISOString();
  const productId = uuidv4();
  const product: Product = {
    id: productId,
    name: data.name,
    description: data.description,
    price: data.price,
    quantity: data.quantity,
    category: data.category,
    createdAt: now,
    updatedAt: now,
  };

  products.set(product.id, product);
  return product;
}

export async function searchProducts(options: SearchProductsQuery): Promise<SearchProductsResponse> {
  const page = options.page;
  const pageSize = options.pageSize;
  const query = options.query?.toLowerCase();

  const productList = Array.from(products.values())
    .filter(product => {
      // Apply text query filter if specified
      if (query) {
        const matchesQuery =
          product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Apply category filter if specified
      if (options.category && product.category !== options.category) {
        return false;
      }

      // Apply price range filters if specified
      if (options.minPrice !== undefined && product.price < options.minPrice) {
        return false;
      }

      if (options.maxPrice !== undefined && product.price > options.maxPrice) {
        return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = productList.length;
  const start = (page - 1) * pageSize;

  return {
    products: productList.slice(start, start + pageSize),
    totalCount: total,
    page,
    pageSize,
  };
}
