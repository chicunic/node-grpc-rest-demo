/** @type {import('jest').Config} */
export default {
  // Enable ESM support
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],

  // TypeScript support
  testEnvironment: 'node',

  // Test file paths
  roots: ['<rootDir>/tests'],
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.spec.ts'],

  // Coverage configuration
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts', '!src/index.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Module path mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },

  // Timeout and concurrency settings
  testTimeout: 15000,
  maxWorkers: '50%',

  // Test result display
  displayName: 'Node gRPC REST Demo Tests',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Mock cleanup
  clearMocks: true,
  restoreMocks: true,

  // TypeScript transformation
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        useESM: true,
      },
    ],
  },

  // Ignore transformed modules
  transformIgnorePatterns: ['node_modules/(?!(uuid|@grpc/.*)/)'],
};
