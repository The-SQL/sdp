import { createLanguage } from "@/utils/db/languages"; // Adjust path as needed
import { createClient } from "@/utils/supabase/client";
import { Language } from "@/utils/types"; // Adjust path as needed

// Mock the Supabase client
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock Data
const mockLanguage: Language = {
  id: "lang1",
  name: "Spanish",
};

describe("Language DB Functions", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console.error to check for logging in error cases
    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- createLanguage ---
  describe("createLanguage", () => {
    it("should insert a new language and return it on success", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: [mockLanguage], error: null }), // Supabase returns data in an array
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act
      const result = await createLanguage("Spanish");

      // Assert
      expect(result).toEqual(mockLanguage);
    });

    it("should throw an error and log if language creation fails", async () => {
      // Arrange
      const mockError = new Error("Language creation failed");
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: null, error: mockError }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act & Assert
      await expect(createLanguage("Spanish")).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error creating language:",
        mockError
      );
    });
  });
});
