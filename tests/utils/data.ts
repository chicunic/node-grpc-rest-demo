/**
 * Test data and constants for all services
 */
import { CreateProductRequest, Product } from '../../src/types/product.types';
import { CreateUserRequest, User } from '../../src/types/user.types';

// ===== COMMON CONSTANTS =====
export const TEST_FAKE_UUID = '123e4567-e89b-4321-a456-426614174000';

export const TEST_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  SMALL_PAGE_SIZE: 2,
};

// Single product for CRUD tests
export const TEST_PRODUCT = {
  name: 'Test Product',
  description: 'This is a test product',
  price: 100,
  quantity: 50,
  category: 'Electronics',
} as CreateProductRequest;

// Multiple products for search/list tests
export const SEARCH_PRODUCTS = [
  {
    name: 'iPhone 15 Pro',
    description: 'Latest Apple smartphone',
    price: 1000,
    quantity: 25,
    category: 'Electronics',
  },
  {
    name: 'Samsung Galaxy S24',
    description: 'High-end Android smartphone',
    price: 900,
    quantity: 30,
    category: 'Electronics',
  },
  {
    name: 'JavaScript Guide',
    description: 'Programming book',
    price: 30,
    quantity: 100,
    category: 'Books',
  },
  {
    name: 'Advanced JavaScript',
    description: 'Programming book for developers',
    price: 35,
    quantity: 75,
    category: 'Books',
  },
  {
    name: 'The Great Gatsby',
    description: 'Classic American literature',
    price: 20,
    quantity: 100,
    category: 'Books',
  },
  {
    name: 'Coffee Maker Pro',
    description: 'Premium coffee maker',
    price: 200,
    quantity: 20,
    category: 'Appliances',
  },
] as CreateProductRequest[];

// Product Mock DB Data
export const MOCK_PRODUCT_RESPONSE: Product = {
  id: '123e4567-e89b-4321-a456-426614174000',
  name: 'Test Product',
  description: 'This is a test product',
  price: 100,
  quantity: 50,
  category: 'Electronics',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Single user for CRUD tests
export const TEST_USER = {
  username: 'testuser123',
  email: 'test@example.com',
  fullName: 'Test User',
} as CreateUserRequest;

// Multiple users for list tests
export const LIST_USERS = [
  {
    username: 'alice',
    email: 'alice@example.com',
    fullName: 'Alice Smith',
  },
  {
    username: 'bob',
    email: 'bob@example.com',
    fullName: 'Bob Johnson',
  },
  {
    username: 'charlie',
    email: 'charlie@example.com',
    fullName: 'Charlie Brown',
  },
] as CreateUserRequest[];

// User Mock DB Data
export const MOCK_USER_RESPONSE: User = {
  id: '123e4567-e89b-4321-a456-426614174000',
  username: 'testuser123',
  email: 'test@example.com',
  fullName: 'Test User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true,
};
