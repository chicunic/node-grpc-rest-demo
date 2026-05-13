import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.spec.ts"],
    exclude: ["tests/specs/integration/**"],

    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{ts,js}"],
      exclude: ["src/**/*.d.ts", "src/index.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },

    testTimeout: 15000,
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
    restoreMocks: false,
  },
});
