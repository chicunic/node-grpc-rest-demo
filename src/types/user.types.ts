import { PaginationQuery, PaginationResponse } from './pagination.types';

// REST API interfaces
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

// gRPC interface
export interface GrpcUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface GrpcGetUserResponse {
  user: GrpcUser;
}

export interface GrpcCreateUserResponse {
  user: GrpcUser;
}

export interface GrpcUpdateUserResponse {
  user: GrpcUser;
}

export interface GrpcDeleteUserResponse {
  success: boolean;
}

export interface GrpcListUsersResponse {
  users: GrpcUser[];
  total_count: number;
  page: number;
  page_size: number;
}
