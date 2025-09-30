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
import { FileText, HelpCircle, Mic, Plus, Trash2, Video } from "lucide-react";
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
  courseVersion = "main",
  originalUnits,
  originalLessons,
}: {
  units: Unit[];
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
  addUnit: () => void;
  lessons: Lesson[];
  addLesson: (unitId: string) => void;
  removeUnit: (unitId: string) => void;
  courseVersion?: string;
  originalUnits?: Unit[];
  originalLessons?: Lesson[];
}) {
  // prepare maps for quick lookup
  const origUnitsMap = new Map<string, Unit>((originalUnits || []).map((u) => [u.id, u]));
  const origLessonsMap = new Map<string, Lesson>((originalLessons || []).map((l) => [l.id, l]));

  const unitChanged = (unit: Unit) => {
    if (!originalUnits) return false;
    const orig = origUnitsMap.get(unit.id);
    if (!orig) return true; // new unit => changed
    return (orig.title || "") !== (unit.title || "");
  };

  const lessonChanged = (lesson: Lesson) => {
    if (!originalLessons) return false;
    const orig = origLessonsMap.get(lesson.id);
    if (!orig) return true; // new lesson
    if ((orig.title || "") !== (lesson.title || "")) return true;
    try {
      return JSON.stringify(orig.content || {}) !== JSON.stringify(lesson.content || {});
    } catch (e) {
      return false;
    }
  };

  const highlight = (changed: boolean) =>
    changed && courseVersion !== "main" ? "ring-2 ring-yellow-300 bg-yellow-50" : "";

  return (
    <>
      {/* <Button onClick={() => console.log(lessons)}>Test</Button> */}
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
                    className={`text-lg font-semibold border-none p-0 h-auto ${highlight(unitChanged(unit))}`}
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
                      className={`border border-gray-200 rounded-lg p-4 ${highlight(lessonChanged(lesson))}`}
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
                          className={`flex-1 font-medium ${highlight(lessonChanged(lesson))}`}
                        />
                        <Select
                          value={lesson.content_type}
                          onValueChange={(value) => {
                            const updatedLesson = lessons.map((l) =>
                              l.id === lesson.id
                                ? {
                                    ...l,
                                    content_type:
                                      value as Lesson["content_type"],
                                    content:
                                      value === "text"
                                        ? { body: "" }
                                        : value === "video"
                                        ? { url: "", notes: "" }
                                        : value === "audio"
                                        ? { url: "", transcript: "" }
                                        : { prompt: "", exerciseType: "" },
                                  }
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
                              {"url" in lesson.content &&
                                !lesson.content.url && (
                                  <>
                                    <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-2">
                                      Upload video or record directly
                                    </p>
                                  </>
                                )}
                              {lesson.content_type === "video" &&
                                "url" in lesson.content &&
                                lesson.content.url && (
                                  <video
                                    src={lesson.content.url}
                                    controls
                                    className="w-full max-h-64 mb-4"
                                  />
                                )}
                              <Input
                                type="file"
                                accept="video/*"
                                className="w-fit mx-auto"
                                onChange={async (
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    setLessons(
                                      lessons.map((l) =>
                                        l.id === lesson.id
                                          ? {
                                              ...l,
                                              content: {
                                                ...(l.content || {}),
                                                url: url,
                                                fileName: file.name,
                                              },
                                            }
                                          : l
                                      )
                                    );
                                  }
                                }}
                              />
                            </div>
                            <Textarea
                              placeholder="Video description and notes..."
                              rows={2}
                              value={
                                lesson.content_type === "video" &&
                                "notes" in lesson.content
                                  ? lesson.content.notes ?? ""
                                  : ""
                              }
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
                            value={
                              lesson.content_type === "text" &&
                              "body" in lesson.content
                                ? lesson.content.body ?? ""
                                : ""
                            }
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
                              {"url" in lesson.content &&
                                !lesson.content.url && (
                                  <>
                                    <Mic className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-2">
                                      Record audio or upload file
                                    </p>
                                  </>
                                )}
                              {lesson.content_type === "audio" &&
                                "url" in lesson.content &&
                                lesson.content.url && (
                                  <audio
                                    src={lesson.content.url}
                                    controls
                                    className="w-full max-h-64 mb-4"
                                  />
                                )}
                              <div className="flex gap-2 justify-center">
                                <Input
                                  type="file"
                                  accept="audio/*"
                                  className="w-fit mx-auto"
                                  onChange={async (
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const url = URL.createObjectURL(file);
                                      setLessons(
                                        lessons.map((l) =>
                                          l.id === lesson.id
                                            ? {
                                                ...l,
                                                content: {
                                                  ...(l.content || {}),
                                                  url: url,
                                                  fileName: file.name,
                                                },
                                              }
                                            : l
                                        )
                                      );
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <Textarea
                              placeholder="Audio transcript and pronunciation notes..."
                              rows={2}
                              value={
                                lesson.content_type === "audio" &&
                                "transcript" in lesson.content
                                  ? lesson.content.transcript ?? ""
                                  : ""
                              }
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
                            <Select
                              value={
                                "exerciseType" in lesson.content
                                  ? lesson.content.exerciseType
                                  : ""
                              }
                              onValueChange={(value) => {
                                setLessons(
                                  lessons.map((l) =>
                                    l.id === lesson.id
                                      ? {
                                          ...l,
                                          content:
                                            value === "quiz"
                                              ? {
                                                  exerciseType: "quiz",
                                                  question: "",
                                                  options: ["", "", ""],
                                                  correct: 0,
                                                }
                                              : value === "fill-blank"
                                              ? {
                                                  exerciseType: "fill-blank",
                                                  sentence: "",
                                                  blankIndex: null,
                                                }
                                              : l.content,
                                        }
                                      : l
                                  )
                                );
                              }}
                            >
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
                              </SelectContent>
                            </Select>
                            {/* Multiple Choice Quiz */}
                            {"exerciseType" in lesson.content &&
                              lesson.content.exerciseType === "quiz" && (
                                <div className="space-y-2">
                                  <Input
                                    placeholder="Enter question..."
                                    value={lesson.content.question}
                                    onChange={(e) => {
                                      if (
                                        "exerciseType" in lesson.content &&
                                        lesson.content.exerciseType === "quiz"
                                      ) {
                                        setLessons(
                                          lessons.map((l) =>
                                            l.id === lesson.id
                                              ? {
                                                  ...l,
                                                  content: {
                                                    ...lesson.content,
                                                    question: e.target.value,
                                                  },
                                                }
                                              : l
                                          )
                                        );
                                      }
                                    }}
                                  />
                                  {"exerciseType" in lesson.content &&
                                    lesson.content.exerciseType === "quiz" &&
                                    lesson.content.options.map((opt, idx) => {
                                      if (
                                        "exerciseType" in lesson.content &&
                                        lesson.content.exerciseType === "quiz"
                                      ) {
                                        return (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-2"
                                          >
                                            <Input
                                              placeholder={`Option ${idx + 1}`}
                                              value={opt}
                                              onChange={(e) => {
                                                if (
                                                  "exerciseType" in
                                                    lesson.content &&
                                                  lesson.content
                                                    .exerciseType === "quiz"
                                                ) {
                                                  const newOptions = [
                                                    ...lesson.content.options,
                                                  ];
                                                  newOptions[idx] =
                                                    e.target.value;
                                                  setLessons(
                                                    lessons.map((l) =>
                                                      l.id === lesson.id
                                                        ? {
                                                            ...l,
                                                            content: {
                                                              ...lesson.content,
                                                              options:
                                                                newOptions,
                                                            },
                                                          }
                                                        : l
                                                    )
                                                  );
                                                }
                                              }}
                                            />
                                            <input
                                              type="radio"
                                              name={`correct-${lesson.id}`}
                                              checked={
                                                lesson.content.correct === idx
                                              }
                                              onChange={() => {
                                                if (
                                                  "exerciseType" in
                                                    lesson.content &&
                                                  lesson.content
                                                    .exerciseType === "quiz"
                                                ) {
                                                  setLessons(
                                                    lessons.map((l) =>
                                                      l.id === lesson.id
                                                        ? {
                                                            ...l,
                                                            content: {
                                                              ...lesson.content,
                                                              correct: idx,
                                                            },
                                                          }
                                                        : l
                                                    )
                                                  );
                                                }
                                              }}
                                            />
                                            <span className="text-xs">
                                              Correct
                                            </span>
                                            {lesson.content.options.length >
                                              3 && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  if (
                                                    "exerciseType" in
                                                      lesson.content &&
                                                    lesson.content
                                                      .exerciseType === "quiz"
                                                  ) {
                                                    const newOptions =
                                                      lesson.content.options.filter(
                                                        (_, i) => i !== idx
                                                      );
                                                    setLessons(
                                                      lessons.map((l) => {
                                                        if (
                                                          l.id === lesson.id &&
                                                          "exerciseType" in
                                                            l.content &&
                                                          l.content
                                                            .exerciseType ===
                                                            "quiz"
                                                        ) {
                                                          return {
                                                            ...l,
                                                            content: {
                                                              ...l.content,
                                                              options:
                                                                newOptions,
                                                              correct:
                                                                l.content
                                                                  .correct ===
                                                                idx
                                                                  ? 0
                                                                  : l.content
                                                                      .correct,
                                                            },
                                                          };
                                                        }
                                                        return l;
                                                      })
                                                    );
                                                  }
                                                }}
                                              >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                              </Button>
                                            )}
                                          </div>
                                        );
                                      }
                                      return null;
                                    })}
                                  {"exerciseType" in lesson.content &&
                                    lesson.content.exerciseType === "quiz" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          if (
                                            "exerciseType" in lesson.content &&
                                            lesson.content.exerciseType ===
                                              "quiz"
                                          ) {
                                            setLessons(
                                              lessons.map((l) => {
                                                if (
                                                  l.id === lesson.id &&
                                                  "exerciseType" in l.content &&
                                                  l.content.exerciseType ===
                                                    "quiz"
                                                ) {
                                                  return {
                                                    ...l,
                                                    content: {
                                                      ...l.content,
                                                      options: [
                                                        ...l.content.options,
                                                        "",
                                                      ],
                                                    },
                                                  };
                                                }
                                                return l;
                                              })
                                            );
                                          }
                                        }}
                                        disabled={
                                          "exerciseType" in lesson.content &&
                                          lesson.content.exerciseType ===
                                            "quiz" &&
                                          lesson.content.options.length >= 6
                                        }
                                      >
                                        <Plus className="h-4 w-4 mr-1" /> Add
                                        Option
                                      </Button>
                                    )}
                                </div>
                              )}
                            {/* Fill in the Blanks */}
                            {"exerciseType" in lesson.content &&
                              lesson.content.exerciseType === "fill-blank" && (
                                <div className="space-y-2">
                                  <Input
                                    placeholder="Enter sentence..."
                                    value={lesson.content.sentence}
                                    onChange={(e) => {
                                      if (
                                        "exerciseType" in lesson.content &&
                                        lesson.content.exerciseType ===
                                          "fill-blank"
                                      ) {
                                        setLessons(
                                          lessons.map((l) =>
                                            l.id === lesson.id
                                              ? {
                                                  ...l,
                                                  content: {
                                                    ...lesson.content,
                                                    sentence: e.target.value,
                                                    blankIndex: null,
                                                  },
                                                }
                                              : l
                                          )
                                        );
                                      }
                                    }}
                                  />
                                  {"exerciseType" in lesson.content &&
                                    lesson.content.exerciseType ===
                                      "fill-blank" &&
                                    lesson.content.sentence && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {lesson.content.sentence
                                          .split(" ")
                                          .map((word, idx) => {
                                            if (
                                              "exerciseType" in
                                                lesson.content &&
                                              lesson.content.exerciseType ===
                                                "fill-blank"
                                            ) {
                                              return (
                                                <Button
                                                  key={idx}
                                                  variant={
                                                    lesson.content
                                                      .blankIndex === idx
                                                      ? "default"
                                                      : "outline"
                                                  }
                                                  size="sm"
                                                  onClick={() => {
                                                    if (
                                                      "exerciseType" in
                                                        lesson.content &&
                                                      lesson.content
                                                        .exerciseType ===
                                                        "fill-blank"
                                                    ) {
                                                      setLessons(
                                                        lessons.map((l) =>
                                                          l.id === lesson.id
                                                            ? {
                                                                ...l,
                                                                content: {
                                                                  ...lesson.content,
                                                                  blankIndex:
                                                                    idx,
                                                                  blankWord:
                                                                    "exerciseType" in
                                                                      lesson.content &&
                                                                    lesson
                                                                      .content
                                                                      .exerciseType ===
                                                                      "fill-blank" &&
                                                                    typeof lesson
                                                                      .content
                                                                      .sentence ===
                                                                      "string"
                                                                      ? lesson.content.sentence.split(
                                                                          " "
                                                                        )[idx]
                                                                      : "",
                                                                },
                                                              }
                                                            : l
                                                        )
                                                      );
                                                    }
                                                  }}
                                                >
                                                  {lesson.content.blankIndex ===
                                                  idx
                                                    ? "[Blank]"
                                                    : word}
                                                </Button>
                                              );
                                            }
                                            return null;
                                          })}
                                      </div>
                                    )}
                                </div>
                              )}
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
