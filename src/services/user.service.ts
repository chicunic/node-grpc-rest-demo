import { randomUUID } from "node:crypto";

import type {
  CreateUserRequest,
  ListUsersQuery,
  ListUsersResponse,
  UpdateUserRequest,
  User,
} from "../schemas/user.js";
import { NotFoundError } from "../utils/errors.js";

const users = new Map<string, User>();

export async function getUser(id: string): Promise<User> {
  const user = users.get(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const now = new Date().toISOString();
  const user: User = {
    id: randomUUID(),
    username: data.username,
    email: data.email,
    fullName: data.fullName,
    createdAt: now,
    updatedAt: now,
    isActive: true,
  };

  users.set(user.id, user);
  return user;
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
  const user = await getUser(id);

  const updatedUser: User = {
    ...user,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  users.set(id, updatedUser);
  return updatedUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  await getUser(id); // throws if user doesn't exist
  users.delete(id);
  return true;
}

export async function listUsers(options: ListUsersQuery): Promise<ListUsersResponse> {
  const { page, pageSize, sortBy, filter } = options;
  const filterLower = filter?.toLowerCase();

  const userList = Array.from(users.values())
    .filter((user) => {
      if (!filterLower) return true;
      return (
        user.username.toLowerCase().includes(filterLower) ||
        user.email.toLowerCase().includes(filterLower) ||
        user.fullName.toLowerCase().includes(filterLower)
      );
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      const aValue = a[sortBy as keyof User];
      const bValue = b[sortBy as keyof User];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue);
      }
      return 0;
    });

  const start = (page - 1) * pageSize;

  return {
    users: userList.slice(start, start + pageSize),
    totalCount: userList.length,
    page,
    pageSize,
  };
}
