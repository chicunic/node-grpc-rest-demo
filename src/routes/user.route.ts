import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import {
  CreateUserSchema,
  DeleteUserResponseSchema,
  ListUsersQuerySchema,
  ListUsersResponseSchema,
  UpdateUserSchema,
  UserIdParamSchema,
  UserSchema,
} from "../schemas/user.js";
import { createUser, deleteUser, getUser, listUsers, updateUser } from "../services/user.service.js";
import { defaultHook, jsonError } from "../schemas/common.js";

const app = new OpenAPIHono({ defaultHook: defaultHook() });

app.openapi(
  createRoute({
    method: "get",
    path: "/users/{id}",
    summary: "Get a user by ID",
    tags: ["Users"],
    request: { params: UserIdParamSchema },
    responses: {
      200: { content: { "application/json": { schema: UserSchema } }, description: "User found" },
      400: jsonError("Validation error"),
      404: jsonError("User not found"),
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const user = await getUser(id);
    return c.json(user, 200);
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/users",
    summary: "Create a new user",
    tags: ["Users"],
    request: {
      body: {
        content: { "application/json": { schema: CreateUserSchema } },
        description: "User data to create",
        required: true,
      },
    },
    responses: {
      201: { content: { "application/json": { schema: UserSchema } }, description: "User created" },
      400: jsonError("Validation error"),
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const user = await createUser(body);
    return c.json(user, 201);
  },
);

app.openapi(
  createRoute({
    method: "put",
    path: "/users/{id}",
    summary: "Update an existing user",
    tags: ["Users"],
    request: {
      params: UserIdParamSchema,
      body: {
        content: { "application/json": { schema: UpdateUserSchema } },
        description: "User fields to update",
        required: true,
      },
    },
    responses: {
      200: { content: { "application/json": { schema: UserSchema } }, description: "User updated" },
      400: jsonError("Validation error"),
      404: jsonError("User not found"),
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const user = await updateUser(id, body);
    return c.json(user, 200);
  },
);

app.openapi(
  createRoute({
    method: "delete",
    path: "/users/{id}",
    summary: "Delete a user",
    tags: ["Users"],
    request: { params: UserIdParamSchema },
    responses: {
      200: {
        content: { "application/json": { schema: DeleteUserResponseSchema } },
        description: "User deleted",
      },
      400: jsonError("Validation error"),
      404: jsonError("User not found"),
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    await deleteUser(id);
    return c.json({ success: true }, 200);
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/users",
    summary: "List users",
    tags: ["Users"],
    request: { query: ListUsersQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: ListUsersResponseSchema } },
        description: "Paginated list of users",
      },
      400: jsonError("Validation error"),
    },
  }),
  async (c) => {
    const query = c.req.valid("query");
    const result = await listUsers(query);
    return c.json(result, 200);
  },
);

export const userRoutes = app;
