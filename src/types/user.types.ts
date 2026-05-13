import type { PaginationQuery, PaginationResponse } from "./pagination.types.js";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface GetUserParams {
  id: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  fullName?: string;
  isActive?: boolean;
}

export interface DeleteUserResponse {
  success: boolean;
}

export interface ListUsersQuery extends PaginationQuery {
  sortBy?: string;
  filter?: string;
}

export interface ListUsersResponse extends PaginationResponse {
  users: User[];
}

export interface GrpcUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface GrpcUserResponse {
  user: GrpcUser;
  message: string;
}

export interface GrpcDeleteUserResponse {
  message: string;
}

export interface GrpcListUsersResponse {
  users: GrpcUser[];
  total_count: number;
  page: number;
  page_size: number;
}
