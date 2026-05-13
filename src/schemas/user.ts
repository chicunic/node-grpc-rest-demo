import { z } from "@hono/zod-openapi";
import {
  EXAMPLE_EMAIL,
  EXAMPLE_FULL_NAME,
  EXAMPLE_USERNAME,
  EXAMPLE_UUID,
  PaginationQuerySchema,
  PaginationResponseSchema,
} from "./common.js";

export const UserSchema = z
  .object({
    id: z.uuid().meta({ description: "User ID (UUID)", example: EXAMPLE_UUID }),
    username: z.string().min(1).max(100).meta({ description: "Unique username", example: EXAMPLE_USERNAME }),
    email: z.email().meta({ description: "Email address", example: EXAMPLE_EMAIL }),
    fullName: z.string().min(1).max(200).meta({ description: "Full display name", example: EXAMPLE_FULL_NAME }),
    createdAt: z.iso.datetime().meta({ description: "Creation timestamp (ISO 8601)" }),
    updatedAt: z.iso.datetime().meta({ description: "Last update timestamp (ISO 8601)" }),
    isActive: z.boolean().meta({ description: "Whether the user is active", example: true }),
  })
  .meta({ id: "User" });

export const CreateUserSchema = UserSchema.pick({
  username: true,
  email: true,
  fullName: true,
}).meta({ id: "CreateUserRequest" });

export const UpdateUserSchema = UserSchema.pick({
  username: true,
  email: true,
  fullName: true,
  isActive: true,
})
  .partial()
  .meta({ id: "UpdateUserRequest" });

export const UserIdParamSchema = z.object({
  id: z.uuid().meta({
    description: "User ID (UUID)",
    param: { name: "id", in: "path" },
    example: EXAMPLE_UUID,
  }),
});

export const ListUsersQuerySchema = PaginationQuerySchema.extend({
  sortBy: z.string().optional().meta({ description: "Field to sort by", example: "username" }),
  filter: z.string().optional().meta({ description: "Substring filter", example: "alice" }),
});

export const ListUsersResponseSchema = PaginationResponseSchema.extend({
  users: z.array(UserSchema),
}).meta({ id: "ListUsersResponse" });

export const DeleteUserResponseSchema = z
  .object({
    success: z.boolean().meta({ example: true }),
  })
  .meta({ id: "DeleteUserResponse" });

export type User = z.infer<typeof UserSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;
export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;
