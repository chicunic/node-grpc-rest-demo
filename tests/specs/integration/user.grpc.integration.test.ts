/**
 * User Service - gRPC Integration Tests
 * Tests complete gRPC service using real server implementation with minimal mocking
 */
/* eslint-disable jest/no-conditional-expect */
import * as grpc from '@grpc/grpc-js';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import {
  GrpcCreateUserResponse,
  GrpcDeleteUserResponse,
  GrpcGetUserResponse,
  GrpcListUsersResponse,
  GrpcUpdateUserResponse,
} from '../../../src/types/user.types';
import { LIST_USERS, TEST_FAKE_UUID, TEST_PAGINATION, TEST_USER } from '../../utils/data';
import { expectValidISOString, expectValidUUID } from '../../utils/helpers';
import {
  GrpcTestClient,
  createGrpcTestClient,
  promisifyGrpcCall,
  shutdownGrpcTestClient,
} from '../../utils/server.grpc';

describe('User - gRPC Integration', () => {
  let grpcClient: GrpcTestClient;
  let userId: string;

  beforeAll(async () => {
    // Start gRPC client
    grpcClient = await createGrpcTestClient();
  });

  afterAll(async () => {
    if (grpcClient) {
      await shutdownGrpcTestClient(grpcClient);
    }
  });

  describe('User CRUD Flow - gRPC Integration', () => {
    it('should create a new user successfully', async () => {
      const request = {
        username: TEST_USER.username,
        email: TEST_USER.email,
        full_name: TEST_USER.fullName,
      };

      const response = await promisifyGrpcCall<typeof request, GrpcCreateUserResponse>(
        grpcClient.userClient,
        'CreateUser',
        request
      );

      expect(response).toBeDefined();
      expect(response.user).toBeDefined();
      expectValidUUID(response.user.id);
      expect(response.user.username).toBe(request.username);
      expect(response.user.email).toBe(request.email);
      expect(response.user.full_name).toBe(request.full_name);
      expect(response.user.is_active).toBe(true);
      expectValidISOString(response.user.created_at);
      expectValidISOString(response.user.updated_at);

      // Save userId for subsequent tests
      userId = response.user.id;
    });

    it('should get the created user by ID successfully', async () => {
      const getRequest = { id: userId };
      const response = await promisifyGrpcCall<typeof getRequest, GrpcGetUserResponse>(
        grpcClient.userClient,
        'GetUser',
        getRequest
      );

      expect(response).toBeDefined();
      expect(response.user).toBeDefined();
      expect(response.user.id).toBe(userId);
      expect(response.user.username).toBe(TEST_USER.username);
      expect(response.user.email).toBe(TEST_USER.email);
      expect(response.user.full_name).toBe(TEST_USER.fullName);
      expect(response.user.is_active).toBe(true);
    });

    it('should update the user successfully', async () => {
      const updateData = {
        fullName: 'Updated Full Name',
        isActive: false,
      };
      const updateRequest = {
        id: userId,
        data: {
          full_name: updateData.fullName,
          is_active: updateData.isActive,
        },
      };
      const response = await promisifyGrpcCall<typeof updateRequest, GrpcUpdateUserResponse>(
        grpcClient.userClient,
        'UpdateUser',
        updateRequest
      );

      expect(response).toBeDefined();
      expect(response.user).toBeDefined();
      expect(response.user.id).toBe(userId);
      expect(response.user.username).toBe(TEST_USER.username); // unchanged
      expect(response.user.email).toBe(TEST_USER.email); // unchanged
      expect(response.user.full_name).toBe(updateData.fullName);
      expect(response.user.is_active).toBe(updateData.isActive);
    });

    it('should allow partial updates on the user', async () => {
      const partialUpdateData = {
        email: 'newemail@example.com',
      };
      const updateRequest = {
        id: userId,
        data: {
          email: partialUpdateData.email,
        },
      };
      const response = await promisifyGrpcCall<typeof updateRequest, GrpcUpdateUserResponse>(
        grpcClient.userClient,
        'UpdateUser',
        updateRequest
      );

      expect(response.user.email).toBe(partialUpdateData.email);
      expect(response.user.username).toBe(TEST_USER.username); // unchanged
      // full_name should be from previous update
      expect(response.user.full_name).toBe('Updated Full Name');
    });

    it('should delete the user successfully', async () => {
      const deleteRequest = { id: userId };
      const response = await promisifyGrpcCall<typeof deleteRequest, GrpcDeleteUserResponse>(
        grpcClient.userClient,
        'DeleteUser',
        deleteRequest
      );

      expect(response).toBeDefined();
      expect(response.success).toBe(true);

      // Verify user is deleted
      try {
        await promisifyGrpcCall(grpcClient.userClient, 'GetUser', { id: userId });
        throw new Error('Should have thrown an error');
      } catch (error) {
        const grpcError = error as grpc.ServiceError;
        expect(grpcError.code).toBe(grpc.status.NOT_FOUND);
      }
    });
  });

  describe('Error Handling - gRPC Integration', () => {
    it('should return NOT_FOUND for non-existent user operations', async () => {
      // Test GET
      try {
        await promisifyGrpcCall(grpcClient.userClient, 'GetUser', { id: TEST_FAKE_UUID });
        throw new Error('Should have thrown an error');
      } catch (error) {
        const grpcError = error as grpc.ServiceError;
        expect(grpcError.code).toBe(grpc.status.NOT_FOUND);
        expect(grpcError.details).toContain('User not found');
      }

      // Test UPDATE
      try {
        await promisifyGrpcCall(grpcClient.userClient, 'UpdateUser', {
          id: TEST_FAKE_UUID,
          data: { full_name: 'New Name' },
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        const grpcError = error as grpc.ServiceError;
        expect(grpcError.code).toBe(grpc.status.NOT_FOUND);
        expect(grpcError.details).toContain('User not found');
      }

      // Test DELETE
      try {
        await promisifyGrpcCall(grpcClient.userClient, 'DeleteUser', { id: TEST_FAKE_UUID });
        throw new Error('Should have thrown an error');
      } catch (error) {
        const grpcError = error as grpc.ServiceError;
        expect(grpcError.code).toBe(grpc.status.NOT_FOUND);
        expect(grpcError.details).toContain('User not found');
      }
    });
  });

  describe('ListUsers - gRPC Integration', () => {
    beforeAll(async () => {
      // Create multiple users for list testing
      const users = LIST_USERS.map(user => ({
        username: user.username,
        email: user.email,
        full_name: user.fullName,
      }));

      for (const user of users) {
        await promisifyGrpcCall<typeof user, GrpcCreateUserResponse>(grpcClient.userClient, 'CreateUser', user);
      }
    });

    it('should list users with default pagination', async () => {
      const request = {
        page: TEST_PAGINATION.DEFAULT_PAGE,
        page_size: TEST_PAGINATION.DEFAULT_PAGE_SIZE,
      };

      const response = await promisifyGrpcCall<typeof request, GrpcListUsersResponse>(
        grpcClient.userClient,
        'ListUsers',
        request
      );

      expect(response).toBeDefined();
      expect(response.users).toBeInstanceOf(Array);
      expect(response.total_count).toBeGreaterThanOrEqual(3);
      expect(response.page).toBe(TEST_PAGINATION.DEFAULT_PAGE);
      expect(response.page_size).toBe(TEST_PAGINATION.DEFAULT_PAGE_SIZE);
    });

    it('should support custom pagination', async () => {
      const request = {
        page: TEST_PAGINATION.DEFAULT_PAGE,
        page_size: TEST_PAGINATION.SMALL_PAGE_SIZE,
      };

      const response = await promisifyGrpcCall<typeof request, GrpcListUsersResponse>(
        grpcClient.userClient,
        'ListUsers',
        request
      );

      expect(response.users).toBeInstanceOf(Array);
      expect(response.users.length).toBeLessThanOrEqual(TEST_PAGINATION.SMALL_PAGE_SIZE);
      expect(response.page).toBe(TEST_PAGINATION.DEFAULT_PAGE);
      expect(response.page_size).toBe(TEST_PAGINATION.SMALL_PAGE_SIZE);
    });

    it('should support sorting', async () => {
      const request = {
        page: TEST_PAGINATION.DEFAULT_PAGE,
        page_size: TEST_PAGINATION.DEFAULT_PAGE_SIZE,
        sort_by: 'username',
      };

      const response = await promisifyGrpcCall<typeof request, GrpcListUsersResponse>(
        grpcClient.userClient,
        'ListUsers',
        request
      );

      expect(response.users).toBeInstanceOf(Array);

      // Check if sorted by username
      expect(response.users.length).toBeGreaterThan(1);
      for (let i = 0; i < response.users.length - 1; i++) {
        const currentUser = response.users[i]!;
        const nextUser = response.users[i + 1]!;
        expect(currentUser.username.localeCompare(nextUser.username)).toBeLessThanOrEqual(0);
      }
    });

    it('should support filtering', async () => {
      const request = {
        page: TEST_PAGINATION.DEFAULT_PAGE,
        page_size: TEST_PAGINATION.DEFAULT_PAGE_SIZE,
        filter: 'alice',
      };

      const response = await promisifyGrpcCall<typeof request, GrpcListUsersResponse>(
        grpcClient.userClient,
        'ListUsers',
        request
      );

      expect(response.users).toBeInstanceOf(Array);
      expect(response.total_count).toBeGreaterThan(0);

      // Check if filtered results contain 'alice'
      response.users.forEach(user => {
        const userString = JSON.stringify(user).toLowerCase();
        expect(userString).toContain('alice');
      });
    });
  });
});
