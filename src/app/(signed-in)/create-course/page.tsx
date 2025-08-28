"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Upload,
  Video,
  FileText,
  Mic,
  ImageIcon,
  HelpCircle,
  Users,
  Eye,
  Save,
  Trash2,
  Move,
  Copy,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import SetupTab from "./setup-tab";
import { Course } from "@/utils/types";
import { insertCourse, updateCourse, uploadImageToSupabase } from "@/utils/db/client";

export default function CreateCourse() {
  const { user } = useUser();
  const displayName =
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName) ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "there";

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

  const [chapters, setChapters] = useState([
    {
      id: 1,
      title: "Introduction",
      lessons: [
        {
          id: 1,
          title: "Welcome to the Course",
          type: "video",
          duration: "5 min",
          content: "",
        },
        {
          id: 2,
          title: "Course Overview",
          type: "text",
          duration: "10 min",
          content: "",
        },
      ],
    },
  ]);
  const [collaborators] = useState([]);
  const [pendingRequests] = useState([
    {
      id: 1,
      user: "Alex Chen",
      message: "I'd love to help with pronunciation sections",
      date: "2 days ago",
    },
    {
      id: 2,
      user: "Sarah Johnson",
      message: "Can I contribute cultural context lessons?",
      date: "1 week ago",
    },
  ]);

  const lessonTypes = [
    {
      type: "video",
      icon: Video,
      label: "Video Lesson",
      description: "Record or upload video content",
    },
    {
      type: "text",
      icon: FileText,
      label: "Text Content",
      description: "Written lessons and explanations",
    },
    {
      type: "audio",
      icon: Mic,
      label: "Audio Lesson",
      description: "Pronunciation and listening exercises",
    },
    {
      type: "interactive",
      icon: HelpCircle,
      label: "Interactive Exercise",
      description: "Quizzes and practice activities",
    },
    {
      type: "image",
      icon: ImageIcon,
      label: "Visual Content",
      description: "Images, diagrams, and infographics",
    },
  ];

  const addChapter = () => {
    const newChapter = {
      id: chapters.length + 1,
      title: `Chapter ${chapters.length + 1}`,
      lessons: [],
    };
    setChapters([...chapters, newChapter]);
  };

  const addLesson = (chapterId: number) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              lessons: [
                ...chapter.lessons,
                {
                  id: chapter.lessons.length + 1,
                  title: `Lesson ${chapter.lessons.length + 1}`,
                  type: "text",
                  duration: "10 min",
                  content: "",
                },
              ],
            }
          : chapter
      )
    );
  };

  const saveDraft = async () => {
    try {
      const result = await insertCourse(courseData);
      console.log("Inserted course:", result);
      if (courseImageFile && result.id) {
        const publicUrl = await uploadImageToSupabase(
          courseImageFile,
          "course-covers",
          `${result.id}`
        );

        const updatedResult = await updateCourse(result.id, { profile_url: publicUrl });
        console.log("Updated course: ", updatedResult);
      }
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
            />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Course Content Builder
              </h2>
              <Button
                onClick={addChapter}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </div>

            <div className="space-y-6">
              {chapters.map((chapter, chapterIndex) => (
                <Card key={chapter.id} className="border border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {chapterIndex + 1}
                        </div>
                        <Input
                          value={chapter.title}
                          onChange={(e) => {
                            const updatedChapters = chapters.map((c) =>
                              c.id === chapter.id
                                ? { ...c, title: e.target.value }
                                : c
                            );
                            setChapters(updatedChapters);
                          }}
                          className="text-lg font-semibold border-none p-0 h-auto"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Move className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                              {lessonIndex + 1}
                            </div>
                            <Input
                              value={lesson.title}
                              onChange={(e) => {
                                const updatedChapters = chapters.map((c) =>
                                  c.id === chapter.id
                                    ? {
                                        ...c,
                                        lessons: c.lessons.map((l) =>
                                          l.id === lesson.id
                                            ? { ...l, title: e.target.value }
                                            : l
                                        ),
                                      }
                                    : c
                                );
                                setChapters(updatedChapters);
                              }}
                              className="flex-1 font-medium"
                            />
                            <Select value={lesson.type}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {lessonTypes.map((type) => (
                                  <SelectItem key={type.type} value={type.type}>
                                    <div className="flex items-center gap-2">
                                      <type.icon className="h-4 w-4" />
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={lesson.duration}
                              onChange={(e) => {
                                const updatedChapters = chapters.map((c) =>
                                  c.id === chapter.id
                                    ? {
                                        ...c,
                                        lessons: c.lessons.map((l) =>
                                          l.id === lesson.id
                                            ? { ...l, duration: e.target.value }
                                            : l
                                        ),
                                      }
                                    : c
                                );
                                setChapters(updatedChapters);
                              }}
                              className="w-20"
                              placeholder="Duration"
                            />
                          </div>
                          <div className="ml-9">
                            {lesson.type === "video" && (
                              <div className="space-y-3">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                  <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600 mb-2">
                                    Upload video or record directly
                                  </p>
                                  <Button variant="outline" size="sm">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Choose File
                                  </Button>
                                </div>
                                <Textarea
                                  placeholder="Video description and notes..."
                                  rows={2}
                                />
                              </div>
                            )}
                            {lesson.type === "text" && (
                              <Textarea
                                placeholder="Write your lesson content here..."
                                rows={4}
                              />
                            )}
                            {lesson.type === "audio" && (
                              <div className="space-y-3">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                  <Mic className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600 mb-2">
                                    Record audio or upload file
                                  </p>
                                  <div className="flex gap-2 justify-center">
                                    <Button variant="outline" size="sm">
                                      <Mic className="h-4 w-4 mr-2" />
                                      Record
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload
                                    </Button>
                                  </div>
                                </div>
                                <Textarea
                                  placeholder="Audio transcript and pronunciation notes..."
                                  rows={2}
                                />
                              </div>
                            )}
                            {lesson.type === "interactive" && (
                              <div className="space-y-3">
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose exercise type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="quiz">
                                      Multiple Choice Quiz
                                    </SelectItem>
                                    <SelectItem value="fill-blank">
                                      Fill in the Blanks
                                    </SelectItem>
                                    <SelectItem value="matching">
                                      Matching Exercise
                                    </SelectItem>
                                    <SelectItem value="speaking">
                                      Speaking Practice
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Textarea
                                  placeholder="Exercise instructions and content..."
                                  rows={3}
                                />
                              </div>
                            )}
                            {lesson.type === "image" && (
                              <div className="space-y-3">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600 mb-2">
                                    Upload images or add visual content
                                  </p>
                                  <Button variant="outline" size="sm">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Choose File
                                  </Button>
                                </div>
                                <Textarea
                                  placeholder="Image descriptions and notes..."
                                  rows={2}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => addLesson(chapter.id)}
                        className="w-full bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lesson
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Collaboration Settings */}
              <div className="space-y-6">
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>Collaboration Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Accept Collaboration Requests
                        </label>
                        <p className="text-xs text-gray-500">
                          Allow others to request to contribute to your course
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Auto-approve Trusted Contributors
                        </label>
                        <p className="text-xs text-gray-500">
                          Automatically approve requests from verified educators
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Require Review for Changes
                        </label>
                        <p className="text-xs text-gray-500">
                          All changes must be approved before publishing
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>Invite Collaborators</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter username or email"
                        className="flex-1"
                      />
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Collaboration Roles:
                      </h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          • <strong>Editor:</strong> Can add and modify content
                        </div>
                        <div>
                          • <strong>Reviewer:</strong> Can suggest changes and
                          improvements
                        </div>
                        <div>
                          • <strong>Contributor:</strong> Can add specific
                          lessons or sections
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Collaboration Requests */}
              <div className="space-y-6">
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>Collaboration Requests</CardTitle>
                    <p className="text-sm text-gray-600">
                      {pendingRequests.length} pending requests
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {request.user}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {request.message}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {request.date}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Accept
                            </Button>
                            <Button variant="outline" size="sm">
                              Message
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 bg-transparent"
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingRequests.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No collaboration requests yet</p>
                          <p className="text-sm">
                            Share your course to attract contributors
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>Current Collaborators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            M
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {displayName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Course Creator
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          Owner
                        </Badge>
                      </div>
                      {collaborators.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">No collaborators yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="publish" className="space-y-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Publish Your Course</CardTitle>
                  <p className="text-sm text-gray-600">
                    Review your course before making it available to students
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Course Information
                        </h4>
                        <p className="text-sm text-gray-600">
                          Title, description, and basic details
                        </p>
                      </div>
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Course Content
                        </h4>
                        <p className="text-sm text-gray-600">
                          {chapters.length} chapters with lessons
                        </p>
                      </div>
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Collaboration Settings
                        </h4>
                        <p className="text-sm text-gray-600">
                          Configured for community contributions
                        </p>
                      </div>
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Publishing Options
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="publish"
                          id="draft"
                          className="text-blue-600"
                        />
                        <label htmlFor="draft" className="flex-1">
                          <div className="font-medium text-gray-900">
                            Save as Draft
                          </div>
                          <div className="text-sm text-gray-600">
                            Continue working on your course privately
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="publish"
                          id="unlisted"
                          className="text-blue-600"
                        />
                        <label htmlFor="unlisted" className="flex-1">
                          <div className="font-medium text-gray-900">
                            Publish as Unlisted
                          </div>
                          <div className="text-sm text-gray-600">
                            Only accessible via direct link
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="publish"
                          id="public"
                          className="text-blue-600"
                          defaultChecked
                        />
                        <label htmlFor="public" className="flex-1">
                          <div className="font-medium text-gray-900">
                            Publish Publicly
                          </div>
                          <div className="text-sm text-gray-600">
                            Make discoverable to all users
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Course
                    </Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                      Publish Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Floating Action Bar */}
        <div className="fixed bottom-6 right-6 flex gap-3">
          {/* <Button
            variant="outline"
            className="bg-white shadow-lg"
            onClick={async () => await saveDraft()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button> */}
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
