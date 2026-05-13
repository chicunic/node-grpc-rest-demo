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
