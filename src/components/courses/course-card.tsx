"use client"

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CourseWithStats } from "@/utils/db/server";
import { useUser } from "@clerk/nextjs";
import { Clock, Star, Users } from "lucide-react";

function CourseCard({ course }: { course: CourseWithStats }) {
  const { user } = useUser();

  return (
    <Card
      key={course.id}
      className="hover:shadow-lg hover:scale-105 transition-transform border border-gray-200 flex flex-col h-full py-0"
    >
      <CardContent className="p-0 flex flex-col flex-1">
        <div className="relative">
          <img
            src={course.image || "/placeholder.svg"}
            alt={course.title}
            className="h-48 w-full object-cover rounded-t-lg"
          />
        </div>
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900">
              {course.title}
            </h3>
          </div>

          {course.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {course.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 justify-start">
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

          <div className="flex items-center gap-2 mt-auto">
            <Badge variant="secondary">{course.language}</Badge>
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
            <span className="text-sm text-gray-500 ml-auto">
              by {user && course.author_id === user.id ? "You" : course.author}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCard;
