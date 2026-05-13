import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/specs/integration/**/*.test.ts"],

    testTimeout: 15000,
    fileParallelism: false,
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
    restoreMocks: false,
  },
});
