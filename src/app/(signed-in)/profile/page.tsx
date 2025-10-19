"use client"

import Loading from "@/components/loading"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/utils/supabase/client"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import type {
  UserProfile,
  UserAchievement,
  UserCourse,
  UserCoursesState,
  UserProgress,
  UserStats,
  EditableProfile,
} from "@/utils/types"
import { Bell, BookOpen, Calendar, Clock, Mail, Shield, Star, Target, Trophy, User } from "lucide-react"
import { useEffect, useState } from "react"
import { getUserProfile, getUserStats, getUserAchievements, getUserProgress, getUserCourses } from "@/utils/db/profile" // Adjust the import path as needed

export default function Profile() {
  const { user } = useUser()
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editableProfile, setEditableProfile] = useState<EditableProfile>({
    name: "",
    email: "",
    bio: "",
    location: "",
    nativeLanguage: "",
  })
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "achievements" | "favorites" | "settings">(
    "overview",
  )
  const [stats1, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<UserAchievement[] | null>(null)
  const [courses, setCourses] = useState<UserCoursesState | null>(null)
  const [progress, setProgress] = useState<UserProgress[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const loadData = async () => {
      setLoading(true)

      // Set up a 10s timeout to catch hung requests in tests and logging
      timeoutId = setTimeout(() => {
        console.error("Data loading timed out")
      }, 10000)

      try {
        const [profileData, statsData, achievementsData, progressData, coursesData] = await Promise.all([
          getUserProfile(user.id).catch(() => null),
          getUserStats(user.id).catch(() => null),
          getUserAchievements(user.id).catch(() => []),
          getUserProgress(user.id).catch(() => []),
          getUserCourses(user.id).catch(() => ({
            data: [],
            num_completed: 0,
            num_in_progress: 0,
            languageNames: [],
          })),
        ])

        setProfile(profileData)
        setStats(statsData)
        setAchievements(achievementsData)
        setProgress(progressData)
        setCourses(coursesData)
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        // Clear the timeout when data finishes loading (success or error)
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        setLoading(false)
      }
    }
    loadData()

    // Cleanup: clear timeout if component unmounts before load completes
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  }, [user])

  useEffect(() => {
    if (profile) {
      setEditableProfile({
        name: profile.name,
        email: profile.email || "",
        bio: profile.bio || "",
        location: profile.location || "",
        nativeLanguage: profile.nativeLanguage || "",
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return

    await supabase
      .from("users")
      .update({
        name: editableProfile.name,
        bio: editableProfile.bio,
      })
      .eq("clerk_id", user.id)

    if (profile) {
      setProfile({
        ...profile,
        ...editableProfile,
        id: profile.id,
        clerk_id: profile.clerk_id,
        profile_url: profile.profile_url,
        created_at: profile.created_at,
      })
    }
    setIsEditing(false)
    setActiveTab("settings")
  }

  if (loading) {
    return <Loading />
  }
  if (!profile) {
    return <Loading />
  }
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                {profile?.profile_url ? (
                  <img
                    src={profile.profile_url || "/placeholder.svg"}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                    {profile?.name[0]}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-between w-full">
                    <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
                    <Button
                      onClick={() => {
                        if (isEditing) handleSave()
                        else {
                          setIsEditing(true)
                          setActiveTab("settings")
                        }
                      }}
                      variant={isEditing ? "default" : "outline"}
                      className={`${isEditing ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                    >
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{profile?.bio || "No Bio"}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined{" "}
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p data-testid="completed-courses" className="text-2xl font-bold text-gray-900">
                    {courses?.num_completed}
                  </p>
                  <p className="text-sm text-gray-600">Completed Courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p data-testid="in-progress-courses" className="text-2xl font-bold text-gray-900">
                    {courses?.num_in_progress}
                  </p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats1?.lessons_completed || 0}</p>
                  <p className="text-sm text-gray-600">Lessons</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p data-testid="current-streak" className="text-2xl font-bold text-gray-900">
                    {stats1?.current_streak}
                  </p>
                  <p className="text-sm text-gray-600">Day Streak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p data-testid="longest-streak" className="text-2xl font-bold text-gray-900">
                    {stats1?.longest_streak}
                  </p>
                  <p className="text-sm text-gray-600">Best Streak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats1?.total_points}</p>
                  <p className="text-sm text-gray-600">Points</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Learning Languages</CardTitle>
              </CardHeader>
              <CardContent>
                {courses?.languageNames.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
                    <p className="text-gray-600 text-center">No languages learnt yet</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {courses?.languageNames.map((language, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {language}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6" data-testid="courses-tab-content">
            <div className="grid gap-6">
              {courses?.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <BookOpen className="h-16 w-16 text-blue-600 mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Learning</h3>
                  <p className="text-gray-600 text-center max-w-sm mb-6">
                    You haven&apos;t started learning yet. Browse our courses to begin your journey.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/courses")}>
                    Browse Courses
                  </Button>
                </div>
              ) : (
                courses?.data.map((course: UserCourse, idx) => (
                  <Card key={course.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 data-testid={`course-title-${idx + 1}`} className="text-lg font-semibold text-gray-900">
                          {course?.course_title}
                        </h3>
                        <Badge
                          variant={course.overall_progress === 100 ? "default" : "secondary"}
                          className={course.overall_progress === 100 ? "bg-green-600" : "bg-blue-100 text-blue-800"}
                        >
                          {course.overall_progress === 100 ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.overall_progress}%</span>
                        </div>
                        <Progress value={Number(course.overall_progress) || 0} className="h-2" />
                        <p className="text-sm text-gray-600">
                          {course.overall_progress === 100
                            ? `Completed on ${
                                course?.completed_at
                                  ? new Date(course.completed_at).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Unknown"
                              }`
                            : ``}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid gap-4">
              {achievements
                ?.slice() // create a shallow copy to avoid mutating the original
                .sort((a, b) => (b.earned ? 1 : 0) - (a.earned ? 1 : 0)) // earned first
                .map((achievement: UserAchievement) => (
                  <Card key={achievement.id} className={achievement.earned ? "border-green-200 bg-green-50" : ""}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            achievement.earned ? "bg-green-600" : "bg-gray-200"
                          }`}
                        >
                          <Trophy className={`h-6 w-6 ${achievement.earned ? "text-white" : "text-gray-400"}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                          <p className="text-gray-600">{achievement.description}</p>
                          {achievement.earned ? (
                            <p className="text-sm text-green-600">Earned on {achievement.date}</p>
                          ) : (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>
                                  {achievement.progress}/{achievement.goal}
                                </span>
                              </div>
                              <Progress
                                value={((achievement.progress ?? 0) / (achievement.goal ?? 1)) * 100}
                                className="h-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <Input
                        id="name"
                        data-testid="name-input"
                        value={editableProfile.name}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setEditableProfile({
                            ...editableProfile,
                            name: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <Input
                        id="email"
                        data-testid="email-input"
                        value={editableProfile.email}
                        disabled
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="bio" className="text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <Textarea
                        id="bio"
                        data-testid="bio-textarea"
                        value={editableProfile.bio}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setEditableProfile({
                            ...editableProfile,
                            bio: e.target.value,
                          })
                        }
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
