import { createClient } from "@/utils/supabase/server";
import { SupabaseCourseList } from "./client";
import { ensureUserInitialized, updateUserStreak } from "./profile";
import { Course } from "../types";

export interface CourseWithStats {
  id: string;
  title: string;
  level: string;
  language: string;
  image: string;
  duration: string;
  students: number;
  rating: number;
  reviews: string | number;
  author: string;
  description: string;
  tags: string[];
  isRecommended: boolean;
  price: string;
  isPublic: boolean;
  isPublished: boolean;
}

export async function insertUser(
  clerk_id: string,
  name: string,
  email: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .insert([{ clerk_id, name, email }])
    .select();

  if (error) {
    console.error("Error inserting user:", error);
    throw error;
  }

  await ensureUserInitialized(clerk_id);
  await updateUserStreak(clerk_id);

  return data;
}

export async function checkUserExists(clerk_id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerk_id);

  if (error) {
    console.error("Error checking user existence:", error);
    throw error;
  }

  return data ? data.length > 0 : false;
}

export async function getCoursesByAuthor(authorId: string): Promise<CourseWithStats[]> {
  const supabase = await createClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select(
      `
        *,
        languages(name),
        course_tags(
          tags(name)
        ),
        users(name),
        course_feedback(
          rating
        ),
        user_courses(
          id
        )
      `
    )
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to fetch courses");
  }

  const transformedCourses = (courses as SupabaseCourseList[]).map((course) => {
    const ratings = course.course_feedback?.map((fb) => fb.rating) || [];
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) /
          ratings.length
        : 0;

    const reviewCount = ratings.length;
    const enrolledStudents = course.user_courses?.length || 0;

    return {
      id: course.id,
      title: course.title,
      level: course.difficulty || "Beginner",
      language: course.languages?.name || "Unknown",
      image: course.profile_url || "/placeholder.svg",
      duration: course.estimated_duration || "Unknown",
      students: enrolledStudents,
      rating: averageRating,
      reviews: reviewCount || "No reviews yet",
      author: course.users?.name || "Unknown Author",
      description: course.description || "No description available",
      tags: course.course_tags
        ?.map((ct) => ct.tags?.name)
        .filter((name): name is string => name != null) || ["Language"],
      isRecommended: Math.random() > 0.5,
      price: "Free",
      isPublic: course.is_public || false,
      isPublished: course.is_published || false,
    };
  });

  return transformedCourses;
}

export async function getStandardCourseById(courseId: string): Promise<Course | null> {
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to fetch course");
  }

  return course;
}

export async function getLessonsByUnitId(unitId: string) {
  const supabase = await createClient();

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("unit_id", unitId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to fetch lessons");
  }

  return lessons;
}   

export async function getUnitsByCourseId(courseId: string) {
  const supabase = await createClient();

  const { data: units, error } = await supabase
    .from("units")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to fetch units");
  }

  return units;
}

export async function deleteCourseById(courseId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to delete course");
  }

  return true;
}