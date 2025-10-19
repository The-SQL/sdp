import {
  createTag,
  insertCourseTag,
  insertCourseTags,
} from "@/utils/db/tags"; // Adjust path as needed
import { createClient } from "@/utils/supabase/client";
import { Tag } from "@/utils/types"; // Adjust path as needed

// Mock the Supabase client
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock Data
const mockTag: Tag = {
  id: "tag1",
  name: "JavaScript",
};

describe("Tag DB Functions", () => {
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

  // --- createTag ---
  describe("createTag", () => {
    it("should insert a new tag and return it on success", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: [mockTag], error: null }), // Supabase returns an array
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act
      const result = await createTag("JavaScript");

      // Assert
      expect(result).toEqual(mockTag);
    });

    it("should throw an error and log if tag creation fails", async () => {
      // Arrange
      const mockError = new Error("Tag creation failed");
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: null, error: mockError }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act & Assert
      await expect(createTag("JavaScript")).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error creating tag:",
        mockError
      );
    });
  });

  // --- insertCourseTag ---
  describe("insertCourseTag", () => {
    it("should insert a course-tag relationship successfully", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          insert: async () => ({ error: null }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act & Assert
      await expect(
        insertCourseTag("course1", "tag1")
      ).resolves.toBeUndefined();
    });

    it("should throw an error and log if insertion fails", async () => {
      // Arrange
      const mockError = new Error("Relation insert failed");
      const mockClient = {
        from: () => ({
          insert: async () => ({ error: mockError }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act & Assert
      await expect(insertCourseTag("course1", "tag1")).rejects.toThrow(
        mockError
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error inserting course tag:",
        mockError
      );
    });
  });

  // --- insertCourseTags ---
  describe("insertCourseTags", () => {
    it("should insert multiple course-tag relationships successfully", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          insert: async () => ({ error: null }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act & Assert
      await expect(
        insertCourseTags("course1", ["tag1", "tag2"])
      ).resolves.toBeUndefined();
    });

    it("should throw an error if bulk insertion fails", async () => {
      // Arrange
      const mockError = new Error("Bulk relation insert failed");
      const mockClient = {
        from: () => ({
          insert: async () => ({ error: mockError }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act & Assert
      await expect(
        insertCourseTags("course1", ["tag1", "tag2"])
      ).rejects.toThrow(mockError);
      // No console.error is expected as the implementation just throws
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
