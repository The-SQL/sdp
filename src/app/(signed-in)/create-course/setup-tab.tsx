import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { Course, Language, Tag } from "@/utils/types";
import { PostgrestError } from "@supabase/supabase-js";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import SearchableInput from "@/components/ui/searchable-input";
import { createLanguage, createTag } from "@/utils/db/client";
import { XIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

function SetupTab({
  courseData,
  setCourseData,
  setCourseImageFile,
  tags,
  setTags,
}: {
  courseData: Course;
  setCourseData: Dispatch<SetStateAction<Course>>;
  setCourseImageFile: Dispatch<SetStateAction<File | null>>;
  tags?: Tag[];
  setTags?: Dispatch<SetStateAction<Tag[]>>;
}) {
  const [localImageUrl, setLocalImageUrl] = useState<string>("");

  const removeTag = (id: string) => {
    setTags?.((prev) => prev.filter((tag) => tag.id !== id));
  };

  const searchLanguages = async (
    query: string
  ): Promise<{ data: Language[]; error: PostgrestError | null }> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("languages")
      .select("id, name")
      .ilike("name", `%${query}%`);
    return { data: data ?? [], error };
  };

  const searchTags = async (
    query: string
  ): Promise<{ data: Tag[]; error: PostgrestError | null }> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tags")
      .select("id, name")
      .ilike("name", `%${query}%`);
    return { data: data ?? [], error };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Course Details Form */}
      <div className="space-y-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title
              </Label>
              <Input
                placeholder="e.g., Spanish for Travel Enthusiasts"
                value={courseData.title}
                onChange={(e) =>
                  setCourseData({ ...courseData, title: e.target.value })
                }
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Course Image
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setLocalImageUrl(url);
                    setCourseImageFile(file);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 relative">
              <div style={{ position: "relative" }}>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </Label>
                <SearchableInput<Language>
                  dbCall={searchLanguages}
                  selected={
                    courseData.language_id && courseData.language_name
                      ? {
                          id: courseData.language_id,
                          name: courseData.language_name,
                        }
                      : null
                  }
                  onSelect={(lang) => {
                    setCourseData((p) => ({
                      ...p,
                      language_id: lang.id,
                      language_name: lang.name,
                    })); // your actual state update
                  }}
                  isCreationAllowed
                  createSearchType={createLanguage}
                  placeholder="Enter language..."
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </Label>
                <Select
                  value={courseData.difficulty}
                  onValueChange={(value: string) =>
                    setCourseData({ ...courseData, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration
              </Label>
              <Input
                placeholder="e.g., 8 weeks"
                value={courseData.estimated_duration}
                onChange={(e) =>
                  setCourseData({
                    ...courseData,
                    estimated_duration: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Course Description
              </Label>
              <Textarea
                placeholder="Describe what students will learn and achieve in this course..."
                rows={4}
                value={courseData.description}
                onChange={(e) =>
                  setCourseData({ ...courseData, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Objectives
              </Label>
              <Textarea
                placeholder="Master basic conversation skills, Learn 500+ essential vocabulary words, Understand cultural context"
                rows={3}
                value={courseData.learning_objectives}
                onChange={(e) =>
                  setCourseData({
                    ...courseData,
                    learning_objectives: e.target.value,
                  })
                }
              />
            </div>

            {tags && setTags && (
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </Label>
                <SearchableInput<Tag>
                  dbCall={searchTags}
                  onSelect={(tag) => {
                    if (tags.find((t) => t.id === tag.id)) return;
                    setTags((prev) => [...prev, tag]);
                  }}
                  isCreationAllowed
                  clearOnSelect
                  createSearchType={createTag}
                  placeholder="Enter tag..."
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag.id} className="cursor-pointer">
                      {tag.name}{" "}
                      <span
                        className="text-gray-400"
                        onClick={() => removeTag(tag.id)}
                      >
                        <XIcon className="w-4 h-4" />
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Course Preview */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Course Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                {localImageUrl || courseData.profile_url ? (
                  <img
                    src={localImageUrl || courseData.profile_url}
                    alt="Course Preview"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl">
                    🌍
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {courseData.title || "Course Title"}
                  </h3>
                  {courseData.difficulty && (
                    <Badge
                      className={
                        courseData.difficulty === "beginner"
                          ? "bg-green-100 text-green-800"
                          : courseData.difficulty === "intermediate"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {courseData.difficulty}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {courseData.description ||
                  "Course description will appear here..."}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>⏱ {courseData.estimated_duration || "Duration"}</span>
                <span>⭐ New course</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SetupTab;
