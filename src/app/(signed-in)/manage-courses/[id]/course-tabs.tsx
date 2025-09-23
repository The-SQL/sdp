"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  insertCourse,
  insertLessons,
  insertUnits,
  updateCourse,
  uploadImageToSupabase,
} from "@/utils/db/client";
import { Course, Lesson, Unit } from "@/utils/types";
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
}: {
  course: Course;
  fetchedUnits: Unit[];
  fetchedLessons: Lesson[];
}) {
  const { user } = useUser();

  const [courseData, setCourseData] = useState<Course>({
    id: course.id,
    author_id: course.author_id,
    language_id: course.language_id,
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

  const publishCourse = async (
    state: string
  ): Promise<{ success: boolean; data: Course | null }> => {
    try {
      const courseToPublish = {
        ...courseData,
        is_published:
          state === "public" || state === "unlisted" || state === "draft",
        is_public: state === "public",
      };
      console.log("Course data to save:", courseToPublish);
      console.log("Units to save:", units);
      console.log("Lessons to save:", lessons);
      setUploadStep("Uploading course...");
      const result = await insertCourse(courseToPublish);

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
            if (
              (lesson.content_type === "video" ||
                lesson.content_type === "audio") &&
              typeof lesson.content === "object" &&
              "url" in lesson.content &&
              lesson.content.url &&
              typeof lesson.content.url === "string" &&
              lesson.content.url.startsWith("blob:") &&
              lesson.content.fileName // fileName should be set in builder-tab.tsx
            ) {
              const fileType =
                lesson.content_type === "video" ? "videos" : "audios";
              const file = await fetch(lesson.content.url).then((r) =>
                r.blob()
              );
              const ext = lesson.content.fileName.split(".").pop();
              const publicUrl = await uploadImageToSupabase(
                new File([file], `${lesson.id}.${ext}`),
                `course-${fileType}`,
                `${result.id}-${lesson.id}.${ext}`
              );
              return {
                ...lesson,
                content: {
                  ...lesson.content,
                  url: publicUrl,
                },
              };
            }
            return lesson;
          })
        );

        setUploadStep("Uploading units...");
        await insertUnits(result.id!, units);

        setUploadStep("Uploading lessons...");
        await insertLessons(result.id!, updatedLessons);
      }

      console.log("Done");
      setUploadStep("Course published successfully!");
      return { success: true, data: result };
    } catch (error) {
      console.error("Error saving draft: ", error);
      return { success: false, data: null };
    }
  };

  useEffect(() => {
    if (user) {
      setCourseData((prev) => ({ ...prev, author_id: user.id }));
    }
  }, [user]);

  return (
    <Tabs defaultValue="setup" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 max-w-2xl">
        <TabsTrigger value="setup">Course Setup</TabsTrigger>
        <TabsTrigger value="content">Content Builder</TabsTrigger>
        <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        <TabsTrigger value="publish">Publish</TabsTrigger>
      </TabsList>

      <TabsContent value="setup" className="space-y-6">
        <SetupTab
          courseData={courseData}
          setCourseData={setCourseData}
          setCourseImageFile={setCourseImageFile}
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
        <PublishTab publishCourse={publishCourse} uploadStep={uploadStep}      isEditing={true} />
      </TabsContent>
    </Tabs>
  );
}

export default CourseTabs;
