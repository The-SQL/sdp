import { insertReview } from "@/utils/db/reviews"; // Adjust path as needed
import { createClient } from "@/utils/supabase/client";
import { Review } from "@/utils/types"; // Adjust path as needed

// Mock the Supabase client
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock Data
const mockReview: Review = {
  id: "review1",
  course_id: "course1",
  user_id: "user1",
  rating: 5,
  comment: "Excellent course!",
  created_at: new Date().toISOString(),
};

describe("Review DB Functions", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console.error to check for logging
    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- insertReview ---
  describe("insertReview", () => {
    it("should return null on successful insertion (as no .select() is used)", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          insert: async () => ({ data: null, error: null }), // Supabase insert without .select() returns null data
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act
      const result = await insertReview(mockReview);

      // Assert
      expect(result).toBeNull();
    });

    it("should throw an error and log if insertion fails", async () => {
      // Arrange
      const mockError = { message: "DB constraint violation" };
      const mockClient = {
        from: () => ({
          insert: async () => ({ data: null, error: mockError }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act & Assert
      await expect(insertReview(mockReview)).rejects.toThrow(
        "Failed to insert review"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error inserting review:",
        mockError
      );
    });
  });
});

