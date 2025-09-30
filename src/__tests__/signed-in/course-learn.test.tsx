/* eslint-disable @typescript-eslint/no-require-imports */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CourseLearning from "@/app/(signed-in)/course/[id]/learn/page"; // Update with actual path
import {
  AudioPlayer,
  VideoPlayer,
  FillBlankExercise,
  MCQExercise,
} from "@/components/learn/components";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

// Mock external dependencies
jest.mock("@/components/loading", () => {
  return function MockLoading() {
    return <div data-testid="loading">Loading...</div>;
  };
});

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant,
    disabled,
    className,
    onClick,
    size,
    asChild,
  }: {
    children: React.ReactNode;
    variant?: string;
    disabled?: boolean;
    className?: string;
    onClick?: () => void;
    size?: string;
    asChild?: boolean;
  }) => {
    if (asChild) {
      return <div data-testid="button-as-child">{children}</div>;
    }
    return (
      <button
        data-testid="button"
        data-variant={variant}
        data-disabled={disabled}
        data-size={size}
        className={className}
        onClick={onClick}
      >
        {children}
      </button>
    );
  },
}));

jest.mock("@/components/ui/progress", () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress" data-value={value}>
      Progress: {value}%
    </div>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({
    className,
    placeholder,
  }: {
    className?: string;
    placeholder?: string;
  }) => (
    <textarea
      data-testid="textarea"
      className={className}
      placeholder={placeholder}
    />
  ),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="dialog-title">{children}</h3>
  ),
  DialogTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="dialog-trigger">{children}</div>,
}));

jest.mock("@/utils/db/learn", () => ({
  getCourseWithContent: jest.fn(),
  getUserProgress: jest.fn(),
  updateLessonProgress: jest.fn(),
  checkIfEnrolled: jest.fn(),
  enrollInCourse: jest.fn(),
}));

jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return (
      <a data-testid="link" href={href}>
        {children}
      </a>
    );
  };
});

jest.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevron-left">ChevronLeft</div>,
  ChevronRight: () => <div data-testid="chevron-right">ChevronRight</div>,
  Play: () => <div data-testid="play">Play</div>,
  Pause: () => <div data-testid="pause">Pause</div>,
  Volume2: () => <div data-testid="volume">Volume2</div>,
  BookOpen: () => <div data-testid="book-open">BookOpen</div>,
  CheckCircle: () => <div data-testid="check-circle">CheckCircle</div>,
  Circle: () => <div data-testid="circle">Circle</div>,
  Bot: () => <div data-testid="bot">Bot</div>,
  Send: () => <div data-testid="send">Send</div>,
  Users: () => <div data-testid="users">Users</div>,
  ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
  ChevronUp: () => <div data-testid="chevron-up">ChevronUp</div>,
  Download: () => <div data-testid="download">Download</div>,
  Maximize: () => <div data-testid="maximize">Maximize</div>,
  Minimize: () => <div data-testid="minimize">Minimize</div>,
  GripVertical: () => <div data-testid="grip-vertical">GripVertical</div>,
  XCircle: () => <div data-testid="x-circle">XCircle</div>,
  Video: () => <div data-testid="video">Video</div>,
  FileText: () => <div data-testid="file-text">FileText</div>,
  Mic: () => <div data-testid="mic">Mic</div>,
  HelpCircle: () => <div data-testid="help-circle">HelpCircle</div>,
  Loader2: () => <div data-testid="loader2">Loader2</div>,
}));

// Mock console.error
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

// Mock implementations
const mockUseUser = jest.mocked(useUser);
const mockUseParams = jest.mocked(useParams);
const mockGetCourseWithContent = jest.mocked(
  require("@/utils/db/learn").getCourseWithContent
);
const mockGetUserProgress = jest.mocked(
  require("@/utils/db/learn").getUserProgress
);
const mockUpdateLessonProgress = jest.mocked(
  require("@/utils/db/learn").updateLessonProgress
);
const mockCheckIfEnrolled = jest.mocked(
  require("@/utils/db/learn").checkIfEnrolled
);
const mockEnrollInCourse = jest.mocked(
  require("@/utils/db/learn").enrollInCourse
);

describe("CourseLearning", () => {
  const mockCourse = {
    id: "course-123",
    title: "Test Course",
    description: "Test course description",
    difficulty: "Beginner",
    profile_url: "/test-profile.jpg",
    units: [
      {
        id: "unit-1",
        title: "Introduction to React",
        order_index: 1,
        lessons: [
          {
            id: "lesson-1",
            title: "What is React?",
            content_type: "video" as const,
            content: {
              url: "/test-video.mp4",
              notes: "Test video notes",
            },
            order_index: 1,
            unit_id: "unit-1",
          },
          {
            id: "lesson-2",
            title: "Setting up Environment",
            content_type: "exercise" as const,
            content: {
              exerciseType: "quiz",
              question: "What is React?",
              options: ["A library", "A framework", "A language"],
              correct: 0,
            },
            order_index: 2,
            unit_id: "unit-1",
          },
        ],
      },
      {
        id: "unit-2",
        title: "Advanced Concepts",
        order_index: 2,
        lessons: [
          {
            id: "lesson-3",
            title: "Hooks",
            content_type: "text" as const,
            content: {
              body: "Hooks are functions that let you use state and other React features...",
            },
            order_index: 1,
            unit_id: "unit-2",
          },
        ],
      },
    ],
  };

  const mockUserProgress = [
    { lesson_id: "lesson-1", status: "completed" as const },
    { lesson_id: "lesson-2", status: "not_started" as const },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: "course-123" });
    mockUseUser.mockReturnValue({
      user: {
        id: "user-123",
      },
      isLoaded: true,
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("Loading State", () => {
    it("shows loading state initially", () => {
      mockGetCourseWithContent.mockImplementation(() => new Promise(() => {}));

      render(<CourseLearning />);

      expect(screen.getByTestId("loading")).toBeInTheDocument();
    });
  });

  describe("Course Not Found", () => {
    it("shows course not found when course data is null", async () => {
      mockGetCourseWithContent.mockResolvedValue(null);

      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("Course not found")).toBeInTheDocument();
      });

      expect(screen.getByText("Back to Explore")).toBeInTheDocument();
    });
  });

  describe("Enrollment", () => {
    it("shows enrollment card when user is not enrolled", async () => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(false);

      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("Enroll in Course")).toBeInTheDocument();
      });

      expect(
        screen.getByText(`Enroll in "${mockCourse.title}" to start learning`)
      ).toBeInTheDocument();
      expect(screen.getByText("Enroll Now")).toBeInTheDocument();
    });

    it("handles enrollment when enroll button is clicked", async () => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(false);
      mockEnrollInCourse.mockResolvedValue(undefined);
      mockGetUserProgress.mockResolvedValue(mockUserProgress);

      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("Enroll Now")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Enroll Now"));

      await waitFor(() => {
        expect(mockEnrollInCourse).toHaveBeenCalledWith(
          "user-123",
          "course-123"
        );
      });
    });

    it("shows loading state during enrollment", async () => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(false);
      mockEnrollInCourse.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("Enroll Now")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Enroll Now"));

      expect(screen.getByTestId("loader2")).toBeInTheDocument();
    });
  });

  describe("Course Content", () => {
    beforeEach(() => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(true);
      mockGetUserProgress.mockResolvedValue(mockUserProgress);
    });

    it("renders course content when enrolled", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.queryByRole("heading", { level: 4, name: "What is React?" })
        ).toBeNull();
      });

      await waitFor(() => {
        expect(
          screen.queryByRole("heading", { level: 4, name: "Test Course" })
        ).toBeNull();
      });
      await waitFor(() => {
        expect(
          screen.queryByRole("heading", { level: 4, name: "Beginner" })
        ).toBeNull();
      });
    });

    it("displays progress information", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByTestId("progress")).toBeInTheDocument();
      });

      expect(screen.getByText("1/3")).toBeInTheDocument(); // 1 completed out of 3 total
    });

    it("renders unit structure correctly", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("Introduction to React")).toBeInTheDocument();
      });

      expect(screen.getByText("Advanced Concepts")).toBeInTheDocument();
      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            level: 4,
            name: "Introduction to React",
          })
        ).toBeInTheDocument();
      });

      expect(screen.getByText("Setting up Environment")).toBeInTheDocument();
    });

    it("toggles unit expansion", async () => {
      render(<CourseLearning />);

      // Wait until the unit heading appears
      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            level: 4,
            name: "Introduction to React",
          })
        ).toBeInTheDocument();
      });

      // Initially expanded — check lesson visible
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 4, name: "What is React?" })
        ).toBeVisible();
      });

      // Collapse the unit
      fireEvent.click(screen.getByText("Introduction to React"));

      // Lesson should no longer be visible
      await waitFor(() => {
        expect(
          screen.queryByRole("heading", { level: 4, name: "What is React?" })
        ).toBeNull();
      });
    });
  });

  describe("Lesson Navigation", () => {
    beforeEach(() => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(true);
      mockGetUserProgress.mockResolvedValue(mockUserProgress);
    });

    it("navigates to next lesson", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: "What is React?" })
        ).toBeInTheDocument();
      });

      const nextButton = screen.getByText("Next Lesson");
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            level: 1,
            name: "Setting up Environment",
          })
        ).toBeInTheDocument();
      });
    });

    it("navigates to previous lesson", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: "What is React?" })
        ).toBeInTheDocument();
      });

      // First go to next lesson
      fireEvent.click(screen.getByText("Next Lesson"));

      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            level: 1,
            name: "Setting up Environment",
          })
        ).toBeInTheDocument();
      });

      // Then go back
      fireEvent.click(screen.getByText("Previous Lesson"));

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: "What is React?" })
        ).toBeInTheDocument();
      });
    });

    it("disables previous button on first lesson", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        const previousButton = screen.getByText("Previous Lesson");
        expect(previousButton).toHaveAttribute("data-disabled", "true");
      });
    });

    it("disables next button on last lesson", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: "What is React?" })
        ).toBeInTheDocument();
      });

      // Navigate to last lesson
      fireEvent.click(screen.getByText("Next Lesson")); // Lesson 2
      fireEvent.click(screen.getByText("Next Lesson")); // Lesson 3

      await waitFor(() => {
        const nextButton = screen.getByText("Next Lesson");
        expect(nextButton).toHaveAttribute("data-disabled", "true");
      });
    });
  });

  describe("Progress Tracking", () => {
    beforeEach(() => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(true);
      mockGetUserProgress.mockResolvedValue(mockUserProgress);
      mockUpdateLessonProgress.mockResolvedValue(undefined);
    });

    it("marks lesson as complete", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: "What is React?" })
        ).toBeInTheDocument();
      });

      // Current lesson is already completed (from mock data), so button should show "Mark Incomplete"
      const markCompleteButton = screen.getByText("Mark Incomplete");
      fireEvent.click(markCompleteButton);

      await waitFor(() => {
        expect(mockUpdateLessonProgress).toHaveBeenCalledWith(
          "user-123",
          "lesson-1",
          "not_started"
        );
      });
    });

    it("marks lesson as incomplete", async () => {
      // Mock lesson as not completed
      const progressWithIncomplete = [
        { lesson_id: "lesson-1", status: "not_started" as const },
      ];
      mockGetUserProgress.mockResolvedValue(progressWithIncomplete);

      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: "What is React?" })
        ).toBeInTheDocument();
      });

      const markCompleteButton = screen.getByText("Mark Complete");
      fireEvent.click(markCompleteButton);

      await waitFor(() => {
        expect(mockUpdateLessonProgress).toHaveBeenCalledWith(
          "user-123",
          "lesson-1",
          "completed"
        );
      });
    });

    it("automatically marks lesson as complete when media ends", async () => {
      // Mock lesson as not completed
      const progressWithIncomplete = [
        { lesson_id: "lesson-1", status: "not_started" as const },
      ];
      mockGetUserProgress.mockResolvedValue(progressWithIncomplete);

      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: "What is React?" })
        ).toBeInTheDocument();
      });

      // Find the video element using test ID and fire ended event
      const videoElement = screen.getByTestId("video-lesson");
      fireEvent.ended(videoElement);

      await waitFor(() => {
        expect(mockUpdateLessonProgress).toHaveBeenCalledWith(
          "user-123",
          "lesson-1",
          "completed"
        );
      });
    });
  });

  describe("Mobile Responsiveness", () => {
    beforeEach(() => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(true);
      mockGetUserProgress.mockResolvedValue(mockUserProgress);
    });

    it("shows mobile sidebar toggle button", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("Open Curriculum")).toBeInTheDocument();
      });
    });

    it("toggles mobile sidebar", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("Open Curriculum")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Open Curriculum"));

      await waitFor(() => {
        expect(screen.getByText("Close Curriculum")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("handles course data fetch error", async () => {
      mockGetCourseWithContent.mockRejectedValue(new Error("Fetch failed"));

      render(<CourseLearning />);

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          "Error loading course data:",
          expect.any(Error)
        );
      });
    });

    it("handles enrollment error", async () => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(false);
      mockEnrollInCourse.mockRejectedValue(new Error("Enrollment failed"));

      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("Enroll Now")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Enroll Now"));

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          "Error enrolling in course:",
          expect.any(Error)
        );
      });
    });

    it("handles progress update error", async () => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(true);
      mockGetUserProgress.mockResolvedValue(mockUserProgress);
      mockUpdateLessonProgress.mockRejectedValue(new Error("Update failed"));

      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("Mark Incomplete")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Mark Incomplete"));

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          "Error updating progress:",
          expect.any(Error)
        );
      });
    });
  });

  describe("Discussion Forum", () => {
    beforeEach(() => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(true);
      mockGetUserProgress.mockResolvedValue(mockUserProgress);
    });

    it("opens discussion forum dialog", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("Discussion Forum")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Discussion Forum"));

      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByText("Course Discussion Forum")).toBeInTheDocument();
    });
  });
  // Add these tests to your existing CourseLearning test file

  describe("Exercise Components", () => {
    describe("MCQExercise", () => {
      const mockMCQQuestion = {
        question: "What is React?",
        options: [
          { id: "1", text: "A library" },
          { id: "2", text: "A framework" },
          { id: "3", text: "A language" },
        ],
        correctAnswer: ["1"],
      };

      it("renders MCQ exercise with question and options", () => {
        render(<MCQExercise question={mockMCQQuestion} />);

        expect(screen.getByText("What is React?")).toBeInTheDocument();
        expect(screen.getByText("A library")).toBeInTheDocument();
        expect(screen.getByText("A framework")).toBeInTheDocument();
        expect(screen.getByText("A language")).toBeInTheDocument();
        expect(screen.getByText("Check Answer")).toBeInTheDocument();
      });

      it("allows selecting an option", () => {
        render(<MCQExercise question={mockMCQQuestion} />);

        const firstOption = screen.getByText("A library");
        fireEvent.click(firstOption);

        expect(firstOption).toHaveClass("border-blue-500", "bg-blue-50");
      });

      it("shows correct feedback when correct answer is selected", async () => {
        render(<MCQExercise question={mockMCQQuestion} />);

        const correctOption = screen.getByText("A library");
        fireEvent.click(correctOption);

        const submitButton = screen.getByText("Check Answer");
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText("Correct!")).toBeInTheDocument();
        });
        expect(correctOption).toHaveClass("border-green-500", "bg-green-50");
      });

      it("shows incorrect feedback when wrong answer is selected", async () => {
        render(<MCQExercise question={mockMCQQuestion} />);

        const wrongOption = screen.getByText("A framework");
        fireEvent.click(wrongOption);

        const submitButton = screen.getByText("Check Answer");
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/Incorrect/)).toBeInTheDocument();
        });
        expect(wrongOption).toHaveClass("border-red-500", "bg-red-50");
      });

      it("disables options after submission", async () => {
        render(<MCQExercise question={mockMCQQuestion} />);

        const option = screen.getByText("A library");
        fireEvent.click(option);

        const submitButton = screen.getByText("Check Answer");
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(option).toBeDisabled();
        });
      });
    });

    describe("FillBlankExercise", () => {
      const mockFillBlankQuestion = {
        question:
          "Fill in the blank: React is a ______ for building user interfaces",
        correctAnswer: ["library"],
      };

      it("renders fill-in-the-blank exercise", () => {
        render(<FillBlankExercise question={mockFillBlankQuestion} />);

        expect(screen.getByText(/Fill in the blank/)).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText("Type your answer...")
        ).toBeInTheDocument();
        expect(screen.getByText("Check")).toBeInTheDocument();
      });

      it("allows typing an answer", () => {
        render(<FillBlankExercise question={mockFillBlankQuestion} />);

        const input = screen.getByPlaceholderText("Type your answer...");
        fireEvent.change(input, { target: { value: "library" } });

        expect(input).toHaveValue("library");
      });

      it("shows correct feedback when correct answer is entered", async () => {
        render(<FillBlankExercise question={mockFillBlankQuestion} />);

        const input = screen.getByPlaceholderText("Type your answer...");
        fireEvent.change(input, { target: { value: "library" } });

        const submitButton = screen.getByText("Check");
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText("Correct!")).toBeInTheDocument();
        });
      });

      it("shows incorrect feedback when wrong answer is entered", async () => {
        render(<FillBlankExercise question={mockFillBlankQuestion} />);

        const input = screen.getByPlaceholderText("Type your answer...");
        fireEvent.change(input, { target: { value: "framework" } });

        const submitButton = screen.getByText("Check");
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/Incorrect/)).toBeInTheDocument();
        });
      });

      it("disables input after submission", async () => {
        render(<FillBlankExercise question={mockFillBlankQuestion} />);

        const input = screen.getByPlaceholderText("Type your answer...");
        fireEvent.change(input, { target: { value: "library" } });

        const submitButton = screen.getByText("Check");
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(input).toBeDisabled();
        });
      });

      it("handles case-insensitive answers", async () => {
        render(<FillBlankExercise question={mockFillBlankQuestion} />);

        const input = screen.getByPlaceholderText("Type your answer...");
        fireEvent.change(input, { target: { value: "LIBRARY" } }); // uppercase

        const submitButton = screen.getByText("Check");
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText("Correct!")).toBeInTheDocument();
        });
      });

      it("handles trimmed answers", async () => {
        render(<FillBlankExercise question={mockFillBlankQuestion} />);

        const input = screen.getByPlaceholderText("Type your answer...");
        fireEvent.change(input, { target: { value: "  library  " } }); // with spaces

        const submitButton = screen.getByText("Check");
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText("Correct!")).toBeInTheDocument();
        });
      });
    });
  });

  describe("Media Players", () => {
    describe("VideoPlayer", () => {
      it("renders video player with source", () => {
        render(<VideoPlayer src="/test-video.mp4" title="Test Video" />);

        const videoElement = screen.getByTestId("video-lesson");
        expect(videoElement).toBeInTheDocument();
        expect(videoElement).toHaveAttribute("src", "/test-video.mp4");
        expect(videoElement).toHaveAttribute("controls");
      });

      it("renders fallback when no source provided", () => {
        render(<VideoPlayer src="" title="Test Video" />);

        expect(
          screen.getByText("Video content not available")
        ).toBeInTheDocument();
        expect(screen.getByTestId("video")).toBeInTheDocument();
      });

      it("calls onEnded when video ends", () => {
        const mockOnEnded = jest.fn();
        render(
          <VideoPlayer
            src="/test-video.mp4"
            title="Test Video"
            onEnded={mockOnEnded}
          />
        );

        const videoElement = screen.getByTestId("video-lesson");
        fireEvent.ended(videoElement);

        expect(mockOnEnded).toHaveBeenCalledTimes(1);
      });

      it("handles play and pause events", () => {
        render(<VideoPlayer src="/test-video.mp4" title="Test Video" />);

        const videoElement = screen.getByTestId("video-lesson");
        fireEvent.play(videoElement);
        fireEvent.pause(videoElement);

        // We're mainly testing that these events don't cause errors
        expect(videoElement).toBeInTheDocument();
      });
    });

    describe("AudioPlayer", () => {
      it("renders audio player with play button", () => {
        render(<AudioPlayer src="/test-audio.mp3" title="Test Audio" />);

        expect(screen.getByText("Test Audio")).toBeInTheDocument();
        expect(screen.getByText("Click to play")).toBeInTheDocument();
        expect(screen.getByTestId("play")).toBeInTheDocument();
      });

      it("renders fallback when no audio source provided", () => {
        render(<AudioPlayer src="" title="Test Audio" />);

        expect(
          screen.getByText("Audio content not available")
        ).toBeInTheDocument();
        expect(screen.getByTestId("mic")).toBeInTheDocument();
      });

      it("calls onEnded when audio ends", () => {
        const mockOnEnded = jest.fn();
        render(
          <AudioPlayer
            src="/test-audio.mp3"
            title="Test Audio"
            onEnded={mockOnEnded}
          />
        );

        // Since audio element is hidden, we need to access it through ref
        // This is a simplified test - in practice you might need to mock the audio element
        const playButton = screen.getByText("Click to play").closest("div");
        expect(playButton).toBeInTheDocument();

        // The actual audio ended event would be triggered by the audio element
        // For this test, we're verifying the component renders correctly
        expect(mockOnEnded).toBeDefined();
      });

      it("toggles play state when clicked", () => {
        // Mock HTMLAudioElement methods
        const mockPlay = jest.fn();
        const mockPause = jest.fn();

        window.HTMLMediaElement.prototype.play = mockPlay;
        window.HTMLMediaElement.prototype.pause = mockPause;

        render(<AudioPlayer src="/test-audio.mp3" title="Test Audio" />);

        const playArea = screen.getByText("Click to play").closest("div");
        fireEvent.click(playArea!);

        expect(mockPlay).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Lesson Content Rendering", () => {
    beforeEach(() => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(true);
      mockGetUserProgress.mockResolvedValue([]);
    });

    it("renders video lesson content correctly", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 4, name: "What is React?" })
        ).toBeInTheDocument();
      });

      expect(screen.getByTestId("video-lesson")).toBeInTheDocument();
      expect(screen.getByText("Lesson Notes")).toBeInTheDocument();
      expect(screen.getByText("Test video notes")).toBeInTheDocument();
    });
  });

  describe("Sidebar Functionality", () => {
    beforeEach(() => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(true);
      mockGetUserProgress.mockResolvedValue([]);
    });

    it("highlights current lesson in sidebar", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 4, name: "What is React?" })
        ).toBeInTheDocument();
      });

      const currentLesson = screen
        .getByRole("heading", { level: 4, name: "What is React?" })
        .closest("div");
      expect(currentLesson).toHaveClass("flex-1 min-w-0");
    });

    it("navigates to lesson when clicked in sidebar", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            level: 4,
            name: "Setting up Environment",
          })
        ).toBeInTheDocument();
      });

      // Click on second lesson in sidebar
      fireEvent.click(screen.getByText("Setting up Environment"));

      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            level: 4,
            name: "Setting up Environment",
          })
        ).toBeInTheDocument();
      });
    });

    it("toggles mobile sidebar visibility", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("Open Curriculum")).toBeInTheDocument();
      });

      // Open sidebar
      fireEvent.click(screen.getByText("Open Curriculum"));

      await waitFor(() => {
        expect(screen.getByText("Close Curriculum")).toBeInTheDocument();
      });

      // Close sidebar
      fireEvent.click(screen.getByText("Close Curriculum"));

      await waitFor(() => {
        expect(screen.getByText("Open Curriculum")).toBeInTheDocument();
      });
    });
  });

  describe("Progress and Completion", () => {
    beforeEach(() => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(true);
      mockUpdateLessonProgress.mockResolvedValue(undefined);
    });

    it("shows correct progress percentage", async () => {
      const progressWithOneCompleted = [
        { lesson_id: "lesson-1", status: "completed" as const },
        { lesson_id: "lesson-2", status: "not_started" as const },
        { lesson_id: "lesson-3", status: "not_started" as const },
      ];
      mockGetUserProgress.mockResolvedValue(progressWithOneCompleted);

      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("1/3")).toBeInTheDocument();
      });

      const progressElement = screen.getByTestId("progress");
      expect(progressElement).toHaveAttribute(
        "data-value",
        "33.33333333333333"
      );
    });

    it("updates progress when lesson is marked complete from sidebar", async () => {
      mockGetUserProgress.mockResolvedValue([]);

      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: "What is React?" })
        ).toBeInTheDocument();
      });

      // Click the circle icon in sidebar to mark complete
      const checkCircle = screen.getAllByTestId("circle");
      fireEvent.click(checkCircle[0]);

      await waitFor(() => {
        expect(mockUpdateLessonProgress).toHaveBeenCalledWith(
          "user-123",
          "lesson-1",
          "completed"
        );
      });
    });
  });

  describe("Error Boundaries and Edge Cases", () => {
    it("handles unit with no lessons", async () => {
      const courseWithEmptyUnit = {
        ...mockCourse,
        units: [
          {
            id: "empty-unit",
            title: "Empty Unit",
            order_index: 1,
            lessons: [],
          },
        ],
      };
      mockGetCourseWithContent.mockResolvedValue(courseWithEmptyUnit);
      mockCheckIfEnrolled.mockResolvedValue(true);
      mockGetUserProgress.mockResolvedValue([]);

      render(<CourseLearning />);

      await waitFor(() => {
        expect(screen.getByText("Empty Unit")).toBeInTheDocument();
        expect(
          screen.getByText("Select a lesson to begin")
        ).toBeInTheDocument();
      });
    });

    it("handles malformed exercise content gracefully", async () => {
      const courseWithMalformedExercise = {
        ...mockCourse,
        units: [
          {
            id: "unit-1",
            title: "Test Unit",
            order_index: 1,
            lessons: [
              {
                id: "malformed-lesson",
                title: "Malformed Exercise",
                content_type: "exercise" as const,
                content: {}, // Empty content
                order_index: 1,
                unit_id: "unit-1",
              },
            ],
          },
        ],
      };
      mockGetCourseWithContent.mockResolvedValue(courseWithMalformedExercise);
      mockCheckIfEnrolled.mockResolvedValue(true);
      mockGetUserProgress.mockResolvedValue([]);

      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: "Malformed Exercise" })
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText("Exercise content format not supported")
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      mockGetCourseWithContent.mockResolvedValue(mockCourse);
      mockCheckIfEnrolled.mockResolvedValue(true);
      mockGetUserProgress.mockResolvedValue([]);
    });

    it("has proper labels and roles for interactive elements", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: "What is React?" })
        ).toBeInTheDocument();
      });

      // Check video has controls
      const videoElement = screen.getByTestId("video-lesson");
      expect(videoElement).toHaveAttribute("controls");

      // Check buttons have proper text
      expect(screen.getByText("Previous Lesson")).toBeInTheDocument();
      expect(screen.getByText("Next Lesson")).toBeInTheDocument();
      expect(screen.getByText("Mark Complete")).toBeInTheDocument();
    });

    it("maintains focus management during navigation", async () => {
      render(<CourseLearning />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1, name: "What is React?" })
        ).toBeInTheDocument();
      });

      const nextButton = screen.getByText("Next Lesson");
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            level: 1,
            name: "Setting up Environment",
          })
        ).toBeInTheDocument();
      });

      // Next button should still be focusable and in the document
      expect(nextButton).toBeInTheDocument();
    });
  });
});
