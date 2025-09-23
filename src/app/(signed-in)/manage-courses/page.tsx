import { Button } from "@/components/ui/button";

import Link from "next/link";
import { Suspense } from "react";
import CoursesGrid, { CoursesGridSkeleton } from "./courses-grid";
async function Page() {

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex ">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Your Courses
            </h1>
            <p className="text-gray-600">
              Edit, update, and organise your courses
            </p>
          </div>

          <Link href="/create-course" className="ml-auto">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Create New Course
            </Button>
          </Link>
        </div>

        <Suspense fallback={<CoursesGridSkeleton />}>
          <CoursesGrid />
        </Suspense>
      </div>
    </div>
  );
}

export default Page;
