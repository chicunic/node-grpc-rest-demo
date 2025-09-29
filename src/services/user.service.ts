import { v4 as uuidv4 } from 'uuid';

import { CreateUserRequest, ListUsersQuery, ListUsersResponse, UpdateUserRequest, User } from '../types/user.types';

// In-memory storage for users
const users = new Map<string, User>();

export async function getUser(id: string): Promise<User> {
  const user = users.get(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const now = new Date().toISOString();
  const user: User = {
    id: uuidv4(),
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

  const updatedUser = {
    ...user,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  users.set(id, updatedUser);
  return updatedUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  await getUser(id); // This will throw if user doesn't exist

  users.delete(id);
  return true;
}

export async function listUsers(options: ListUsersQuery): Promise<ListUsersResponse> {
  const page = options.page;
  const pageSize = options.pageSize;
  const filter = options.filter?.toLowerCase();

  const userList = Array.from(users.values())
    .filter(user => {
      // Apply filter if specified
      if (!filter) return true;
      return (
        user.username.toLowerCase().includes(filter) ||
        user.email.toLowerCase().includes(filter) ||
        user.fullName.toLowerCase().includes(filter)
      );
    })
    .sort((a, b) => {
      // Apply sorting if specified
      if (!options.sortBy) return 0;
      const aValue = a[options.sortBy as keyof User];
      const bValue = b[options.sortBy as keyof User];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      }
      return 0;
    });

  const total = userList.length;
  const start = (page - 1) * pageSize;

  return {
    users: userList.slice(start, start + pageSize),
    totalCount: total,
    page,
    pageSize,
  };
}
