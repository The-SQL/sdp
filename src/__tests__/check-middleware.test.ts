// check-middleware.test.ts
jest.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: jest.fn(() => () => new Response("OK")),
  createRouteMatcher: jest.fn(() => {
    return () => false;
  }),
}));

import middleware, { config } from "@/middleware";

describe("clerkMiddleware wrapper", () => {
  it("should export a default handler", () => {
    expect(middleware).toBeDefined();
    expect(typeof middleware).toBe("function");
  });

  it("config should have a matcher array", () => {
    expect(config).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
    expect(config.matcher.length).toBeGreaterThan(0);
  });
});
