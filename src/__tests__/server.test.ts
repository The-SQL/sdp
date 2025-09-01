import { insertUser, checkUserExists } from "@/utils/db/server";
import { createClient } from "@/utils/supabase/server";
import { makeSupabaseMock } from "../__mocks__/supabase";

// Mock supabase server module
jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(),
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
      (createClient as jest.Mock).mockResolvedValue(mock.client);

      // Act
      const result = await insertUser("c1", "N", "e@x.com");

      // Assert — WHAT & WHY:
      // 1) We called the right table
      expect(mock.from).toHaveBeenCalledWith("users");

      // 2) We inserted the exact payload (shape + keys)
      expect(mock.insert).toHaveBeenCalledWith([
        { clerk_id: "c1", name: "N", email: "e@x.com" },
      ]);

      // 3) We asked for .select() after insert (returning inserted rows)
      expect(mock.selectAfterInsert).toHaveBeenCalled();

      // 4) Function returns whatever Supabase returned as data
      expect(result).toEqual(fakeInserted);
    });

    it("throws when Supabase insert fails", async () => {
      // Arrange: simulate Supabase error
      const err = new Error("insert failed");
      const mock = makeSupabaseMock({
        insertSelect: { data: null, error: err },
      });
      (createClient as jest.Mock).mockResolvedValue(mock.client);

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
      (createClient as jest.Mock).mockResolvedValue(mock.client);

      // Act
      const exists = await checkUserExists("c1");

      // Assert — WHAT & WHY:
      // 1) Correct table
      expect(mock.from).toHaveBeenCalledWith("users");

      // 2) We did a .select("*") before .eq(...)
      //    We don’t assert the "*" value here because your code doesn’t
      //    pass it (it uses ".select('*')"); instead we assert we called .select at all.
      expect(mock.select).toHaveBeenCalled();

      // 3) We filtered by clerk_id — this proves the WHERE is correct
      //    Our mock exposes the final method in the chain as "eqAfterSelect".
      //    We can’t directly assert arguments on eq because we wrapped it,
      //    so let’s inspect the call arguments from the mock returned earlier:
      const eqCalls = mock.select().eq.mock.calls; // select() returns { eq }
      expect(eqCalls[0][0]).toBe("clerk_id");
      expect(eqCalls[0][1]).toBe("c1");

      // 4) True because data length > 0
      expect(exists).toBe(false);
    });

    it("returns false when no rows match", async () => {
      // Arrange: zero rows
      const mock = makeSupabaseMock({
        selectEq: { data: [], error: null },
      });
      (createClient as jest.Mock).mockResolvedValue(mock.client);

      // Act
      const exists = await checkUserExists("c2");

      // Assert
      expect(exists).toBe(false);
    });
  });
});
