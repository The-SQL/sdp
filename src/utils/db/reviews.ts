import { createClient } from "../supabase/client";
import { Review } from "../types";

export async function insertReview(review: Review): Promise<Review | null> {
  const supabase = createClient();

  const { data, error } = await supabase.from("course_feedback").insert(review);

  if (error) {
    console.error("Error inserting review:", error);
    throw new Error("Failed to insert review");
  }

  return data || null;
}
