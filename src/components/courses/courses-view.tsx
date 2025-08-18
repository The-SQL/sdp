"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Clock, Users, Star } from "lucide-react"
import Image from "next/image";

// Dummy course data
const courses = [
  {
    id: 1,
    title: "Spanish for Beginners",
    description: "Learn the basics of Spanish language with interactive lessons and community support.",
    level: "Beginner",
    duration: "8 weeks",
    students: 1234,
    rating: 4.8,
    language: "Spanish",
    image: "/mock/spanish.jfif",
  },
  {
    id: 2,
    title: "French Conversation Practice",
    description: "Improve your French speaking skills through guided conversation sessions.",
    level: "Intermediate",
    duration: "6 weeks",
    students: 856,
    rating: 4.9,
    language: "French",
    image: "/mock/french-conversation.jfif",
  },
  {
    id: 3,
    title: "Japanese Writing System",
    description: "Master Hiragana, Katakana, and basic Kanji characters step by step.",
    level: "Beginner",
    duration: "12 weeks",
    students: 2103,
    rating: 4.7,
    language: "Japanese",
    image: "/mock/japanese.jfif",
  },
  {
    id: 4,
    title: "German Grammar Mastery",
    description: "Comprehensive guide to German grammar rules and practical applications.",
    level: "Advanced",
    duration: "10 weeks",
    students: 567,
    rating: 4.6,
    language: "German",
    image: "/mock/german.jfif",
  },
  {
    id: 5,
    title: "Italian Culture & Language",
    description: "Learn Italian while exploring the rich culture and traditions of Italy.",
    level: "Intermediate",
    duration: "8 weeks",
    students: 923,
    rating: 4.8,
    language: "Italian",
    image: "/mock/italian-language.jfif",
  },
  {
    id: 6,
    title: "Mandarin Pronunciation",
    description: "Perfect your Mandarin pronunciation with tone practice and phonetic exercises.",
    level: "Beginner",
    duration: "6 weeks",
    students: 1456,
    rating: 4.5,
    language: "Mandarin",
    image: "/mock/chinese.jfif",
  },
]

export function CoursesView() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.level.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Explore Courses</h1>
        <p className="text-muted-foreground">Discover language learning courses from our global community</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses, languages, or levels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-55 bg-gray-100 relative">
              <Image src={course.image || "/placeholder.svg"} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course.students.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {course.rating}
                </div>
              </div>

              <Button className="w-full">Enroll Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No courses found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
}
