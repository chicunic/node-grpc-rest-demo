import { v4 as uuidv4 } from 'uuid';

import type {
  CreateProductRequest,
  Product,
  SearchProductsQuery,
  SearchProductsResponse,
} from '../types/product.types';

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
  const product: Product = {
    id: uuidv4(),
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
  const { page, pageSize, query, category, minPrice, maxPrice } = options;
  const queryLower = query?.toLowerCase();

  const productList = Array.from(products.values())
    .filter((product) => {
      if (queryLower) {
        const matchesQuery =
          product.name.toLowerCase().includes(queryLower) || product.description.toLowerCase().includes(queryLower);
        if (!matchesQuery) return false;
      }

      if (category && product.category !== category) {
        return false;
      }

      if (minPrice !== undefined && product.price < minPrice) {
        return false;
      }

      if (maxPrice !== undefined && product.price > maxPrice) {
        return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const start = (page - 1) * pageSize;

  return {
    products: productList.slice(start, start + pageSize),
    totalCount: productList.length,
    page,
    pageSize,
  };
}
