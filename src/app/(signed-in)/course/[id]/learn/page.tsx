
// app/course/[id]/learn/page.tsx
"use client";

import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
    checkIfEnrolled,
    enrollInCourse,
    getCourseWithContent,
    getUserProgress,
    updateLessonProgress,
} from "@/utils/db/learn";
import { Lesson, UserProgress as UserProgressType } from "@/utils/types";
import { useUser } from "@clerk/nextjs";
import {
    BookOpen,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Circle,
    FileText,
    HelpCircle,
    Loader2,
    Mic,
    Pause,
    Play,
    Users,
    Video,
    XCircle
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface CourseWithContent {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  profile_url: string;
  units: {
    id: string;
    title: string;
    order_index: number;
    lessons: {
      id: string;
      title: string;
      content_type: "video" | "text" | "audio" | "exercise";
      content: Lesson["content"];
      order_index: number;
      unit_id: string;
    }[];
  }[];
}

// Exercise Components
interface MCQOption {
  id: string;
  text: string;
}

interface MCQQuestion {
  question: string;
  options: MCQOption[];
  correctAnswer: string[];
}

interface FillBlankQuestion {
  question: string;
  correctAnswer: string[];
}

function MCQExercise({ question }: { question: MCQQuestion }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const isCorrect = selectedOption && question.correctAnswer.includes(selectedOption);

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4 sm:p-6">
        <h3 className="font-semibold mb-4 text-sm sm:text-base">{question.question}</h3>
        <div className="space-y-2 mb-4">
          {question.options.map((option: MCQOption) => (
            <button
              key={option.id}
              className={`w-full p-3 text-left border rounded-lg transition-colors text-sm sm:text-base ${
                selectedOption === option.id
                  ? isSubmitted
                    ? isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                    : "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => !isSubmitted && setSelectedOption(option.id)}
              disabled={isSubmitted}
            >
              {option.text}
            </button>
          ))}
        </div>
        {isSubmitted && (
          <div className={`flex items-center gap-2 mb-4 ${isCorrect ? "text-green-600" : "text-red-600"} text-sm sm:text-base`}>
            {isCorrect ? (
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span>{isCorrect ? "Correct!" : `Incorrect. The correct answer is: ${question.options.find((opt: MCQOption) => opt.id === question.correctAnswer[0])?.text}`}</span>
          </div>
        )}
        {!isSubmitted && (
          <Button 
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
          >
            Check Answer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function FillBlankExercise({ question }: { question: FillBlankQuestion }) {
  const [answer, setAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  // Fix: Add null/undefined check and trim before comparison
  const isCorrect = question.correctAnswer.some((ans: string) => 
    ans && answer.trim().toLowerCase() === ans.trim().toLowerCase()
  );

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4 sm:p-6">
        <h3 className="font-semibold mb-4 text-sm sm:text-base">{question.question}</h3>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg text-sm sm:text-base"
            placeholder="Type your answer..."
            disabled={isSubmitted}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
          >
            Check
          </Button>
        </div>
        {isSubmitted && (
          <div className={`flex items-center gap-2 text-sm sm:text-base ${isCorrect ? "text-green-600" : "text-red-600"}`}>
            {isCorrect ? (
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span>{isCorrect ? "Correct!" : `Incorrect. The correct answer is: ${question.correctAnswer[0] || ''}`}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Media Player Components
const VideoPlayer = ({ src, title, onEnded }: { src: string; title: string; onEnded?: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
        {src ? (
          <video
            src={src}
            controls
            className="w-full h-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={onEnded}
          />
        ) : (
          <div className="text-center text-white">
            <Video className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-base">Video content not available</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AudioPlayer = ({ src, title, onEnded }: { src: string; title: string; onEnded?: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div 
        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 sm:p-8 flex items-center justify-center min-h-[300px] sm:min-h-[400px] cursor-pointer"
        onClick={togglePlay}
      >
        {src ? (
          <div className="text-center w-full">
            <div className={`w-24 h-24 sm:w-32 sm:h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-all duration-200 ${
              isPlaying ? 'scale-110' : 'scale-100'
            }`}>
              {isPlaying ? (
                <Pause className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              ) : (
                <Play className="h-8 w-8 sm:h-12 sm:w-12 text-white ml-2" />
              )}
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">{title}</p>
            <p className="text-gray-600 text-sm sm:text-base">
              {isPlaying ? 'Now Playing...' : 'Click to play'}
            </p>
            <audio
              ref={audioRef}
              src={src}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={onEnded}
              className="hidden"
            />
          </div>
        ) : (
          <div className="text-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Mic className="h-8 w-8 sm:h-12 sm:w-12 text-gray-500" />
            </div>
            <p className="text-base sm:text-xl text-gray-500">Audio content not available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CourseLearning() {
  const [course, setCourse] = useState<CourseWithContent | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgressType[]>([]);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [forumOpen, setForumOpen] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useUser();
  const params = useParams();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCourseData();
  }, [params.id, user]);

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (!isResizing || window.innerWidth < 768) return;
      const newWidth = Math.max(240, Math.min(480, e.clientX));
      setSidebarWidth(newWidth);
    };

    const stopResizing = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResizing);

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  const loadCourseData = async () => {
    if (!user || !params.id) return;

    try {
      setIsLoading(true);
      const courseData = await getCourseWithContent(params.id as string);
      setCourse(courseData);

      const enrolled = await checkIfEnrolled(user.id, params.id as string);
      setIsEnrolled(enrolled);

      if (enrolled) {
        const progressData = await getUserProgress(user.id, params.id as string);
        setUserProgress(progressData);
      }

      if (courseData?.units && courseData.units.length > 0) {
        const initialExpanded: Record<string, boolean> = {};
        courseData.units.forEach(unit => {
          initialExpanded[unit.id] = true;
        });
        setExpandedUnits(initialExpanded);
      }
    } catch (error) {
      console.error("Error loading course data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user || !params.id) return;

    try {
      setIsEnrolling(true);
      await enrollInCourse(user.id, params.id as string);
      setIsEnrolled(true);
      await loadCourseData();
    } catch (error) {
      console.error("Error enrolling in course:", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleMarkComplete = async (lessonId: string, currentlyCompleted: boolean) => {
    if (!user) return;

    try {
      const newStatus = currentlyCompleted ? "not_started" : "completed";
      await updateLessonProgress(user.id, lessonId, newStatus);

      setUserProgress(prev => {
        const existing = prev.find(p => p.lesson_id === lessonId);
        if (existing) {
          return prev.map(p => 
            p.lesson_id === lessonId ? { ...p, status: newStatus } : p
          );
        } else {
          return [...prev, { lesson_id: lessonId, status: newStatus } as UserProgressType];
        }
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const getLessonStatus = (lessonId: string) => {
    const progress = userProgress.find(p => p.lesson_id === lessonId);
    return progress?.status || "not_started";
  };

  const isLessonCompleted = (lessonId: string) => {
    return getLessonStatus(lessonId) === "completed";
  };

  const getCompletedLessonsCount = () => {
    if (!course) return 0;
    return course.units.flatMap(unit => unit.lessons)
      .filter(lesson => isLessonCompleted(lesson.id)).length;
  };

  const getTotalLessonsCount = () => {
    if (!course) return 0;
    return course.units.flatMap(unit => unit.lessons).length;
  };

  const getCurrentLesson = () => {
    if (!course) return null;
    return course.units[currentUnitIndex]?.lessons[currentLessonIndex];
  };

  const goToNextLesson = () => {
    if (!course) return;

    const currentUnit = course.units[currentUnitIndex];
    if (currentLessonIndex < currentUnit.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentUnitIndex < course.units.length - 1) {
      setCurrentUnitIndex(currentUnitIndex + 1);
      setCurrentLessonIndex(0);
    }
  };

  const goToPreviousLesson = () => {
    if (!course) return;

    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentUnitIndex > 0) {
      setCurrentUnitIndex(currentUnitIndex - 1);
      const previousUnit = course.units[currentUnitIndex - 1];
      setCurrentLessonIndex(previousUnit.lessons.length - 1);
    }
  };

  const canGoNext = () => {
    if (!course) return false;
    const currentUnit = course.units[currentUnitIndex];
    return currentLessonIndex < currentUnit.lessons.length - 1 || 
           currentUnitIndex < course.units.length - 1;
  };

  const canGoPrevious = () => {
    return currentLessonIndex > 0 || currentUnitIndex > 0;
  };

  const toggleUnitExpansion = (unitId: string) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const handleLessonClick = async (unitIndex: number, lessonIndex: number) => {
    setCurrentUnitIndex(unitIndex);
    setCurrentLessonIndex(lessonIndex);
    
    const lessonId = course?.units[unitIndex]?.lessons[lessonIndex]?.id;
    if (lessonId && !isLessonCompleted(lessonId)) {
      await handleMarkComplete(lessonId, false);
    }
  };

  const handleMediaEnded = async () => {
    const currentLesson = getCurrentLesson();
    if (!currentLesson || isLessonCompleted(currentLesson.id)) return;
    
    await handleMarkComplete(currentLesson.id, false);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Course not found</h1>
          <Link href="/explore" className="text-blue-600 hover:text-blue-700 text-sm sm:text-base">
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-4 sm:p-6 text-center">
            <h1 className="text-lg sm:text-xl font-bold mb-4">Enroll in Course</h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
               Enroll in &quot;{course.title}&quot; to start learning
            </p>
            <Button 
              onClick={handleEnroll} 
              disabled={isEnrolling}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
            >
              {isEnrolling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Enroll Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentLesson = getCurrentLesson();
  const completedLessons = getCompletedLessonsCount();
  const totalLessons = getTotalLessonsCount();
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case "video":
        return <Video className="h-3 w-3 mr-1" />;
      case "audio":
        return <Mic className="h-3 w-3 mr-1" />;
      case "text":
        return <FileText className="h-3 w-3 mr-1" />;
      case "exercise":
        return <HelpCircle className="h-3 w-3 mr-1" />;
      default:
        return <FileText className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col md:flex-row">
      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
      ref={sidebarRef}
      className={`bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0 fixed md:static top-0 left-0 z-20 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} w-full md:w-[${sidebarWidth}px] flex flex-col`}
      style={{ width: isSidebarOpen ? '100%' : `${sidebarWidth}px` }}
    >
      <div className="md:hidden sticky top-0 z-30 bg-gray-50 border-b border-gray-200 p-3 sm:p-4">
        <Button 
          variant="ghost"
          size="lg"
          onClick={() => setIsSidebarOpen(false)}
          className="w-full flex justify-between items-center text-base sm:text-lg font-semibold text-gray-900 hover:bg-gray-100"
        >
          <span>Close Curriculum</span>
          <XCircle className="h-6 w-6 sm:h-7 sm:w-7 text-gray-600" />
        </Button>
      </div>

      <div className="p-2 sm:p-4 md:p-6 border-b border-gray-200">
        <Link
          href={`/course/${course.id}`}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 text-sm sm:text-base"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Course
        </Link>
        <h2 className="font-bold text-base sm:text-lg text-gray-900 break-words">{course.title}</h2>
        <p className="text-sm text-gray-600 mb-4 break-words">{course.difficulty}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">
              {completedLessons}/{totalLessons}
            </span>
          </div>
          <Progress value={progressPercentage} />
        </div>
      </div>

        <div className="p-2 sm:p-3 md:p-4 flex-1 overflow-y-auto">
          <div className="space-y-2 sm:space-y-3">
            {course.units.map((unit, unitIndex) => (
              <div key={unit.id} className="border border-gray-200 rounded-lg">
                <div 
                  className="p-2 sm:p-3 bg-gray-100 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleUnitExpansion(unit.id)}
                >
                  <h4 className="font-medium text-gray-900 text-xs sm:text-sm md:text-base break-words">
                    {unit.title}
                  </h4>
                  {expandedUnits[unit.id] ? (
                    <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  )}
                </div>
                
                {expandedUnits[unit.id] && (
                  <div className="p-1 sm:p-2 space-y-1">
                    {unit.lessons.map((lesson, lessonIndex) => {
                      const isCompleted = isLessonCompleted(lesson.id);
                      const isCurrent = unitIndex === currentUnitIndex && lessonIndex === currentLessonIndex;
                      
                      return (
                        <div
                          key={lesson.id}
                          className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-colors ${
                            isCurrent
                              ? "bg-blue-50 border border-blue-200"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => handleLessonClick(unitIndex, lessonIndex)}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div 
                              className="flex-shrink-0 cursor-pointer transition-all duration-200 ease-in-out"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkComplete(lesson.id, isLessonCompleted(lesson.id));
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 hover:text-green-700" />
                              ) : (
                                <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`text-xs sm:text-sm font-medium break-words ${
                                  isCurrent
                                    ? "text-blue-900"
                                    : "text-gray-900"
                                }`}
                              >
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {getContentTypeIcon(lesson.content_type)}
                                  {lesson.content_type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between md:hidden mb-3 sm:mb-4">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="text-sm sm:text-base"
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Open Curriculum
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">
                {currentLesson?.title || "Loading..."}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Unit {currentUnitIndex + 1}, Lesson {currentLessonIndex + 1} of{" "}
                {course.units[currentUnitIndex]?.lessons.length}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <Dialog open={forumOpen} onOpenChange={setForumOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Discussion Forum
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Course Discussion Forum</DialogTitle>
                  </DialogHeader>
                  <div className="p-4 text-center text-gray-500 text-sm sm:text-base">
                    Forum functionality coming soon
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          {currentLesson ? (
            <Card className="border border-gray-200">
              <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                <LessonContent
                  lesson={currentLesson}
                  isCompleted={isLessonCompleted(currentLesson.id)}
                  onMarkComplete={(completed) => 
                    handleMarkComplete(currentLesson.id, completed)
                  }
                  onMediaEnded={handleMediaEnded}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 text-sm sm:text-base">Select a lesson to begin</p>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="p-3 sm:p-4 md:p-6 border-t border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <Button
              variant="outline"
              disabled={!canGoPrevious()}
              onClick={goToPreviousLesson}
              size="sm"
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Lesson
            </Button>

            <div className="flex items-center gap-2 sm:gap-4 order-3 sm:order-2 w-full sm:w-auto justify-center">
              {currentLesson && (
                <Button
                  variant={isLessonCompleted(currentLesson.id) ? "outline" : "default"}
                  onClick={() => handleMarkComplete(
                    currentLesson.id, 
                    isLessonCompleted(currentLesson.id)
                  )}
                  size="sm"
                  className={`w-full sm:w-auto text-sm sm:text-base ${!isLessonCompleted(currentLesson.id) ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                >
                  {isLessonCompleted(currentLesson.id) ? (
                    <>
                      <Circle className="h-4 w-4 mr-2" />
                      Mark Incomplete
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </Button>
              )}
            </div>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white order-2 sm:order-3 w-full sm:w-auto text-sm sm:text-base"
              disabled={!canGoNext()}
              onClick={goToNextLesson}
              size="sm"
            >
              Next Lesson
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonContent({ 
  lesson, 
  isCompleted, 
  onMarkComplete, 
  onMediaEnded 
}: { 
  lesson: CourseWithContent['units'][0]['lessons'][0];
  isCompleted: boolean;
  onMarkComplete: (completed: boolean) => void;
  onMediaEnded?: () => void;
}) {
  const renderContent = () => {
    switch (lesson.content_type) {
      case "video":
        return <VideoContent content={lesson.content} onEnded={onMediaEnded} />;
      case "audio":
        return <AudioContent content={lesson.content} onEnded={onMediaEnded} />;
      case "text":
        return <TextContent content={lesson.content} />;
      case "exercise":
        return <ExerciseContent content={lesson.content} />;
      default:
        return <div className="text-gray-500 text-sm sm:text-base">Unsupported content type</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
      {renderContent()}
    </div>
  );
}

function VideoContent({ content, onEnded }: { 
  content: Lesson["content"]; 
  onEnded?: () => void; 
}) {
  const videoContent = content as { url?: string; notes?: string };

  return (
    <div className="space-y-4 sm:space-y-6">
      {videoContent.url ? (
        <VideoPlayer 
          src={videoContent.url} 
          title="Video Lesson"
          onEnded={onEnded}
        />
      ) : (
        <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <Video className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-base">Video content not available</p>
          </div>
        </div>
      )}
      {videoContent.notes && (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">Lesson Notes</h3>
          <p className="text-gray-700 text-sm sm:text-base">
            {videoContent.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function AudioContent({ content, onEnded }: { 
  content: Lesson["content"]; 
  onEnded?: () => void; 
}) {
  const audioContent = content as { url?: string; transcript?: string };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AudioPlayer 
        src={audioContent.url || ''} 
        title="Audio Lesson"
        onEnded={onEnded}
      />
      
      {audioContent.transcript && (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
          <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Transcript</h3>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            {audioContent.transcript}
          </p>
        </div>
      )}
    </div>
  );
}

function TextContent({ content }: { 
  content: Lesson["content"]; 
}) {
  const textContent = content as { body?: string };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="prose max-w-none text-sm sm:text-base">
        {textContent.body ? (
          <div className="text-gray-700 whitespace-pre-line">
            {textContent.body}
          </div>
        ) : (
          <p className="text-gray-500">No content available</p>
        )}
      </div>
    </div>
  );
}

function ExerciseContent({ content }: { 
  content: Lesson["content"]; 
}) {
  interface ExerciseContentType {
    exerciseType?: "quiz" | "fill-blank";
    question?: string;
    options?: string[];
    correct?: number;
    sentence?: string;
    blankIndex?: number;
  }

  const exerciseContent = content as ExerciseContentType;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4">
          Practice Exercise
        </h2>
        <p className="text-gray-600 mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base">
          {exerciseContent.exerciseType === "quiz" && "Choose the correct option"}
          {exerciseContent.exerciseType === "fill-blank" && "Fill in the blank"}
          {!exerciseContent.exerciseType && "Complete the following exercises"}
        </p>
      </div>
      
      {exerciseContent.exerciseType === "quiz" && exerciseContent.options && (
        <MCQExercise 
          question={{
            question: exerciseContent.question || "Select the correct answer:",
            options: exerciseContent.options.map((option: string, index: number) => ({
              id: index.toString(),
              text: option
            })),
            correctAnswer: [exerciseContent.correct?.toString() || "0"]
          }}
        />
      )}
      
      {exerciseContent.exerciseType === "fill-blank" && exerciseContent.sentence && exerciseContent.blankIndex !== undefined && (
        <FillBlankExercise 
          question={{
            question: `Fill in the blank: ${exerciseContent.sentence.replace(exerciseContent.sentence.split(" ")[exerciseContent.blankIndex], "______")}`,
            correctAnswer: [exerciseContent.sentence.split(" ")[exerciseContent.blankIndex]]
          }}
        />
      )}
      
      {!exerciseContent.exerciseType && (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg text-center">
          <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-sm sm:text-base">Exercise content format not supported</p>
        </div>
      )}
    </div>
  );
}
