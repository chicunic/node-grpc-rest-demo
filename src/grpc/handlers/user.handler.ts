import * as grpc from '@grpc/grpc-js';

import { createUser, deleteUser, getUser, listUsers, updateUser } from '../../services/user.service';
import {
  GrpcCreateUserResponse,
  GrpcDeleteUserResponse,
  GrpcGetUserResponse,
  GrpcListUsersResponse,
  GrpcUpdateUserResponse,
  GrpcUser,
} from '../../types/user.types';
import { handleGrpcError } from '../../utils/error.handler';
import {
  CreateUserRequestDto,
  DeleteUserRequestDto,
  GetUserRequestDto,
  ListUsersRequestDto,
  UpdateUserRequestDto,
} from '../validators/user.validator';
import { createValidationError, validateRequest } from '../validators/validator.utils';

export const userServiceImplementation = {
  GetUser: async (
    call: grpc.ServerUnaryCall<GetUserRequestDto, GrpcGetUserResponse>,
    callback: grpc.sendUnaryData<GrpcGetUserResponse>
  ): Promise<void> => {
    try {
      const validation = await validateRequest(GetUserRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors!));
        return;
      }

      const { id } = call.request;
      const result = await getUser(id);
      const response: GrpcGetUserResponse = {
        user: {
          id: result.id,
          username: result.username,
          email: result.email,
          full_name: result.fullName,
          created_at: result.createdAt,
          updated_at: result.updatedAt,
          is_active: result.isActive,
        },
      };
      callback(null, response);
    } catch (error) {
      handleGrpcError(error, callback, 'GetUser');
    }
  },

  CreateUser: async (
    call: grpc.ServerUnaryCall<CreateUserRequestDto, GrpcCreateUserResponse>,
    callback: grpc.sendUnaryData<GrpcCreateUserResponse>
  ): Promise<void> => {
    try {
      const validation = await validateRequest(CreateUserRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors!));
        return;
      }

      const { username, email, full_name } = call.request;
      const result = await createUser({
        username,
        email,
        fullName: full_name,
      });
      const response: GrpcCreateUserResponse = {
        user: {
          id: result.id,
          username: result.username,
          email: result.email,
          full_name: result.fullName,
          created_at: result.createdAt,
          updated_at: result.updatedAt,
          is_active: result.isActive,
        },
      };
      callback(null, response);
    } catch (error) {
      handleGrpcError(error, callback, 'CreateUser');
    }
  },

  UpdateUser: async (
    call: grpc.ServerUnaryCall<UpdateUserRequestDto, GrpcUpdateUserResponse>,
    callback: grpc.sendUnaryData<GrpcUpdateUserResponse>
  ): Promise<void> => {
    try {
      const validation = await validateRequest(UpdateUserRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors!));
        return;
      }

      const {
        id,
        data: { username, email, full_name, is_active },
      } = call.request;
      const updateData: Record<string, unknown> = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (full_name) updateData.fullName = full_name;
      if (is_active !== undefined) updateData.isActive = is_active;

      const result = await updateUser(id, updateData);
      const response: GrpcUpdateUserResponse = {
        user: {
          id: result.id,
          username: result.username,
          email: result.email,
          full_name: result.fullName,
          created_at: result.createdAt,
          updated_at: result.updatedAt,
          is_active: result.isActive,
        },
      };
      callback(null, response);
    } catch (error) {
      handleGrpcError(error, callback, 'UpdateUser');
    }
  },

  DeleteUser: async (
    call: grpc.ServerUnaryCall<DeleteUserRequestDto, GrpcDeleteUserResponse>,
    callback: grpc.sendUnaryData<GrpcDeleteUserResponse>
  ): Promise<void> => {
    try {
      const validation = await validateRequest(DeleteUserRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors!));
        return;
      }

      const { id } = call.request;
      const result = await deleteUser(id);
      callback(null, { success: result });
    } catch (error) {
      handleGrpcError(error, callback, 'DeleteUser');
    }
  },

  ListUsers: async (
    call: grpc.ServerUnaryCall<ListUsersRequestDto, GrpcListUsersResponse>,
    callback: grpc.sendUnaryData<GrpcListUsersResponse>
  ): Promise<void> => {
    try {
      const validation = await validateRequest(ListUsersRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors!));
        return;
      }

      const { page, page_size, sort_by, filter } = call.request;
      const result = await listUsers({
        page,
        pageSize: page_size,
        sortBy: sort_by,
        filter,
      });
      const grpcUsers: GrpcUser[] = result.users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.fullName,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        is_active: user.isActive,
      }));
      callback(null, {
        users: grpcUsers,
        total_count: result.totalCount,
        page: page ?? 1,
        page_size: page_size ?? 10,
      });
    } catch (error) {
      handleGrpcError(error, callback, 'ListUsers');
    }
  },
};
