import '@testing-library/jest-dom'

// jest.setup.js
beforeAll(() => {
  // silence warnings
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  // silence specific noisy errors but keep real ones:
  const origError = console.error;
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const msg = String(args[0] || '');
    // ignore only expected/react act/deprecation messages
    if (/act\(|deprecated|Some expected warning text/i.test(msg)) return;
    origError(...args);
  });
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