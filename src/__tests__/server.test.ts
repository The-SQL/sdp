
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  insertUser,
  checkUserExists,
  getCoursesByAuthor,
  getStandardCourseById,
  getLessonsByUnitId,
  getUnitsByCourseId,
  deleteCourseById,
  createCourseChangeRequest,
  getCourseChangeRequests,
  applyCourseChangeRequest,
} from "@/utils/db/server"; 
import { createClient as createServerClient } from "@/utils/supabase/server";
import { ensureUserInitialized, updateUserStreak } from "@/utils/db/profile";
import { SupabaseCourseList } from "@/utils/db/client";
import {
  Course,
  Lesson,
  SuggestedChange,
  SuggestedChangePayload,
  Unit,
} from "@/utils/types"; 

// Mock the server supabase client
jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Mock the profile functions to avoid side effects
jest.mock("@/utils/db/profile", () => ({
  updateUserStreak: jest.fn().mockResolvedValue({ current_streak: 1 }),
  ensureUserInitialized: jest.fn().mockResolvedValue(undefined),
}));

// --- Mock Data ---
const mockUser = {
  clerk_id: "c1",
  name: "Test User",
  email: "e@x.com",
};

const mockCourse: Course = {
  id: "course1",
  author_id: "author1",
  language_id: "lang1",
  title: "Test Course",
  description: "Desc",
  difficulty: "easy",
  estimated_duration: "1h",
  learning_objectives: "Learn",
  profile_url: "url",
  is_public: true,
  is_published: true,
  open_to_collab: false,
};

const mockUnit: Unit = {
  id: "unit1",
  course_id: "course1",
  title: "Test Unit",
  order_index: 1,
};

const mockLesson: Lesson = {
  id: "lesson1",
  unit_id: "unit1",
  title: "Test Lesson",
  content_type: "text",
  content: { body: "Hello" },
  order_index: 1,
};

const mockChangeRequest: SuggestedChange = {
  id: "req1",
  collaborator_id: "collab1",
  course_id: "course1",
  summary: "Test change",
  payload: {
    course: mockCourse,
    units: [mockUnit],
    lessons: [mockLesson],
  },
  status: "pending",
};

// Mock raw Supabase response for getCoursesByAuthor
const mockSupabaseCourse: SupabaseCourseList = {
  id: "course1",
  author_id: "author1",
  title: "Test Course",
  description: "Desc",
  difficulty: "easy",
  estimated_duration: "1h",
  profile_url: "url",
  is_public: true,
  is_published: true,
  languages: { name: "English" },
  users: { name: "Author Name" },
// avg 4
user_courses: [{ id: "u1" }, { id: "u2" }], // 2 students
  course_tags: [{ tags: { name: "React" } }, { tags: { name: "TS" } }],
  course_feedback: [],
};

describe("server db functions", () => {
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

  // ---------- insertUser ----------
  describe("insertUser", () => {
    it("inserts a user, calls initializers, and returns data", async () => {
      // Arrange
      const fakeInserted = [mockUser];
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: fakeInserted, error: null }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);

      // Act
      const result = await insertUser(
        mockUser.clerk_id,
        mockUser.name,
        mockUser.email
      );

      // Assert
      expect(result).toEqual(fakeInserted);
      expect(ensureUserInitialized).toHaveBeenCalledWith(mockUser.clerk_id);
      expect(updateUserStreak).toHaveBeenCalledWith(mockUser.clerk_id);
    });

    it("throws and does not call initializers when insert fails", async () => {
      // Arrange
      const mockError = new Error("insert failed");
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: null, error: mockError }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);

      // Act + Assert
      await expect(
        insertUser(mockUser.clerk_id, mockUser.name, mockUser.email)
      ).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error inserting user:",
        mockError
      );
      expect(ensureUserInitialized).not.toHaveBeenCalled();
      expect(updateUserStreak).not.toHaveBeenCalled();
    });
  });

  // ---------- checkUserExists ----------
  describe("checkUserExists", () => {
    it("returns true when user exists", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: async () => ({ data: [mockUser], error: null }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);

      // Act
      const exists = await checkUserExists("c1");

      // Assert
      expect(exists).toBe(true);
    });

    it("returns false when no rows match", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: async () => ({ data: [], error: null }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);

      // Act
      const exists = await checkUserExists("c2");

      // Assert
      expect(exists).toBe(false);
    });

    it("throws when check fails", async () => {
      // Arrange
      const mockError = new Error("select failed");
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: async () => ({ data: null, error: mockError }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);

      // Act + Assert
      await expect(checkUserExists("c1")).rejects.toThrow(mockError);
    });
  });

  // ---------- getCoursesByAuthor ----------
  describe("getCoursesByAuthor", () => {
    // Helper to create the complex multi-query mock
    const createGetCoursesMock = (
      authored: any,
      collabs: any,
      collabCourses: any,
      errors: any = {}
    ) => {
      const mockClient = {
        from: (table: string) => {
          if (table === "courses") {
            return {
              select: () => ({
                eq: () => ({
                  // This is the authored courses call
                  order: async () => ({ data: authored, error: errors.authored }),
                }),
                in: () => ({
                  // This is the collaborator courses call
                  order: async () => ({
                    data: collabCourses,
                    error: errors.collabCourses,
                  }),
                }),
              }),
            };
          }
          if (table === "collaborators") {
            return {
              select: () => ({
                eq: () => ({
                  eq: async () => ({ data: collabs, error: errors.collabs }),
                }),
              }),
            };
          }
          return { select: () => ({ eq: () => ({ order: () => {} }) }) };
        },
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
    };

    it("returns transformed collaborator courses", async () => {
      const collabCourse = {
        ...mockSupabaseCourse,
        id: "course2",
        author_id: "other_author",
      };
      createGetCoursesMock(
        [],
        [{ course_id: "course2" }],
        [collabCourse],
        {}
      );
      const result = await getCoursesByAuthor("author1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("course2");
      expect(result[0].isCollaborator).toBe(true);
    });

    it("merges and deduplicates authored and collaborator courses", async () => {
      // author of course1, collab on course2, and collab on course1 (should be deduped)
      const collabCourse = {
        ...mockSupabaseCourse,
        id: "course2",
        author_id: "other_author",
      };
      createGetCoursesMock(
        [mockSupabaseCourse],
        [{ course_id: "course1" }, { course_id: "course2" }],
        [mockSupabaseCourse, collabCourse],
        {}
      );
      const result = await getCoursesByAuthor("author1");
      expect(result).toHaveLength(2); // course1 (authored) and course2 (collab)
      expect(result[0].id).toBe("course1");
      expect(result[0].isCollaborator).toBe(false); // Authored takes precedence
      expect(result[1].id).toBe("course2");
      expect(result[1].isCollaborator).toBe(true);
    });

    it("throws if fetching authored courses fails", async () => {
      createGetCoursesMock(null, [], [], {
        authored: new Error("Failed to fetch courses"),
      });
      await expect(getCoursesByAuthor("author1")).rejects.toThrow(
        "Failed to fetch courses"
      );
    });

    it("returns only authored courses if fetching collaborator rows fails", async () => {
      createGetCoursesMock([mockSupabaseCourse], null, [], {
        collabs: new Error("collab row fail"),
      });
      const result = await getCoursesByAuthor("author1");
      expect(result).toHaveLength(1); // Still returns authored courses
      expect(result[0].id).toBe("course1");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Supabase error fetching collaborator rows:",
        expect.any(Error)
      );
    });

    it("returns authored courses if fetching collaborator courses fails", async () => {
      createGetCoursesMock(
        [mockSupabaseCourse],
        [{ course_id: "course2" }],
        null,
        { collabCourses: new Error("collab course fail") }
      );
      const result = await getCoursesByAuthor("author1");
      expect(result).toHaveLength(1); // Still returns authored courses
      expect(result[0].id).toBe("course1");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Supabase error fetching collaborator courses:",
        expect.any(Error)
      );
    });
  });

  // ---------- getStandardCourseById ----------
  describe("getStandardCourseById", () => {
    it("returns a course on success", async () => {
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: mockCourse, error: null }),
            }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
      const result = await getStandardCourseById("course1");
      expect(result).toEqual(mockCourse);
    });

    it("throws on failure", async () => {
      const mockError = new Error("Failed to fetch course");
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: mockError }),
            }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
      await expect(getStandardCourseById("course1")).rejects.toThrow(
        "Failed to fetch course"
      );
    });
  });

  // ---------- getLessonsByUnitId ----------
  describe("getLessonsByUnitId", () => {
    it("returns lessons on success", async () => {
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              order: async () => ({ data: [mockLesson], error: null }),
            }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
      const result = await getLessonsByUnitId("unit1");
      expect(result).toEqual([mockLesson]);
    });

    it("throws on failure", async () => {
      const mockError = new Error("Failed to fetch lessons");
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              order: async () => ({ data: null, error: mockError }),
            }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
      await expect(getLessonsByUnitId("unit1")).rejects.toThrow(
        "Failed to fetch lessons"
      );
    });
  });

  // ---------- getUnitsByCourseId ----------
  describe("getUnitsByCourseId", () => {
    it("returns units on success", async () => {
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              order: async () => ({ data: [mockUnit], error: null }),
            }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
      const result = await getUnitsByCourseId("course1");
      expect(result).toEqual([mockUnit]);
    });

    it("throws on failure", async () => {
      const mockError = new Error("Failed to fetch units");
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              order: async () => ({ data: null, error: mockError }),
            }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
      await expect(getUnitsByCourseId("course1")).rejects.toThrow(
        "Failed to fetch units"
      );
    });
  });

  // ---------- deleteCourseById ----------
  describe("deleteCourseById", () => {
    it("returns true on success", async () => {
      const mockClient = {
        from: () => ({
          delete: () => ({
            eq: async () => ({ error: null }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
      const result = await deleteCourseById("course1");
      expect(result).toBe(true);
    });

    it("throws on failure", async () => {
      const mockError = new Error("Failed to delete course");
      const mockClient = {
        from: () => ({
          delete: () => ({
            eq: async () => ({ error: mockError }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
      await expect(deleteCourseById("course1")).rejects.toThrow(
        "Failed to delete course"
      );
    });
  });

  // ---------- createCourseChangeRequest ----------
  describe("createCourseChangeRequest", () => {
    it("returns created request on success", async () => {
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: () => ({
              single: async () => ({ data: mockChangeRequest, error: null }),
            }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
      const result = await createCourseChangeRequest(
        "c1",
        "collab1",
        "summary",
        mockChangeRequest.payload
      );
      expect(result).toEqual(mockChangeRequest);
    });

    it("throws on failure", async () => {
      const mockError = new Error("insert failed");
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: () => ({
              single: async () => ({ data: null, error: mockError }),
            }),
          }),
        }),
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
      await expect(
        createCourseChangeRequest(
          "c1",
          "collab1",
          "summary",
          mockChangeRequest.payload
        )
      ).rejects.toThrow(mockError);
    });
  });

  // ---------- getCourseChangeRequests ----------
  describe("getCourseChangeRequests", () => {
    let mockOrder: jest.Mock;
    let mockEq: jest.Mock;
    let mockSelect: jest.Mock;
    let mockClient: any;

    beforeEach(() => {
      mockOrder = jest.fn(async () => ({ data: [mockChangeRequest], error: null }));
      mockEq = jest.fn(() => ({ order: mockOrder, eq: mockEq }));
      mockSelect = jest.fn(() => ({ order: mockOrder, eq: mockEq }));
      mockClient = { from: () => ({ select: mockSelect }) };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
    });

    it("returns requests with no filters", async () => {
      const result = await getCourseChangeRequests();
      expect(result).toEqual([mockChangeRequest]);
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).not.toHaveBeenCalled();
      expect(mockOrder).toHaveBeenCalled();
    });

    it("returns requests filtered by courseId", async () => {
      await getCourseChangeRequests("course1");
      expect(mockEq).toHaveBeenCalledWith("course_id", "course1");
      expect(mockOrder).toHaveBeenCalled();
    });

    it("returns requests filtered by status", async () => {
      await getCourseChangeRequests(undefined, "pending");
      expect(mockEq).toHaveBeenCalledWith("status", "pending");
      expect(mockOrder).toHaveBeenCalled();
    });

    it("returns requests filtered by courseId and status", async () => {
      await getCourseChangeRequests("course1", "pending");
      expect(mockEq).toHaveBeenCalledWith("course_id", "course1");
      expect(mockEq).toHaveBeenCalledWith("status", "pending");
      expect(mockEq.mock.calls.length).toBe(2);
      expect(mockOrder).toHaveBeenCalled();
    });

    it("throws on failure", async () => {
      const mockError = new Error("fetch failed");
      mockOrder.mockResolvedValue({ data: null, error: mockError });
      await expect(getCourseChangeRequests()).rejects.toThrow(mockError);
    });
  });

  // ---------- applyCourseChangeRequest ----------
  describe("applyCourseChangeRequest", () => {
    const mockRequest = {
      id: "req1",
      course_id: "course1",
      status: "pending",
      payload: {
        courseUpdates: { title: "New Title" },
        units: [mockUnit],
        lessons: [mockLesson],
      },
    };
    const mockCourseData = { author_id: "author1" };

    // Helper to create the full procedural mock
    const createApplyMock = (
      request: any,
      course: any,
      errors: any = {}
    ) => {
      const mockClient = {
        from: (table: string) => {
          if (table === "course_change_requests") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({ data: request, error: errors.fetchReq }),
                }),
              }),
              update: () => ({
                eq: async () => ({ error: errors.markErr }),
              }),
            };
          }
          if (table === "courses") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({ data: course, error: errors.courseErr }),
                }),
              }),
              update: () => ({
                eq: async () => ({ error: errors.updCourseErr }),
              }),
            };
          }
          if (table === "units") {
            return {
              upsert: async () => ({ error: errors.unitsErr }),
            };
          }
          if (table === "lessons") {
            return {
              upsert: async () => ({ error: errors.lessonsErr }),
            };
          }
          return {};
        },
      };
      (createServerClient as jest.Mock).mockResolvedValue(mockClient);
    };

    it("applies a change request successfully", async () => {
      createApplyMock(mockRequest, mockCourseData);
      const result = await applyCourseChangeRequest("req1", "author1");
      expect(result).toBe(true);
    });

    it("throws if request is not found", async () => {
      createApplyMock(null, mockCourseData, {
        fetchReq: new Error("not found"),
      });
      await expect(
        applyCourseChangeRequest("req1", "author1")
      ).rejects.toThrow("not found");
    });

    it("throws if request is not pending", async () => {
      const approvedRequest = { ...mockRequest, status: "approved" };
      createApplyMock(approvedRequest, mockCourseData);
      await expect(
        applyCourseChangeRequest("req1", "author1")
      ).rejects.toThrow("Request is not pending");
    });

    it("throws if course is not found", async () => {
      createApplyMock(mockRequest, null, {
        courseErr: new Error("course not found"),
      });
      await expect(
        applyCourseChangeRequest("req1", "author1")
      ).rejects.toThrow("course not found");
    });

    it("throws if approver is not the author", async () => {
      createApplyMock(mockRequest, { author_id: "other_author" });
      await expect(
        applyCourseChangeRequest("req1", "author1")
      ).rejects.toThrow("Only the course author can approve change requests");
    });

    it("throws if course update fails", async () => {
      createApplyMock(mockRequest, mockCourseData, {
        updCourseErr: new Error("update fail"),
      });
      await expect(
        applyCourseChangeRequest("req1", "author1")
   ).rejects.toThrow("update fail");
    });

    it("throws if units upsert fails", async () => {
      createApplyMock(mockRequest, mockCourseData, {
        unitsErr: new Error("units fail"),
      });
      await expect(
        applyCourseChangeRequest("req1", "author1")
      ).rejects.toThrow("units fail");
    });

    it("throws if lessons upsert fails", async () => {
      createApplyMock(mockRequest, mockCourseData, {
        lessonsErr: new Error("lessons fail"),
      });
      await expect(
        applyCourseChangeRequest("req1", "author1")
      ).rejects.toThrow("lessons fail");
    });

    it("throws if marking request as approved fails", async () => {
      createApplyMock(mockRequest, mockCourseData, {
        markErr: new Error("mark fail"),
      });
      await expect(
        applyCourseChangeRequest("req1", "author1")
      ).rejects.toThrow("mark fail");
    });
  });
});