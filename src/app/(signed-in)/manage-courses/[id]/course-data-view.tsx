"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Course, Lesson, SuggestedChange, Unit } from "@/utils/types";
import { useState } from "react";
import CourseTabs from "./course-tabs";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";

function CourseDataView({
  course,
  fetchedUnits,
  fetchedLessons,
  suggestedEdits,
}: {
  course: Course;
  fetchedUnits: Unit[];
  fetchedLessons: Lesson[];
  suggestedEdits: SuggestedChange[];
}) {
  const [courseViewed, setCourseViewed] = useState<Course>(course);
  const [unitsViewed, setUnitsViewed] = useState<Unit[]>(fetchedUnits);
  const [lessonsViewed, setLessonsViewed] = useState<Lesson[]>(fetchedLessons);
  const [courseVersion, setCourseVersion] = useState<string>("main");
  const { user } = useUser();
  const handleSelectChange = (value: string) => {
    if (value === "main") {
      setCourseViewed(course);
      setUnitsViewed(fetchedUnits);
      setLessonsViewed(fetchedLessons);
      setCourseVersion("main");
    } else {
      const selectedEdit = suggestedEdits.find((edit) => edit.id === value);
      if (selectedEdit) {
        setCourseViewed(selectedEdit.payload.course);
        setUnitsViewed(selectedEdit.payload.units);
        setLessonsViewed(selectedEdit.payload.lessons);
        setCourseVersion(selectedEdit.id!);
      }
    }
  };

  return (
    <div>
      {user?.id === course.author_id && (
        <div>
          <Label className="mb-2 text-muted-foreground">Version</Label>
          <Select onValueChange={handleSelectChange} defaultValue="main">
            <SelectTrigger className="w-[170px] mb-4">
              <SelectValue placeholder="Select an edit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="main">Main</SelectItem>
                {suggestedEdits
                  .filter((edit) => edit.status === "pending")
                  .map((edit) => (
                    <SelectItem key={edit.id} value={edit.id!}>
                      Suggested Edit -{" "}
                      {new Date(edit.created_at || "").toLocaleDateString()}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      <CourseTabs
        courseVersion={courseVersion}
        course={courseViewed}
        fetchedUnits={unitsViewed}
        fetchedLessons={lessonsViewed}
        originalCourse={course}
        originalUnits={fetchedUnits}
        originalLessons={fetchedLessons}
      />
    </div>
  );
}

export default CourseDataView;
