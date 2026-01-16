/**
 * User Service Mock Utilities
 */
import type { jest } from '@jest/globals';

import type {
  CreateUserRequest,
  ListUsersQuery,
  ListUsersResponse,
  UpdateUserRequest,
  User,
} from '../../src/types/user.types';
import { MOCK_USER_RESPONSE } from './data';
import { createJestMock, createModuleMock } from './mock.factory';

export const mockUserService = {
  createUser: createJestMock() as jest.Mock<(data: CreateUserRequest) => Promise<User>>,
  getUser: createJestMock() as jest.Mock<(id: string) => Promise<User>>,
  updateUser: createJestMock() as jest.Mock<(id: string, data: UpdateUserRequest) => Promise<User>>,
  deleteUser: createJestMock() as jest.Mock<(id: string) => Promise<boolean>>,
  listUsers: createJestMock() as jest.Mock<(options: ListUsersQuery) => Promise<ListUsersResponse>>,

  setup(): void {
    this.createUser.mockResolvedValue(MOCK_USER_RESPONSE);
    this.getUser.mockResolvedValue(MOCK_USER_RESPONSE);
    this.updateUser.mockResolvedValue(MOCK_USER_RESPONSE);
    this.deleteUser.mockResolvedValue(true);
    this.listUsers.mockResolvedValue({
      users: [MOCK_USER_RESPONSE],
      totalCount: 1,
      page: 1,
      pageSize: 10,
    });
  },

  reset(): void {
    this.createUser.mockReset();
    this.getUser.mockReset();
    this.updateUser.mockReset();
    this.deleteUser.mockReset();
    this.listUsers.mockReset();
  },
};

export function enableUserServiceMock(): typeof jest {
  return createModuleMock('../../src/services/user.service', {
    createUser: mockUserService.createUser,
    getUser: mockUserService.getUser,
    updateUser: mockUserService.updateUser,
    deleteUser: mockUserService.deleteUser,
    listUsers: mockUserService.listUsers,
  });
}
