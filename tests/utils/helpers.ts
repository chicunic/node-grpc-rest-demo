/**
 * Test helper functions
 */
import { isUUID } from "class-validator";
import type { Response } from "supertest";

export function expectValidUUID(uuid: string): void {
  expect(isUUID(uuid, "4")).toBe(true);
}

export function expectValidISOString(dateString: string): void {
  const date = new Date(dateString);
  expect(date.getTime()).not.toBeNaN();
  expect(date.toISOString()).toBe(dateString);
}

export const restAssert = {
  expectSuccess(response: Response, expectedStatus = 200): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toBeDefined();
  },

  expectError(response: Response, expectedStatus: number, expectedMessage?: string): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.body.error).toBeDefined();
    if (expectedMessage) {
      expect(response.body.error).toContain(expectedMessage);
    }
  },
};
