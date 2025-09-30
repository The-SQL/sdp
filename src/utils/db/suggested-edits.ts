import { createClient } from "@/utils/supabase/client";
import {
    SuggestedChange,
    SuggestedChangeStatus
} from "../types";


export async function insertSuggestedEdit(
  suggestedChanges: SuggestedChange
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("suggested_edits")
    .insert([suggestedChanges]);

  if (error) {
    console.error("Error inserting suggested edit:", error);
    throw error;
  }
}

export async function getCourseSuggestedEdits(
  courseId: string
): Promise<SuggestedChange[] | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("suggested_edits")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching suggested edits:", error.message);
    return null;
  }

  return data;
}

export async function updateSuggestedEditStatus(
  editId: string,
  status: SuggestedChangeStatus,
  reviewedBy: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("suggested_edits")
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", editId);

  if (error) {
    console.error("Error updating suggested edit status:", error);
    throw error;
  }
}
