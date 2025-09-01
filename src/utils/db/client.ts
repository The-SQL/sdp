import { createClient } from "@/utils/supabase/client";
import {
  Course, Language, Lesson, Unit,
  UserProfile,
  UserAchievement,
  UserCourse,
  UserCoursesState,
  UserProgress,
  UserStats,
} from "../types";

export async function checkUserExists(clerk_id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerk_id);

  if (error) {
    console.error("Error checking user existence:", error);
    throw error;
  }

  return data.length > 0;
}

export async function insertCourse(course: Course): Promise<Course> {
  const supabase = createClient();

  console.log("Inserting course:", course);

  const { data, error } = await supabase
    .from("courses")
    .insert([course])
    .select();

  if (error) {
    console.error("Error inserting course:", error);
    throw error;
  }

  return data[0];
}

export async function updateCourse(
  courseId: string,
  updates: Partial<Course>
): Promise<Course> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", courseId)
    .select();

  if (error) {
    console.error("Error updating course:", error);
    throw error;
  }

  return data[0];
}

export async function createLanguage(language: string): Promise<Language> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("languages")
    .insert({ name: language })
    .select();

  if (error) {
    console.error("Error creating language:", error);
    throw error;
  }

  return data[0];
}

export async function createTag(
  tag: string
): Promise<{ id: string; name: string }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tags")
    .insert({ name: tag })
    .select();

  if (error) {
    console.error("Error creating tag:", error);
    throw error;
  }

  return data[0];
}

export async function insertCourseTag(
  courseId: string,
  tagId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("course_tags")
    .insert({ course_id: courseId, tag_id: tagId });

  if (error) {
    console.error("Error inserting course tag:", error);
    throw error;
  }
}

export async function insertCourseTags(courseId: string, tagIds: string[]) {
  const supabase = createClient();

  const payload = tagIds.map((tagId) => ({
    course_id: courseId,
    tag_id: tagId,
  }));

  const { error } = await supabase.from("course_tags").insert(payload);

  if (error) throw error;
}

export async function insertUnit(
  courseId: string,
  title: string,
  order_index: number
): Promise<Unit> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("units")
    .insert({ course_id: courseId, title, order_index })
    .select();

  if (error) {
    console.error("Error inserting unit:", error);
    throw error;
  }

  return data[0];
}

export async function insertUnits(courseId: string, units: Unit[]) {
  const supabase = createClient();

  const payload = units.map((unit) => ({
    course_id: courseId,
    id: unit.id,
    title: unit.title,
    order_index: unit.order_index,
  }));

  const { error } = await supabase.from("units").insert(payload);

  if (error) throw error;
}

export async function insertLesson(
  unitId: string,
  title: string,
  content_type: string,
  content: object,
  order_index: number
): Promise<Lesson> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("lessons")
    .insert({
      unit_id: unitId,
      title,
      content_type,
      content,
      order_index,
    })
    .select();

  if (error) {
    console.error("Error inserting lesson:", error);
    throw error;
  }

  return data[0];
}

export async function insertLessons(courseId: string, lessons: Lesson[]) {
  const supabase = createClient();

  const payload = lessons.map((lesson) => ({
    unit_id: lesson.unit_id,
    title: lesson.title,
    order_index: lesson.order_index,
    content_type: lesson.content_type,
    content: lesson.content,
    duration: 888,
  }));

  const { error } = await supabase.from("lessons").insert(payload);

  if (error) throw error;
}

export const uploadImageToSupabase = async (
  file: File,
  bucket: string,
  fileName: string
): Promise<string> => {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).upload(fileName, file);
  if (error) {
    console.error("Error uploading image:", error.message);
    throw error;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error.message);
    return null;
  }

  return data;
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user stats:", error.message);
    return null;
  }

  return data;
}

export async function getUserAchievements(
  userId: string
): Promise<UserAchievement[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user achievements:", error.message);
    return null;
  }

  return data;
}

export async function getUserProgress(
  userId: string
): Promise<UserProgress[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user progress:", error.message);
    return null;
  }

  return data;
}

export async function getUserCourses(userId: string): Promise<UserCoursesState | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_courses")
    .select(
      `
        *,
        course:course_id (
          title,
          language:language_id (name)
        )
      `
    )
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Courses fetch error:", error);
    return null;
  }

  const userCourses: UserCourse[] = data.map((c) => ({
    id: c.id,
    course_id: c.course_id,
    enrolled_at: c.enrolled_at,
    completed_at: c.completed_at,
    overall_progress: c.overall_progress,
    course_title: c.course.title,
  }));

  const languageNames = [...new Set(data.map((c) => c.course.language.name))];
  const num_completed = userCourses.filter((c) => c.completed_at !== null).length;
  const num_in_progress = userCourses.filter((c) => c.completed_at === null).length;

  return {
    data: userCourses,
    languageNames,
    num_completed,
    num_in_progress,
  };
}

