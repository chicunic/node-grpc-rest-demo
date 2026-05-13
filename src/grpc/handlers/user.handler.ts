import type * as grpc from "@grpc/grpc-js";

import type { UpdateUserRequest, User } from "../../schemas/user.js";
import { createUser, deleteUser, getUser, listUsers, updateUser } from "../../services/user.service.js";
import type {
  GrpcDeleteUserResponse,
  GrpcListUsersResponse,
  GrpcUser,
  GrpcUserResponse,
} from "../../types/user.types.js";
import { handleGrpcError } from "../../utils/error.handler.js";
import {
  CreateUserRequestDto,
  DeleteUserRequestDto,
  GetUserRequestDto,
  ListUsersRequestDto,
  UpdateUserRequestDto,
} from "../validators/user.validator.js";
import { createValidationError, validateRequest } from "../validators/validator.utils.js";

function toGrpcUser(user: User): GrpcUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.fullName,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    is_active: user.isActive,
  };
}

export const userServiceImplementation = {
  GetUser: async (
    call: grpc.ServerUnaryCall<GetUserRequestDto, GrpcUserResponse>,
    callback: grpc.sendUnaryData<GrpcUserResponse>,
  ): Promise<void> => {
    try {
      const validation = await validateRequest(GetUserRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors));
        return;
      }

      const result = await getUser(call.request.id);
      callback(null, { user: toGrpcUser(result), message: "User retrieved successfully" });
    } catch (error) {
      handleGrpcError(error, callback, "GetUser");
    }
  },

  CreateUser: async (
    call: grpc.ServerUnaryCall<CreateUserRequestDto, GrpcUserResponse>,
    callback: grpc.sendUnaryData<GrpcUserResponse>,
  ): Promise<void> => {
    try {
      const validation = await validateRequest(CreateUserRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors));
        return;
      }

      const { username, email, full_name } = call.request;
      const result = await createUser({ username, email, fullName: full_name });
      callback(null, { user: toGrpcUser(result), message: "User created successfully" });
    } catch (error) {
      handleGrpcError(error, callback, "CreateUser");
    }
  },

  UpdateUser: async (
    call: grpc.ServerUnaryCall<UpdateUserRequestDto, GrpcUserResponse>,
    callback: grpc.sendUnaryData<GrpcUserResponse>,
  ): Promise<void> => {
    try {
      const validation = await validateRequest(UpdateUserRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors));
        return;
      }

      const { id, username, email, full_name, is_active } = call.request;
      const updateData: UpdateUserRequest = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (full_name) updateData.fullName = full_name;
      if (is_active !== undefined) updateData.isActive = is_active;

      const result = await updateUser(id, updateData);
      callback(null, { user: toGrpcUser(result), message: "User updated successfully" });
    } catch (error) {
      handleGrpcError(error, callback, "UpdateUser");
    }
  },

  DeleteUser: async (
    call: grpc.ServerUnaryCall<DeleteUserRequestDto, GrpcDeleteUserResponse>,
    callback: grpc.sendUnaryData<GrpcDeleteUserResponse>,
  ): Promise<void> => {
    try {
      const validation = await validateRequest(DeleteUserRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors));
        return;
      }

      await deleteUser(call.request.id);
      callback(null, { message: "User deleted successfully" });
    } catch (error) {
      handleGrpcError(error, callback, "DeleteUser");
    }
  },

  ListUsers: async (
    call: grpc.ServerUnaryCall<ListUsersRequestDto, GrpcListUsersResponse>,
    callback: grpc.sendUnaryData<GrpcListUsersResponse>,
  ): Promise<void> => {
    try {
      const validation = await validateRequest(ListUsersRequestDto, call.request);
      if (!validation.isValid) {
        callback(createValidationError(validation.errors));
        return;
      }

      const { page, page_size, sort_by, filter } = call.request;
      const result = await listUsers({
        page,
        pageSize: page_size,
        sortBy: sort_by,
        filter,
      });

      callback(null, {
        users: result.users.map(toGrpcUser),
        total_count: result.totalCount,
        page,
        page_size,
      });
    } catch (error) {
      handleGrpcError(error, callback, "ListUsers");
    }
  },
};
