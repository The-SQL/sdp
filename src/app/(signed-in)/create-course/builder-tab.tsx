"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Lesson, Unit } from "@/utils/types";
import {
  FileText,
  HelpCircle,
  ImageIcon,
  Mic,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
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
    type: "exercise",
    icon: HelpCircle,
    label: "Interactive Exercise",
    description: "Quizzes and practice activities",
  },
];

function BuilderTab({
  units,
  addUnit,
  addLesson,
  lessons,
  setLessons,
  setUnits,
  removeUnit,
}: {
  units: Unit[];
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
  addUnit: () => void;
  lessons: Lesson[];
  addLesson: (unitId: string) => void;
  removeUnit: (unitId: string) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Course Content Builder
        </h2>
        <Button
          onClick={addUnit}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </div>

      <div className="space-y-6">
        {units.map((unit, unitIndex) => (
          <Card key={unit.id} className="border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="min-w-8 min-h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {unitIndex + 1}
                  </div>
                  <Input
                    value={unit.title}
                    onChange={(e) => {
                      const updatedUnits = units.map((c) =>
                        c.id === unit.id ? { ...c, title: e.target.value } : c
                      );
                      setUnits(updatedUnits);
                    }}
                    className="text-lg font-semibold border-none p-0 h-auto"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 bg-transparent"
                    onClick={() => removeUnit(unit.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessons
                  .filter((lesson) => lesson.unit_id === unit.id)
                  .map((lesson, lessonIndex) => (
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
                            const updatedLesson = lessons.map((l) =>
                              l.id === lesson.id
                                ? { ...l, title: e.target.value }
                                : l
                            );
                            setLessons(updatedLesson);
                          }}
                          className="flex-1 font-medium"
                        />
                        <Select
                          value={lesson.content_type}
                          onValueChange={(value) => {
                            const updatedLesson = lessons.map((l) =>
                              l.id === lesson.id
                                ? { ...l, content_type: value }
                                : l
                            );
                            setLessons(updatedLesson);
                          }}
                        >
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
                      </div>
                      <div className="ml-9">
                        {lesson.content_type === "video" && (
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
                              onChange={(e) => {
                                setLessons(
                                  lessons.map((l) =>
                                    l.id === lesson.id
                                      ? {
                                          ...l,
                                          content: {
                                            ...(l.content || {}),
                                            notes: e.target.value,
                                          },
                                        }
                                      : l
                                  )
                                );
                              }}
                            />
                          </div>
                        )}
                        {lesson.content_type === "text" && (
                          <Textarea
                            placeholder="Write your lesson content here..."
                            rows={4}
                            onChange={(e) => {
                              setLessons(
                                lessons.map((l) =>
                                  l.id === lesson.id
                                    ? {
                                        ...l,
                                        content: { body: e.target.value },
                                      }
                                    : l
                                )
                              );
                            }}
                          />
                        )}
                        {lesson.content_type === "audio" && (
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
                              onChange={(e) => {
                                setLessons(
                                  lessons.map((l) =>
                                    l.id === lesson.id
                                      ? {
                                          ...l,
                                          content: {
                                            ...(l.content || {}),
                                            transcript: e.target.value,
                                          },
                                        }
                                      : l
                                  )
                                );
                              }}
                            />
                          </div>
                        )}
                        {lesson.content_type === "exercise" && (
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
                              onChange={(e) => {
                                setLessons(
                                  lessons.map((l) =>
                                    l.id === lesson.id
                                      ? {
                                          ...l,
                                          content: {
                                            ...(l.content || {}),
                                            prompt: e.target.value,
                                          },
                                        }
                                      : l
                                  )
                                );
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                <Button
                  variant="outline"
                  onClick={() => addLesson(unit.id)}
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
    </>
  );
}

export default BuilderTab;
