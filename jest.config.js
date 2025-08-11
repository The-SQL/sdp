const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  // Tell Jest where to collect coverage from
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',           // all TypeScript files in src/
    '!src/**/*.d.ts',              // ignore type declaration files
    '!src/**/__tests__/**',        // ignore test files
    '!src/**/types/**',            // ignore any type folders
  ],

  coverageDirectory: 'coverage',   // where reports are stored
  coverageReporters: ['text', 'lcov', 'clover'], // formats for GitHub & Codecov
};

module.exports = createJestConfig(customJestConfig);
