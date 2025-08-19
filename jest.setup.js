import '@testing-library/jest-dom'

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

// Restore console after all tests
afterAll(() => {
  jest.restoreAllMocks();
});