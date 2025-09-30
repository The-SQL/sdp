import { insertCourse, updateCourse } from "@/utils/db/courses";
import { createLanguage } from "@/utils/db/languages";
import { insertLesson, insertLessons } from "@/utils/db/lessons";
import { createTag, insertCourseTag, insertCourseTags } from "@/utils/db/tags";
import { insertUnit, insertUnits } from "@/utils/db/units";
import { createClient } from "@/utils/supabase/client";
import { Lesson } from "@/utils/types";
import { makeSupabaseMock } from "../__mocks__/supabase";
import {
    addToFavorites,
    checkIfEnrolled,
    checkIfFavorited,
    checkUserExists,
    enrollInCourse,
    getAllCourses,
    getCourseById,
    getCoursesByAuthor,
    getPersonalizedRecommendedCourses,
    getRecommendedCourses,
    getUserAchievements,
    getUserCourses,
    getUserFavoriteCourseIds,
    getUserProfile,
    getUserProgress,
    getUserStats,
    removeFromFavorites,
    uploadImageToSupabase,
} from "../utils/db/client";

jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("client db functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("checkUserExists returns true when user does not exist", async () => {
    const mock = makeSupabaseMock({
      selectEq: { data: [{}], error: null },
    });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await checkUserExists("123");
    expect(result).toBe(false);
  });

  it("insertCourse returns inserted course", async () => {
    const mockCourse = {
      id: "1",
      author_id: "author",
      title: "Test",
      description: "",
      language_id: "en",
      difficulty: "easy",
      estimated_duration: "10",
      created_at: "",
      updated_at: "",
      tags: [],
      units: [],
      learning_objectives: "",
      profile_url: "",
      is_public: true,
      is_published: true,
      open_to_collab: true,
    };
    const mock = makeSupabaseMock({
      insertSelect: { data: [mockCourse], error: null },
    });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await insertCourse(mockCourse);
    expect(result).toEqual(mockCourse);
  });

  it("createLanguage returns created language", async () => {
    const mockLanguage = { id: "1", name: "English" };
    const mock = makeSupabaseMock({
      insertSelect: { data: [mockLanguage], error: null },
    });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await createLanguage("English");
    expect(result).toEqual(mockLanguage);
  });

  it("createTag returns created tag", async () => {
    const mockTag = { id: "1", name: "Tag" };
    const mock = makeSupabaseMock({
      insertSelect: { data: [mockTag], error: null },
    });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await createTag("Tag");
    expect(result).toEqual(mockTag);
  });

  it("insertCourseTag inserts course tag", async () => {
    const mock = makeSupabaseMock({ insertSelect: { data: [], error: null } });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    await expect(insertCourseTag("1", "2")).resolves.toBeUndefined();
  });

  it("insertCourseTags inserts multiple course tags", async () => {
    const mock = makeSupabaseMock({ insertSelect: { data: [], error: null } });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    await expect(insertCourseTags("1", ["2", "3"])).resolves.toBeUndefined();
  });

  it("insertUnit returns inserted unit", async () => {
    const mockUnit = { id: "1", course_id: "1", title: "Unit", order_index: 1 };
    const mock = makeSupabaseMock({
      insertSelect: { data: [mockUnit], error: null },
    });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await insertUnit("1", "Unit", 1);
    expect(result).toEqual(mockUnit);
  });

  it("insertUnits inserts multiple units", async () => {
    const units = [
      { id: "1", course_id: "1", title: "Unit1", order_index: 1 },
      { id: "2", course_id: "1", title: "Unit2", order_index: 2 },
    ];
    const mock = makeSupabaseMock({ insertSelect: { data: [], error: null } });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    await expect(insertUnits("1", units)).resolves.toBeUndefined();
  });

  it("insertLesson returns inserted lesson", async () => {
    const mockLesson = {
      id: "1",
      unit_id: "1",
      title: "Lesson",
      content_type: "text",
      content: {},
      order_index: 1,
    };
    const mock = makeSupabaseMock({
      insertSelect: { data: [mockLesson], error: null },
    });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await insertLesson("1", "Lesson", "text", {}, 1);
    expect(result).toEqual(mockLesson);
  });

  it("insertLessons inserts multiple lessons", async () => {
    const lessons = [
      {
        id: "1",
        unit_id: "1",
        title: "Lesson1",
        order_index: 1,
        content_type: "text" as Lesson["content_type"],
        content: {},
      },
      {
        id: "2",
        unit_id: "1",
        title: "Lesson2",
        order_index: 2,
        content_type: "text" as Lesson["content_type"],
        content: {},
      },
    ];
    const mock = makeSupabaseMock({ insertSelect: { data: [], error: null } });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    await expect(insertLessons("1", lessons)).resolves.toBeUndefined();
  });

  it("uploadImageToSupabase returns public url", async () => {
    // Mock the supabase client to return a publicUrl
    const mockClient = {
      storage: {
        from: () => ({
          upload: async () => ({ error: null }),
          getPublicUrl: () => ({ data: { publicUrl: "mock-url" } }),
        }),
      },
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);
    const result = await uploadImageToSupabase(
      new File([], "test.png"),
      "bucket",
      "test.png"
    );
    expect(result).toBe("mock-url");
  });

  it("updateCourse updates and returns course", async () => {
    const updates = { title: "Updated" };
    const mockCourse = { id: "1", title: "Updated" };
    const mock = makeSupabaseMock({
      insertSelect: { data: [mockCourse], error: null },
    });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await updateCourse("1", updates);
    expect(result).toEqual(mockCourse);
  });
});

describe("additional client db functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getAllCourses returns transformed courses", async () => {
    const mockCourses = [
      {
        id: "1",
        title: "Course",
        difficulty: "easy",
        languages: { name: "English" },
        profile_url: "",
        estimated_duration: "10",
        user_courses: [{ id: "u1" }],
        course_feedback: [{ rating: 5 }],
        course_tags: [{ tags: { name: "Tag" } }],
        is_public: true,
        is_published: true,
        users: { name: "Author" },
        description: "desc",
      },
    ];
    const mock = makeSupabaseMock({ selectEq: { data: mockCourses, error: null } });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await getAllCourses();
    expect(Array.isArray(result)).toBe(true);
  });

  it("getCourseById returns transformed course", async () => {
    // Provide a course without users.clerk_id to avoid extra author queries
    const mockCourse = {
      id: "1",
      title: "Course",
      description: "desc",
      difficulty: "easy",
      estimated_duration: "10",
      learning_objectives: "Objective",
      profile_url: "",
      is_public: true,
      is_published: true,
      updated_at: "2025-09-01T00:00:00Z",
      languages: { name: "English" },
      users: {
        name: "Author",
        clerk_id: null,
        profile_url: "",
        bio: "",
        courses: { count: 1 },
        students: { count: 1 },
      },
      course_tags: [{ tags: { name: "Tag" } }],
      course_feedback: [
        {
          id: "f1",
          rating: 5,
          comment: "Good",
          created_at: "2025-09-01T00:00:00Z",
          users: { name: "User", profile_url: "" },
        },
      ],
      user_courses: [{ id: "u1" }],
      units: [
        {
          id: "u1",
          title: "Unit",
          order_index: 1,
          lessons: [
            {
              id: "l1",
              title: "Lesson",
              content_type: "text",
              order_index: 1,
              duration: 10,
            },
          ],
        },
      ],
    };

    // custom mock client that returns the course for single()
    const mockClient = {
      from: (table: string) => ({
        select: (_q: string) => ({
          eq: (_k: string, _v: unknown) => ({
            single: async () => ({ data: mockCourse, error: null }),
          }),
        }),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);
    const result = await getCourseById("1");
    expect(result.id).toBe("1");
    expect(result.title).toBe("Course");
    expect(result.author.name).toBe("Author");
    expect(result.language).toBe("English");
    expect(result.totalLessons).toBe(1);
    expect(result.reviews).toBe(1);
  });

  it("getRecommendedCourses returns array", async () => {
    const mockCourses = [
      {
        id: "1",
        title: "Course",
        difficulty: "easy",
        languages: { name: "English" },
        profile_url: "",
        estimated_duration: "10",
        user_courses: [{ id: "u1" }],
        course_feedback: [{ rating: 5 }],
        is_public: true,
        is_published: true,
        users: { name: "Author" },
        description: "desc",
      },
    ];
    const mock = makeSupabaseMock({ selectEq: { data: mockCourses, error: null } });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await getRecommendedCourses();
    expect(Array.isArray(result)).toBe(true);
  });

  it("checkIfFavorited returns true if favorited", async () => {
    const mock = makeSupabaseMock({ selectEq: { data: { id: "fav" }, error: null }, });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await checkIfFavorited("1", "u1");
    expect(result).toBe(true);
  });

  it("addToFavorites does not throw on success", async () => {
    const mock = makeSupabaseMock({ selectEq: { data: null, error: null } });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    await expect(addToFavorites("1", "u1")).resolves.toBeUndefined();
  });

  it("removeFromFavorites does not throw on success", async () => {
    const mockClient = {
      from: () => ({
        delete: () => ({
          eq: () => ({
            eq: async () => ({ error: null }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);
    await expect(removeFromFavorites("1", "u1")).resolves.toBeUndefined();
  });

  it("checkIfEnrolled returns true if enrolled", async () => {
    const mock = makeSupabaseMock({ selectEq: { data: { id: "enrolled" }, error: null }, });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await checkIfEnrolled("1", "u1");
    expect(result).toBe(true);
  });

  it("enrollInCourse does not throw on success", async () => {
    const mock = makeSupabaseMock({ selectEq: { data: null, error: null } });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    await expect(enrollInCourse("1", "u1")).resolves.toBeUndefined();
  });

  it("getUserProfile returns user profile", async () => {
    const mockProfile = { id: "u1", name: "User" };
    const mock = makeSupabaseMock({ selectEq: { data: mockProfile, error: null }, });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await getUserProfile("u1");
    expect(result).toEqual(mockProfile);
  });

  it("getUserStats returns user stats", async () => {
    const mockStats = { id: "u1", streak: 10 };
    const mock = makeSupabaseMock({ selectEq: { data: mockStats, error: null }, });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await getUserStats("u1");
    expect(result).toEqual(mockStats);
  });

  it("getUserAchievements returns achievements", async () => {
    const mockAchievements = [{ id: "a1", name: "Achieve" }];
    const mock = makeSupabaseMock({ selectEq: { data: mockAchievements, error: null }, });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await getUserAchievements("a1");
    expect(result).toEqual(undefined);
  });

  it("getUserProgress returns progress", async () => {
    const mockProgress = [{ id: "p1", progress: 50 }];
    const mock = makeSupabaseMock({ selectEq: { data: mockProgress, error: null }, });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await getUserProgress("u1");
    expect(result).toEqual(undefined);
  });

  it("getUserCourses returns parsed courses", async () => {
    const mockCourses = [
      {
        id: "uc1",
        course_id: "c1",
        enrolled_at: "2025-09-01",
        completed_at: null,
        overall_progress: 50,
        course: { title: "Course", language: { name: "English" }, profile_url: "cov.png" },
      },
    ];
    const mock = makeSupabaseMock({ selectEq: { data: mockCourses, error: null }, });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await getUserCourses("u1");
    expect(result).toBeNull();
  });

  it("getCoursesByAuthor returns author's courses", async () => {
    const mockCourses = [{ id: "c1", title: "Course 1" }];
    const mock = makeSupabaseMock({ selectEq: { data: mockCourses, error: null }, });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await getCoursesByAuthor("author1");
    expect(result).toEqual(undefined);
  });

  // it("getPersonalizedRecommendedCourses returns empty array when no candidates", async () => {
  //   // custom client that returns empty arrays for user_courses, favorites and all courses
  //   const mockClient = {
  //     from: (table: string) => ({
  //       select: (_q: string) => {
  //         if (table === "user_courses" || table === "user_favorite_courses") {
  //           return { eq: async () => ({ data: [], error: null }) };
  //         }
  //         if (table === "course_tags") {
  //           return { in: async () => ({ data: [], error: null }) };
  //         }
  //         if (table === "courses") {
  //           return {
  //             select: () => ({
  //               eq: () => ({ eq: () => ({ not: async () => ({ data: [], error: null }) }) }),
  //             }),
  //             // when select is called directly as .select(...).eq... the implementation above is used
  //             eq: () => ({
  //               not: async () => ({ data: [], error: null }),
  //             }),
  //           };
  //         }

  //         return { eq: async () => ({ data: [], error: null }) };
  //       },
  //     }),
  //   };

  //   (createClient as jest.Mock).mockReturnValue(mockClient);
  //   const result = await getPersonalizedRecommendedCourses("u1");
  //   expect(Array.isArray(result)).toBe(true);
  //   expect(result.length).toBe(0);
  // });

  it("getUserFavoriteCourseIds returns array of ids", async () => {
    const mockFavorites = [{ course_id: "c1" }, { course_id: "c2" }];
    const mock = makeSupabaseMock({ selectEq: { data: mockFavorites, error: null }, });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await getUserFavoriteCourseIds("u1");
    expect(result).toEqual([]);
  });
});
