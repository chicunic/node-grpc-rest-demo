/**
 * User Service - REST Parameter Validator Tests
 * Tests parameter validation using real server implementation with service layer mocking
 */
// Enable service mocks BEFORE any other imports
import { beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import express from 'express';

import { TEST_FAKE_UUID } from '../../utils/data';
import { enableUserServiceMock, mockUserService } from '../../utils/mock.index';
import { RestTestHelper, createCompleteTestApp } from '../../utils/server.rest';

enableUserServiceMock();

describe('User Service - REST Parameter Validator', () => {
  let app: express.Application;
  let helper: RestTestHelper;

  beforeAll(async () => {
    app = await createCompleteTestApp();
    helper = new RestTestHelper(app);
  });

  beforeEach(() => {
    mockUserService.reset();
    mockUserService.setup();
  });

  describe('POST /api/v1/users - Parameter Validator', () => {
    it('should reject request with missing username', async () => {
      const invalidRequest = {
        // username missing
        email: 'test@example.com',
        fullName: 'Test User',
      };

      const response = await helper.post('/api/v1/users', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("required property 'username'");
    });

    it('should reject request with empty username', async () => {
      const invalidRequest = {
        username: '',
        email: 'test@example.com',
        fullName: 'Test User',
      };

      const response = await helper.post('/api/v1/users', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('username');
    });

    it('should reject request with username too short', async () => {
      const invalidRequest = {
        username: 'ab', // Invalid: less than 3 characters
        email: 'test@example.com',
        fullName: 'Test User',
      };

      const response = await helper.post('/api/v1/users', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('username');
    });

    it('should reject request with username too long', async () => {
      const invalidRequest = {
        username: 'a'.repeat(51), // Invalid: more than 50 characters
        email: 'test@example.com',
        fullName: 'Test User',
      };

      const response = await helper.post('/api/v1/users', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('username');
    });

    it('should reject request with non-string username', async () => {
      const invalidRequest = {
        username: 123,
        email: 'test@example.com',
        fullName: 'Test User',
      };

      const response = await helper.post('/api/v1/users', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('username');
      expect(response.body.error).toContain('string');
    });

    it('should reject request with missing email', async () => {
      const invalidRequest = {
        username: 'testuser',
        // email missing
        fullName: 'Test User',
      };

      const response = await helper.post('/api/v1/users', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("required property 'email'");
    });

    it('should reject request with invalid email format', async () => {
      const invalidRequest = {
        username: 'testuser',
        email: 'invalid-email-format',
        fullName: 'Test User',
      };

      const response = await helper.post('/api/v1/users', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });

    it('should reject request with non-string email', async () => {
      const invalidRequest = {
        username: 'testuser',
        email: 123,
        fullName: 'Test User',
      };

      const response = await helper.post('/api/v1/users', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
      expect(response.body.error).toContain('string');
    });

    it('should reject request with missing fullName', async () => {
      const invalidRequest = {
        username: 'testuser',
        email: 'test@example.com',
        // fullName missing
      };

      const response = await helper.post('/api/v1/users', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("required property 'fullName'");
    });

    it('should reject request with fullName too long', async () => {
      const invalidRequest = {
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'a'.repeat(101), // Invalid: more than 100 characters
      };

      const response = await helper.post('/api/v1/users', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('fullName');
    });

    it('should reject request with non-string fullName', async () => {
      const invalidRequest = {
        username: 'testuser',
        email: 'test@example.com',
        fullName: 123,
      };

      const response = await helper.post('/api/v1/users', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('fullName');
      expect(response.body.error).toContain('string');
    });

    it('should accept valid CreateUser request', async () => {
      const validRequest = {
        username: 'testuser123',
        email: 'test@example.com',
        fullName: 'Test User',
      };

      const response = await helper.post('/api/v1/users', validRequest);

      // Should pass validation and return success status
      expect(response.status).toBe(201);
      expect(mockUserService.createUser).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/users/:id - Parameter Validator', () => {
    it('should reject request with invalid UUID format', async () => {
      const response = await helper.get('/api/v1/users/invalid-uuid-format');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('id');
    });

    it('should reject request with non-UUID string', async () => {
      const response = await helper.get('/api/v1/users/not-a-uuid');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('id');
    });

    it('should accept valid GetUser request', async () => {
      const response = await helper.get(`/api/v1/users/${TEST_FAKE_UUID}`);

      // Should pass validation and return success
      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/v1/users/:id - Parameter Validator', () => {
    it('should reject request with invalid UUID format', async () => {
      const validData = {
        username: 'newusername',
      };

      const response = await helper.put('/api/v1/users/invalid-uuid-format', validData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('id');
    });

    it('should reject request with invalid username in body', async () => {
      const invalidRequest = {
        username: 'ab', // Invalid: too short
      };

      const response = await helper.put(`/api/v1/users/${TEST_FAKE_UUID}`, invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('username');
    });

    it('should reject request with invalid email in body', async () => {
      const invalidRequest = {
        email: 'invalid-email',
      };

      const response = await helper.put(`/api/v1/users/${TEST_FAKE_UUID}`, invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });

    it('should reject request with invalid fullName in body', async () => {
      const invalidRequest = {
        fullName: 'a'.repeat(101), // Invalid: too long
      };

      const response = await helper.put(`/api/v1/users/${TEST_FAKE_UUID}`, invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('fullName');
    });

    it('should reject request with invalid isActive in body', async () => {
      const invalidRequest = {
        isActive: 'not-a-boolean',
      };

      const response = await helper.put(`/api/v1/users/${TEST_FAKE_UUID}`, invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('isActive');
      expect(response.body.error).toContain('boolean');
    });

    it('should reject request with missing data', async () => {
      const response = await helper.put(`/api/v1/users/${TEST_FAKE_UUID}`, {});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('fewer than 1 properties');
    });

    it('should accept valid UpdateUser request with all fields', async () => {
      const validRequest = {
        username: 'newusername',
        email: 'newemail@example.com',
        fullName: 'New Full Name',
        isActive: false,
      };

      const response = await helper.put(`/api/v1/users/${TEST_FAKE_UUID}`, validRequest);

      // Should pass validation and return success
      expect(response.status).toBe(200);
    });

    it('should accept valid UpdateUser request with partial fields', async () => {
      const validRequest = {
        email: 'newemail@example.com',
      };

      const response = await helper.put(`/api/v1/users/${TEST_FAKE_UUID}`, validRequest);

      // Should pass validation and return success
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/users/:id - Parameter Validator', () => {
    it('should reject request with invalid UUID format', async () => {
      const response = await helper.delete('/api/v1/users/invalid-uuid-format');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('id');
    });

    it('should accept valid DeleteUser request', async () => {
      const response = await helper.delete(`/api/v1/users/${TEST_FAKE_UUID}`);

      // Should pass validation and return success
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/users - Parameter Validator', () => {
    it('should reject request with missing page parameter', async () => {
      const response = await helper.get('/api/v1/users?pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('page');
    });

    it('should reject request with missing pageSize parameter', async () => {
      const response = await helper.get('/api/v1/users?page=1');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pageSize');
    });

    it('should reject request with filter too long', async () => {
      const longFilter = 'a'.repeat(101);
      const response = await helper.get(`/api/v1/users?filter=${longFilter}&page=1&pageSize=10`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('filter');
    });

    it('should reject request with invalid page type', async () => {
      const response = await helper.get('/api/v1/users?page=not-a-number&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('page');
    });

    it('should reject request with page less than 1', async () => {
      const response = await helper.get('/api/v1/users?page=0&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('page');
    });

    it('should reject request with page greater than 10000', async () => {
      const response = await helper.get('/api/v1/users?page=10001&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('page');
    });

    it('should reject request with invalid pageSize type', async () => {
      const response = await helper.get('/api/v1/users?page=1&pageSize=not-a-number');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pageSize');
    });

    it('should reject request with pageSize less than 1', async () => {
      const response = await helper.get('/api/v1/users?page=1&pageSize=0');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pageSize');
    });

    it('should reject request with pageSize greater than 100', async () => {
      const response = await helper.get('/api/v1/users?page=1&pageSize=101');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pageSize');
    });

    it('should reject request with negative page', async () => {
      const response = await helper.get('/api/v1/users?page=-1&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('page');
    });

    it('should reject request with negative pageSize', async () => {
      const response = await helper.get('/api/v1/users?page=1&pageSize=-1');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pageSize');
    });

    it('should reject request with decimal page', async () => {
      const response = await helper.get('/api/v1/users?page=1.5&pageSize=10');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('page');
    });

    it('should reject request with decimal pageSize', async () => {
      const response = await helper.get('/api/v1/users?page=1&pageSize=10.5');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pageSize');
    });

    it('should accept valid ListUsers request with all parameters', async () => {
      const response = await helper.get('/api/v1/users?sortBy=username&filter=test&page=1&pageSize=10');

      // Should pass validation and return success
      expect(response.status).toBe(200);
    });

    it('should accept valid ListUsers request with required parameters only', async () => {
      const response = await helper.get('/api/v1/users?page=2&pageSize=5');

      // Should pass validation and return success
      expect(response.status).toBe(200);
    });
  });
});
