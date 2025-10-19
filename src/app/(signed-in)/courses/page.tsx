"use client";

// Import necessary React hooks and components
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Search, Filter, Star, Clock, Users, Heart } from "lucide-react";
import {
  getAllCourses,
  getRecommendedCourses,
  addToFavorites,
  removeFromFavorites,
  getUserFavoriteCourseIds,
} from "@/utils/db/client";
import { useAuth } from "@clerk/nextjs";
import Loading from "@/components/loading";

// Define the Course interface for type safety
interface Course {
  id: string;
  title: string;
  level: string;
  language: string;
  image: string;
  duration: string;
  students: number;
  rating: number;
  reviews: number | string; // Allow both number and string
  author: string;
  description: string;
  tags: string[];
  isRecommended: boolean;
  price: string;
  isFavorited?: boolean;
  isPublic: boolean;
  isPublished: boolean;
}

// Main component for displaying courses list
export default function Courses() {
  // State management for filters, sorting, and course data
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  // Fetch all courses and recommended courses, and check favorite status
  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId) return;

      try {
        // Get ALL data in parallel
        const [allCourses, recommendedCourses, favoriteCourseIds] =
          await Promise.all([
            getAllCourses(),
            getRecommendedCourses(userId),
            getUserFavoriteCourseIds(userId), // Get ALL favorites at once
          ]);

        const recommendedIds = new Set(recommendedCourses.map((c: Course) => c.id));
        const favoriteIds = new Set(favoriteCourseIds); // Convert to Set for fast lookup

        // No need for async mapping now - just check against the Set
        const coursesWithStatus = allCourses.map((course) => ({
          ...course,
          isRecommended: recommendedIds.has(course.id),
          isFavorited: favoriteIds.has(course.id),
        }));

        setCourses(coursesWithStatus);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  // Handle favorite/unfavorite course action
  const toggleFavorite = async (
    courseId: string,
    currentlyFavorited: boolean
  ) => {
    if (!userId) return;

    try {
      if (currentlyFavorited) {
        await removeFromFavorites(courseId, userId);
      } else {
        await addToFavorites(courseId, userId);
      }

      // Update local state
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId
            ? { ...course, isFavorited: !currentlyFavorited }
            : course
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Compute available languages for filtering
  const availableLanguages = useMemo(() => {
    const languages = courses
      .filter((course) => course.isPublic && course.isPublished)
      .map((course) => course.language)
      .filter(Boolean);
    return [...new Set(languages)].sort();
  }, [courses]);

  // Filter courses to only show public and published ones
  const publicPublishedCourses = courses.filter(
    (course) => course.isPublic && course.isPublished
  );

  // Apply search, level, and language filters
  const filteredCourses = publicPublishedCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesLevel =
      selectedLevel.toLowerCase() === "all" ||
      course.level === selectedLevel.toLowerCase();
    const matchesLanguage =
      selectedLanguage === "all" ||
      course.language === selectedLanguage.toLowerCase();

    return matchesSearch && matchesLevel && matchesLanguage;
  });

  // Sort courses by recommended status and selected sort criteria
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    // First, sort by recommended status (recommended courses first)
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;

    // If both are recommended or both are not, use the selected sort criteria
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "students":
        return b.students - a.students;
      case "duration":
        return Number.parseInt(a.duration) - Number.parseInt(b.duration);
      default:
        return b.students - a.students;
    }
  });

  // Display loading state
  if (loading) {
    return <Loading />;
  }

  // Main render of the courses page
  return (
    <div className="bg-white">
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Explore Courses
          </h1>
          <p className="text-gray-600">
            Discover language learning courses from our global community
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses, languages, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>

          <div className="flex gap-4 items-center">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="students">Most Students</SelectItem>
                <SelectItem value="duration">Shortest Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Courses List Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ||
              selectedLevel !== "all" ||
              selectedLanguage !== "all"
                ? `Search Results (${sortedCourses.length})`
                : "All Courses"}
            </h2>
            <span className="text-sm text-gray-500">
              {sortedCourses.length} courses found
            </span>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCourses.map((course) => (
              <Link href={`/course/${course.id}`} key={course.id}>
                <Card className="hover:shadow-lg hover:scale-105 transition-transform border border-gray-200 flex flex-col h-full py-0">
                  <CardContent className="p-0 flex flex-col flex-1">
                    <div className="relative">
                      <img
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        className="h-48 w-full object-cover rounded-t-lg"
                      />
                      {course.isRecommended && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-blue-600 text-white">
                            Recommended
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {course.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`hover:text-red-500 ${
                            course.isFavorited
                              ? "text-red-500"
                              : "text-gray-400"
                          }`}
                          onClick={() =>
                            toggleFavorite(
                              course.id,
                              course.isFavorited || false
                            )
                          }
                          disabled={!userId}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              course.isFavorited ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                      </div>

                      {course.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                          {course.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{course.students.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>
                            {course.rating.toFixed(1)} ({course.reviews})
                          </span>
                        </div>
                      </div>

                      {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {course.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto">
                        <Badge
                          variant="secondary"
                          className={
                            course.level === "beginner"
                              ? "bg-green-100 text-green-800"
                              : course.level === "intermediate"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {course.level}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          by {course.author}
                        </span>
                      </div>

                      <Button
                        asChild
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
                      ></Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Empty State for No Results */}
        {sortedCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No courses found matching your criteria.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
