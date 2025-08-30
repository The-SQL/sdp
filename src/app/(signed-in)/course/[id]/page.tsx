"use client";

import { useState, useEffect } from "react";
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
  Ear
} from "lucide-react";
import { useParams } from "next/navigation";
import { getCourseById, checkIfFavorited, addToFavorites, removeFromFavorites } from "@/utils/db/client";
import { useAuth } from "@clerk/nextjs"; // ADDED: Import useAuth


// ADDED: Interface for course data
interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
    rating: number;
    students: number;
  };
  level: string;
  language: string;
  duration: string;
  totalLessons: number;
  students: number;
  rating: number;
  reviews: number;
  lastUpdated: string;
  tags: string[];
  price: string;
  whatYouWillLearn: string[];
  requirements: string[];
  chapters: Array<{
    id: string;
    title: string;
    lessons: number;
    duration: string;
    completed: boolean;
    lessons_detail: Array<{
      title: string;
      duration: string;
      type: string;
    }>;
  }>;
  reviews_list: Array<{
    id: string;
    user: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
  }>;
}

export default function CourseOverview() {
  const [isStarred, setIsStarred] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null); // ADDED type annotation
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth(); // ADDED: Get current user ID

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await getCourseById(params.id as string);
        setCourse(courseData as Course);
        
        // Check if course is favorited
        if (userId) {
          const favorited = await checkIfFavorited(params.id as string, userId);
          setIsStarred(favorited);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.id, userId]); // ADDED: userId dependency

  // ADDED: Toggle favorite function
  const toggleFavorite = async () => {
    if (!userId || !course) return;
    
    try {
      if (isStarred) {
        await removeFromFavorites(course.id, userId);
      } else {
        await addToFavorites(course.id, userId);
      }
      
      setIsStarred(!isStarred);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  const reviews = course.reviews_list;

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
                {course.tags.map((tag: string, index: number) => ( // ADDED type annotations
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
                      .map((n: string) => n[0]) // ADDED type annotation
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
                          onClick={toggleFavorite} // UPDATED: Use toggleFavorite function
                          disabled={!userId}
                        >
                          <Heart
                            className={`h-4 w-4 mr-2 ${
                              isStarred ? "fill-current text-red-500" : ""
                            }`}
                          />
                          {isStarred ? "Added to Favorites" : "Add to Favorites"}
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
                    {course.chapters.map((chapter, index: number) => ( // ADDED type annotation
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
                          {chapter.lessons_detail.map((lesson, lessonIndex: number) => ( // ADDED type annotation
                            <div
                              key={lessonIndex}
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                                  {lesson.type === "video" && (
                                    <Play className="h-3 w-3" />
                                  )}
                                  {lesson.type === "audio" && (
                                    <Ear className="h-3 w-3" />
                                  )}
                                  {lesson.type === "exercise" && (
                                    <BookOpen className="h-3 w-3" />
                                  )}
                                  {lesson.type === "text" && (
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
                      {course.whatYouWillLearn.map((item: string, index: number) => ( // ADDED type annotations
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
                      {course.requirements.map((item: string, index: number) => ( // ADDED type annotations
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
                                .map((n: string) => n[0]) // ADDED type annotation
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