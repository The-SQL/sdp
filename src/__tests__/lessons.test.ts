import { insertLesson, insertLessons, updateLesson } from "@/utils/db/lessons"; // Adjust path as needed
import { createClient } from "@/utils/supabase/client";
import { Lesson } from "@/utils/types"; // Adjust path as needed

// Mock the Supabase client
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock Data
const mockLesson: Lesson = {
  id: "lesson1",
  unit_id: "unit1",
  title: "Test Lesson",
  content_type: "text",
  content: { body: "This is a test lesson." },
  order_index: 1,
  created_at: new Date().toISOString(),
};

describe("Lesson DB Functions", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console.error to verify logging in error cases
    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- insertLesson ---
  describe("insertLesson", () => {
    it("should insert a lesson and return the created data on success", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: [mockLesson], error: null }), // Supabase returns an array
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act
      const result = await insertLesson(
        "unit1",
        "Test Lesson",
        "text",
        { body: "This is a test lesson." },
        1
      );

      // Assert
      expect(result).toEqual(mockLesson);
    });

    it("should throw an error and log if insertion fails", async () => {
      // Arrange
      const mockError = new Error("DB insert failed");
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: null, error: mockError }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act & Assert
      await expect(
        insertLesson("unit1", "Test Lesson", "text", {}, 1)
      ).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error inserting lesson:",
        mockError
      );
    });
  });

  // --- insertLessons ---
  describe("insertLessons", () => {
    it("should insert multiple lessons without throwing an error", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          insert: async () => ({ error: null }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);
      const lessonsToInsert: Lesson[] = [
        mockLesson,
        { ...mockLesson, id: "lesson2", title: "Lesson 2", order_index: 2 },
      ];

      // Act & Assert
      await expect(
        insertLessons("course1", lessonsToInsert)
      ).resolves.toBeUndefined();
    });

    it("should throw an error if bulk insertion fails", async () => {
      // Arrange
      const mockError = new Error("Bulk insert failed");
      const mockClient = {
        from: () => ({
          insert: async () => ({ error: mockError }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);
      const lessonsToInsert: Lesson[] = [mockLesson];

      // Act & Assert
      await expect(insertLessons("course1", lessonsToInsert)).rejects.toThrow(
        mockError
      );
    });
  });

  // --- updateLesson ---
  describe("updateLesson", () => {
    it("should update a lesson and return the updated data on success", async () => {
      // Arrange
      const updates: Partial<Lesson> = { title: "Updated Lesson Title" };
      const updatedLesson = { ...mockLesson, title: "Updated Lesson Title" };
      const mockClient = {
        from: () => ({
          update: () => ({
            eq: () => ({
              select: async () => ({ data: [updatedLesson], error: null }), // Supabase returns an array
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act
      const result = await updateLesson("lesson1", updates);

      // Assert
      expect(result).toEqual(updatedLesson);
    });

    it("should throw an error and log if the update fails", async () => {
      // Arrange
      const updates: Partial<Lesson> = { title: "Updated Lesson Title" };
      const mockError = new Error("DB update failed");
      const mockClient = {
        from: () => ({
          update: () => ({
            eq: () => ({
              select: async () => ({ data: null, error: mockError }),
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act & Assert
      await expect(updateLesson("lesson1", updates)).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error updating lesson:",
        mockError
      );
    });
  });
});
