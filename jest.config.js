/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/server/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext',
        moduleResolution: 'node'
      }
    }]
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@services/(.*)$': '<rootDir>/server/services/$1',
    '^@storage$': '<rootDir>/server/storage.ts',
    '^@schema$': '<rootDir>/shared/schema.ts',
    '^@utils/(.*)$': '<rootDir>/server/utils/$1'
  },
  collectCoverageFrom: [
    'server/**/*.ts',
    '!server/tests/**',
    '!server/**/*.d.ts',
    '!server/**/*.test.ts',
    '!server/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/server/tests/setup.ts'],
  testTimeout: 30000,
  maxWorkers: '50%',
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
