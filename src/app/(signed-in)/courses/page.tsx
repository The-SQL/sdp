"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Search, Filter, Star, Clock, Users, Heart } from "lucide-react"
import { getAllCourses, getRecommendedCourses, checkIfFavorited, addToFavorites, removeFromFavorites } from "@/utils/db/client"
import { useAuth } from "@clerk/nextjs"

interface Course {
  id: string;
  title: string;
  level: string;
  language: string;
  image: string;
  duration: string;
  students: number;
  rating: number;
  reviews: number;
  author: string;
  description: string;
  tags: string[];
  isRecommended: boolean;
  price: string;
  isFavorited?: boolean;
}

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const { userId } = useAuth()

  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId) return;
      
      try {
        const [allCourses, recommendedCourses] = await Promise.all([
          getAllCourses(),
          getRecommendedCourses()
        ]);
        
        const recommendedIds = new Set(recommendedCourses.map(c => c.id));
        
        const coursesWithStatus = await Promise.all(
          allCourses.map(async (course) => {
            const isFavorited = await checkIfFavorited(course.id, userId);
            return {
              ...course,
              isRecommended: recommendedIds.has(course.id),
              isFavorited
            } as Course;
          })
        );
        
        setCourses(coursesWithStatus);
      } catch (error) {
        console.error('Error fetching courses:', error)
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [userId])

  const toggleFavorite = async (courseId: string, currentlyFavorited: boolean) => {
    if (!userId) return;
    
    try {
      if (currentlyFavorited) {
        await removeFromFavorites(courseId, userId);
      } else {
        await addToFavorites(courseId, userId);
      }
      
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, isFavorited: !currentlyFavorited }
            : course
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const availableLanguages = useMemo(() => {
    const languages = courses.map(course => course.language).filter(Boolean);
    return [...new Set(languages)].sort();
  }, [courses]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel
    const matchesLanguage = selectedLanguage === "all" || course.language === selectedLanguage

    return matchesSearch && matchesLevel && matchesLanguage
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "students":
        return b.students - a.students
      case "duration":
        return Number.parseInt(a.duration) - Number.parseInt(b.duration)
      default:
        return b.students - a.students
    }
  })

  const recommendedCourses = courses.filter((course) => course.isRecommended)

  if (loading) {
    return (
      <div className="bg-white p-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Courses</h1>
          <p className="text-gray-600">Discover language learning courses from our global community</p>
        </div>

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

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
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

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery || selectedLevel !== "all" || selectedLanguage !== "all"
                ? `Search Results (${sortedCourses.length})`
                : "All Courses"}
            </h2>
            <span className="text-sm text-gray-500">{sortedCourses.length} courses found</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow border border-gray-200 flex flex-col h-auto">
                <CardContent className="p-0 flex flex-col flex-1">
                  <div className="relative">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="h-48 w-full object-cover rounded-t-lg"
                    />
                    {course.isRecommended && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-600 text-white">Recommended</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{course.title}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`hover:text-red-500 ${course.isFavorited ? 'text-red-500' : 'text-gray-400'}`}
                        onClick={() => toggleFavorite(course.id, course.isFavorited || false)}
                        disabled={!userId}
                      >
                        <Heart className={`h-4 w-4 ${course.isFavorited ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    
                    {course.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{course.description}</p>
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
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-4 mt-auto">
                      <Badge
                        variant="secondary"
                        className={
                          course.level === "Beginner"
                            ? "bg-green-100 text-green-800"
                            : course.level === "Intermediate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {course.level}
                      </Badge>
                      <span className="text-sm text-gray-600">by {course.author}</span>
                    </div>
                    
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
                      <Link href={`/course/${course.id}`}>View Course</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {searchQuery === "" && selectedLevel === "all" && selectedLanguage === "all" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow border border-gray-200 flex flex-col h-auto">
                  <CardContent className="p-0 flex flex-col flex-1">
                    <div className="relative">
                      <img
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        className="h-48 w-full object-cover rounded-t-lg"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-600 text-white">Recommended</Badge>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{course.title}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`hover:text-red-500 ${course.isFavorited ? 'text-red-500' : 'text-gray-400'}`}
                          onClick={() => toggleFavorite(course.id, course.isFavorited || false)}
                          disabled={!userId}
                        >
                          <Heart className={`h-4 w-4 ${course.isFavorited ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                      
                      {course.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{course.description}</p>
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
                          <span>{course.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {course.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-4 mt-auto">
                        <Badge
                          variant="secondary"
                          className={
                            course.level === "Beginner"
                              ? "bg-green-100 text-green-800"
                              : course.level === "Intermediate"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {course.level}
                        </Badge>
                        <span className="text-sm text-gray-600">by {course.author}</span>
                      </div>
                      
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
                        <Link href={`/course/${course.id}`}>View Course</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {sortedCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No courses found matching your criteria.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  )
}