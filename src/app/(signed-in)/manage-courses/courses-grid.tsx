import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCoursesByAuthor } from "@/utils/db/server";
import { auth } from "@clerk/nextjs/server";
import { Clock, Star, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

async function CoursesGrid() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const courses = await getCoursesByAuthor(userId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses && courses.length > 0 ? (
        courses.map((course) => (
          <Card
            key={course.id}
            className="hover:shadow-lg transition-shadow border border-gray-200 flex flex-col h-auto"
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
                  <span className="text-sm text-gray-600">by You</span>
                </div>

                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
                >
                  <Link href={`/manage-courses/${course.id}`}>
                    Manage Course
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-gray-600">You have not created any courses yet.</p>
      )}
    </div>
  );
}

export function CoursesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Card
          key={`skeleton-${idx}`}
          className="hover:shadow-lg transition-shadow border border-gray-200 flex flex-col h-auto"
        >
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="relative">
              <Skeleton className="h-48 w-full object-cover rounded-t-lg" />
            </div>

            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-2">
                <Skeleton className="h-5 w-3/4" />
              </div>

              <div className="text-sm mb-3">
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-5/6" />
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-16" />
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-20" />
              </div>

              <div className="flex items-center justify-between mb-4 mt-auto">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>

              <div className="w-full mt-2">
                <Skeleton className="h-9 w-full rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
export default CoursesGrid;
