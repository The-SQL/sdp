"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Star,
  Clock,
  Users,
  BookOpen,
  Play,
  Heart,
  Share2,
  MessageSquare,
  Trophy,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { useParams } from "next/navigation";

export default function CourseOverview() {
  const [isStarred, setIsStarred] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const params = useParams();
  // Mock course data based on ID
  const course = {
    id: params.id,
    title: "Spanish for Beginners",
    subtitle: "Master the fundamentals of Spanish language",
    description:
      "Learn essential Spanish vocabulary and grammar for everyday conversations. This comprehensive course covers basic grammar rules, common phrases, pronunciation, and cultural insights to help you start your Spanish learning journey with confidence.",
    image: "/spanish-learning-colorful.png",
    author: {
      name: "Maria Rodriguez",
      avatar: "/placeholder.svg",
      bio: "Native Spanish speaker with 10+ years of teaching experience",
      rating: 4.9,
      students: 15000,
    },
    level: "Beginner",
    language: "Spanish",
    duration: "10 weeks",
    totalLessons: 20,
    students: 2567,
    rating: 4.6,
    reviews: 234,
    lastUpdated: "2024-01-15",
    tags: ["Grammar", "Vocabulary", "Speaking", "Culture"],
    price: "Free",
    whatYouWillLearn: [
      "Basic Spanish grammar and sentence structure",
      "Essential vocabulary for daily conversations",
      "Proper pronunciation and accent patterns",
      "Cultural context and social customs",
      "Numbers, dates, and time expressions",
      "Common phrases for travel and dining",
    ],
    requirements: [
      "No prior Spanish knowledge required",
      "Dedication to practice 30 minutes daily",
      "Access to audio playback for pronunciation",
    ],
    chapters: [
      {
        id: 1,
        title: "Introduction to Spanish",
        lessons: 3,
        duration: "45 min",
        completed: false,
        lessons_detail: [
          {
            title: "Spanish Alphabet and Sounds",
            duration: "15 min",
            type: "video",
          },
          { title: "Basic Greetings", duration: "20 min", type: "interactive" },
          {
            title: "Practice: First Conversations",
            duration: "10 min",
            type: "exercise",
          },
        ],
      },
      {
        id: 2,
        title: "Essential Vocabulary",
        lessons: 4,
        duration: "60 min",
        completed: false,
        lessons_detail: [
          {
            title: "Family and Relationships",
            duration: "15 min",
            type: "video",
          },
          { title: "Numbers 1-100", duration: "15 min", type: "interactive" },
          {
            title: "Colors and Descriptions",
            duration: "15 min",
            type: "video",
          },
          { title: "Vocabulary Quiz", duration: "15 min", type: "quiz" },
        ],
      },
      {
        id: 3,
        title: "Basic Grammar",
        lessons: 5,
        duration: "75 min",
        completed: false,
        lessons_detail: [
          { title: "Articles and Gender", duration: "20 min", type: "video" },
          {
            title: "Present Tense Verbs",
            duration: "25 min",
            type: "interactive",
          },
          { title: "Question Formation", duration: "15 min", type: "video" },
          { title: "Grammar Exercises", duration: "10 min", type: "exercise" },
          { title: "Chapter Assessment", duration: "5 min", type: "quiz" },
        ],
      },
    ],
  };

  const reviews = [
    {
      id: 1,
      user: "Alex Chen",
      avatar: "/placeholder.svg",
      rating: 5,
      date: "2024-01-10",
      comment:
        "Excellent course! Maria's teaching style is very clear and engaging. The interactive exercises really help reinforce the lessons.",
    },
    {
      id: 2,
      user: "Sarah Johnson",
      avatar: "/placeholder.svg",
      rating: 4,
      date: "2024-01-08",
      comment:
        "Great for beginners. The pace is perfect and the cultural insights are really valuable. Would recommend!",
    },
    {
      id: 3,
      user: "David Kim",
      avatar: "/placeholder.svg",
      rating: 5,
      date: "2024-01-05",
      comment:
        "This course exceeded my expectations. The pronunciation guides are particularly helpful.",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="p-8">
        {/* Course Header */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Badge className="mb-2 bg-green-100 text-green-800">
                  {course.level}
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h1>
                <p className="text-xl text-gray-600 mb-4">{course.subtitle}</p>
                <p className="text-gray-700 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Course Stats */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{course.rating}</span>
                  <span>({course.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.totalLessons} lessons</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {course.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={course.author.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {course.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {course.author.name}
                  </h3>
                  <p className="text-sm text-gray-600">{course.author.bio}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>⭐ {course.author.rating} instructor rating</span>
                    <span>
                      👥 {course.author.students.toLocaleString()} students
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </Button>
              </div>
            </div>

            {/* Course Preview & Actions */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 border border-gray-200">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-t-lg">
                      <Button
                        size="lg"
                        className="bg-white text-gray-900 hover:bg-gray-100"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Preview Course
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {course.price}
                      </div>
                      <div className="text-sm text-gray-600">
                        Full lifetime access
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {!isEnrolled ? (
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setIsEnrolled(true)}
                        >
                          Enroll Now
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          asChild
                        >
                          <Link href={`/course/${course.id}/learn`}>
                            Continue Learning
                          </Link>
                        </Button>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => setIsStarred(!isStarred)}
                        >
                          <Heart
                            className={`h-4 w-4 mr-2 ${
                              isStarred ? "fill-current text-red-500" : ""
                            }`}
                          />
                          {isStarred ? "Starred" : "Star"}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2">
                      <div>✓ {course.totalLessons} lessons</div>
                      <div>✓ Lifetime access</div>
                      <div>✓ Mobile and desktop</div>
                      <div>✓ Certificate of completion</div>
                      <div>✓ Community discussions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Course Content Tabs */}
          <Tabs defaultValue="curriculum" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="mt-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                  <p className="text-sm text-gray-600">
                    {course.chapters.length} chapters • {course.totalLessons}{" "}
                    lessons • {course.duration} total
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.chapters.map((chapter, index) => (
                      <div
                        key={chapter.id}
                        className="border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {chapter.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {chapter.lessons} lessons • {chapter.duration}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="p-4 space-y-2">
                          {chapter.lessons_detail.map((lesson, lessonIndex) => (
                            <div
                              key={lessonIndex}
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                                  {lesson.type === "video" && (
                                    <Play className="h-3 w-3" />
                                  )}
                                  {lesson.type === "quiz" && (
                                    <Trophy className="h-3 w-3" />
                                  )}
                                  {lesson.type === "exercise" && (
                                    <BookOpen className="h-3 w-3" />
                                  )}
                                  {lesson.type === "interactive" && (
                                    <MessageSquare className="h-3 w-3" />
                                  )}
                                </div>
                                <span className="text-sm text-gray-700">
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {lesson.duration}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>{"What you'll learn"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.whatYouWillLearn.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          </div>
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-2xl font-bold">
                        {course.rating}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Based on {course.reviews} reviews
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-200 pb-6 last:border-b-0"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={review.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {review.user
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {review.user}
                              </h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {review.date}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussions" className="mt-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Course Discussions</CardTitle>
                  <p className="text-sm text-gray-600">
                    Connect with fellow students and ask questions
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Join the Discussion
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Enroll in this course to participate in discussions with
                      other students
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Enroll to Join Discussions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
