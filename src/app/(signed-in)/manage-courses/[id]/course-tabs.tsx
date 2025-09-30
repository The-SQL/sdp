"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    uploadImageToSupabase,
} from "@/utils/db/client";
import { updateCourse } from "@/utils/db/courses";
import { insertLessons, updateLesson } from "@/utils/db/lessons";
import { insertSuggestedEdit, updateSuggestedEditStatus } from "@/utils/db/suggested-edits";
import { insertUnits, updateUnit } from "@/utils/db/units";
import { Course, Lesson, SuggestedChange, Unit } from "@/utils/types";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import BuilderTab from "../../create-course/builder-tab";
import CollaborationTab from "../../create-course/collaboration-tab";
import PublishTab from "../../create-course/publish-tab";
import SetupTab from "../../create-course/setup-tab";

function CourseTabs({
  course,
  fetchedUnits,
  fetchedLessons,
  courseVersion = "main",
  originalCourse,
  originalUnits,
  originalLessons,
}: {
  course: Course;
  fetchedUnits: Unit[];
  fetchedLessons: Lesson[];
  courseVersion?: string;
  originalCourse?: Course;
  originalUnits?: Unit[];
  originalLessons?: Lesson[];
}) {
  const { user } = useUser();

  const [courseData, setCourseData] = useState<Course>({
    id: course.id,
    author_id: course.author_id,
    language_id: course.language_id,
    language_name: course.language_name,
    title: course.title,
    description: course.description,
    difficulty: course.difficulty,
    estimated_duration: course.estimated_duration,
    learning_objectives: course.learning_objectives,
    profile_url: course.profile_url,
    is_public: course.is_public,
    is_published: course.is_published,
    open_to_collab: course.open_to_collab,
    created_at: course.created_at,
    updated_at: course.updated_at,
  });
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [units, setUnits] = useState<Unit[]>(fetchedUnits);
  const [lessons, setLessons] = useState<Lesson[]>(fetchedLessons);
  const [uploadStep, setUploadStep] = useState<string>("");
  const [isAuthor, setIsAuthor] = useState<boolean>(false);
  const [summaryOfChanges, setSummaryOfChanges] = useState<string>("");
  const addUnit = () => {
    const newUnit = {
      id: `${crypto.randomUUID()}`,
      title: `Unit ${units.length + 1}`,
      course_id: "temp",
      order_index: units.length + 1,
    };
    setUnits([...units, newUnit]);
  };

  const removeUnit = (unitId: string) => {
    setUnits((prevUnits) => prevUnits.filter((unit) => unit.id !== unitId));
    setLessons((prevLessons) =>
      prevLessons.filter((lesson) => lesson.unit_id !== unitId)
    );
  };

  const addLesson = (unitId: string) => {
    setLessons((prevLessons) => [
      ...prevLessons,
      {
        id: `temp-${prevLessons.length + 1}`,
        title: `Lesson ${prevLessons.length + 1}`,
        content_type: "text",
        content: { body: "" },
        unit_id: unitId,
        order_index: prevLessons.filter((l) => l.unit_id === unitId).length + 1,
      },
    ]);
  };

  const transformLesson = async (lesson: Lesson, courseId: string) => {
    if (
      (lesson.content_type === "video" || lesson.content_type === "audio") &&
      typeof lesson.content === "object" &&
      "url" in lesson.content &&
      lesson.content.url &&
      typeof lesson.content.url === "string" &&
      lesson.content.url.startsWith("blob:") &&
      lesson.content.fileName // fileName should be set in builder-tab.tsx
    ) {
      const fileType = lesson.content_type === "video" ? "videos" : "audios";
      const file = await fetch(lesson.content.url).then((r) => r.blob());
      const ext = lesson.content.fileName.split(".").pop();
      const publicUrl = await uploadImageToSupabase(
        new File([file], `${lesson.id}.${ext}`),
        isAuthor ? `course-${fileType}` : `pending-course-${fileType}`,
        `${courseId}-${lesson.id}.${ext}`
      );
      return {
        ...lesson,
        content: {
          ...lesson.content,
          url: publicUrl,
        },
      };
    } else {
      return lesson;
    }
  };

  const editCourse = async (): Promise<{
    success: boolean;
    data: Course | null;
  }> => {
    try {
      const courseToPublish = {
        ...courseData,
      };

      if (!courseToPublish.id || !user) return { success: false, data: null };

      if (!isAuthor) {
        setUploadStep("Creating course change request...");
        const updatedLessons = await Promise.all(
          lessons.map(async (lesson) => {
            return await transformLesson(lesson, courseData.id!);
          })
        );

        if (courseImageFile) {
          const publicUrl = await uploadImageToSupabase(
            courseImageFile,
            "pending-course-covers",
            `${courseData.id}`
          );

          courseToPublish.profile_url = publicUrl;
        }

        
        const suggestedChanges: SuggestedChange = {
          collaborator_id: user.id,
          course_id: courseData.id!,
          summary: summaryOfChanges,
          payload: {
            course: courseToPublish,
            units,
            lessons: updatedLessons,
          },
          status: "pending",
        };

        console.log("Suggested changes: ", suggestedChanges);

        await insertSuggestedEdit(suggestedChanges);
        setUploadStep("Course change request created successfully!");
        return { success: true, data: null };
      } else if (isAuthor && courseVersion !== "main") {
        setUploadStep("Publishing changes...");
        const updatedLessons = await Promise.all(
          lessons.map(async (lesson) => {
            return await transformLesson(lesson, courseData.id!);
          })
        );

        const result = await updateCourse(courseToPublish.id, courseToPublish);

        if (result) {
          setUploadStep("Uploading units...");

          const unitsToInsert = units.filter(
            (unit) => unit.course_id === "temp"
          );
          const unitsToUpdate = units.filter(
            (unit) => unit.course_id !== "temp"
          );

          await insertUnits(result.id!, unitsToInsert);
          await Promise.all(
            unitsToUpdate.map(async (unit) => {
              if (!unit.id) return;
              await updateUnit(unit.id, unit);
            })
          );
          setUploadStep("Uploading lessons...");

          const lessonsToInsert = updatedLessons.filter((lesson) =>
            lesson.id.startsWith("temp-")
          );
          const lessonsToUpdate = updatedLessons.filter(
            (lesson) => !lesson.id.startsWith("temp-")
          );

          await insertLessons(result.id!, lessonsToInsert);
          await Promise.all(
            lessonsToUpdate.map(async (lesson) => {
              if (!lesson.id) return;
              await updateLesson(lesson.id, lesson);
            })
          );

          await updateSuggestedEditStatus(courseVersion, "approved", user.id);
          setUploadStep("Changes published successfully!");
          return { success: true, data: null };
        } else {
          setUploadStep("Error publishing changes.");
          return { success: false, data: null };
        }
      } else if (isAuthor && courseVersion === "main") {
        setUploadStep("Updating course...");
        const result = await updateCourse(courseToPublish.id, courseToPublish);

        let updatedLessons = [...lessons];
        if (result) {
          setUploadStep("Uploading assets...");
          if (courseImageFile) {
            const publicUrl = await uploadImageToSupabase(
              courseImageFile,
              "course-covers",
              `${result.id}`
            );

            const updatedResult = await updateCourse(result.id!, {
              profile_url: publicUrl,
            });
            console.log("Updated course: ", updatedResult);
          }

          // Upload audio/video files for lessons
          updatedLessons = await Promise.all(
            lessons.map(async (lesson) => {
              return await transformLesson(lesson, courseData.id!);
            })
          );

          setUploadStep("Uploading units...");
          // Insert units
          // If unit.id starts with "temp-", it means it's a new unit and needs to be inserted
          // Otherwise, it's an existing unit and needs to be updated
          const unitsToInsert = units.filter(
            (unit) => unit.course_id === "temp"
          );
          const unitsToUpdate = units.filter(
            (unit) => unit.course_id !== "temp"
          );

          await insertUnits(result.id!, unitsToInsert);
          await Promise.all(
            unitsToUpdate.map(async (unit) => {
              if (!unit.id) return;
              await updateUnit(unit.id, unit);
            })
          );
          setUploadStep("Uploading lessons...");

          // Insert lessons
          // If lesson.id starts with "temp-", it means it's a new lesson and needs to be inserted
          // Otherwise, it's an existing lesson and needs to be updated
          const lessonsToInsert = updatedLessons.filter((lesson) =>
            lesson.id.startsWith("temp-")
          );
          const lessonsToUpdate = updatedLessons.filter(
            (lesson) => !lesson.id.startsWith("temp-")
          );

          await insertLessons(result.id!, lessonsToInsert);
          await Promise.all(
            lessonsToUpdate.map(async (lesson) => {
              if (!lesson.id) return;
              await updateLesson(lesson.id, lesson);
            })
          );
        }

        console.log("Done");
        setUploadStep("Course published successfully!");
        return { success: true, data: result };
      } else {
        return { success: false, data: null };
      }
    } catch (error) {
      console.error("Error saving draft: ", error);
      return { success: false, data: null };
    }
  };

  useEffect(() => {
    setCourseData(course);
    setUnits(fetchedUnits);
    setLessons(fetchedLessons);
  }, [course]);

  useEffect(() => {
    if (user) {
      if (!courseData.author_id) {
        setCourseData((prev) => ({ ...prev, author_id: user.id }));
      }

      setIsAuthor(user.id === courseData.author_id);
    }
  }, [user]);

  return (
    <Tabs defaultValue="setup" className="space-y-6">
      <TabsList className="w-2xl">
        <TabsTrigger value="setup">Course Setup</TabsTrigger>
        <TabsTrigger value="content">Content Builder</TabsTrigger>
        {isAuthor && (
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        )}

        <TabsTrigger value="publish">Publish</TabsTrigger>
      </TabsList>

      <TabsContent value="setup" className="space-y-6">
        <SetupTab
          courseData={courseData}
          setCourseData={setCourseData}
          setCourseImageFile={setCourseImageFile}
          courseVersion={courseVersion}
          originalCourse={originalCourse}

        />
      </TabsContent>

      <TabsContent value="content" className="space-y-6">
        <BuilderTab
          units={units}
          addUnit={addUnit}
          removeUnit={removeUnit}
          addLesson={addLesson}
          lessons={lessons}
          setUnits={setUnits}
          setLessons={setLessons}
          courseVersion={courseVersion}
          originalUnits={originalUnits}
          originalLessons={originalLessons}
        />
      </TabsContent>

      <TabsContent value="collaboration" className="space-y-6">
        <CollaborationTab
          courseData={courseData}
          setCourseData={setCourseData}
          isEditing={true}
        />
      </TabsContent>

      <TabsContent value="publish" className="space-y-6">
        <PublishTab
          publishCourse={editCourse}
          uploadStep={uploadStep}
          isEditing={true}
          courseData={courseData}
          setCourseData={setCourseData}
          isAuthor={isAuthor}
          summaryOfChanges={summaryOfChanges}
          setSummaryOfChanges={setSummaryOfChanges}
          courseVersion={courseVersion}
        />
      </TabsContent>
    </Tabs>
  );
}

export default CourseTabs;
