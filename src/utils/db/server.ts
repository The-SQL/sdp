import { createClient } from "@/utils/supabase/server";
import { updateUserStreak } from "./profile";
import { SupabaseCourseList } from "./client";
import { ensureUserInitialized, updateUserStreak } from "./profile";
import {
  Course,
  Lesson,
  SuggestedChange,
  SuggestedChangePayload,
  Unit,
} from "../types";

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
  author_id?: string; // include author id so UI can tell if it's the current user
  description: string;
  tags: string[];
  isRecommended: boolean;
  price: string;
  isPublic: boolean;
  isPublished: boolean;
  isCollaborator: boolean; // new flag to mark collaborator courses
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

   await updateUserStreak(clerk_id)

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

export async function getCoursesByAuthor(
  authorId: string
): Promise<CourseWithStats[]> {
  const supabase = await createClient();

  const selectString = `
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
      `;

  // Fetch courses authored by the user
  const { data: authoredCourses, error } = await supabase
    .from("courses")
    .select(selectString)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching authored courses:", error);
    throw new Error("Failed to fetch courses");
  }

  // Fetch course IDs where the user is an active collaborator
  const { data: collaboratorRows, error: collabError } = await supabase
    .from("collaborators")
    .select("course_id")
    .eq("user_id", authorId)
    .eq("status", "active");

  if (collabError) {
    // log and continue — we still want to return authored courses if collaborator query fails
    console.error("Supabase error fetching collaborator rows:", collabError);
  }

  const collabCourseIds = (collaboratorRows || []).map(
    (r: { course_id: string }) => r.course_id
  );
  const collabSet = new Set<string>(collabCourseIds);
  const authoredIdSet = new Set<string>(
    (authoredCourses || []).map((c: { id: string }) => c.id)
  );

  // Fetch collaborator courses if any
  let collaboratorCourses: SupabaseCourseList[] = [];
  if (collabCourseIds.length > 0) {
    const { data: collabCoursesData, error: collabCoursesError } =
      await supabase
        .from("courses")
        .select(selectString)
        .in("id", collabCourseIds)
        .order("created_at", { ascending: false });

    if (collabCoursesError) {
      console.error(
        "Supabase error fetching collaborator courses:",
        collabCoursesError
      );
    } else {
      collaboratorCourses = (collabCoursesData as SupabaseCourseList[]) || [];
    }
  }

  // Merge authored and collaborator courses, dedupe by id (authored courses take precedence)
  const combined = (
    [...(authoredCourses || []), ...collaboratorCourses] as SupabaseCourseList[]
  ).filter(Boolean);
  const dedupedMap = new Map<string, SupabaseCourseList>();
  combined.forEach((c) => {
    if (!dedupedMap.has(c.id)) dedupedMap.set(c.id, c);
  });
  const allCourses = Array.from(dedupedMap.values());

  const transformedCourses = allCourses.map((course) => {
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
      author_id: course.author_id,
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
      isCollaborator: collabSet.has(course.id) && !authoredIdSet.has(course.id),
    };
  });

  return transformedCourses;
}

export async function getStandardCourseById(
  courseId: string
): Promise<Course | null> {
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

export async function getLessonsByUnitId(unitId: string): Promise<Lesson[]> {
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

export async function getUnitsByCourseId(courseId: string): Promise<Unit[]> {
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

  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to delete course");
  }

  return true;
}

export async function createCourseChangeRequest(
  courseId: string,
  collaboratorId: string,
  summary: string,
  payload: SuggestedChangePayload
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_change_requests")
    .insert([
      {
        course_id: courseId,
        collaborator_id: collaboratorId,
        summary,
        payload,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating change request:", error);
    throw error;
  }

  return data as SuggestedChange;
}

export async function getCourseChangeRequests(
  courseId?: string,
  status?: string
): Promise<SuggestedChange[] | null> {
  const supabase = await createClient();
  let q = supabase.from("course_change_requests").select("*");
  if (courseId) q = q.eq("course_id", courseId);
  if (status) q = q.eq("status", status);
  const { data, error } = await q.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching change requests:", error);
    throw error;
  }

  return data as SuggestedChange[] | null;
}

export async function applyCourseChangeRequest(
  requestId: string,
  approverId: string
): Promise<boolean> {
  const supabase = await createClient();

  // fetch request
  const { data: req, error: fetchErr } = await supabase
    .from("course_change_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (fetchErr || !req) {
    console.error("Error fetching change request:", fetchErr);
    throw fetchErr || new Error("Change request not found");
  }

  if (req.status !== "pending") {
    throw new Error("Request is not pending");
  }

  // verify approver is author
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("author_id")
    .eq("id", req.course_id)
    .single();

  if (courseErr || !course) {
    console.error("Error fetching course for approval:", courseErr);
    throw courseErr || new Error("Course not found");
  }

  if (course.author_id !== approverId) {
    throw new Error("Only the course author can approve change requests");
  }

  const payload = req.payload || {};

  // Apply top-level course updates
  if (payload.courseUpdates) {
    const { error: updCourseErr } = await supabase
      .from("courses")
      .update(payload.courseUpdates)
      .eq("id", req.course_id);

    if (updCourseErr) {
      console.error("Error applying course updates:", updCourseErr);
      throw updCourseErr;
    }
  }

  // Apply units (upsert by id)
  if (payload.units && payload.units.length) {
    const unitsPayload = payload.units.map((u: Unit) => ({
      id: u.id,
      course_id: req.course_id,
      title: u.title,
      order_index: u.order_index,
    }));

    const { error: unitsErr } = await supabase
      .from("units")
      .upsert(unitsPayload);
    if (unitsErr) {
      console.error("Error upserting units:", unitsErr);
      throw unitsErr;
    }
  }

  // Apply lessons (upsert by id)
  if (payload.lessons && payload.lessons.length) {
    const lessonsPayload = payload.lessons.map((l: Lesson) => ({
      id: l.id,
      unit_id: l.unit_id,
      title: l.title,
      order_index: l.order_index,
      content_type: l.content_type,
      content: l.content,
    }));

    const { error: lessonsErr } = await supabase
      .from("lessons")
      .upsert(lessonsPayload);
    if (lessonsErr) {
      console.error("Error upserting lessons:", lessonsErr);
      throw lessonsErr;
    }
  }

  // mark request approved
  const { error: markErr } = await supabase
    .from("course_change_requests")
    .update({
      status: "approved",
      reviewed_by: approverId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (markErr) {
    console.error("Error marking change request approved:", markErr);
    throw markErr;
  }

  return true;
}
