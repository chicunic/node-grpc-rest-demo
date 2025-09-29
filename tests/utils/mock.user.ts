/**
 * User Service Mock Utilities
 * User service specific mocks and setup functions
 */
import { jest } from '@jest/globals';

import {
  CreateUserRequest,
  ListUsersQuery,
  ListUsersResponse,
  UpdateUserRequest,
  User,
} from '../../src/types/user.types';
import { MOCK_USER_RESPONSE } from './data';
import { createJestMock, createSimpleModuleMock } from './mock.factory';

// Mock user service with all API functions
export const mockUserService = {
  createUser: createJestMock() as jest.Mock<(data: CreateUserRequest) => Promise<User>>,
  getUser: createJestMock() as jest.Mock<(id: string) => Promise<User>>,
  updateUser: createJestMock() as jest.Mock<(id: string, data: UpdateUserRequest) => Promise<User>>,
  deleteUser: createJestMock() as jest.Mock<(id: string) => Promise<boolean>>,
  listUsers: createJestMock() as jest.Mock<(options: ListUsersQuery) => Promise<ListUsersResponse>>,

  setup: (): void => {
    // Setup mock responses with test data
    mockUserService.createUser.mockResolvedValue(MOCK_USER_RESPONSE);
    mockUserService.getUser.mockResolvedValue(MOCK_USER_RESPONSE);
    mockUserService.updateUser.mockResolvedValue(MOCK_USER_RESPONSE);
    mockUserService.deleteUser.mockResolvedValue(true);
    mockUserService.listUsers.mockResolvedValue({
      users: [MOCK_USER_RESPONSE],
      totalCount: 1,
      page: 1,
      pageSize: 10,
    });
  },
  reset: (): void => {
    mockUserService.createUser.mockReset();
    mockUserService.getUser.mockReset();
    mockUserService.updateUser.mockReset();
    mockUserService.deleteUser.mockReset();
    mockUserService.listUsers.mockReset();
  },
};

// Enable user service mock when needed
export function enableUserServiceMock(): typeof jest {
  return createSimpleModuleMock('../../src/services/user.service', {
    createUser: mockUserService.createUser,
    getUser: mockUserService.getUser,
    updateUser: mockUserService.updateUser,
    deleteUser: mockUserService.deleteUser,
    listUsers: mockUserService.listUsers,
  });
}
