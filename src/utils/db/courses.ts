import { createClient } from "@/utils/supabase/client";
import {
    Course
} from "../types";
/**
 * Inserts a new course into the database
 * @param course - The course object to insert
 * @returns The inserted course data
 */
export async function insertCourse(course: Course): Promise<Course | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("courses")
    .insert([course])
    .select();

  if (error) {
    console.error("Error inserting course:", error);
    throw error;
  }

  return data ? data[0] : null;
}

/**
 * Updates an existing course in the database
 * @param courseId - The ID of the course to update
 * @param updates - Partial course object with fields to update
 * @returns The updated course data
 */
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
