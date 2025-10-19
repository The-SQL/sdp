
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  insertFlashcardSet,
  getFlashcardSetsByAuthor,
  getAllFlashcardSets,
  getFlashcardSetById,
  getFlashcardsBySetId,
  insertFlashcard,
} from "@/utils/db/flashcards";
import { createClient } from "@/utils/supabase/client";
import { Flashcard, FlashcardSet } from "@/utils/types";

// Mock the supabase client module
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock data
const mockSet: FlashcardSet = {
  id: "set1",
  author_id: "author1",
  title: "Test Set",
  description: "A set for testing",
  language_id: "en", // Assuming this exists based on your other files
  language_name: "English",
  visibility: "public",
  created_at: new Date().toISOString(),
};

const mockFlashcard: Flashcard = {
  id: "f1",
  flashcard_set_id: "set1",
  front: "What is this?",
  back: "A test.",
};

describe("flashcard db functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("insertFlashcardSet returns inserted set", async () => {
    // Arrange: Mock insert().select().single()
    const mockClient = {
      from: () => ({
        insert: () => ({
          select: () => ({
            single: async () => ({ data: mockSet, error: null }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act
    const result = await insertFlashcardSet(mockSet);

    // Assert
    expect(result).toEqual(mockSet);
  });

  it("getFlashcardSetById returns a single set", async () => {
    // Arrange: Mock select().eq().single()
    const mockClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: mockSet, error: null }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act
    const result = await getFlashcardSetById("set1");

    // Assert
    expect(result).toEqual(mockSet);
  });

  it("insertFlashcard returns inserted flashcard", async () => {
    // Arrange: Mock insert().select().single()
    const mockClient = {
      from: () => ({
        insert: () => ({
          select: () => ({
            single: async () => ({ data: mockFlashcard, error: null }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act
    const result = await insertFlashcard(mockFlashcard);

    // Assert
    expect(result).toEqual(mockFlashcard);
  });

  it("getFlashcardsBySetId returns flashcards for a set", async () => {
    // Arrange: Mock select().eq()
    const mockClient = {
      from: () => ({
        select: () => ({
          eq: async () => ({ data: [mockFlashcard], error: null }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act
    const result = await getFlashcardsBySetId("set1");

    // Assert
    expect(result).toEqual([mockFlashcard]);
  });

  // This helper mocks the complex chainable queries
  const createChainableMock = (data: any, error: any = null) => {
    const mock: any = {
      order: jest.fn(async () => ({ data, error })),
      or: jest.fn(() => mock),
      neq: jest.fn(() => mock),
      eq: jest.fn(() => mock),
      select: jest.fn(() => mock),
    };
    const mockClient = { from: () => mock };
    (createClient as jest.Mock).mockReturnValue(mockClient);
    return mock; // Return the query builder mock to check calls
  };

  it("getFlashcardSetsByAuthor returns sets without query", async () => {
    // Arrange
    const queryBuilderMock = createChainableMock([mockSet]);

    // Act
    const result = await getFlashcardSetsByAuthor("author1", "");

    // Assert
    expect(result).toEqual([mockSet]);
    expect(queryBuilderMock.eq).toHaveBeenCalledWith("author_id", "author1");
    expect(queryBuilderMock.or).not.toHaveBeenCalled();
    expect(queryBuilderMock.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });

  it("getFlashcardSetsByAuthor returns sets with query", async () => {
    // Arrange
    const queryBuilderMock = createChainableMock([mockSet]);

    // Act
    const result = await getFlashcardSetsByAuthor("author1", "test");

    // Assert
    expect(result).toEqual([mockSet]);
    expect(queryBuilderMock.eq).toHaveBeenCalledWith("author_id", "author1");
    expect(queryBuilderMock.or).toHaveBeenCalledWith(
      `title.ilike.%test%,language_name.ilike.%test%,description.ilike.%test%`
    );
    expect(queryBuilderMock.order).toHaveBeenCalled();
  });

  it("getAllFlashcardSets returns public sets without query", async () => {
    // Arrange
    const queryBuilderMock = createChainableMock([mockSet]);

    // Act
    const result = await getAllFlashcardSets("author1", "");

    // Assert
    expect(result).toEqual([mockSet]);
    expect(queryBuilderMock.eq).toHaveBeenCalledWith("visibility", "public");
    expect(queryBuilderMock.neq).toHaveBeenCalledWith("author_id", "author1");
    expect(queryBuilderMock.or).not.toHaveBeenCalled();
    expect(queryBuilderMock.order).toHaveBeenCalled();
  });

  it("getAllFlashcardSets returns public sets with query", async () => {
    // Arrange
    const queryBuilderMock = createChainableMock([mockSet]);

    // Act
    const result = await getAllFlashcardSets("author1", "test");

    // Assert
    expect(result).toEqual([mockSet]);
    expect(queryBuilderMock.eq).toHaveBeenCalledWith("visibility", "public");
    expect(queryBuilderMock.neq).toHaveBeenCalledWith("author_id", "author1");
    expect(queryBuilderMock.or).toHaveBeenCalledWith(
      `title.ilike.%test%,language_name.ilike.%test%,description.ilike.%test%`
    );
    expect(queryBuilderMock.order).toHaveBeenCalled();
  });
});

describe("flashcard db error handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("insertFlashcardSet returns null on error", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: "fail" } }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act
    const result = await insertFlashcardSet(mockSet);

    // Assert
    expect(result).toBeNull();
  });

  it("getFlashcardSetById returns null on error", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: "fail" } }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act
    const result = await getFlashcardSetById("set1");

    // Assert
    expect(result).toBeNull();
  });

  it("insertFlashcard returns null on error", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: "fail" } }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act
    const result = await insertFlashcard(mockFlashcard);

    // Assert
    expect(result).toBeNull();
  });


  // This helper mocks a chainable query that fails at the end
  const createFailingChainableMock = () => {
    const mockError = { message: "Chain failed" };
    const mock: any = {
      order: jest.fn(async () => ({ data: null, error: mockError })),
      or: jest.fn(() => mock),
      neq: jest.fn(() => mock),
      eq: jest.fn(() => mock),
      select: jest.fn(() => mock),
    };
    (createClient as jest.Mock).mockReturnValue({ from: () => mock });
   };

  it("getFlashcardSetsByAuthor returns empty array on error", async () => {
    // Arrange
    createFailingChainableMock();

    // Act
    const result = await getFlashcardSetsByAuthor("author1", "");

    // Assert
    expect(result).toEqual([]);
  });

  it("getAllFlashcardSets throws an error", async () => {
    // Arrange
    createFailingChainableMock();

    // Act & Assert
    await expect(getAllFlashcardSets("author1", "")).rejects.toThrow(
      "Chain failed"
    );
  });
});