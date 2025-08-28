import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { Course } from "@/utils/types";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

function SetupTab({
  courseData,
  setCourseData,
  setCourseImageFile,
}: {
  courseData: Course;
  setCourseData: Dispatch<SetStateAction<Course>>;
  setCourseImageFile: Dispatch<SetStateAction<File | null>>;
}) {
  const searchTag = (tag: string) => {};
  const [localImageUrl, setLocalImageUrl] = useState<string>("");
  const [languageQuery, setLanguageQuery] = useState("");
  const [debouncedQuery] = useDebounce(languageQuery, 300);
  const [languageResults, setLanguageResults] = useState<
    { id: string; name: string }[]
  >([]);
  const languageInputRef = useRef<HTMLInputElement>(null);
  const [showLanguagePopover, setShowLanguagePopover] = useState(false);

  useEffect(() => {
    if (debouncedQuery.trim().length === 0) {
      setLanguageResults([]);
      setShowLanguagePopover(false);
      return;
    }
    const searchLanguages = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("languages")
        .select("id, name")
        .ilike("name", `%${debouncedQuery}%`);
      if (!error && data && data.length > 0) {
        setLanguageResults(data);
      } else {
        setLanguageResults([]);
      }
    };

    console.log("Searching languages for query:", debouncedQuery);

    searchLanguages();
  }, [debouncedQuery]);

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

                <Popover
                  open={showLanguagePopover && languageResults.length > 0}
                >
                  <PopoverTrigger asChild>
                    <Input
                      ref={languageInputRef}
                      type="text"
                      placeholder="Enter language"
                      value={languageQuery}
                      onKeyDown={() => setShowLanguagePopover(true)}
                      onChange={(e) => {
                        setLanguageQuery(e.target.value);
                      }}
                    />
                  </PopoverTrigger>

                  <PopoverContent
                    className="p-0 max-w-[200px]"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <span className="text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0">
                      Results
                    </span>
                    {languageResults.map((lang) => (
                      <div
                        key={lang.id}
                        className="p-2 cursor-pointer hover:bg-muted text-sm font-medium"
                        onClick={() => {
                          setCourseData({
                            ...courseData,
                            language_id: lang.id,
                          });
                          setLanguageQuery(lang.name);
                          setShowLanguagePopover(false);
                        }}
                      >
                        {lang.name}
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
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

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </Label>
              <Input
                placeholder="conversation, travel, beginner-friendly"
                onChange={(e) => searchTag(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Public Course
                  </Label>
                  <p className="text-xs text-gray-500">
                    Allow anyone to discover and enroll
                  </p>
                </div>
                <Switch
                  checked={courseData.is_public}
                  onCheckedChange={(checked: boolean) =>
                    setCourseData({ ...courseData, is_public: checked })
                  }
                />
              </div>
            </div>
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
