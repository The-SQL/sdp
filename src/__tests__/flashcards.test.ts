import { createClient } from "@/utils/supabase/client";

jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

import * as flashcardsDb from "@/utils/db/flashcards";

type MockChain = {
  select: jest.Mock<any, any>;
  eq: jest.Mock<any, any>;
  single: jest.Mock<any, any>;
  order: jest.Mock<any, any>;
  insert?: jest.Mock<any, any>;
  maybeSingle?: jest.Mock<any, any>;
  or?: jest.Mock<any, any>;
};

describe("flashcards db", () => {
  let mockSupabase: { from: jest.Mock } & MockChain;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn().mockReturnThis() as unknown as jest.Mock,
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
      or: jest.fn().mockReturnThis(),
      // add neq to support queries that call .neq(...)
      neq: jest.fn().mockReturnThis(),
    } as unknown as typeof mockSupabase;

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe("insertFlashcardSet", () => {
    it("returns inserted set on success", async () => {
      const mockSet = { id: "s1", title: "T" };
      // insert().select().single() resolves with { data, error }
      (mockSupabase.insert as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: mockSet, error: null }) }),
      });

      const res = await flashcardsDb.insertFlashcardSet({ title: "T" });
      expect(res).toEqual(mockSet);
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcard_sets");
    });

    it("returns null and logs on error", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      (mockSupabase.insert as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: null, error: { message: "err" } }) }),
      });

      const res = await flashcardsDb.insertFlashcardSet({ title: "T" });
      expect(res).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("getFlashcardSetsByAuthor", () => {
    it("returns sets for author without query", async () => {
      const mockSets = [{ id: "1" }];
      // from().select().eq(...).order() resolves
      (mockSupabase.order as jest.Mock).mockResolvedValueOnce({ data: mockSets, error: null });

      const res = await flashcardsDb.getFlashcardSetsByAuthor("author-1", "");
      expect(res).toEqual(mockSets);
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcard_sets");
    });

    it("handles error and returns empty array", async () => {
      (mockSupabase.order as jest.Mock).mockResolvedValueOnce({ data: null, error: { message: "err" } });
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const res = await flashcardsDb.getFlashcardSetsByAuthor("author-1", "q");
      expect(res).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("getAllFlashcardSets", () => {
    it("returns public sets excluding author", async () => {
      const mockSets = [{ id: "p1" }];
      (mockSupabase.order as jest.Mock).mockResolvedValueOnce({ data: mockSets, error: null });

      const res = await flashcardsDb.getAllFlashcardSets("author-1", "");
      expect(res).toEqual(mockSets);
    });

    it("throws when supabase returns error", async () => {
      (mockSupabase.order as jest.Mock).mockResolvedValueOnce({ data: null, error: { message: "err" } });
      await expect(flashcardsDb.getAllFlashcardSets("author-1", "q")).rejects.toThrow("err");
    });
  });

  describe("getFlashcardSetById", () => {
    it("returns set when found", async () => {
      const mockSet = { id: "s1" };
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({ data: mockSet, error: null });

      const res = await flashcardsDb.getFlashcardSetById("s1");
      expect(res).toEqual(mockSet);
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcard_sets");
    });

    it("returns null on error", async () => {
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({ data: null, error: { message: "err" } });
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const res = await flashcardsDb.getFlashcardSetById("s1");
      expect(res).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe("getFlashcardsBySetId", () => {
    it("returns flashcards list", async () => {
      const mockCards = [{ id: "c1" }];
      // from().select().eq(...)
      (mockSupabase.select as jest.Mock).mockReturnThis();
      (mockSupabase.eq as jest.Mock).mockResolvedValueOnce({ data: mockCards, error: null });

      const res = await flashcardsDb.getFlashcardsBySetId("set-1");
      expect(res).toEqual(mockCards);
    });

    it("throws on error", async () => {
      (mockSupabase.select as jest.Mock).mockReturnThis();
      (mockSupabase.eq as jest.Mock).mockResolvedValueOnce({ data: null, error: { message: "err" } });
      await expect(flashcardsDb.getFlashcardsBySetId("set-1")).rejects.toThrow("err");
    });
  });

  describe("insertFlashcard", () => {
    it("returns inserted flashcard on success", async () => {
      const mockCard = { id: "c1", front: "hi" };
      (mockSupabase.insert as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: mockCard, error: null }) }),
      });

      const res = await flashcardsDb.insertFlashcard({ front: "hi" });
      expect(res).toEqual(mockCard);
    });

    it("returns null and logs on error", async () => {
      (mockSupabase.insert as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: null, error: { message: "err" } }) }),
      });
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const res = await flashcardsDb.insertFlashcard({ front: "hi" });
      expect(res).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
