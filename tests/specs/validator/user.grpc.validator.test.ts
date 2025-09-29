/**
 * User Service - gRPC Parameter Validator Tests
 * Tests parameter validation using real server implementation with service layer mocking
 */
import * as grpc from '@grpc/grpc-js';

import {
  CreateUserRequestDto,
  DeleteUserRequestDto,
  GetUserRequestDto,
  ListUsersRequestDto,
  UpdateUserRequestDto,
} from '../../../src/grpc/validators/user.validator';
import {
  GrpcCreateUserResponse,
  GrpcDeleteUserResponse,
  GrpcGetUserResponse,
  GrpcListUsersResponse,
  GrpcUpdateUserResponse,
} from '../../../src/types/user.types';
import { TEST_FAKE_UUID } from '../../utils/data';
import { enableUserServiceMock, mockUserService } from '../../utils/mock.index';
import {
  type GrpcTestClient,
  createGrpcTestClient,
  promisifyGrpcCall,
  shutdownGrpcTestClient,
} from '../../utils/server.grpc';

// Enable service mocks for validation test
enableUserServiceMock();

describe('User Service - gRPC Parameter Validator', () => {
  let testClient: GrpcTestClient;

  beforeAll(async () => {
    testClient = await createGrpcTestClient();
  });

  beforeEach(() => {
    mockUserService.reset();
    mockUserService.setup();
  });

  afterAll(async () => {
    await shutdownGrpcTestClient(testClient);
  });

  describe('CreateUser - Parameter Validator', () => {
    it('should reject request with missing username', async () => {
      const invalidRequest = {
        // username missing
        email: 'test@example.com',
        full_name: 'Test User',
      };

      await expect(
        promisifyGrpcCall<object, GrpcCreateUserResponse>(testClient.userClient, 'CreateUser', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('username is required'),
      });
    });

    it('should reject request with empty username', async () => {
      const invalidRequest = {
        username: '',
        email: 'test@example.com',
        full_name: 'Test User',
      };

      await expect(
        promisifyGrpcCall<CreateUserRequestDto, GrpcCreateUserResponse>(
          testClient.userClient,
          'CreateUser',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('username is required'),
      });
    });

    it('should reject request with username too short', async () => {
      const invalidRequest = {
        username: 'ab', // Invalid: less than 3 characters
        email: 'test@example.com',
        full_name: 'Test User',
      };

      await expect(
        promisifyGrpcCall<CreateUserRequestDto, GrpcCreateUserResponse>(
          testClient.userClient,
          'CreateUser',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('username must be at least 3 characters'),
      });
    });

    it('should reject request with username too long', async () => {
      const invalidRequest = {
        username: 'a'.repeat(51), // Invalid: more than 50 characters
        email: 'test@example.com',
        full_name: 'Test User',
      };

      await expect(
        promisifyGrpcCall<CreateUserRequestDto, GrpcCreateUserResponse>(
          testClient.userClient,
          'CreateUser',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('username must be at most 50 characters'),
      });
    });

    it('should reject request with missing email', async () => {
      const invalidRequest = {
        username: 'testuser',
        // email missing
        full_name: 'Test User',
      };

      await expect(
        promisifyGrpcCall<object, GrpcCreateUserResponse>(testClient.userClient, 'CreateUser', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('email is required'),
      });
    });

    it('should reject request with invalid email format', async () => {
      const invalidRequest = {
        username: 'testuser',
        email: 'invalid-email-format',
        full_name: 'Test User',
      };

      await expect(
        promisifyGrpcCall<CreateUserRequestDto, GrpcCreateUserResponse>(
          testClient.userClient,
          'CreateUser',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('email must be a valid email address'),
      });
    });

    it('should reject request with missing full_name', async () => {
      const invalidRequest = {
        username: 'testuser',
        email: 'test@example.com',
        // full_name missing
      };

      await expect(
        promisifyGrpcCall<object, GrpcCreateUserResponse>(testClient.userClient, 'CreateUser', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('full_name is required'),
      });
    });

    it('should reject request with full_name too long', async () => {
      const invalidRequest = {
        username: 'testuser',
        email: 'test@example.com',
        full_name: 'a'.repeat(101), // Invalid: more than 100 characters
      };

      await expect(
        promisifyGrpcCall<CreateUserRequestDto, GrpcCreateUserResponse>(
          testClient.userClient,
          'CreateUser',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('full_name must be at most 100 characters'),
      });
    });

    it('should accept valid CreateUser request', async () => {
      const validRequest = {
        username: 'testuser123',
        email: 'test@example.com',
        full_name: 'Test User',
      };

      const response = await promisifyGrpcCall<CreateUserRequestDto, GrpcCreateUserResponse>(
        testClient.userClient,
        'CreateUser',
        validRequest
      );

      expect(response).toBeDefined();
    });
  });

  describe('GetUser - Parameter Validator', () => {
    it('should reject request with missing id', async () => {
      const invalidRequest = {
        // id missing
      };

      await expect(
        promisifyGrpcCall<object, GrpcGetUserResponse>(testClient.userClient, 'GetUser', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('id is required'),
      });
    });

    it('should reject request with empty id', async () => {
      const invalidRequest = {
        id: '',
      };

      await expect(
        promisifyGrpcCall<GetUserRequestDto, GrpcGetUserResponse>(testClient.userClient, 'GetUser', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('id is required'),
      });
    });

    it('should reject request with invalid UUID format', async () => {
      const invalidRequest = {
        id: 'invalid-uuid-format',
      };

      await expect(
        promisifyGrpcCall<GetUserRequestDto, GrpcGetUserResponse>(testClient.userClient, 'GetUser', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('id must be a valid UUID v4'),
      });
    });

    it('should accept valid GetUser request', async () => {
      expect.assertions(0);
      const validRequest = {
        id: TEST_FAKE_UUID,
      };

      await promisifyGrpcCall<GetUserRequestDto, GrpcGetUserResponse>(testClient.userClient, 'GetUser', validRequest);
    });
  });

  describe('UpdateUser - Parameter Validator', () => {
    it('should reject request with missing id', async () => {
      const invalidRequest = {
        // id missing
        data: {
          username: 'newusername',
        },
      };

      await expect(
        promisifyGrpcCall<object, GrpcUpdateUserResponse>(testClient.userClient, 'UpdateUser', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('id is required'),
      });
    });

    it('should reject request with invalid UUID format', async () => {
      const invalidRequest = {
        id: 'invalid-uuid-format',
        data: {
          username: 'newusername',
        },
      };

      await expect(
        promisifyGrpcCall<UpdateUserRequestDto, GrpcUpdateUserResponse>(
          testClient.userClient,
          'UpdateUser',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('id must be a valid UUID v4'),
      });
    });

    it('should reject request with missing data', async () => {
      const invalidRequest = {
        id: TEST_FAKE_UUID,
        // data missing
      };

      await expect(
        promisifyGrpcCall<object, GrpcUpdateUserResponse>(testClient.userClient, 'UpdateUser', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('data is required'),
      });
    });

    it('should reject request with invalid username in data', async () => {
      const invalidRequest = {
        id: TEST_FAKE_UUID,
        data: {
          username: 'ab', // Invalid: too short
        },
      };

      await expect(
        promisifyGrpcCall<UpdateUserRequestDto, GrpcUpdateUserResponse>(
          testClient.userClient,
          'UpdateUser',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('username must be at least 3 characters'),
      });
    });

    it('should reject request with invalid email in data', async () => {
      const invalidRequest = {
        id: TEST_FAKE_UUID,
        data: {
          email: 'invalid-email',
        },
      };

      await expect(
        promisifyGrpcCall<UpdateUserRequestDto, GrpcUpdateUserResponse>(
          testClient.userClient,
          'UpdateUser',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('email must be a valid email address'),
      });
    });

    it('should reject request with invalid full_name in data', async () => {
      const invalidRequest = {
        id: TEST_FAKE_UUID,
        data: {
          full_name: 'a'.repeat(101), // Invalid: too long
        },
      };

      await expect(
        promisifyGrpcCall<UpdateUserRequestDto, GrpcUpdateUserResponse>(
          testClient.userClient,
          'UpdateUser',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('full_name must be at most 100 characters'),
      });
    });

    it('should accept valid UpdateUser request with all fields', async () => {
      expect.assertions(0);
      const validRequest = {
        id: TEST_FAKE_UUID,
        data: {
          username: 'newusername',
          email: 'newemail@example.com',
          full_name: 'New Full Name',
          is_active: false,
        },
      };

      await promisifyGrpcCall<UpdateUserRequestDto, GrpcUpdateUserResponse>(
        testClient.userClient,
        'UpdateUser',
        validRequest
      );
    });

    it('should accept valid UpdateUser request with partial fields', async () => {
      expect.assertions(0);
      const validRequest = {
        id: TEST_FAKE_UUID,
        data: {
          email: 'newemail@example.com',
        },
      };

      await promisifyGrpcCall<UpdateUserRequestDto, GrpcUpdateUserResponse>(
        testClient.userClient,
        'UpdateUser',
        validRequest
      );
    });
  });

  describe('DeleteUser - Parameter Validator', () => {
    it('should reject request with missing id', async () => {
      const invalidRequest = {
        // id missing
      };

      await expect(
        promisifyGrpcCall<object, GrpcDeleteUserResponse>(testClient.userClient, 'DeleteUser', invalidRequest)
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('id is required'),
      });
    });

    it('should reject request with invalid UUID format', async () => {
      const invalidRequest = {
        id: 'invalid-uuid-format',
      };

      await expect(
        promisifyGrpcCall<DeleteUserRequestDto, GrpcDeleteUserResponse>(
          testClient.userClient,
          'DeleteUser',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('id must be a valid UUID v4'),
      });
    });

    it('should accept valid DeleteUser request', async () => {
      expect.assertions(0);
      const validRequest = {
        id: TEST_FAKE_UUID,
      };

      await promisifyGrpcCall<DeleteUserRequestDto, GrpcDeleteUserResponse>(
        testClient.userClient,
        'DeleteUser',
        validRequest
      );
    });
  });

  describe('ListUsers - Parameter Validator', () => {
    it('should reject request with page set to 0', async () => {
      const invalidRequest = {
        page: 0, // page must be at least 1
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<ListUsersRequestDto, GrpcListUsersResponse>(
          testClient.userClient,
          'ListUsers',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('page must be at least 1'),
      });
    });

    it('should reject request with page_size set to 0', async () => {
      const invalidRequest = {
        page: 1,
        page_size: 0, // page_size must be at least 1
      };

      await expect(
        promisifyGrpcCall<ListUsersRequestDto, GrpcListUsersResponse>(
          testClient.userClient,
          'ListUsers',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('page_size must be at least 1'),
      });
    });

    it('should reject request with filter too long', async () => {
      const invalidRequest = {
        filter: 'a'.repeat(101), // Invalid: more than 100 characters
        page: 1,
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<ListUsersRequestDto, GrpcListUsersResponse>(
          testClient.userClient,
          'ListUsers',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('filter must be at most 100 characters'),
      });
    });

    it('should reject request with page greater than 10000', async () => {
      const invalidRequest = {
        page: 10001, // Invalid: must be at most 10000
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<ListUsersRequestDto, GrpcListUsersResponse>(
          testClient.userClient,
          'ListUsers',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('page must be at most 10000'),
      });
    });

    it('should reject request with pageSize greater than 100', async () => {
      const invalidRequest = {
        page: 1,
        page_size: 101, // Invalid: must be at most 100
      };

      await expect(
        promisifyGrpcCall<ListUsersRequestDto, GrpcListUsersResponse>(
          testClient.userClient,
          'ListUsers',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('page_size must be at most 100'),
      });
    });

    it('should reject request with negative page', async () => {
      const invalidRequest = {
        page: -1, // Invalid: must be at least 1
        page_size: 10,
      };

      await expect(
        promisifyGrpcCall<ListUsersRequestDto, GrpcListUsersResponse>(
          testClient.userClient,
          'ListUsers',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('page must be at least 1'),
      });
    });

    it('should reject request with negative pageSize', async () => {
      const invalidRequest = {
        page: 1,
        page_size: -1, // Invalid: must be at least 1
      };

      await expect(
        promisifyGrpcCall<ListUsersRequestDto, GrpcListUsersResponse>(
          testClient.userClient,
          'ListUsers',
          invalidRequest
        )
      ).rejects.toMatchObject({
        code: grpc.status.INVALID_ARGUMENT,
        details: expect.stringContaining('page_size must be at least 1'),
      });
    });

    it('should accept valid ListUsers request with all parameters', async () => {
      const validRequest = {
        sort_by: 'username',
        filter: 'test',
        page: 1,
        page_size: 10,
      };

      const response = await promisifyGrpcCall<ListUsersRequestDto, GrpcListUsersResponse>(
        testClient.userClient,
        'ListUsers',
        validRequest
      );

      // Should pass validation and return successful response
      expect(response).toBeDefined();
      expect(response.users).toBeDefined();
    });

    it('should accept valid ListUsers request with required parameters only', async () => {
      const validRequest = {
        page: 2,
        page_size: 5,
      };

      const response = await promisifyGrpcCall<ListUsersRequestDto, GrpcListUsersResponse>(
        testClient.userClient,
        'ListUsers',
        validRequest
      );

      // Should pass validation and return successful response
      expect(response).toBeDefined();
      expect(response.users).toBeDefined();
    });
  });
});
