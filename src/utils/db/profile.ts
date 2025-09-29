import { createClient } from "@/utils/supabase/client";
import {
  UserProfile,
  UserAchievement,
  UserCourse,
  UserCoursesState,
  UserProgress,
  UserStats,
} from "../types";

// Define types for Supabase responses
interface StreakData {
  current_streak: number;
  longest_streak: number;
  updated_at: string;
}

interface UserAchievementDB {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  earned: boolean;
  earned_at?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  requirement: {
    count?: number;
    days?: number;
  };
}

interface CourseWithLanguage {
  course: {
    language_id: string;
    title: string;
    language: {
      name: string;
    };
  };
}

// ---------------- User Profile ----------------
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (error) console.error("Error fetching user profile:", error.message);
  return data;
}

// ---------------- User Stats ----------------
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = createClient();

  try {
    const streak = await updateUserStreak(userId);

    const [lessonsRes, coursesRes, quizzesRes] = await Promise.all([
      supabase.from("user_progress").select("status").eq("user_id", userId),
      supabase
        .from("user_courses")
        .select("completed_at, course:course_id(language_id)")
        .eq("user_id", userId),
      supabase.from("quiz_attempts").select("score").eq("user_id", userId),
    ]);

    if (lessonsRes.error)
      console.error("Error fetching lessons:", lessonsRes.error);
    if (coursesRes.error)
      console.error("Error fetching courses:", coursesRes.error);
    if (quizzesRes.error)
      console.error("Error fetching quizzes:", quizzesRes.error);

    const lessons_completed =
      lessonsRes.data?.filter((l) => l.status === "completed").length ?? 0;
    const courses_completed =
      coursesRes.data?.filter((c) => c.completed_at).length ?? 0;
    const languages_learned = new Set(
      coursesRes.data
        ?.filter((c) => c.completed_at)
        .map((c) => (c as unknown as CourseWithLanguage).course.language_id) ||
        []
    ).size;

    const quizzes_passed =
      quizzesRes.data?.filter((q) => q.score >= 50).length ?? 0;

    return {
      current_streak: streak.current_streak,
      longest_streak: streak.longest_streak,
      total_lessons: lessonsRes.data?.length ?? 0,
      total_points: 0,
      lessons_completed,
      courses_completed,
      streak: streak.current_streak,
      languages_learned,
      quizzes_passed,
    };
  } catch (err) {
    console.error("Unexpected error in getUserStats:", err);
    return null;
  }
}

// ---------------- User Achievements ----------------
export async function getUserAchievements(
  userId: string
): Promise<UserAchievement[] | null> {
  const supabase = createClient();

  try {
    const stats = await getUserStats(userId);
    if (!stats) return null;

    const [allAchievementsRes, userAchievementsRes] = await Promise.all([
      supabase.from("achievements").select<string, Achievement>("*"),
      supabase
        .from("user_achievements")
        .select<string, UserAchievementDB>("*")
        .eq("user_id", userId),
    ]);

    if (!allAchievementsRes.data || allAchievementsRes.error) {
      console.error(
        "Error fetching achievements:",
        allAchievementsRes.error?.message
      );
      return null;
    }
    if (userAchievementsRes.error) {
      console.error(
        "Error fetching user achievements:",
        userAchievementsRes.error.message
      );
    }

    const uaMap = new Map<string, UserAchievementDB>();
    userAchievementsRes.data?.forEach((ua) => uaMap.set(ua.achievement_id, ua));

    const missingAchievements = allAchievementsRes.data
      .filter((a) => !uaMap.has(a.id))
      .map((a) => ({
        user_id: userId,
        achievement_id: a.id,
        earned: false,
        progress: 0,
      }));

    if (missingAchievements.length > 0) {
      const { data: inserted, error: insertErr } = await supabase
        .from("user_achievements")
        .upsert(missingAchievements)
        .select();
      if (insertErr)
        console.error(
          "Error upserting missing achievements:",
          insertErr.message
        );
      inserted?.forEach((ua) => uaMap.set(ua.achievement_id, ua));
    }

    const updates: UserAchievementDB[] = [];
    for (const [achievementId, ua] of uaMap) {
      const achievement = allAchievementsRes.data.find(
        (a) => a.id === achievementId
      );
      if (!achievement) continue;

      let progress = 0;
      switch (achievement.type) {
        case "lesson_completed":
          progress = stats.lessons_completed;
          break;
        case "course_completed":
          progress = stats.courses_completed;
          break;
        case "streak":
          progress = stats.streak;
          break;
        case "language_learning":
          progress = stats.languages_learned;
          break;
        case "quiz_passed":
          progress = stats.quizzes_passed;
          break;
      }

      const goal =
        achievement.requirement.count ?? achievement.requirement.days ?? 0;
      const earned = !ua.earned && progress >= goal;

      updates.push({
        ...ua,
        progress: Math.min(progress, goal),
        earned: ua.earned || earned,
        earned_at: earned ? new Date().toISOString() : ua.earned_at,
      });
    }

    if (updates.length > 0) {
      const { error: updateErr } = await supabase
        .from("user_achievements")
        .upsert(updates);
      if (updateErr)
        console.error("Error updating achievements:", updateErr.message);
    }

    return Array.from(uaMap.values()).map((ua) => {
      const achievement = allAchievementsRes.data.find(
        (a) => a.id === ua.achievement_id
      )!;
      const goal =
        achievement.requirement.count ?? achievement.requirement.days ?? 0;
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        earned: ua.earned,
        date: ua.earned_at
          ? new Date(ua.earned_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : undefined,
        progress: ua.progress,
        goal,
      };
    });
  } catch (err) {
    console.error("Unexpected error in getUserAchievements:", err);
    return null;
  }
}

// ---------------- User Courses ----------------
export async function getUserCourses(
  userId: string
): Promise<UserCoursesState | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_courses")
    .select("*, course:course_id(title, language:language_id(name))")
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Courses fetch error:", error);
    return null;
  }

  const userCourses: UserCourse[] = data.map((c) => ({
    id: c.id,
    course_id: c.course_id,
    enrolled_at: c.enrolled_at,
    completed_at: c.completed_at,
    overall_progress: c.overall_progress,
    course_title: c.course.title,
    course_cover: c.course.cover_url || "",
  }));

  const languageNames = [...new Set(data.map((c) => c.course.language.name))];
  const num_completed = userCourses.filter((c) => c.completed_at).length;
  const num_in_progress = userCourses.filter((c) => !c.completed_at).length;

  return { data: userCourses, languageNames, num_completed, num_in_progress };
}

// ---------------- User Progress ----------------
export async function getUserProgress(
  userId: string
): Promise<UserProgress[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);
  if (error) console.error("Error fetching user progress:", error.message);
  return data;
}


export async function updateUserStreak(
  userId: string
): Promise<{ current_streak: number; longest_streak: number }> {
  const supabase = createClient();
  const { data: streak } = await supabase
    .from("user_streaks")
    .select<string, StreakData>("*")
    .eq("user_id", userId)
    .maybeSingle();

  const today = new Date();

  // --- Case 1: New user or user with no streak record ---
  if (!streak) {
    // Create a new record, starting the streak today.
    await supabase.from("user_streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      updated_at: today.toISOString(),
    });
    return { current_streak: 1, longest_streak: 1 };
  }

  // --- Case 2: Existing user ---

  // **FIX: Normalize dates to compare calendar days, not timestamps**
  const lastUpdate = new Date(streak.updated_at);
  
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastUpdateStart = new Date(lastUpdate.getFullYear(), lastUpdate.getMonth(), lastUpdate.getDate());

  const diffTime = todayStart.getTime() - lastUpdateStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let newCurrent = streak.current_streak;
  let newLongest = streak.longest_streak;

  if (diffDays === 1) {
    // Active on a consecutive day, increment streak.
    newCurrent += 1;
  } else if (diffDays > 1) {
    // Missed one or more days, reset streak to 1.
    newCurrent = 1;
  } else if (diffDays === 0 && newCurrent === 0) {
    // This handles users created by the old `ensureUserInitialized` function.
    // If their streak is 0 and they are active today, start it at 1.
    newCurrent = 1;
  }
  // If diffDays is 0 and streak is > 0, do nothing.

  // Update the longest streak if the current one is greater.
  newLongest = Math.max(newLongest, newCurrent);

  // Update the record with the new streak values and today's timestamp.
  await supabase
    .from("user_streaks")
    .update({
      current_streak: newCurrent,
      longest_streak: newLongest,
      updated_at: today.toISOString(),
    })
    .eq("user_id", userId);

  return { current_streak: newCurrent, longest_streak: newLongest };
}
