// ESLint imports
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';

export default [
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', 'coverage/**'],
  },

  // Base TypeScript configuration for all TS files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.eslint.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
    },
    rules: {
      // TypeScript recommended rules
      ...typescript.configs.recommended.rules,

      // General JavaScript/TypeScript rules
      'object-shorthand': ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off', // Handled by TypeScript ESLint

      // Import/export rules
      'import/no-duplicates': 'error',
      'import/no-unused-modules': 'warn',

      // TypeScript specific rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_|^req$|^res$|^next$',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        {
          allowArgumentsExplicitlyTypedAsAny: false,
          allowDirectConstAssertionInArrowFunctions: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
    },
  },

  // Source code specific rules (stricter for production code)
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // Production code should avoid console logs
      // 'no-console': 'warn', // Commented out for development convenience

      // Modern TypeScript practices
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
    },
  },

  // Test utilities and setup files (more lenient)
  {
    files: ['tests/utils/**/*.ts', 'tests/domain/**/*.ts', 'tests/setup.ts'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        expect: 'readonly',
      },
    },
    rules: {
      // Allow console logs in test utilities
      'no-console': 'off',

      // Allow namespaces for Jest type extensions
      '@typescript-eslint/no-namespace': 'off',
    },
  },

  // Test files (Jest rules enabled)
  {
    files: [
      'tests/specs/**/*.test.ts',
      'tests/specs/**/*.spec.ts',
      '**/__tests__/**/*.ts',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
    languageOptions: {
      globals: {
        ...jest.environments.globals.globals,
      },
    },
    plugins: {
      jest,
    },
    rules: {
      // Jest recommended rules
      ...jest.configs.recommended.rules,

      // Test-specific rule adjustments
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/no-commented-out-tests': 'warn',
      'jest/no-jasmine-globals': 'error',
      'jest/no-conditional-expect': 'warn', // Allow try-catch expect patterns
      'jest/expect-expect': [
        'warn',
        {
          assertFunctionNames: [
            'expect',
            'restAssert.expectSuccess',
            'restAssert.expectError',
            'expectValidUUID',
            'expectValidISOString',
          ],
        },
      ],

      // Allow console logs in tests
      'no-console': 'off',
    },
  },

  // Prettier config (must be last to override conflicting rules)
  prettier,
];
