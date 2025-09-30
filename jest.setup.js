import '@testing-library/jest-dom'

// jest.setup.js
beforeAll(() => {
});
afterAll(() => {
  (console.warn?.mockRestore?.());
  (console.error?.mockRestore?.());
});

// Restore console after all tests
afterAll(() => {
  jest.restoreAllMocks();
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock date-fns to avoid timezone issues
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 days ago'),
}));