import { createClient } from "@/utils/supabase/client";
import {
    Collaborators,
    CollaboratorStatus
} from "../types";

export interface CollaboratorWithUser extends Collaborators {
  users?: {
    clerk_id: string;
    name: string;
    profile_url: string | null;
    bio: string | null;
  } | null;
}

export async function getCourseCollaborators(
  courseId: string
): Promise<CollaboratorWithUser[] | null> {
  const supabase = createClient();

  // Get collaborator records along with user details using an embedded select
  const { data, error } = await supabase
    .from("collaborators")
    .select(
      `
          *,
          users(
            clerk_id,
            name,
            profile_url,
            bio
          )
        `
    )
    .eq("course_id", courseId);

  if (error) {
    console.error("Error fetching course collaborators:", error.message);
    return null;
  }

  return data as CollaboratorWithUser[] | null;
}

export async function updateCollaborationStatus(
  courseId: string,
  userId: string,
  status: CollaboratorStatus
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("collaborators")
    .update({ status })
    .eq("course_id", courseId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating collaboration status:", error);
    throw error;
  }
}

export async function addCollaborator(
  courseId: string,
  userId: string,
  status: CollaboratorStatus
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("collaborators")
    .insert([{ course_id: courseId, user_id: userId, status }]);

  if (error && error.code === "23505") {
    await updateCollaborationStatus(courseId, userId, status);
  } else if (error) {
    console.error("Error adding collaborator:", error);
    throw error;
  }
}

export async function removeCollaborator(
  courseId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("collaborators")
    .delete()
    .eq("course_id", courseId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error removing collaborator:", error);
    throw error;
  }
}

export async function updateCollaboratorStatus(
  collaboratorId: string,
  status: CollaboratorStatus
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("collaborators")
    .update({ status })
    .eq("id", collaboratorId);

  if (error) {
    console.error("Error updating collaborator status:", error);
    throw error;
  }
}

export async function getCourseCollaborator(
  courseId: string,
  userId: string
): Promise<Collaborators | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("collaborators")
    .select("*")
    .eq("course_id", courseId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching course collaborator:", error.message);
    return null;
  }

  return data[0];
}

export async function cancelCollaboration(
  courseId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("collaborators")
    .update({ status: "cancelled" })
    .eq("course_id", courseId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error cancelling collaboration:", error);
    throw error;
  }
}
