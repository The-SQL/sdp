import { createClient } from "@/utils/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";

// Mock Supabase server client
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

// Mock Next.js cookies helper
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("createClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fake.supabase.url";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "fake-anon-key";
  });

  it("calls createServerClient with correct env vars and cookie methods", async () => {
    const mockCookieStore = {
      getAll: jest.fn().mockReturnValue([{ name: "sb-token", value: "abc" }]),
      set: jest.fn(),
    };
    (nextCookies as jest.Mock).mockResolvedValue(mockCookieStore);

    await createClient();

    expect(createServerClient).toHaveBeenCalledWith(
      "https://fake.supabase.url",
      "fake-anon-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );

    // Verify getAll calls the cookie store
    const cookieArg = (createServerClient as jest.Mock).mock.calls[0][2].cookies.getAll();
    expect(cookieArg).toEqual([{ name: "sb-token", value: "abc" }]);
  });

  it("setAll method calls cookieStore.set for each cookie", async () => {
    const mockCookieStore = {
      getAll: jest.fn(),
      set: jest.fn(),
    };
    (nextCookies as jest.Mock).mockResolvedValue(mockCookieStore);

    const client = await createClient();

    const cookiesToSet = [
      { name: "a", value: "1", options: { httpOnly: true } },
      { name: "b", value: "2", options: { secure: true } },
    ];

    (createServerClient as jest.Mock).mock.calls[0][2].cookies.setAll(cookiesToSet);

    expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
    expect(mockCookieStore.set).toHaveBeenCalledWith("a", "1", { httpOnly: true });
    expect(mockCookieStore.set).toHaveBeenCalledWith("b", "2", { secure: true });
  });

  it("does not throw if setAll is called in a context that throws", async () => {
    const mockCookieStore = {
      getAll: jest.fn(),
      set: jest.fn().mockImplementation(() => {
        throw new Error("cannot set in server component");
      }),
    };
    (nextCookies as jest.Mock).mockResolvedValue(mockCookieStore);

    const client = await createClient();

    const cookiesToSet = [{ name: "x", value: "y", options: {} }];
    
    // Should not throw even if cookieStore.set fails
    expect(() =>
      (createServerClient as jest.Mock).mock.calls[0][2].cookies.setAll(cookiesToSet)
    ).not.toThrow();
  });
});
