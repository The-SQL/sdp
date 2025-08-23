import { updateSession } from "../utils/supabase/middleware";

// Mock Supabase client
let cookieMethods: any;

jest.mock("@supabase/ssr", () => {
  return {
    createServerClient: jest.fn((url, key, options) => {
      // Store cookie methods for later use
      cookieMethods = options.cookies;
      
      // Simulate the cookie getter being called by Supabase
      options.cookies.get("sb-access-token");
      options.cookies.get("sb-refresh-token");
      
      return {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ 
            data: { user: { id: "123" } }, 
            error: null 
          })),
        },
      };
    }),
  };
});

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(() => ({
      cookies: {
        set: jest.fn(),
      },
    })),
  },
}));

describe("updateSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cookieMethods = null;
  });

  it("should call supabase auth and return a NextResponse", async () => {
    const request = {
      headers: new Headers(),
      cookies: {
        get: jest.fn().mockImplementation((name) => {
          if (name === "sb-access-token" || name === "sb-refresh-token") {
            return { value: "test_cookie" };
          }
          return null;
        }),
      },
    } as any;

    const response = await updateSession(request);

    // Supabase client should have been created
    const { createServerClient } = require("@supabase/ssr");
    expect(createServerClient).toHaveBeenCalled();

    // Request cookies get should have been called for Supabase tokens
    expect(request.cookies.get).toHaveBeenCalledWith("sb-access-token");
    expect(request.cookies.get).toHaveBeenCalledWith("sb-refresh-token");

    // NextResponse.next should have been called
    const { NextResponse } = require("next/server");
    expect(NextResponse.next).toHaveBeenCalled();

    // Response should have cookies set method
    expect(response.cookies.set).toBeDefined();
  });

  it("should handle cookie set operations when triggered", async () => {
    const request = {
      headers: new Headers(),
      cookies: {
        get: jest.fn().mockReturnValue(null),
        set: jest.fn(),
      },
    } as any;

    await updateSession(request);
    
    // Manually trigger the set method to test it
    cookieMethods.set("test-cookie", "test-value", { httpOnly: true, maxAge: 3600 });
    
    // Verify request.cookies.set was called
    expect(request.cookies.set).toHaveBeenCalledWith({
      name: "test-cookie",
      value: "test-value",
      httpOnly: true,
      maxAge: 3600,
    });
  });

  it("should handle cookie remove operations when triggered", async () => {
    const request = {
      headers: new Headers(),
      cookies: {
        get: jest.fn().mockReturnValue(null),
        set: jest.fn(),
      },
    } as any;

    await updateSession(request);
    
    // Manually trigger the remove method to test it
    cookieMethods.remove("test-cookie", { httpOnly: true });
    
    // Verify request.cookies.set was called with empty value
    expect(request.cookies.set).toHaveBeenCalledWith({
      name: "test-cookie",
      value: "",
      httpOnly: true,
    });
  });
});