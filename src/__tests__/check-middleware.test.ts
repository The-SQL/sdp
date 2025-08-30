// check-middleware.test.ts
jest.mock("@clerk/nextjs/server", () => ({
    clerkMiddleware: jest.fn((handler?: any) => {
      return async (authOrReq?: any, maybeReq?: any) => {
        // Normalize to call your handler as (auth, req)
        const auth = { protect: jest.fn() };
        const req = maybeReq ?? authOrReq;
        return handler ? handler(auth, req) : new Response("OK");
      };
    }),
    createRouteMatcher: jest.fn(() => {
      // Return a matcher that checks req.nextUrl.pathname against patterns
      return () => true;
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