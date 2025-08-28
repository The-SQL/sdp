import { createClient } from "@/utils/supabase/client";
import { Course } from "../types";

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
