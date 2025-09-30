"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    uploadImageToSupabase,
} from "@/utils/db/client";
import { insertCourse, updateCourse } from "@/utils/db/courses";
import { insertLessons } from "@/utils/db/lessons";
import { insertCourseTags } from "@/utils/db/tags";
import { insertUnits } from "@/utils/db/units";
import { Course, Lesson, Tag, Unit } from "@/utils/types";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import BuilderTab from "./builder-tab";
import CollaborationTab from "./collaboration-tab";
import PublishTab from "./publish-tab";
import SetupTab from "./setup-tab";

export default function CreateCourse() {
  const { user } = useUser();
  const [isPublishing, setIsPublishing] = useState(false);

  const [courseData, setCourseData] = useState<Course>({
    author_id: "",
    language_id: "",
    title: "",
    description: "",
    difficulty: "",
    estimated_duration: "",
    learning_objectives: "",
    profile_url: "",
    is_public: false,
    is_published: false,
    open_to_collab: true,
  });
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
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

  const publishCourse = async (): Promise<{
    success: boolean;
    data: Course | null;
  }> => {
    if (isPublishing) return { success: false, data: null };
    setIsPublishing(true);
    try {
      const courseToPublish = {
        ...courseData,
      };
      console.log("Course data to save:", courseToPublish);
      console.log("Tags to save:", tags);
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

        setUploadStep("Uploading tags...");
        await insertCourseTags(
          result.id!,
          tags.map((tag) => tag.id)
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
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    if (user) {
      setCourseData((prev) => ({ ...prev, author_id: user.id }));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create a New Course
          </h1>
          <p className="text-gray-600">
            Share your language expertise with the global community
          </p>
        </div>

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
              tags={tags}
              setTags={setTags}
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
            />
          </TabsContent>

          <TabsContent value="publish" className="space-y-6">
            <PublishTab
              publishCourse={publishCourse}
              uploadStep={uploadStep}
              courseData={courseData}
              setCourseData={setCourseData}
              isAuthor={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
