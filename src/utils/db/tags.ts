import { createClient } from "@/utils/supabase/client";


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
