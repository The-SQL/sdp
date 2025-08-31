"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    insertCourse,
    insertCourseTags,
    insertLessons,
    insertUnits,
    updateCourse,
    uploadImageToSupabase
} from "@/utils/db/client";
import { Course, Lesson, Tag, Unit } from "@/utils/types";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import BuilderTab from "./builder-tab";
import CollaborationTab from "./collaboration-tab";
import PublishTab from "./publish-tab";
import SetupTab from "./setup-tab";

export default function CreateCourse() {
  const { user } = useUser();

  const [courseData, setCourseData] = useState<Course>({
    author_id: "",
    language_id: "",
    title: "",
    description: "",
    difficulty: "",
    estimated_duration: "",
    learning_objectives: "",
    profile_url: "",
    is_public: true,
    is_published: false,
  });
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [collaborators] = useState([]);
  const [pendingRequests] = useState([
    {
      id: "1",
      user: "Alex Chen",
      message: "I'd love to help with pronunciation sections",
      date: "2 days ago",
    },
    {
      id: "2",
      user: "Sarah Johnson",
      message: "Can I contribute cultural context lessons?",
      date: "1 week ago",
    },
  ]);

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
        content: {},
        unit_id: unitId,
        order_index: prevLessons.filter((l) => l.unit_id === unitId).length + 1,
      },
    ]);
  };

  const publishCourse = async (state: string) => {
    try {
      const courseToPublish = {
        ...courseData,
        is_published: state === "public" || state === "unlisted",
        is_public: state === "public",
      };
      console.log("Course data to save:", courseToPublish);
      console.log("Tags to save:", tags);
      console.log("Units to save:", units);
      console.log("Lessons to save:", lessons);
      const result = await insertCourse(courseToPublish);

      if (result.id) {
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

        await insertCourseTags(
          result.id!,
          tags.map((tag) => tag.id)
        );

        await insertUnits(result.id!, units);

        await insertLessons(result.id!, lessons);
      }

      console.log("Done");
    } catch (error) {
      console.error("Error saving draft: ", error);
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
            <CollaborationTab collaborators={collaborators} pendingRequests={pendingRequests} />
          </TabsContent>

          <TabsContent value="publish" className="space-y-6">
            <PublishTab publishCourse={publishCourse} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
