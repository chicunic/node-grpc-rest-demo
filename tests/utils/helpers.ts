/**
 * Test helper functions
 */
import { expect } from '@jest/globals';
import { isUUID } from 'class-validator';
import { Response } from 'supertest';

// Jest matchers for validation (using patterns from src/swagger.json and class-validator)
export const expectValidUUID = (uuid: string): void => expect(isUUID(uuid, '4')).toBe(true);

export const expectValidISOString = (dateString: string): void => {
  const date = new Date(dateString);
  // Check if it's a valid date
  expect(date.getTime()).not.toBeNaN();
  // Check if it matches ISO format by round-trip conversion
  expect(date.toISOString()).toBe(dateString);
};

// REST API response assertions
export const restAssert = {
  // Validate success response
  expectSuccess(response: Response, expectedStatus = 200): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toBeDefined();
  },

  // Validate error response
  expectError(response: Response, expectedStatus: number, expectedMessage?: string): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.body.error).toBeDefined();
    if (expectedMessage) {
      expect(response.body.error).toContain(expectedMessage);
    }
  },
};
