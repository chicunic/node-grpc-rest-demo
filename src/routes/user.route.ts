import { type Request, type Response, Router } from "express";

import { createUser, deleteUser, getUser, listUsers, updateUser } from "../services/user.service.js";
import type {
  CreateUserRequest,
  DeleteUserResponse,
  GetUserParams,
  ListUsersResponse,
  UpdateUserRequest,
  User,
} from "../types/user.types.js";
import { type ErrorResponse, handleRouteError } from "../utils/error.handler.js";

const router = Router();

router.get("/users/:id", async (req: Request<GetUserParams>, res: Response<User | ErrorResponse>) => {
  try {
    const { id } = req.params;
    const result = await getUser(id);
    res.status(200).json(result);
  } catch (error) {
    handleRouteError(error, res, "GET /users/:id endpoint");
  }
});

router.post(
  "/users",
  async (req: Request<unknown, unknown, CreateUserRequest>, res: Response<User | ErrorResponse>) => {
    try {
      const result = await createUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      handleRouteError(error, res, "POST /users endpoint");
    }
  },
);

router.put(
  "/users/:id",
  async (req: Request<GetUserParams, unknown, UpdateUserRequest>, res: Response<User | ErrorResponse>) => {
    try {
      const { id } = req.params;
      const result = await updateUser(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      handleRouteError(error, res, "PUT /users/:id endpoint");
    }
  },
);

router.delete("/users/:id", async (req: Request<GetUserParams>, res: Response<DeleteUserResponse | ErrorResponse>) => {
  try {
    const { id } = req.params;
    const result = await deleteUser(id);
    res.status(200).json({ success: result });
  } catch (error) {
    handleRouteError(error, res, "DELETE /users/:id endpoint");
  }
});

router.get("/users", async (req: Request, res: Response<ListUsersResponse | ErrorResponse>) => {
  try {
    const { page, pageSize, sortBy, filter } = req.query;
    const result = await listUsers({
      page: Number(page),
      pageSize: Number(pageSize),
      sortBy: typeof sortBy === "string" ? sortBy : undefined,
      filter: typeof filter === "string" ? filter : undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    handleRouteError(error, res, "GET /users endpoint");
  }
});

export const userRoutes: Router = router;
