import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

interface DashboardStats {
  total_time_str: string;
  lessons_completed: number;
  streak_days: number;
  languages_count: number;
  achievement_points: number;
}

// Minimal nested course shape that matches your SELECT
type CourseBrief = {
  id: string;
  title: string;
  profile_url?: string | null;
  estimated_duration?: string | null;
  updated_at?: string | null;
  language_id: string;
};

type EnrollmentRow = {
  overall_progress: number | null;
  enrolled_at: string | null;
  completed_at: string | null;
  course: CourseBrief | null; // single object via FK
};

type Achievement = {
  id: string;
  name: string;
  description?: string | null;
  points?: number | null;
  icon_emoji?: string | null;
};

type UserAchievementRow = {
  created_at: string;               // Supabase returns ISO strings
  achievements: Achievement | null; // single FK object
};

type StudySessionRow = { duration_minutes: number | null };
type StreakRow = { current_streak: number | null };

type AchievementCard = {
  name: string;
  description: string;
  earned: true;
  icon: string;
  earnedDate: string;
  points: number;
};

export async function GET() {
  try {
    const user = await currentUser();
    const uid = user?.id;
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_KEY!;
    const supabase = createClient(url, key);

    // -----------------------------
    // 1) COURSES (enrollments)
    // -----------------------------
    const { data: enrolls, error: enrollErr } = await supabase
      .from("user_courses")
      .select(`
        overall_progress,
        enrolled_at,
        completed_at,
        course:course_id ( id, title, profile_url, estimated_duration, updated_at, language_id )
      `)
      .eq("user_id", uid)
      .order("enrolled_at", { ascending: false })
      .returns<EnrollmentRow[]>();

    if (enrollErr) throw new Error(`user_courses query: ${enrollErr.message}`);

    const currentCourses = (enrolls ?? [])
      .filter((r): r is EnrollmentRow & { course: CourseBrief } => !!r.course)
      .map((r) => {
        const raw = Number(r.overall_progress ?? 0);
        const progress = Number.isFinite(raw)
          ? Math.round(raw <= 1 ? raw * 100 : raw)
          : 0;
        const last = r.completed_at ?? r.enrolled_at ?? r.course.updated_at ?? null;

        return {
          id: r.course.id,
          name: r.course.title,
          progress,
          nextLesson: r.completed_at ? "Completed" : "Continue",
          image: r.course.profile_url ?? "/placeholder.svg",
          totalLessons: 0,
          completedLessons: 0,
          lastStudied: last ? new Date(last).toLocaleDateString() : "—",
          quizScore: 0,
          timeSpent: r.course.estimated_duration ?? "",
        };
      });

    // -----------------------------
    // 2) ACHIEVEMENTS (recent list)
    // -----------------------------
    const { data: achRows, error: achErr } = await supabase
      .from("user_achievements")
      .select(`
        created_at,
        achievements:achievement_id ( id, name, description, points, icon_emoji )
      `)
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(4)
      .returns<UserAchievementRow[]>();

    if (achErr) throw new Error(`user_achievements query: ${achErr.message}`);

    const achievements: AchievementCard[] = (achRows ?? [])
      .filter(
        (r): r is UserAchievementRow & { achievements: Achievement } => !!r.achievements
      )
      .map((r) => {
        const earnedDate: string = r.created_at
          ? new Date(r.created_at).toLocaleDateString()
          : "—";

        return {
          name: r.achievements.name,
          description: r.achievements.description ?? "",
          earned: true,
          icon: r.achievements.icon_emoji ?? "🏆",
          earnedDate,
          points: r.achievements.points ?? 0,
        };
      });

    // -----------------------------
    // 3) QUICK STATS
    // -----------------------------

    // Languages learning (distinct language_id across enrolled courses)
    const languages_count = new Set<string>(
      (enrolls ?? [])
        .filter(
          (r): r is EnrollmentRow & { course: CourseBrief } =>
            !!r.course && !!r.course.language_id
        )
        .map((r) => r.course.language_id)
    ).size;

    // Achievement points (sum)
    type AchievementSlim = { points: number | null };
    type UserAchievementSumRow = { achievements: AchievementSlim | null };

    const { data: achSumRows, error: achSumErr } = await supabase
      .from("user_achievements")
      .select(`achievements:achievement_id ( points )`)
      .eq("user_id", uid)
      .returns<UserAchievementSumRow[]>();

    if (achSumErr) {
      throw new Error(`user_achievements (sum) query: ${achSumErr.message}`);
    }

    const achievement_points = (achSumRows ?? []).reduce(
      (sum, r) => sum + (r.achievements?.points ?? 0),
      0
    );

    // Lessons completed
    let lessons_completed = 0;
    {
      const { data: lessonRows, error: lessonErr } = await supabase
        .from("user_lessons")
        .select("completed_at")
        .eq("user_id", uid)
        .not("completed_at", "is", null);
      if (!lessonErr) lessons_completed = lessonRows?.length ?? 0;
    }

    // Total study time
    let totalMinutes = 0;
    {
      const { data: sessions, error: sesErr } = await supabase
        .from("study_sessions")
        .select("duration_minutes")
        .eq("user_id", uid)
        .returns<StudySessionRow[]>();

      if (!sesErr) {
        totalMinutes = (sessions ?? []).reduce(
          (s, row) => s + (row.duration_minutes ?? 0),
          0
        );
      }
    }
    const total_time_str = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

    // Current streak (single row)
    const { data: streakRow, error: streakErr } = await supabase
      .from("user_streaks")
      .select("current_streak")
      .eq("user_id", uid)
      .maybeSingle()
      .returns<StreakRow>();

    const streak_days = streakErr ? 0 : (streakRow?.current_streak ?? 0);

    const stats: DashboardStats = {
      total_time_str,
      lessons_completed,
      streak_days,
      languages_count,
      achievement_points,
    };

    // Return payload used by the page
    return NextResponse.json({
      currentCourses,
      achievements,
      goals: [],
      starredCourses: [],
      weeklyActivity: [],
      stats,
    });
  } catch (err) {
    console.error("dashboard route error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Internal error", message },
      { status: 500 }
    );
  }
}
