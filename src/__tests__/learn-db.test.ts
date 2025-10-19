
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getCourseWithContent,
  getUserProgress,
  updateLessonProgress,
  checkIfEnrolled,
  enrollInCourse,
} from "@/utils/db/learn"; // Adjust path as needed
import { createClient } from "@/utils/supabase/client";
import { CourseWithContent, Lesson, UnitWithLessons } from "@/utils/types"; // Adjust path as needed

// Mock the supabase client module
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock data (using the data from your previous file)
const mockLesson1: Lesson = {
  id: "lesson1",
  unit_id: "unit1",
  title: "Lesson 1",
  content_type: "text",
  content: {},
  order_index: 2, // Intentionally out of order
};

const mockLesson2: Lesson = {
  id: "lesson2",
  unit_id: "unit1",
  title: "Lesson 2",
  content_type: "text",
  content: {},
  order_index: 1, // Intentionally out of order
};

const mockUnit1: UnitWithLessons = {
  id: "unit1",
  course_id: "course1",
  title: "Unit 1",
  order_index: 2, // Intentionally out of order
  lessons: [mockLesson1, mockLesson2],
};

const mockUnit2: UnitWithLessons = {
  id: "unit2",
  course_id: "course1",
  title: "Unit 2",
  order_index: 1, // Intentionally out of order
  lessons: [],
};

const mockCourse: CourseWithContent = {
  id: "course1",
  title: "Test Course",
  description: "A course for testing",
  difficulty: "easy",
  profile_url: "http://example.com/course.png",
  units: [mockUnit1, mockUnit2],
};

describe("learn db functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCourseWithContent", () => {
    it("returns a course and sorts its units and lessons", async () => {
      // ... (This test was correct and remains unchanged) ...
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: mockCourse, error: null }),
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);
      const result = await getCourseWithContent("course1");
      expect(result).not.toBeNull();
      expect(result?.units[0].id).toBe("unit2");
      expect(result?.units[1].id).toBe("unit1");
      expect(result?.units[1].lessons?.[0].id).toBe("lesson2");
      expect(result?.units[1].lessons?.[1].id).toBe("lesson1");
    });

    it("throws an error when fetching fails", async () => {
      // ... (This test was correct and remains unchanged) ...
      const mockError = { message: "DB Error" };
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: mockError }),
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);
      await expect(getCourseWithContent("course1")).rejects.toEqual(mockError);
    });
  });

  describe("getUserProgress", () => {
    // This helper creates the complex mock needed for getUserProgress
    const createGetUserProgressMock = (
      finalError: any = null,
      finalData: any = null
    ) => {
      const mockClient = {
        from: (table: string) => {
          if (table === "units") {
            // This handles the *first* subquery
            return {
              select: () => ({
                eq: async () => ({ data: [{ id: "unit1" }], error: null }),
              }),
            };
          }
          if (table === "lessons") {
            // This handles the *second* subquery
            return {
              select: () => ({
                in: async () => ({
                  data: [{ id: "lesson1" }, { id: "lesson2" }],
                  error: null,
                }),
              }),
            };
          }
          if (table === "user_progress") {
            // This handles the *main* query
            return {
              select: () => ({
                eq: () => ({
                  in: async () => ({ data: finalData, error: finalError }),
                }),
              }),
            };
          }
          return {}; // fallback
        },
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);
    };

    it("returns user progress for a given course", async () => {
      // Arrange
      const mockProgress = [{ lesson_id: "lesson1", status: "completed" }];
      createGetUserProgressMock(null, mockProgress); // Act

      const result = await getUserProgress("user1", "course1"); // Assert

      expect(result).toEqual(mockProgress);
    });

    it("returns an empty array on error", async () => {
      // Arrange: Spy on console.error
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockError = { message: "fail" };
      createGetUserProgressMock(mockError, null); // Act

      const result = await getUserProgress("user1", "course1"); // Assert

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching user progress:",
        mockError
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("updateLessonProgress", () => {
    // This helper creates the extremely complex mock for updateLessonProgress
    const createUpdateProgressMock = (
      existingProgress: { id: string } | null
    ) => {
      const mockUserProgressUpdate = jest.fn(async () => ({ error: null }));
      const mockUserProgressInsert = jest.fn(async () => ({ error: null }));
      const mockUserCourseUpdate = jest.fn(async () => ({ error: null }));

      const mockClient = {
        from: (table: string) => {
          switch (table) {
            case "user_progress":
              return {
                select: () => ({
                  eq: () => ({
                    eq: () => ({
                      // For finding existing progress
                      single: async () => ({
                        data: existingProgress, // Supabase returns an error if .single() finds no row
                        error: existingProgress ? null : { code: "PGRST116" },
                      }),
                    }),
                    in: async () => ({
                      // For calculating total progress
                      data: [{ lesson_id: "lesson1", status: "completed" }],
                      error: null,
                    }),
                  }),
                }),
                update: () => ({ eq: mockUserProgressUpdate }),
                insert: mockUserProgressInsert,
              };
            case "lessons":
              return {
                select: () => ({
                  eq: () => ({
                    // For finding unit_id from lesson_id
                    single: async () => ({ data: { unit_id: "unit1" } }),
                  }),
                  in: async () => ({
                    // For finding all lessons in course
                    data: [{ id: "lesson1" }, { id: "lesson2" }],
                    error: null,
                  }),
                }),
              };
            case "units":
              return {
                select: () => ({
                  eq: (col: string) => {
                    if (col === "id") {
                      // For finding course_id from unit_id
                      return {
                        single: async () => ({
                          data: { course_id: "course1" },
                        }),
                      };
                    }
                    if (col === "course_id") {
                      // For subquery in updateCourseProgress
                      return async () => ({
                        data: [{ id: "unit1" }],
                        error: null,
                      });
                    }
                    return {};
                  },
                }),
              };
            case "user_courses":
              return {
                select: () => ({
                  eq: () => ({
                    eq: () => ({
                      // For finding existing user_course record
                      single: async () => ({ data: { id: "user_course1" } }),
                    }),
                  }),
                }),
                update: () => ({ eq: mockUserCourseUpdate }),
              };
            default:
              return {};
          }
        },
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      return { mockUserProgressUpdate, mockUserProgressInsert };
    };

    it("updates existing progress record", async () => {
      // Arrange
      const { mockUserProgressUpdate, mockUserProgressInsert } =
        createUpdateProgressMock({ id: "progress1" }); // Act

      await expect(
        updateLessonProgress("user1", "lesson1", "completed")
      ).resolves.toBeUndefined(); // Assert

      expect(mockUserProgressUpdate).toHaveBeenCalled();
      expect(mockUserProgressInsert).not.toHaveBeenCalled();
    });

    it("creates new progress record if none exists", async () => {
      // Arrange
      const { mockUserProgressUpdate, mockUserProgressInsert } =
        createUpdateProgressMock(null); // No existing progress
      // Act

      await expect(
        updateLessonProgress("user1", "lesson1", "in_progress")
      ).resolves.toBeUndefined(); // Assert

      expect(mockUserProgressUpdate).not.toHaveBeenCalled();
      expect(mockUserProgressInsert).toHaveBeenCalled();
    });
  });

  describe("checkIfEnrolled", () => {
    // ... (This test group was correct and remains unchanged) ...
    it("returns true if user is enrolled", async () => {
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: async () => ({ data: { id: "uc1" }, error: null }),
              }),
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);
      const result = await checkIfEnrolled("user1", "course1");
      expect(result).toBe(true);
    });

    it("returns false if user is not enrolled (PGRST116 error)", async () => {
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: async () => ({
                  data: null,
                  error: { code: "PGRST116", message: "No rows found" },
                }),
              }),
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);
      const result = await checkIfEnrolled("user1", "course1");
      expect(result).toBe(false);
    });

    it("returns false on other errors", async () => {
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: async () => ({
                  data: null,
                  error: { message: "DB Error" },
                }),
              }),
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);
      const result = await checkIfEnrolled("user1", "course1");
      expect(result).toBe(false);
    });
  });

  describe("enrollInCourse", () => {
    // ... (This test group was correct and remains unchanged) ...
    it("does not throw on successful enrollment", async () => {
      const mockClient = {
        from: () => ({
          insert: async () => ({ error: null }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);
      await expect(enrollInCourse("user1", "course1")).resolves.toBeUndefined();
    });

    it("throws on enrollment error", async () => {
      const mockError = { message: "Failed to enroll" };
      const mockClient = {
        from: () => ({
          insert: async () => ({ error: mockError }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);
      await expect(enrollInCourse("user1", "course1")).rejects.toEqual(
        mockError
      );
    });
  });
});
