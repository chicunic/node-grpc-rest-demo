import { vi } from "vitest";

import type {
  CreateUserRequest,
  ListUsersQuery,
  ListUsersResponse,
  UpdateUserRequest,
  User,
} from "../../src/types/user.types.js";
import { MOCK_USER_RESPONSE } from "./data.js";

export const mockUserService = {
  createUser: vi.fn<(data: CreateUserRequest) => Promise<User>>(),
  getUser: vi.fn<(id: string) => Promise<User>>(),
  updateUser: vi.fn<(id: string, data: UpdateUserRequest) => Promise<User>>(),
  deleteUser: vi.fn<(id: string) => Promise<boolean>>(),
  listUsers: vi.fn<(options: ListUsersQuery) => Promise<ListUsersResponse>>(),

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
