/**
 * Jest setup file for global test configuration
 * This file runs before all tests and sets up global mocks and configurations
 */
import { afterAll, beforeAll, jest } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';

// Expected error patterns that should be suppressed (from Winston logs)
const expectedErrors: string[] = ['Product not found', 'User not found', 'gRPC Error'];

const shouldSuppressWinstonLog = (message: string): boolean => {
  return expectedErrors.some(pattern => message.includes(pattern));
};

const originalStdoutWrite = process.stdout.write;

beforeAll(() => {
  // Mock stdout to suppress expected Winston error logs
  process.stdout.write = jest.fn((...args: Parameters<typeof originalStdoutWrite>) => {
    const [chunk] = args;
    const message = typeof chunk === 'string' ? chunk : String(chunk);

    // Let through non-error logs and unexpected errors
    if (!shouldSuppressWinstonLog(message)) {
      return originalStdoutWrite.apply(process.stdout, args);
    }

    // Maintain async callback behavior for suppressed logs
    const callback = args[args.length - 1];
    if (typeof callback === 'function') {
      callback();
    }
    return true;
  }) as typeof originalStdoutWrite;
});

afterAll(() => {
  // Restore original stdout
  process.stdout.write = originalStdoutWrite;
});

export {};
