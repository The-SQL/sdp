"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Search, Filter, Star, Clock, Users, Heart } from "lucide-react"

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [sortBy, setSortBy] = useState("popular")

  const courses = [
    {
      id: 1,
      title: "Spanish for Beginners",
      level: "Beginner",
      language: "Spanish",
      image: "/mock/spanish.png",
      duration: "10 weeks",
      students: 2567,
      rating: 4.6,
      reviews: 234,
      author: "Maria Rodriguez",
      description:
        "Learn essential Spanish vocabulary and grammar for everyday conversations with interactive lessons.",
      tags: ["Grammar", "Vocabulary", "Speaking"],
      isRecommended: true,
      price: "Free",
    },
    {
      id: 2,
      title: "French Conversation Practice",
      level: "Intermediate",
      language: "French",
      image: "/mock/french-conversation.png",
      duration: "8 weeks",
      students: 1923,
      rating: 4.8,
      reviews: 156,
      author: "Pierre Dubois",
      description: "Improve your French speaking skills through interactive conversations and real-world scenarios.",
      tags: ["Speaking", "Listening", "Culture"],
      isRecommended: true,
      price: "Free",
    },
    {
      id: 3,
      title: "Japanese Writing System",
      level: "Beginner",
      language: "Japanese",
      image: "/mock/japanese.png",
      duration: "6 weeks",
      students: 3456,
      rating: 4.5,
      reviews: 289,
      author: "Yuki Tanaka",
      description: "Master Hiragana, Katakana, and basic Kanji characters with step-by-step guidance.",
      tags: ["Writing", "Characters", "Reading"],
      isRecommended: false,
      price: "Free",
    },
    {
      id: 4,
      title: "German Grammar Mastery",
      level: "Advanced",
      language: "German",
      image: "/mock/german.png",
      duration: "12 weeks",
      students: 1567,
      rating: 4.7,
      reviews: 198,
      author: "Hans Mueller",
      description: "Comprehensive guide to German grammar rules and practical usage for advanced learners.",
      tags: ["Grammar", "Advanced", "Writing"],
      isRecommended: false,
      price: "Free",
    },
    {
      id: 5,
      title: "Italian Culture & Language",
      level: "Intermediate",
      language: "Italian",
      image: "/mock/italian-language.png",
      duration: "8 weeks",
      students: 2123,
      rating: 4.8,
      reviews: 167,
      author: "Giuseppe Rossi",
      description: "Learn Italian while exploring the rich culture and traditions of Italy through immersive content.",
      tags: ["Culture", "Speaking", "History"],
      isRecommended: true,
      price: "Free",
    },
    {
      id: 6,
      title: "Mandarin Pronunciation",
      level: "Beginner",
      language: "Mandarin",
      image: "/mock/chinese.png",
      duration: "6 weeks",
      students: 2856,
      rating: 4.6,
      reviews: 245,
      author: "Li Wei",
      description: "Perfect your Mandarin pronunciation with tone practice and phonetics training.",
      tags: ["Pronunciation", "Tones", "Speaking"],
      isRecommended: false,
      price: "Free",
    },
  ]

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
      default: // popular
        return b.students - a.students
    }
  })

  const recommendedCourses = courses.filter((course) => course.isRecommended)

  return (
    <div className="bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Courses</h1>
          <p className="text-gray-600">Discover language learning courses from our global community</p>
        </div>

        {/* Search and Filters */}
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
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Japanese">Japanese</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="Italian">Italian</SelectItem>
                <SelectItem value="Mandarin">Mandarin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="students">Most Students</SelectItem>
                <SelectItem value="duration">Shortest Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* All Courses */}
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
              <Card key={course.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                <CardContent className="p-0">
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
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{course.title}</h3>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{course.description}</p>
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
                          {course.rating} ({course.reviews})
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mb-4">
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
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Link href={`/course/${course.id}`}>View Course</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommended Courses */}
        {searchQuery === "" && selectedLevel === "all" && selectedLanguage === "all" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                  <CardContent className="p-0">
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
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{course.title}</h3>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{course.description}</p>
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
                          <span>{course.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
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
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
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
