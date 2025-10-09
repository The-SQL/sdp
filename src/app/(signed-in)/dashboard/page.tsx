"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  // getUserAchievements,
  getUserCourses,
  getUserProgress,
  // getUserStats,
  getLearningGoals,
  addLearningGoal,
  completeLearningGoal,
  getFavorites,
  getLessonsCompleted,
  getLoginStreak,
  markLoginDay,
} from "@/utils/db/client";
import { useUser } from "@clerk/nextjs";
import { Heart, Plus, Star, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

type CoursesStateT = Awaited<ReturnType<typeof getUserCourses>>; // UserCoursesState | null
type ProgressRowsT = Awaited<ReturnType<typeof getUserProgress>>; // UserProgress[] | null
type UserCourseT = NonNullable<CoursesStateT>["data"][number];

type LearningGoal = {
  id: string;
  user_id: string;
  description: string;
  target_date: string;
  created_at: string;
  completed: boolean;
};

type FavCourse = {
  title: string;
  difficulty: string;
  author: string;
};

export default function Dashboard() {
  const { user, isLoaded } = useUser();

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [coursesState, setCoursesState] = useState<CoursesStateT>(null);
  // const [achievements, setAchievements] = useState<AchievementsT>(null);
  const [progressRows, setProgressRows] = useState<ProgressRowsT>(null);
  const [loading, setLoading] = useState(true);
  const [favCourses, setFavCourses] = useState<FavCourse[]>([]);
  const [lessonsCompleted, setLessonsCompleted] = useState<number | null>(null);
  const [loginStreak, setLoginStreak] = useState<number | null>(null);
  

  const displayName =
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName) ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "there";

  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    let isCancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [courses, prog, fetchedGoals, favorites, count_lessons] = await Promise.all([
          getUserCourses(user.id),
          // getUserAchievements(user.id),
          getUserProgress(user.id),
          getLearningGoals(user.id),
          getFavorites(user.id),
          getLessonsCompleted(user.id),
        ]);

        if (isCancelled) return;
        setCoursesState(courses);
        // setAchievements(ach);
        setProgressRows(prog);
        setGoals(fetchedGoals);
        setFavCourses(favorites);
        setLessonsCompleted(count_lessons);
        
      } catch (e) {
        console.error("Dashboard data load error:", e);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isLoaded, user]);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    let cancelled = false;

    (async () => {
      try {
        // idempotent: safe to call every mount/day
        await markLoginDay(user.id, "Africa/Johannesburg");
        const streak = await getLoginStreak(user.id, "Africa/Johannesburg", false);
        if (!cancelled) setLoginStreak(streak ?? 0);
      } catch (e) {
        console.error("login streak load error:", e);
        if (!cancelled) setLoginStreak(0);
      }
    })();

    return () => { cancelled = true; };
  }, [isLoaded, user?.id]);

  const currentCourses = useMemo(() => {
    const list: UserCourseT[] = coursesState?.data ?? [];
    return list.map((c) => ({
      id: c.course_id ?? c.id, // link target
      name: c.course_title ?? "Untitled course", // title
      progress: Math.round(c.overall_progress ?? 0), // %
      nextLesson: "", // plug in later if you track it
      image: c.course_cover, // plug in later
      totalLessons: undefined, // optional for now
      completedLessons: undefined, // optional for now
      lastStudied: c.enrolled_at
        ? new Date(c.enrolled_at).toLocaleDateString()
        : "—",
      quizScore: undefined, // optional
      timeSpent: "", // optional
    }));
  }, [coursesState]);

  const weeklyActivity = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0..6 (Sun..Sat)
    const diffToMonday = (day + 6) % 7; // Monday=0
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const template = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
      (d) => ({
        day: d,
        studied: false,
        minutes: 0,
        lessons: 0,
      })
    );

    if (!progressRows || progressRows.length === 0) return template;

    const res = [...template];
    for (const row of progressRows) {
      const ts = row.last_accessed;
      if (!ts) continue;
      const dt = new Date(ts);
      if (dt < startOfWeek) continue;

      const weekday = (dt.getDay() + 6) % 7; // Monday=0
      res[weekday].studied = true;
      // no duration info in schema -> mark at least 1 “lesson”
      res[weekday].lessons = Math.max(res[weekday].lessons, 1);
    }
    return res;
  }, [progressRows]);

 

  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    let isCancelled = false;
    (async () => {
      try {
        if (user) {
          const fetchedGoals = await getLearningGoals(user.id);
          console.log("fetched goals from Supabase:", fetchedGoals);
          if (!isCancelled) setGoals(fetchedGoals);
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isLoaded, user]);

  const fetchStarredCourses = async () => {
    if (!user?.id) return;
    try {
      const favorites = await getFavorites(user.id);
      setFavCourses(favorites);
      console.log("Starred Courses:", favorites);
      // console.log("Refetched starred courses");
    } catch (error) {
      console.error("Error refreshing favorites:", error);
    }
  };

  return (
    <div className="bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {displayName}!
          </h1>
          <p className="text-gray-600">
            Continue your language learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Current Courses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Courses
                </h2>
                <Button variant="outline" asChild>
                  <Link href="/courses">Browse More</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {!loading && (currentCourses?.length ?? 0) === 0 && (
                  <Card className="border border-dashed border-gray-300 bg-gray-50">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        No Courses Yet
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        You haven’t enrolled in any courses. Browse the catalog
                        to get started.
                      </p>
                      <Button asChild>
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Optional: loading placeholder */}
                {loading && (
                  <Card className="border border-gray-200">
                    <CardContent className="p-6 text-gray-600">
                      Loading your courses…
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-x-hidden overflow-y-hidden">
                  {currentCourses.map((course) => (
                    <Link key={course.id} href={`/course/${course.id}/learn`}>
                      <Card className="border border-gray-200 p-4 hover:shadow-lg hover:scale-105 transition-transform">
                        <CardContent className="p-0">
                          <div className="flex items-center gap-4">
                            <Image
                              src={course.image}
                              alt={course.name}
                              width={64} // corresponds to w-16 (16 * 4px)
                              height={64} // corresponds to h-16
                              className="rounded-lg object-cover aspect-square"
                            />

                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {course.name}
                                </h3>
                              </div>

                              <div className="flex items-center gap-3">
                                <Progress
                                  value={course.progress}
                                  className="flex-1"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  {course.progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Tabs defaultValue="activity">
              <TabsList>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
              </TabsList>
              <TabsContent value="activity">
                {/* Weekly Progress */}
                <Card className="border border-gray-200 mt-12">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      {"This Week's Activity"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-3">
                      {weeklyActivity.map((day) => (
                        <div key={day.day} className="text-center">
                          <div className="text-xs text-gray-500 mb-2">
                            {day.day}
                          </div>
                          <div
                            className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-xs font-medium ${
                              day.studied
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {day.studied ? day.lessons : "0"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="goals">
                {/* Learning Goals */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Dialog
                      open={goalDialogOpen}
                      onOpenChange={setGoalDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Goal
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Set a New Learning Goal</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Goal Description
                            </label>
                            <Textarea
                              placeholder="e.g., Complete intermediate French course"
                              value={newGoal}
                              onChange={(e) => setNewGoal(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Target Date
                            </label>
                            <Input
                              type="date"
                              value={goalDeadline}
                              onChange={(e) => setGoalDeadline(e.target.value)}
                            />
                          </div>
                          <Button
                            onClick={async () => {
                              try {
                                if (user) {
                                  await addLearningGoal(
                                    newGoal,
                                    new Date(goalDeadline),
                                    user.id
                                  );
                                  console.log("Goal added:", newGoal);
                                  const refreshedGoals = await getLearningGoals(
                                    user.id
                                  );
                                  setGoals(refreshedGoals);
                                }
                                setGoalDialogOpen(false);
                                setNewGoal("");
                                setGoalDeadline("");
                              } catch (error) {
                                console.error("Failed to add goal:", error);
                              }
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Create Goal
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="space-y-3">
                    {(goals?.length ?? 0) === 0 && (
                      <Card className="border border-dashed border-gray-300 bg-gray-50">
                        <CardContent className="p-6 text-center">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            No Goals Yet
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Set your first learning goal to stay on track.
                          </p>
                          <Button onClick={() => setGoalDialogOpen(true)}>
                            Add Goal
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                    <div className="max-h-[210px] overflow-y-auto space-y-4">
                      {goals.map((goal) => (
                        <Card key={goal.id} className="border border-gray-200">
                          <CardContent className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {goal.description}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Target date:{" "}
                                {format(
                                  new Date(goal.target_date),
                                  "MMMM dd, yyyy"
                                )}
                              </p>
                            </div>
                            <Button
                              onClick={async () => {
                                try {
                                  if (user) {
                                    setIsCompleting(goal.description);
                                    await completeLearningGoal(
                                      user.id,
                                      goal.description
                                    );
                                    console.log(
                                      "Goal completed:",
                                      goal.description
                                    );

                                    const refreshedGoals =
                                      await getLearningGoals(user.id);
                                    setGoals(refreshedGoals);
                                  }
                                } catch (error) {
                                  console.error(
                                    "Failed to complete goal:",
                                    error
                                  );
                                } finally {
                                  setIsCompleting(null);
                                }
                              }}
                              disabled={
                                isCompleting === goal.description ||
                                goal.completed
                              }
                              className={`text-white ${
                                goal.completed
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700"
                              }`}
                            >
                              {goal.completed ? "Completed" : "Complete"}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lessons Completed</span>
                  <span className="font-semibold text-gray-900">{lessonsCompleted ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold text-blue-600">
                    {loginStreak ?? "-"} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Languages Completed</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Courses Completed</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
              </CardContent>
            </Card>

            {/* Starred Courses */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Starred Courses
              </h2>
              <div className="space-y-3">
                {favCourses.map((course, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-gray-900">
                            {course.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            by {course.author}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-600">
                              {course.difficulty}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
