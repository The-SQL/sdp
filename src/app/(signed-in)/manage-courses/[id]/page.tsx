import {
  getLessonsByUnitId,
  getStandardCourseById,
  getUnitsByCourseId,
} from "@/utils/db/server";
import CourseTabs from "./course-tabs";

async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const course = await getStandardCourseById(id);
  const units = await getUnitsByCourseId(id);

  const lessons = await Promise.all(
    units.map((unit) => getLessonsByUnitId(unit.id))
  ).then((res) => {
    return res.flat();
  });

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
        <CourseTabs
          course={course}
          fetchedUnits={units}
          fetchedLessons={lessons}
        />
      </div>
    </div>
  );
}

export default Page;
