import { insertUser, checkUserExists } from "@/utils/db/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { makeSupabaseMock } from "../__mocks__/supabase";

// Mock both server and client supabase modules
jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock the profile functions to avoid side effects in tests
jest.mock("@/utils/db/profile", () => ({
  updateUserStreak: jest.fn().mockResolvedValue({ current_streak: 1, longest_streak: 1 }),
  ensureUserInitialized: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock the profile functions to avoid side effects in tests
jest.mock("@/utils/db/profile", () => ({
  updateUserStreak: jest.fn().mockResolvedValue({ current_streak: 1, longest_streak: 1 }),
  ensureUserInitialized: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock the profile functions to avoid side effects in tests
jest.mock("@/utils/db/profile", () => ({
  updateUserStreak: jest.fn().mockResolvedValue({ current_streak: 1, longest_streak: 1 }),
  ensureUserInitialized: jest.fn().mockResolvedValue(undefined),
}));

describe("db helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- insertUser ----------
  describe("insertUser", () => {
    it("inserts a user and returns inserted rows on success", async () => {
      // Arrange: configure Supabase to succeed for insert().select()
      const fakeInserted = [{ clerk_id: "c1", name: "N", email: "e@x.com" }];
      const mock = makeSupabaseMock({
        insertSelect: { data: fakeInserted, error: null },
      });
      (createServerClient as jest.Mock).mockResolvedValue(mock.client);

      // Act
      const result = await insertUser("c1", "N", "e@x.com");

      // Assert
      expect(mock.from).toHaveBeenCalledWith("users");
      expect(mock.insert).toHaveBeenCalledWith([
        { clerk_id: "c1", name: "N", email: "e@x.com" },
      ]);
      expect(mock.selectAfterInsert).toHaveBeenCalled();
      expect(result).toEqual(fakeInserted);
    });

    it("throws when Supabase insert fails", async () => {
      // Arrange: simulate Supabase error
      const err = new Error("insert failed");
      const mock = makeSupabaseMock({
        insertSelect: { data: null, error: err },
      });
      (createServerClient as jest.Mock).mockResolvedValue(mock.client);

      // Act + Assert
      await expect(insertUser("c1", "N", "e@x.com")).rejects.toThrow("insert failed");
    });
  });

  // ---------- checkUserExists ----------
  describe("checkUserExists", () => {
    it("returns true when a row does not exist", async () => {
      // Arrange: simulate one matching row
      const mock = makeSupabaseMock({
        selectEq: { data: [{ clerk_id: "c1" }], error: null },
      });
      (createServerClient as jest.Mock).mockResolvedValue(mock.client);

      // Act
      const exists = await checkUserExists("c1");

      // Assert
      expect(mock.from).toHaveBeenCalledWith("users");
      expect(mock.select).toHaveBeenCalled();
      
      const eqCalls = mock.select().eq.mock.calls;
      expect(eqCalls[0][0]).toBe("clerk_id");
      expect(eqCalls[0][1]).toBe("c1");
      
      expect(exists).toBe(false);
    });

    it("returns false when no rows match", async () => {
      // Arrange: zero rows
      const mock = makeSupabaseMock({
        selectEq: { data: [], error: null },
      });
      (createServerClient as jest.Mock).mockResolvedValue(mock.client);

      // Act
      const exists = await checkUserExists("c2");

      // Assert
      expect(exists).toBe(false);
    });
  });
});