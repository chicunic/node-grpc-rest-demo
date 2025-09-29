/**
 * Mock Factory Utilities
 * Generic utilities for creating mock objects
 */
import { jest } from '@jest/globals';

// Create Jest mock functions
export function createJestMock(): jest.Mock {
  return jest.fn();
}

// Create simple Jest module mock
export function createSimpleModuleMock(modulePath: string, mockImplementations: Record<string, unknown>): typeof jest {
  return jest.unstable_mockModule(modulePath, () => mockImplementations);
}
