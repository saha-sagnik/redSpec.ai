module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'agents/**/*.py',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testTimeout: 30000, // 30 seconds for E2E tests
  verbose: true,
};
