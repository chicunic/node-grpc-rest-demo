import { Request, Response, Router } from 'express';

import { createUser, deleteUser, getUser, listUsers, updateUser } from '../services/user.service';
import {
  CreateUserRequest,
  DeleteUserResponse,
  GetUserParams,
  ListUsersQuery,
  ListUsersResponse,
  UpdateUserRequest,
  User,
} from '../types/user.types';
import { ErrorResponse, handleRouteError } from '../utils/error.handler';

const router = Router();

// Get user by ID
router.get('/users/:id', async (req: Request<GetUserParams>, res: Response<User | ErrorResponse>) => {
  try {
    const { id } = req.params;
    const result = await getUser(id);
    res.status(200).json(result);
  } catch (error) {
    handleRouteError(error, res, 'GET /users/:id endpoint');
  }
});

// Create new user
router.post('/users', async (req: Request<CreateUserRequest>, res: Response<User | ErrorResponse>) => {
  try {
    const { username, email, fullName } = req.body;
    const result = await createUser({ username, email, fullName });
    res.status(201).json(result);
  } catch (error) {
    handleRouteError(error, res, 'POST /users endpoint');
  }
});

// Update user
router.put(
  '/users/:id',
  async (req: Request<GetUserParams, unknown, UpdateUserRequest>, res: Response<User | ErrorResponse>) => {
    try {
      const { id } = req.params;
      const result = await updateUser(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      handleRouteError(error, res, 'PUT /users/:id endpoint');
    }
  }
);

// Delete user
router.delete('/users/:id', async (req: Request<GetUserParams>, res: Response<DeleteUserResponse | ErrorResponse>) => {
  try {
    const { id } = req.params;
    const result = await deleteUser(id);
    res.status(200).json({ success: result });
  } catch (error) {
    handleRouteError(error, res, 'DELETE /users/:id endpoint');
  }
});

// List users
router.get(
  '/users',
  async (req: Request<unknown, unknown, unknown, ListUsersQuery>, res: Response<ListUsersResponse | ErrorResponse>) => {
    try {
      const { page, pageSize, sortBy, filter } = req.query;
      const result = await listUsers({ page, pageSize, sortBy, filter });
      res.status(200).json(result);
    } catch (error) {
      handleRouteError(error, res, 'GET /users endpoint');
    }
  }
);

export const userRoutes: Router = router;
