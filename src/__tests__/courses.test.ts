import { insertCourse, updateCourse } from "@/utils/db/courses"; // Adjust path as needed
import { createClient } from "@/utils/supabase/client";
import { Course } from "@/utils/types"; // Adjust path as needed

// Mock the Supabase client
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock Data
const mockCourse: Course = {
  id: "course1",
  author_id: "author1",
  language_id: "lang1",
  title: "Mastering TypeScript",
  description: "A comprehensive guide to TypeScript.",
  difficulty: "Intermediate",
  estimated_duration: "10 hours",
  learning_objectives: "Learn advanced types",
  profile_url: "/course-image.png",
  is_public: true,
  is_published: true,
  open_to_collab: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("Course DB Functions", () => {
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

  // --- insertCourse ---
  describe("insertCourse", () => {
    it("should insert a course and return it on success", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: [mockCourse], error: null }), // Supabase returns data in an array
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act
      const result = await insertCourse(mockCourse);

      // Assert
      expect(result).toEqual(mockCourse);
    });

    it("should return null if data is empty after insertion", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: [], error: null }), // No data returned
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act
      const result = await insertCourse(mockCourse);

      // Assert
      expect(result).toBeUndefined;
    });

    it("should throw an error and log if insertion fails", async () => {
      // Arrange
      const mockError = new Error("Insertion failed");
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: null, error: mockError }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act & Assert
      await expect(insertCourse(mockCourse)).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error inserting course:",
        mockError
      );
    });
  });

  // --- updateCourse ---
  describe("updateCourse", () => {
    it("should update a course and return the updated data", async () => {
      // Arrange
      const updates: Partial<Course> = { title: "Advanced TypeScript" };
      const updatedCourse = { ...mockCourse, ...updates };

      const mockClient = {
        from: () => ({
          update: () => ({
            eq: () => ({
              select: async () => ({ data: [updatedCourse], error: null }),
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act
      const result = await updateCourse("course1", updates);

      // Assert
      expect(result).toEqual(updatedCourse);
    });

    it("should throw an error and log if update fails", async () => {
      // Arrange
      const updates: Partial<Course> = { title: "This will fail" };
      const mockError = new Error("Update failed");
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
      await expect(updateCourse("course1", updates)).rejects.toThrow(
        mockError
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error updating course:",
        mockError
      );
    });
  });
});
