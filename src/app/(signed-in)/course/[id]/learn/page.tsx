"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  BookOpen,
  CheckCircle,
  Circle,
  Bot,
  Send,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CourseLearning() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [forumOpen, setForumOpen] = useState(false);
  const params = useParams();

  const course = {
    id: params.id,
    title: "Spanish for Beginners",
    totalLessons: 20,
    completedLessons: 8,
    currentChapter: "Basic Grammar",
  };

  const lessons = [
    {
      id: 1,
      title: "Spanish Alphabet and Sounds",
      type: "video",
      duration: "15 min",
      completed: true,
      content: {
        videoUrl: "/placeholder-video.mp4",
        transcript:
          "Welcome to your first Spanish lesson. Today we'll learn the Spanish alphabet...",
        notes: "The Spanish alphabet has 27 letters, including the unique 'ñ'.",
      },
    },
    {
      id: 2,
      title: "Basic Greetings",
      type: "interactive",
      duration: "20 min",
      completed: true,
      content: {
        text: "Learn essential Spanish greetings for daily conversations.",
        exercises: [
          { question: "How do you say 'Hello' in Spanish?", answer: "Hola" },
          { question: "How do you say 'Good morning'?", answer: "Buenos días" },
        ],
      },
    },
    {
      id: 3,
      title: "Practice: First Conversations",
      type: "exercise",
      duration: "10 min",
      completed: false,
      content: {
        text: "Practice what you've learned with interactive exercises.",
        quiz: [
          {
            question: "Choose the correct greeting for 'Good afternoon':",
            options: ["Buenos días", "Buenas tardes", "Buenas noches", "Hola"],
            correct: 1,
          },
        ],
      },
    },
  ];

  const chatMessages = [
    {
      type: "bot",
      message:
        "Hello! I'm your Spanish learning assistant. How can I help you today?",
    },
    { type: "user", message: "I'm having trouble with pronunciation of 'rr'" },
    {
      type: "bot",
      message:
        "The rolled 'rr' is tricky! Try placing your tongue tip against the roof of your mouth and blow air to make it vibrate. Practice with words like 'perro' (dog) and 'carro' (car).",
    },
  ];

  const forumPosts = [
    {
      user: "Alex Chen",
      time: "2 hours ago",
      question: "Tips for remembering gender of nouns?",
      replies: 3,
    },
    {
      user: "Sarah Johnson",
      time: "5 hours ago",
      question: "Difference between 'ser' and 'estar'?",
      replies: 7,
    },
  ];

  const currentLessonData = lessons[currentLesson];

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar - Lesson List */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <Link
              href={`/course/${course.id}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Course
            </Link>
            <h2 className="font-bold text-lg text-gray-900">{course.title}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {course.currentChapter}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">
                  {course.completedLessons}/{course.totalLessons}
                </span>
              </div>
              <Progress
                value={(course.completedLessons / course.totalLessons) * 100}
              />
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Lessons</h3>
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentLesson
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setCurrentLesson(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {lesson.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-sm font-medium truncate ${
                          index === currentLesson
                            ? "text-blue-900"
                            : "text-gray-900"
                        }`}
                      >
                        {lesson.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {lesson.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {lesson.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentLessonData.title}
                </h1>
                <p className="text-gray-600">
                  Lesson {currentLesson + 1} of {lessons.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Dialog open={forumOpen} onOpenChange={setForumOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Discussion Forum
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Course Discussion Forum</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {forumPosts.map((post, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {post.user}
                            </span>
                            <span className="text-sm text-gray-500">
                              {post.time}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{post.question}</p>
                          <div className="text-sm text-blue-600">
                            {post.replies} replies
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Ask a question..."
                        className="flex-1"
                      />
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Post
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Bot className="h-4 w-4 mr-2" />
                      AI Assistant
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Learning Assistant</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            msg.type === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded-lg ${
                              msg.type === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Ask me anything..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="flex-1 p-6">
            <Card className="h-full border border-gray-200">
              <CardContent className="p-8 h-full">
                {currentLessonData.type === "video" && (
                  <div className="space-y-6">
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          {isPlaying ? (
                            <Pause className="h-8 w-8" />
                          ) : (
                            <Play className="h-8 w-8" />
                          )}
                        </div>
                        <p className="text-lg">
                          Video: {currentLessonData.title}
                        </p>
                        <p className="text-sm opacity-75">
                          {currentLessonData.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isPlaying ? "Pause" : "Play"}
                      </Button>
                      <Button variant="outline">
                        <Volume2 className="h-4 w-4 mr-2" />
                        Audio
                      </Button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Lesson Notes</h3>
                      <p className="text-gray-700">
                        {currentLessonData.content.notes}
                      </p>
                    </div>
                  </div>
                )}

                {currentLessonData.type === "interactive" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {currentLessonData.title}
                      </h2>
                      <p className="text-gray-600 mb-8">
                        {currentLessonData.content.text}
                      </p>
                    </div>
                    <div className="space-y-4">
                      {currentLessonData.content.exercises?.map(
                        (exercise, index) => (
                          <Card key={index} className="border border-gray-200">
                            <CardContent className="p-6">
                              <h3 className="font-semibold mb-4">
                                {exercise.question}
                              </h3>
                              <div className="flex gap-4">
                                <input
                                  type="text"
                                  className="flex-1 p-3 border border-gray-300 rounded-lg"
                                  placeholder="Type your answer..."
                                />
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                  Check
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  </div>
                )}

                {currentLessonData.type === "exercise" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Practice Exercise
                      </h2>
                      <p className="text-gray-600 mb-8">
                        {currentLessonData.content.text}
                      </p>
                    </div>
                    {currentLessonData.content.quiz?.map((question, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-6">
                          <h3 className="font-semibold mb-4">
                            {question.question}
                          </h3>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <button
                                key={optionIndex}
                                className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Navigation Footer */}
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                disabled={currentLesson === 0}
                onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </Button>

              <div className="flex items-center gap-4">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Take Notes
                </Button>
                {!currentLessonData.completed && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
              </div>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={currentLesson === lessons.length - 1}
                onClick={() =>
                  setCurrentLesson(
                    Math.min(lessons.length - 1, currentLesson + 1)
                  )
                }
              >
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
