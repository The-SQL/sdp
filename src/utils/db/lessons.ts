import { createClient } from "@/utils/supabase/client";
import {
    Lesson
} from "../types";

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

export async function updateLesson(
  lessonId: string,
  updates: Partial<Lesson>
): Promise<Lesson> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("lessons")
    .update(updates)
    .eq("id", lessonId)
    .select();

  if (error) {
    console.error("Error updating lesson:", error);
    throw error;
  }

  return data[0];
}
