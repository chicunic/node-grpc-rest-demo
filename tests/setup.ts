import { afterAll, beforeAll, vi } from "vitest";

process.env.NODE_ENV = "test";

// Expected error patterns in structured logs to suppress during tests
const expectedErrors = ["Product not found", "User not found", "gRPC Error"];

function shouldSuppressLog(message: string): boolean {
  return expectedErrors.some((pattern) => message.includes(pattern));
}

const originalStdoutWrite = process.stdout.write.bind(process.stdout);

beforeAll(() => {
  process.stdout.write = vi.fn((...args: Parameters<typeof originalStdoutWrite>) => {
    const [chunk] = args;
    const message = typeof chunk === "string" ? chunk : String(chunk);

    if (!shouldSuppressLog(message)) {
      return originalStdoutWrite(...args);
    }

    // Maintain async callback behavior for suppressed logs
    const callback = args[args.length - 1];
    if (typeof callback === "function") {
      callback();
    }
    return true;
  }) as typeof process.stdout.write;
});

afterAll(() => {
  process.stdout.write = originalStdoutWrite;
});
