import { createClient } from "@/utils/supabase/client";
import {
  checkUserExists,
  insertCourse,
  updateCourse,
  createLanguage,
  createTag,
  insertCourseTag,
  insertCourseTags,
  insertUnit,
  insertUnits,
  insertLesson,
  insertLessons,
  uploadImageToSupabase,
} from "../utils/db/client";
import { makeSupabaseMock } from "../__mocks__/supabase";

jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("client db functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("checkUserExists returns true when user exists", async () => {
    const mock = makeSupabaseMock({
      selectEq: { data: [{}], error: null },
    });
    (createClient as jest.Mock).mockReturnValue(mock.client);
    const result = await checkUserExists("123");
    expect(result).toBe(true);
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
        content_type: "text",
        content: {},
        duration: 888,
      },
      {
        id: "2",
        unit_id: "1",
        title: "Lesson2",
        order_index: 2,
        content_type: "text",
        content: {},
        duration: 888,
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
