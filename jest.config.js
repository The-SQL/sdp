const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

   moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // 👈 maps @/... to your src folder
  },

  // Tell Jest where to collect coverage from
  collectCoverage: true,
  collectCoverageFrom: [
    'src/utils/db/client.ts',
    'src/utils/db/server.ts',
    'src/utils/db/forum.ts',
    '!src/utils/types/**',
    '!src/utils/supabase/**',
    '!src/utils/**/__mocks__/**',
    '!src/app/api/**/*.ts',
    'src/lib/**/*.ts',
    '!src/lib/types/**',
    '!src/lib/**/__mocks__/**',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/components/**',
    '!**/*.config.*',
    '!**/jest.config.js',
    '!**/jest.setup.js',
    '!**/next.config.ts',
    '!**/tsconfig.json',
    '!**/package.json',
    '!**/postcss.config.*',
    '!**/eslint.config.*',
    '!**/next-env.d.ts',
    '!**/README.md',
    '!**/components.json',
    '!coverage/**',
    '!public/**',
    '!**/__mocks__/**',
    '!**/mock/**',
  ],

  coverageDirectory: 'coverage',   // where reports are stored
  coverageReporters: ['text', 'lcov', 'clover'], // formats for GitHub & Codecov
};

module.exports = createJestConfig(customJestConfig);
