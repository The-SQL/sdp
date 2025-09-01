"use client";

import Loading from "@/components/loading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import {
  UserProfile,
  UserAchievement,
  UserCourse,
  UserCoursesState,
  UserProgress,
  UserStats,
  EditableProfile,
} from "@/utils/types";
import {
  Bell,
  BookOpen,
  Calendar,
  Clock,
  Heart,
  Languages,
  Mail,
  MapPin,
  Shield,
  Star,
  Target,
  Trophy,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getUserProfile,
  getUserStats,
  getUserAchievements,
  getUserProgress,
  getUserCourses,
} from "@/utils/db/client"; // Adjust the import path as needed

export default function Profile() {
  const { user } = useUser();
  const supabase = createClient();

  const [profiles, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState<EditableProfile>({
    name: "",
    email: "",
    bio: "",
    location: "",
    nativeLanguage: "",
  });
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "achievements" | "favorites" | "settings"
  >("overview");
  const [stats1, setStats] = useState<UserStats | null>(null);
  const [achievements1, setAchievements] = useState<UserAchievement[] | null>(
    null
  );
  const [courses, setCourses] = useState<UserCoursesState | null>(null);
  const [progress, setProgress] = useState<UserProgress[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Update the loadData function in the useEffect
    const loadData = async () => {
      setLoading(true);
      try {
        const [
          profileData,
          statsData,
          achievementsData,
          progressData,
          coursesData,
        ] = await Promise.all([
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
        ]);

        setProfile(profileData);
        setStats(statsData);
        setAchievements(achievementsData);
        setProgress(progressData);
        setCourses(coursesData);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  useEffect(() => {
    if (profiles) {
      setEditableProfile({
        name: profiles.name,
        email: profiles.email || "",
        bio: profiles.bio || "",
        location: profiles.location || "",
        nativeLanguage: profiles.nativeLanguage || "",
      });
    }
  }, [profiles]);

  const stats = {
    coursesCompleted: 3,
    coursesInProgress: 2,
    totalLessons: 127,
    currentStreak: 15,
    longestStreak: 28,
    totalPoints: 2450,
  };

  const achievements = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first lesson",
      earned: true,
      date: "Jan 15, 2024",
    },
    {
      id: 2,
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      earned: true,
      date: "Jan 22, 2024",
    },
    {
      id: 3,
      name: "Course Crusher",
      description: "Complete your first course",
      earned: true,
      date: "Feb 10, 2024",
    },
    {
      id: 4,
      name: "Streak Master",
      description: "Maintain a 30-day streak",
      earned: false,
      progress: 15,
    },
    {
      id: 5,
      name: "Polyglot",
      description: "Learn 3 different languages",
      earned: false,
      progress: 2,
    },
  ];

  const favoritesCourses = [
    {
      id: 4,
      title: "German Grammar Mastery",
      author: "Hans Mueller",
      rating: 4.7,
      savedDate: "3 days ago",
    },
    {
      id: 5,
      title: "Mandarin Pronunciation",
      author: "Li Wei",
      rating: 4.6,
      savedDate: "1 week ago",
    },
  ];

  const handleSave = async () => {
    if (!user) return;

    await supabase
      .from("users")
      .update({
        name: editableProfile.name,
        bio: editableProfile.bio,
      })
      .eq("clerk_id", user.id);

    if (profiles) {
      setProfile({
        ...profiles,
        ...editableProfile,
        id: profiles.id,
        clerk_id: profiles.clerk_id,
        profile_url: profiles.profile_url,
        created_at: profiles.created_at,
      });
    }
    setIsEditing(false);
    setActiveTab("settings");
  };

  // Add this useEffect to handle cases where data might not load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.error("Data loading timed out");
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return <Loading />;
  }
  if (!profiles) {
    return <Loading />;
  }
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                {profiles?.profile_url ? (
                  <img
                    src={profiles.profile_url || "/placeholder.svg"}
                    alt={profiles.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                    {profiles?.name[0]}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-between w-full">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profiles?.name}
                    </h1>
                    <Button
                      onClick={() => {
                        if (isEditing) handleSave();
                        else {
                          setIsEditing(true);
                          setActiveTab("settings");
                        }
                      }}
                      variant={isEditing ? "default" : "outline"}
                      className={`${
                        isEditing ? "bg-blue-600 hover:bg-blue-700" : ""
                      }`}
                    >
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  {profiles?.bio || "No Bio"}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{profiles?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{profiles?.location || "Not Specified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined{" "}
                      {profiles?.created_at
                        ? new Date(profiles.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Languages className="h-4 w-4" />
                    <span>
                      Native: {profiles?.nativeLanguage || "Not Specified"}
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p
                    data-testid="completed-courses"
                    className="text-2xl font-bold text-gray-900"
                  >
                    {courses?.num_completed}
                  </p>
                  <p className="text-sm text-gray-600">Completed Courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p
                    data-testid="in-progress-courses"
                    className="text-2xl font-bold text-gray-900"
                  >
                    {courses?.num_in_progress}
                  </p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalLessons}
                  </p>
                  <p className="text-sm text-gray-600">Lessons</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p
                    data-testid="current-streak"
                    className="text-2xl font-bold text-gray-900"
                  >
                    {stats1?.current_streak || 0}
                  </p>
                  <p className="text-sm text-gray-600">Day Streak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p
                    data-testid="longest-streak"
                    className="text-2xl font-bold text-gray-900"
                  >
                    {stats1?.longest_streak || 0}
                  </p>
                  <p className="text-sm text-gray-600">Best Streak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalPoints}
                  </p>
                  <p className="text-sm text-gray-600">Points</p>
                </CardContent>
              </Card>
            </div>

            {/* Learning Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {courses?.languageNames.map((language, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="courses"
            className="space-y-6"
            data-testid="courses-tab-content"
          >
            <div className="grid gap-6">
              {courses?.data.map((course: UserCourse, idx) => (
                <Card key={course.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        data-testid={`course-title-${idx + 1}`}
                        className="text-lg font-semibold text-gray-900"
                      >
                        {course?.course_title}
                      </h3>
                      <Badge
                        variant={
                          course.overall_progress === 100
                            ? "default"
                            : "secondary"
                        }
                        className={
                          course.overall_progress === 100
                            ? "bg-green-600"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {course.overall_progress === 100
                          ? "Completed"
                          : "In Progress"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.overall_progress}%</span>
                      </div>
                      <Progress
                        value={Number(course.overall_progress) || 0}
                        className="h-2"
                      />
                      <p className="text-sm text-gray-600">
                        {course.overall_progress === 100
                          ? `Completed on ${
                              course?.completed_at
                                ? new Date(
                                    course.completed_at
                                  ).toLocaleDateString("en-US", {
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid gap-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={
                    achievement.earned ? "border-green-200 bg-green-50" : ""
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          achievement.earned ? "bg-green-600" : "bg-gray-200"
                        }`}
                      >
                        <Trophy
                          className={`h-6 w-6 ${
                            achievement.earned ? "text-white" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {achievement.name}
                        </h3>
                        <p className="text-gray-600">
                          {achievement.description}
                        </p>
                        {achievement.earned ? (
                          <p className="text-sm text-green-600">
                            Earned on {achievement.date}
                          </p>
                        ) : (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>
                                {achievement.progress}/
                                {achievement.id === 4 ? 30 : 3}
                              </span>
                            </div>
                            <Progress
                              value={
                                ((achievement.progress ?? 0) /
                                  (achievement.id === 4 ? 30 : 3)) *
                                100
                              }
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

          <TabsContent value="favorites" className="space-y-6">
            <div className="grid gap-4">
              {favoritesCourses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 mb-2">by {course.author}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.rating}</span>
                          </div>
                          <span>Saved {course.savedDate}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Course
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
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
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-700"
                      >
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
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
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
                      <label
                        htmlFor="bio"
                        className="text-sm font-medium text-gray-700"
                      >
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
                    <div>
                      <label
                        htmlFor="location"
                        className="text-sm font-medium text-gray-700"
                      >
                        Location
                      </label>
                      <Input
                        id="location"
                        data-testid="location-input"
                        value={editableProfile.location}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setEditableProfile({
                            ...editableProfile,
                            location: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="nativeLanguage"
                        className="text-sm font-medium text-gray-700"
                      >
                        Native Language
                      </label>
                      <Input
                        id="nativeLanguage"
                        data-testid="native-language-input"
                        value={editableProfile.nativeLanguage}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setEditableProfile({
                            ...editableProfile,
                            nativeLanguage: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Reminders</p>
                      <p className="text-sm text-gray-600">
                        Get reminded to practice daily
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Course Updates</p>
                      <p className="text-sm text-gray-600">
                        New lessons and course announcements
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    Change Password
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    Download My Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
