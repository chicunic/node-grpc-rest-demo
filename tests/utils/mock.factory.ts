/**
 * Mock Factory Utilities
 */
import { jest } from '@jest/globals';

export function createJestMock(): jest.Mock {
  return jest.fn();
}

export function createModuleMock(modulePath: string, implementations: Record<string, unknown>): typeof jest {
  return jest.unstable_mockModule(modulePath, () => implementations);
}
