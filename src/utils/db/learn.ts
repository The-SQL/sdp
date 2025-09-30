// utils/db/learn.ts
import { createClient } from "@/utils/supabase/client";
import { UnitWithLessons, CourseWithContent, Lesson } from "../types";

export async function getCourseWithContent(courseId: string) {
  const supabase = createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select(
      `
    id,
    title,
    description,
    difficulty,
    profile_url,
    units:units(
      id,
      title,
      order_index,
      course_id,
      lessons:lessons(
        id,
        title,
        content_type,
        content,
        order_index,
        duration,
        description,
        unit_id
      )
    )
  `
    )
    .eq("id", courseId)
    .single();

  if (courseError) {
    console.error("Error fetching course:", courseError);
    throw courseError;
  }

  // Ensure units and lessons are ordered by order_index
  if (course && Array.isArray(course.units)) {
    course.units.sort(
      (a: UnitWithLessons, b: UnitWithLessons) =>
        (Number(a.order_index) || 0) - (Number(b.order_index) || 0)
    );

    course.units.forEach((unit: UnitWithLessons) => {
      if (Array.isArray(unit.lessons)) {
        unit.lessons.sort(
          (a: Lesson, b: Lesson) =>
            (Number(a.order_index) || 0) - (Number(b.order_index) || 0)
        );
      }
    });
  }

  return course;
}

export async function getUserProgress(
  userId: string,
  courseId: string
): Promise<
  {
    lesson_id: string;
    status: string;
    last_accessed: string;
    score: number;
  }[]
> {
  const supabase = createClient();

  const { data: progress, error } = await supabase
    .from("user_progress")
    .select(
      `
      lesson_id,
      status,
      last_accessed,
      score
    `
    )
    .eq("user_id", userId)
    .in(
      "lesson_id",
      (
        await supabase
          .from("lessons")
          .select("id")
          .in(
            "unit_id",
            (
              await supabase
                .from("units")
                .select("id")
                .eq("course_id", courseId)
            ).data?.map((u) => u.id) || []
          )
      ).data?.map((l) => l.id) || []
    );

  if (error) {
    console.error("Error fetching user progress:", error);
    return [];
  }

  return progress || [];
}

export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  status: "not_started" | "in_progress" | "completed",
  score?: number
) {
  const supabase = createClient();

  // Check if progress record exists
  const { data: existingProgress } = await supabase
    .from("user_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .single();

  if (existingProgress) {
    // Update existing progress
    const { error } = await supabase
      .from("user_progress")
      .update({
        status,
        score,
        last_accessed: new Date().toISOString(),
      })
      .eq("id", existingProgress.id);

    if (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  } else {
    // Create new progress record
    const { error } = await supabase.from("user_progress").insert({
      user_id: userId,
      lesson_id: lessonId,
      status,
      score,
      last_accessed: new Date().toISOString(),
    });

    if (error) {
      console.error("Error creating progress:", error);
      throw error;
    }
  }

  // Update overall course progress
  await updateCourseProgress(userId, lessonId);
}

async function updateCourseProgress(userId: string, lessonId: string) {
  const supabase = createClient();

  // Get the unit_id from the lesson first
  const { data: lesson } = await supabase
    .from("lessons")
    .select("unit_id")
    .eq("id", lessonId)
    .single();

  if (!lesson) return;

  // Then get the course_id from the unit
  const { data: unit } = await supabase
    .from("units")
    .select("course_id")
    .eq("id", lesson.unit_id)
    .single();

  if (!unit) return;

  const courseId = unit.course_id;

  // Get all lessons in the course
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .in(
      "unit_id",
      (
        await supabase.from("units").select("id").eq("course_id", courseId)
      ).data?.map((u) => u.id) || []
    );

  if (!lessons) return;

  // Get user's progress for all lessons in the course
  const { data: progress } = await supabase
    .from("user_progress")
    .select("lesson_id, status")
    .eq("user_id", userId)
    .in(
      "lesson_id",
      lessons.map((l) => l.id)
    );

  // Calculate overall progress percentage
  const completedLessons =
    progress?.filter((p) => p.status === "completed").length || 0;
  const totalLessons = lessons.length;
  const overallProgress =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Update user_courses table
  const { data: userCourse } = await supabase
    .from("user_courses")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (userCourse) {
    // Update existing record
    await supabase
      .from("user_courses")
      .update({
        overall_progress: overallProgress,
        completed_at: overallProgress === 100 ? new Date().toISOString() : null,
      })
      .eq("id", userCourse.id);
  } else {
    // Create new record if user is enrolled
    await supabase.from("user_courses").insert({
      user_id: userId,
      course_id: courseId,
      overall_progress: overallProgress,
      enrolled_at: new Date().toISOString(),
      completed_at: overallProgress === 100 ? new Date().toISOString() : null,
    });
  }
}

export async function checkIfEnrolled(
  userId: string,
  courseId: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_courses")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking enrollment:", error);
    return false;
  }

  return !!data;
}

export async function enrollInCourse(
  userId: string,
  courseId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("user_courses").insert({
    user_id: userId,
    course_id: courseId,
    enrolled_at: new Date().toISOString(),
    overall_progress: 0,
  });

  if (error) {
    console.error("Error enrolling in course:", error);
    throw error;
  }
}
