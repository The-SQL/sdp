import { getCourseSuggestedEdits } from "@/utils/db/client";
import {
  getLessonsByUnitId,
  getStandardCourseById,
  getUnitsByCourseId,
} from "@/utils/db/server";
import CourseDataView from "./course-data-view";

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getStandardCourseById(id);
  const units = await getUnitsByCourseId(id);
  const suggestedEdits = await getCourseSuggestedEdits(id);

  const lessons = await Promise.all(
    units.map((unit) => getLessonsByUnitId(unit.id))
  ).then((res) => {
    return res.flat();
  });

  console.log("Course fetched:", course);
  console.log("Suggested edits fetched:", suggestedEdits);
  if (!course) {
    return (
      <div>
        <h1>Course not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Course: {course.title}
          </h1>
          <p className="text-gray-600">Edit and update your course details</p>
        </div>
        <CourseDataView
          suggestedEdits={suggestedEdits || []}
          course={course}
          fetchedUnits={units}
          fetchedLessons={lessons}
        />
      </div>
    </div>
  );
}

export default Page;
