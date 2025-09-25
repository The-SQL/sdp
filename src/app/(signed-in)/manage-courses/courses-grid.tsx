import CourseCard from "@/components/courses/course-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCoursesByAuthor } from "@/utils/db/server";
import { auth } from "@clerk/nextjs/server";
import { BookDashed } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

async function CoursesGrid() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const courses = await getCoursesByAuthor(userId);

  if (!courses.length) {
    return (
      <div className="text-center text-gray-600 w-full h-full flex flex-col justify-center items-center pt-48">
        <BookDashed className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        No courses found.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.length > 0 ? (
        courses.map((course) => (
          <Link href={`/manage-courses/${course.id}`}>
            <CourseCard course={course} />
          </Link>
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
          className="hover:shadow-lg transition-shadow border border-gray-200 flex flex-col h-auto py-0"
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

              <div className="flex items-center justify-between mt-auto">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
export default CoursesGrid;
