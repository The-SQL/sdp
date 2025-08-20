import { createClient } from "@/utils/supabase/client";
import { createBrowserClient } from "@supabase/ssr";

// Mock the Supabase browser client
jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(),
}));

describe("createClient", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV }; // reset env
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fake.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  afterAll(() => {
    process.env = OLD_ENV; // restore original env
  });

  it("calls createBrowserClient with correct environment variables", () => {
    createClient();
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://fake.supabase.co",
      "anon-key"
    );
  });

  it("returns the client instance from createBrowserClient", () => {
    const fakeClient = { query: jest.fn() };
    (createBrowserClient as jest.Mock).mockReturnValue(fakeClient);

    const client = createClient();
    expect(client).toBe(fakeClient);
  });

  it("throws if environment variables are missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createClient()).toThrow();
  });
});
