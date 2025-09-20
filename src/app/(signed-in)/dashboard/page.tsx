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
} from "@/utils/db/client";
import { useUser } from "@clerk/nextjs";
import {Heart, Plus, Star, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";


type CoursesStateT = Awaited<ReturnType<typeof getUserCourses>>; // UserCoursesState | null
// type AchievementsT = Awaited<ReturnType<typeof getUserAchievements>>; // UserAchievement[] | null
// type StatsT = Awaited<ReturnType<typeof getUserStats>>; // UserStats | null
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
  // const [stats, setStats] = useState<StatsT>(null);
  const [progressRows, setProgressRows] = useState<ProgressRowsT>(null);
  const [loading, setLoading] = useState(true);
  const [favCourses, setFavCourses] = useState<FavCourse[]>([]);

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
        const [courses, prog, fetchedGoals, favorites] = await Promise.all([
          getUserCourses(user.id),
          // getUserAchievements(user.id),
          // getUserStats(user.id),
          getUserProgress(user.id),
          getLearningGoals(user.id),
          getFavorites(user.id),
        ]);

        if (isCancelled) return;
        setCoursesState(courses);
        // setAchievements(ach);
        // setStats(st);
        setProgressRows(prog);
        setGoals(fetchedGoals);
        setFavCourses(favorites);
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

  // const Achievements = useMemo(() => {
  //   const list = achievements ?? [];
  //   return list.slice(0, 6).map((a) => ({
  //     name: a.name,
  //     description: a.description,
  //     earned: a.earned,
  //     icon: "🏅", // default icon
  //     earnedDate: a.date ?? null,
  //     points: 0, // no per-achievement points in your type
  //     progress: a.progress ?? 0, // optional
  //     total: undefined as number | undefined, // not in your type
  //   }));
  // }, [achievements]);

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
      const ts = row.updated_at;
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

  const currentStreak = weeklyActivity.filter((d) => d.studied).length;
  const totalMinutesThisWeek = weeklyActivity.reduce(
    (s, d) => s + d.minutes,
    0
  );

  // const totalTimeStr = "—"; // not present in your schema; show dash for now
  // const lessonsCompleted = stats?.total_lessons ?? 0;
  // const streakDays = stats?.current_streak ?? currentStreak; // fallback to weekly calc
  // const languagesCount = coursesState?.languageNames.length ?? 0;
  // const achievementPoints = stats?.total_points ?? 0;

  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);


   useEffect(() => {
    if(!isLoaded || !user?.id) return;

    let isCancelled = false;
    (async() => {
      try {
        if(user){
          const fetchedGoals = await getLearningGoals(user.id);
          console.log("fetched goals from Supabase:", fetchedGoals);
          if(!isCancelled) setGoals(fetchedGoals);
        }
      } catch(e){
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
          <div className="lg:col-span-2 space-y-8">
            {/* Current Courses */}
            <div>
              <div className="flex items-center justify-between mb-6">
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

                {currentCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Image
                          src={course.image}
                          alt={course.name}
                          width={64} // corresponds to w-16 (16 * 4px)
                          height={64} // corresponds to h-16
                          className="rounded-lg object-cover"
                        />

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {course.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">
                                {course.quizScore}% avg
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">
                            {course.nextLesson}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <span>
                              {course.completedLessons}/{course.totalLessons}{" "}
                              lessons
                            </span>
                            <span>{course.timeSpent} studied</span>
                            <span>Last: {course.lastStudied}</span>
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
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          asChild
                        >
                          <Link href={`/course/${course.id}/learn`}>
                            Continue
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Learning Goals */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Learning Goals
                </h2>
                <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
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
                        onClick={async ()=>{
                            try {
                              if(user){
                                await addLearningGoal(newGoal, new Date(goalDeadline), user.id);
                                console.log("Goal added:", newGoal);
                                const refreshedGoals = await getLearningGoals(user.id);
                                setGoals(refreshedGoals);
                              }
                              setGoalDialogOpen(false);
                              setNewGoal("");
                              setGoalDeadline("");
                            } catch(error){
                              console.error("Failed to add goal:", error);
                            }
                        }}  
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white">
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
                {goals.map((goal) => (
                  <Card key={goal.id} className="border border-gray-200">
                   <CardContent className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{goal.description}</h3>
                        <p className="text-sm text-gray-600">{goal.target_date}</p>
                      </div>
                      <Button
                        onClick={async () => {
                          try {
                            if(user){
                              setIsCompleting(goal.description);
                              await completeLearningGoal(user.id, goal.description);
                              console.log("Goal completed:", goal.description);

                              const refreshedGoals = await getLearningGoals(user.id);
                              setGoals(refreshedGoals);
                            }
                          }catch(error){
                            console.error("Failed to complete goal:", error);
                          }finally{
                            setIsCompleting(null);
                          }
                        }}
                        disabled={isCompleting === goal.description || goal.completed}
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

            {/* Weekly Progress */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  {"This Week's Activity"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-3 mb-6">
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
                      {day.studied && (
                        <div className="text-xs text-gray-500 mt-1">
                          {day.minutes}m
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {currentStreak}
                    </div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {totalMinutesThisWeek}
                    </div>
                    <div className="text-sm text-gray-600">
                      Minutes This Week
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <span className="font-semibold text-gray-900">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold text-blue-600">
                    {currentStreak} days
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
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={fetchStarredCourses}
                >
                  View Starred
                </Button>

              </div>
            </div>
            {/* Achievements */}
            {/* <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Recent Achievements
              </h2>
              <div className="space-y-3">
                {(achievements ?? []).slice(0, 4).map((achievement, index) => (
                  <Card
                    key={index}
                    className={`border ${
                      achievement.earned
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`text-2xl ${
                            achievement.earned ? "" : "grayscale opacity-50"
                          }`}
                        >
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-medium text-sm ${
                              achievement.earned
                                ? "text-green-800"
                                : "text-gray-600"
                            }`}
                          >
                            {achievement.name}
                          </h3>
                          <p
                            className={`text-xs ${
                              achievement.earned
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {achievement.description}
                          </p>
                          {!achievement.earned && achievement.progress && (
                            <div className="mt-2">
                              <Progress
                                value={
                                  (achievement.progress / achievement.total) *
                                  100
                                }
                                className="h-1"
                              />
                              <span className="text-xs text-gray-500">
                                {achievement.progress}/{achievement.total}
                              </span>
                            </div>
                          )}
                        </div>
                        {achievement.earned && achievement.points > 0 && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            +{achievement.points}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  asChild
                >
                  <Link href="/achievements">View All Achievements</Link>
                </Button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
