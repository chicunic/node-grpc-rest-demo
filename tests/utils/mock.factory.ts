/**
 * Mock Factory Utilities
 */
import { vi } from "vitest";

export function createMock(): ReturnType<typeof vi.fn> {
  return vi.fn();
}
