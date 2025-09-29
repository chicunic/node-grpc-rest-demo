/**
 * User Service - REST API Integration Tests
 * Tests complete REST service using real server implementation with minimal mocking
 */
import { beforeAll, describe, expect, it } from '@jest/globals';
import express from 'express';

import { LIST_USERS, TEST_FAKE_UUID, TEST_PAGINATION, TEST_USER } from '../../utils/data';
import { expectValidISOString, expectValidUUID, restAssert } from '../../utils/helpers';
import { RestTestHelper, createCompleteTestApp } from '../../utils/server.rest';

interface UserData {
  username: string;
  email: string;
  fullName: string;
}

interface UserResponse extends UserData {
  id: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

describe('User - REST Integration', () => {
  let app: express.Application;
  let helper: RestTestHelper;
  let userId: string;

  beforeAll(async () => {
    app = await createCompleteTestApp();
    helper = new RestTestHelper(app);
  });

  describe('User CRUD Flow - REST Integration', () => {
    it('should create a new user successfully', async () => {
      const userData = TEST_USER;

      const response = await helper.post('/api/v1/users', userData);

      restAssert.expectSuccess(response, 201);
      expect(response.body.id).toBeDefined();
      expectValidUUID(response.body.id);
      expect(response.body.username).toBe(userData.username);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.fullName).toBe(userData.fullName);
      expect(response.body.isActive).toBe(true);
      expectValidISOString(response.body.createdAt);
      expectValidISOString(response.body.updatedAt);

      // Save userId for subsequent tests
      userId = response.body.id;
    });

    it('should get the created user by ID successfully', async () => {
      const response = await helper.get(`/api/v1/users/${userId}`);

      restAssert.expectSuccess(response, 200);
      expect(response.body.id).toBe(userId);
      expect(response.body.username).toBe(TEST_USER.username);
      expect(response.body.email).toBe(TEST_USER.email);
      expect(response.body.fullName).toBe(TEST_USER.fullName);
      expect(response.body.isActive).toBe(true);
    });

    it('should update the user successfully', async () => {
      const updateData = {
        fullName: 'Updated Full Name',
        isActive: false,
      };
      const response = await helper.put(`/api/v1/users/${userId}`, updateData);

      restAssert.expectSuccess(response, 200);
      expect(response.body.id).toBe(userId);
      expect(response.body.username).toBe(TEST_USER.username); // unchanged
      expect(response.body.email).toBe(TEST_USER.email); // unchanged
      expect(response.body.fullName).toBe(updateData.fullName);
      expect(response.body.isActive).toBe(updateData.isActive);
    });

    it('should allow partial updates on the user', async () => {
      const updateData = {
        email: 'newemail@example.com',
      };
      const response = await helper.put(`/api/v1/users/${userId}`, updateData);

      restAssert.expectSuccess(response, 200);
      expect(response.body.email).toBe(updateData.email);
      expect(response.body.username).toBe(TEST_USER.username); // unchanged
      // fullName should be from previous update
      expect(response.body.fullName).toBe('Updated Full Name');
    });

    it('should delete the user successfully', async () => {
      const response = await helper.delete(`/api/v1/users/${userId}`);

      restAssert.expectSuccess(response, 200);
      expect(response.body.success).toBe(true);

      // Verify user is deleted
      const getResponse = await helper.get(`/api/v1/users/${userId}`);
      restAssert.expectError(getResponse, 404);
    });
  });

  describe('Error Handling - REST Integration', () => {
    it('should return 404 for non-existent user operations', async () => {
      // Test GET
      const getResponse = await helper.get(`/api/v1/users/${TEST_FAKE_UUID}`);
      restAssert.expectError(getResponse, 404, 'User not found');

      // Test UPDATE
      const updateData = { fullName: 'New Name' };
      const updateResponse = await helper.put(`/api/v1/users/${TEST_FAKE_UUID}`, updateData);
      restAssert.expectError(updateResponse, 404, 'User not found');

      // Test DELETE
      const deleteResponse = await helper.delete(`/api/v1/users/${TEST_FAKE_UUID}`);
      restAssert.expectError(deleteResponse, 404, 'User not found');
    });
  });

  describe('ListUsers - REST Integration', () => {
    beforeAll(async () => {
      // Create multiple users for list testing
      const users = LIST_USERS;

      for (const user of users) {
        await helper.post('/api/v1/users', user);
      }
    });

    it('should list users with default pagination', async () => {
      const response = await helper.get('/api/v1/users?page=1&pageSize=10');

      restAssert.expectSuccess(response, 200);
      expect(response.body.users).toBeInstanceOf(Array);
      expect(response.body.totalCount).toBeGreaterThanOrEqual(3);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
    });

    it('should support custom pagination', async () => {
      const response = await helper.get(
        `/api/v1/users?page=${TEST_PAGINATION.DEFAULT_PAGE}&pageSize=${TEST_PAGINATION.SMALL_PAGE_SIZE}`
      );

      restAssert.expectSuccess(response, 200);
      expect(response.body.users).toBeInstanceOf(Array);
      expect(response.body.users.length).toBeLessThanOrEqual(TEST_PAGINATION.SMALL_PAGE_SIZE);
      expect(response.body.page).toBe(TEST_PAGINATION.DEFAULT_PAGE);
      expect(response.body.pageSize).toBe(TEST_PAGINATION.SMALL_PAGE_SIZE);
    });

    it('should support sorting', async () => {
      const response = await helper.get(`/api/v1/users?sortBy=username&page=1&pageSize=10`);

      restAssert.expectSuccess(response, 200);
      expect(response.body.users).toBeInstanceOf(Array);

      // Check if sorted by username
      expect(response.body.users.length).toBeGreaterThan(1);
      for (let i = 0; i < response.body.users.length - 1; i++) {
        const currentUsername = response.body.users[i].username;
        const nextUsername = response.body.users[i + 1].username;
        expect(currentUsername.localeCompare(nextUsername)).toBeLessThanOrEqual(0);
      }
    });

    it('should support filtering', async () => {
      const response = await helper.get(`/api/v1/users?filter=alice&page=1&pageSize=10`);

      restAssert.expectSuccess(response, 200);
      expect(response.body.users).toBeInstanceOf(Array);

      // Check if filtered results contain 'alice'
      response.body.users.forEach((user: UserResponse) => {
        const userString = JSON.stringify(user).toLowerCase();
        expect(userString).toContain('alice');
      });
    });
  });
});
