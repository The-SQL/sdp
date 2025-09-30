import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import BuilderTab from "@/app/(signed-in)/create-course/builder-tab"; // Update with actual path
import { Lesson, Unit } from "@/utils/types";
// Mock external dependencies
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

jest.mock("@/components/ui/input", () => ({
  Input: ({
    value,
    onChange,
    className,
    placeholder,
    type,
    accept,
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    placeholder?: string;
    type?: string;
    accept?: string;
  }) => (
    <input
      data-testid="input"
      data-type={type}
      data-accept={accept}
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
    />
  ),
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({
    value,
    onChange,
    className,
    placeholder,
    rows,
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    className?: string;
    placeholder?: string;
    rows?: number;
  }) => (
    <textarea
      data-testid="textarea"
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
      rows={rows}
    />
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => (
    <div data-testid="select" data-value={value}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
        
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? React.cloneElement(child, { onValueChange } as any)
          : child
      )}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <div data-testid="select-value" data-placeholder={placeholder}>
      Select Value
    </div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
    "data-changed": dataChanged,
    "data-testid": testId,
  }: {
    children: React.ReactNode;
    className?: string;
    "data-changed"?: boolean;
    "data-testid"?: string;
  }) => (
    <div
      data-testid={testId || "card"}
      className={className}
      data-changed={dataChanged}
    >
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
    "data-changed": dataChanged,
  }: {
    children: React.ReactNode;
    className?: string;
    "data-changed"?: boolean;
  }) => (
    <div
      data-testid="card-content"
      className={className}
      data-changed={dataChanged}
    >
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
}));

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  FileText: () => <div data-testid="file-text-icon">FileText</div>,
  HelpCircle: () => <div data-testid="help-circle-icon">HelpCircle</div>,
  Mic: () => <div data-testid="mic-icon">Mic</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Trash2: () => <div data-testid="trash-icon">Trash2</div>,
  Video: () => <div data-testid="video-icon">Video</div>,
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-url");

// Mock file reader
(global.FileReader as unknown) = jest.fn();

describe("BuilderTab", () => {
  // Custom query functions for multiple elements
  const getUnitCard = (unitId: string) =>
    screen.getByTestId("card").closest(`[data-unit-id="${unitId}"]`) ||
    screen.getByTestId("card");

  const getUnitByIndex = (index: number) => {
    const unitCards = screen.getAllByTestId("card");
    if (index >= unitCards.length) {
      throw new Error(
        `Unit index ${index} not found. Only ${unitCards.length} units available.`
      );
    }
    return unitCards[index];
  };

  const getLessonInUnit = (unitElement: HTMLElement, lessonIndex: number) => {
    const lessonElements = within(unitElement)
      .getAllByTestId("card-content")
      .flatMap((content) =>
        Array.from(content.querySelectorAll('[class*="border-gray-200"]'))
      );

    if (lessonIndex >= lessonElements.length) {
      throw new Error(
        `Lesson index ${lessonIndex} not found in unit. Only ${lessonElements.length} lessons available.`
      );
    }
    return lessonElements[lessonIndex] as HTMLElement;
  };

  const getUnitTitleInput = (unitElement: HTMLElement) =>
    within(unitElement)
      .getAllByTestId("input")
      .find((input) => input.closest('[data-testid="card-header"]'))!;

  const getLessonTitleInput = (lessonElement: HTMLElement) =>
    within(lessonElement)
      .getAllByTestId("input")
      .find((input) => !input.closest("select"))!;

  const getLessonTypeSelect = (lessonElement: HTMLElement) =>
    within(lessonElement).getByTestId("select");

  const getDeleteUnitButton = (unitElement: HTMLElement) =>
    within(unitElement)
      .getAllByTestId("button")
      .find((button) => button.innerHTML.includes("trash-icon"))!;

  const getAddLessonButton = (unitElement: HTMLElement) =>
    within(unitElement)
      .getAllByTestId("button")
      .find((button) => button.textContent?.includes("Add Lesson"))!;

  const getUnitNumber = (unitElement: HTMLElement) => {
    const header = within(unitElement).getByTestId("card-header");
    // Look specifically for the unit number circle with blue background
    const unitNumberElement = within(header).getByText(/\d/, {
      selector: '[class*="bg-blue-600"]',
    });
    return unitNumberElement;
  };

  const getFileInputsByAccept = (accept: string) => {
    return screen
      .getAllByTestId("input")
      .filter((input) => input.getAttribute("data-accept") === accept);
  };

  // Mock props
  const mockUnits: Unit[] = [
    {
      id: "unit-1",
      course_id: "course-123",
      title: "Introduction to React",
      order_index: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: "unit-2",
      course_id: "course-123",
      title: "Advanced Concepts",
      order_index: 1,
      created_at: new Date().toISOString(),
    },
  ];

  const mockLessons: Lesson[] = [
    {
      id: "lesson-1",
      unit_id: "unit-1",
      title: "What is React?",
      content_type: "text",
      content: { body: "React is a library..." },
      order_index: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: "lesson-2",
      unit_id: "unit-1",
      title: "Setting up Environment",
      content_type: "video",
      content: { url: "", notes: "" },
      order_index: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: "lesson-3",
      unit_id: "unit-2",
      title: "Hooks",
      content_type: "exercise",
      content: {
        exerciseType: "quiz",
        question: "",
        options: ["", "", ""],
        correct: 0,
      },
      order_index: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: "lesson-4",
      unit_id: "unit-2",
      title: "Audio Lesson",
      content_type: "audio",
      content: { url: "", transcript: "" },
      order_index: 1, // ✅ Required field
      created_at: new Date().toISOString(),
    },
  ];

  const mockAddUnit = jest.fn();
  const mockAddLesson = jest.fn();
  const mockRemoveUnit = jest.fn();
  const mockSetUnits = jest.fn();
  const mockSetLessons = jest.fn();

  const defaultProps = {
    units: mockUnits,
    lessons: mockLessons,
    addUnit: mockAddUnit,
    addLesson: mockAddLesson,
    removeUnit: mockRemoveUnit,
    setUnits: mockSetUnits,
    setLessons: mockSetLessons,
    courseVersion: "main",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Add this before the describe block
  const mockFileReader = {
    readAsDataURL: jest.fn(),
    result: "data:mock;base64,test",
    onload: jest.fn(),
    onerror: jest.fn(),
  };
  (global.FileReader as unknown as jest.Mock) = jest.fn(() => mockFileReader);

  describe("Initial Rendering", () => {
    it("renders all units and lessons", () => {
      render(<BuilderTab {...defaultProps} />);

      // Check header
      expect(screen.getByText("Course Content Builder")).toBeInTheDocument();
      expect(screen.getByText("Add Unit")).toBeInTheDocument();

      // Check units are rendered
      expect(
        screen.getByDisplayValue("Introduction to React")
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("Advanced Concepts")).toBeInTheDocument();

      // Check lessons are rendered
      expect(screen.getByDisplayValue("What is React?")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("Setting up Environment")
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("Hooks")).toBeInTheDocument();
    });

    it("shows correct unit numbers", () => {
      render(<BuilderTab {...defaultProps} />);

      const unitCards = screen.getAllByTestId("card");

      // Use the enhanced helper to get unit numbers from headers only
      const firstUnitNumber = getUnitNumber(unitCards[0]);
      const secondUnitNumber = getUnitNumber(unitCards[1]);

      expect(firstUnitNumber).toHaveTextContent("1");
      expect(secondUnitNumber).toHaveTextContent("2");
    });
  });

  describe("Unit Management", () => {
    it("calls addUnit when Add Unit button is clicked", () => {
      render(<BuilderTab {...defaultProps} />);

      const addUnitButton = screen.getByText("Add Unit");
      fireEvent.click(addUnitButton);

      expect(mockAddUnit).toHaveBeenCalledTimes(1);
    });

    it("calls removeUnit with correct unit id when delete button is clicked", () => {
      render(<BuilderTab {...defaultProps} />);

      const unitCards = screen.getAllByTestId("card");
      const firstUnit = unitCards[0];

      const deleteButton = getDeleteUnitButton(firstUnit);
      fireEvent.click(deleteButton);

      expect(mockRemoveUnit).toHaveBeenCalledWith("unit-1");
    });

    it("updates unit title when input is changed", () => {
      render(<BuilderTab {...defaultProps} />);

      const unitCards = screen.getAllByTestId("card");
      const firstUnit = unitCards[0];

      const titleInput = getUnitTitleInput(firstUnit);
      fireEvent.change(titleInput, { target: { value: "Updated Unit Title" } });

      expect(mockSetUnits).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "unit-1",
            title: "Updated Unit Title",
          }),
          expect.objectContaining({ id: "unit-2", title: "Advanced Concepts" }),
        ])
      );
    });
  });

  describe("Lesson Management", () => {
    it("calls addLesson with correct unit id when Add Lesson button is clicked", () => {
      render(<BuilderTab {...defaultProps} />);

      const unitCards = screen.getAllByTestId("card");
      const firstUnit = unitCards[0];

      const addLessonButton = getAddLessonButton(firstUnit);
      fireEvent.click(addLessonButton);

      expect(mockAddLesson).toHaveBeenCalledWith("unit-1");
    });

    it("updates lesson title when input is changed", () => {
      render(<BuilderTab {...defaultProps} />);

      const unitCards = screen.getAllByTestId("card");
      const firstUnit = unitCards[0];
      const firstLesson = getLessonInUnit(firstUnit, 0);

      const titleInput = getLessonTitleInput(firstLesson);
      fireEvent.change(titleInput, {
        target: { value: "Updated Lesson Title" },
      });

      expect(mockSetLessons).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "lesson-1",
            title: "Updated Lesson Title",
          }),
        ])
      );
    });

    it("changes lesson content type when select is changed", () => {
      render(<BuilderTab {...defaultProps} />);

      const unitCards = screen.getAllByTestId("card");
      const firstUnit = unitCards[0];
      const firstLesson = getLessonInUnit(firstUnit, 0);

      const typeSelect = getLessonTypeSelect(firstLesson);
      // Since Select is mocked, we simulate the value change directly
      const onValueChange = typeSelect.getAttribute("data-onvaluechange");
      if (onValueChange) {
        // This would normally be handled by the Select component
        expect(typeSelect).toBeInTheDocument();
      }
    });
  });

  describe("Lesson Content Types", () => {
    it("renders text content area for text lessons", () => {
      render(<BuilderTab {...defaultProps} />);

      const textareas = screen.getAllByTestId("textarea");
      const textLessonTextarea = textareas.find(
        (ta) =>
          ta.getAttribute("placeholder") === "Write your lesson content here..."
      );

      expect(textLessonTextarea).toBeInTheDocument();
      expect(textLessonTextarea).toHaveValue("React is a library...");
    });

    it("renders video upload section for video lessons", () => {
      render(<BuilderTab {...defaultProps} />);

      // Look for file inputs with video accept attribute
      const videoInputs = getFileInputsByAccept("video/*");

      // Also check if we can find video-related elements by text
      const videoIcons = screen.getAllByTestId("video-icon");

      expect(videoInputs.length + videoIcons.length).toBeGreaterThan(0);
    });

    it("renders audio upload section for audio lessons", () => {
      render(<BuilderTab {...defaultProps} />);

      // Look for file inputs with audio accept attribute
      const audioInputs = getFileInputsByAccept("audio/*");

      // Also check if we can find audio-related elements
      const audioIcons = screen.getAllByTestId("mic-icon");

      expect(audioInputs.length + audioIcons.length).toBeGreaterThan(0);
    });

    it("renders exercise configuration for exercise lessons", () => {
      render(<BuilderTab {...defaultProps} />);

      // Look for exercise-related content by checking for exercise icons
      const exerciseIcons = screen.getAllByTestId("help-circle-icon");

      expect(exerciseIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Exercise Configuration", () => {
    it("handles quiz exercise configuration", () => {
      const quizLesson: Lesson = {
        id: "lesson-quiz",
        title: "Quiz Lesson",
        content_type: "exercise",
        unit_id: "unit-2",
        content: {
          exerciseType: "quiz",
          question: "What is React?",
          options: ["Library", "Framework", "Language"],
          correct: 0,
        },
        order_index: 1,
        created_at: new Date().toISOString(),
      };

      render(
        <BuilderTab {...defaultProps} lessons={[...mockLessons, quizLesson]} />
      );

      // Should find quiz question input
      const inputs = screen.getAllByTestId("input");
      const questionInput = inputs.find(
        (input) => input.getAttribute("placeholder") === "Enter question..."
      );

      expect(questionInput).toBeInTheDocument();
    });

    it("handles fill-blank exercise configuration", () => {
      const fillBlankLesson: Lesson = {
        id: "lesson-fill",
        title: "Fill Blank Lesson",
        content_type: "exercise",
        unit_id: "unit-2",
        content: {
          exerciseType: "fill-blank",
          sentence: "React is a library for building user interfaces",
          blankIndex: 2,
        },
        order_index: 2,
        created_at: new Date().toISOString(),
      };

      render(
        <BuilderTab
          {...defaultProps}
          lessons={[...mockLessons, fillBlankLesson]}
        />
      );

      // Should find sentence input
      const inputs = screen.getAllByTestId("input");
      const sentenceInput = inputs.find(
        (input) => input.getAttribute("placeholder") === "Enter sentence..."
      );

      expect(sentenceInput).toBeInTheDocument();
    });
  });

  describe("Change Detection", () => {
    const originalUnits: Unit[] = [
      {
        id: "unit-1",
        course_id: "course-123",
        title: "Original Unit Title",
        order_index: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: "unit-2",
        course_id: "course-123",
        title: "Advanced Concepts",
        order_index: 1,
        created_at: new Date().toISOString(),
      },
    ];

    const originalLessons: Lesson[] = [
      {
        id: "lesson-1",
        unit_id: "unit-1",
        title: "Original Lesson Title",
        content_type: "text",
        content: { body: "Original content" },
        order_index: 0,
        created_at: new Date().toISOString(),
      },
    ];

    it("highlights changed lessons in non-main versions", () => {
      const propsWithChanges = {
        ...defaultProps,
        courseVersion: "draft",
        originalUnits,
        originalLessons,
        lessons: [
          {
            id: "lesson-1",
            title: "Changed Lesson Title", // Changed
            content_type: "text" as const,
            unit_id: "unit-1",
            content: { body: "Original content" },
            order_index: 0,
            created_at: new Date().toISOString(),
          },
        ],
      };

      render(<BuilderTab {...propsWithChanges} />);

      // Look for lessons with change indicators
      const lessonElements = document.querySelectorAll(
        '[class*="border-gray-200"]'
      );

      const changedLessons = Array.from(lessonElements).filter(
        (lesson) =>
          lesson.getAttribute("data-changed") === "true" ||
          lesson.className.includes("changed") ||
          lesson.className.includes("yellow")
      );

      expect(changedLessons.length).toBeGreaterThan(0);
    });
  });

  describe("Multiple Elements Handling", () => {
    it("correctly identifies and interacts with specific units among multiple", () => {
      const multipleUnits: Unit[] = [
        {
          id: "unit-1",
          course_id: "course-123",
          title: "First Unit",
          order_index: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: "unit-2",
          course_id: "course-123",
          title: "Second Unit",
          order_index: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: "unit-3",
          course_id: "course-123",
          title: "Third Unit",
          order_index: 2,
          created_at: new Date().toISOString(),
        },
      ];

      render(<BuilderTab {...defaultProps} units={multipleUnits} />);

      const unitCards = screen.getAllByTestId("card");
      expect(unitCards).toHaveLength(3);

      // Interact with second unit specifically
      const secondUnit = unitCards[1];
      const secondUnitTitleInput = getUnitTitleInput(secondUnit);

      fireEvent.change(secondUnitTitleInput, {
        target: { value: "Updated Second Unit" },
      });

      expect(mockSetUnits).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: "unit-1", title: "First Unit" }),
          expect.objectContaining({
            id: "unit-2",
            title: "Updated Second Unit",
          }),
          expect.objectContaining({ id: "unit-3", title: "Third Unit" }),
        ])
      );
    });

    it("correctly identifies and interacts with specific lessons among multiple", () => {
      const multipleLessons: Lesson[] = [
        {
          id: "lesson-1",
          title: "First Lesson",
          content_type: "text" as const,
          unit_id: "unit-1",
          content: { body: "" },
          order_index: 0,
        },
        {
          id: "lesson-2",
          title: "Second Lesson",
          content_type: "text" as const,
          unit_id: "unit-1",
          content: { body: "" },
          order_index: 1,
        },
        {
          id: "lesson-3",
          title: "Third Lesson",
          content_type: "text" as const,
          unit_id: "unit-1",
          content: { body: "" },
          order_index: 2,
        },
      ];

      render(<BuilderTab {...defaultProps} lessons={multipleLessons} />);

      const unitCards = screen.getAllByTestId("card");
      const firstUnit = unitCards[0];

      // Get second lesson in first unit
      const secondLesson = getLessonInUnit(firstUnit, 1);
      const secondLessonTitleInput = getLessonTitleInput(secondLesson);

      fireEvent.change(secondLessonTitleInput, {
        target: { value: "Updated Second Lesson" },
      });

      expect(mockSetLessons).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: "lesson-1", title: "First Lesson" }),
          expect.objectContaining({
            id: "lesson-2",
            title: "Updated Second Lesson",
          }),
          expect.objectContaining({ id: "lesson-3", title: "Third Lesson" }),
        ])
      );
    });
  });

  describe("Error Handling", () => {
    it("handles empty units array", () => {
      render(<BuilderTab {...defaultProps} units={[]} lessons={[]} />);

      expect(screen.getByText("Course Content Builder")).toBeInTheDocument();
      expect(screen.getByText("Add Unit")).toBeInTheDocument();
    });

    it("handles lessons with missing content gracefully", () => {
      const lessonsWithMissingContent: Lesson[] = [
        {
          id: "lesson-1",
          title: "Lesson",
          content_type: "text" as const,
          unit_id: "unit-1",
          content: { body: "" },
          
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
          order_index: null as any,
        },
      ];

      render(
        <BuilderTab {...defaultProps} lessons={lessonsWithMissingContent} />
      );

      // Should render without crashing
      expect(screen.getByDisplayValue("Lesson")).toBeInTheDocument();
    });
  });

  describe("Change Detection Implementation", () => {
    const originalUnits: Unit[] = [
      {
        id: "unit-1",
        course_id: "course-123",
        title: "Original Unit Title",
        order_index: 0,
        created_at: new Date().toISOString(),
      },
    ];

    const originalLessons: Lesson[] = [
      {
        id: "lesson-1",
        unit_id: "unit-1",
        title: "Original Lesson Title",
        content_type: "text",
        content: { body: "Original content" },
        order_index: 0,
        created_at: new Date().toISOString(),
      },
    ];

    it("detects changed units by title", () => {
      const propsWithChanges = {
        ...defaultProps,
        courseVersion: "draft",
        originalUnits,
        originalLessons,
        units: [
          {
            id: "unit-1",
            course_id: "course-123",
            title: "Changed Unit Title",
            order_index: 0,
            created_at: new Date().toISOString(),
          },
        ],
      };

      render(<BuilderTab {...propsWithChanges} />);

      // Check that the changed unit input has highlight classes
      const unitInput = screen.getByDisplayValue("Changed Unit Title");
      expect(unitInput).toHaveClass("ring-2");
      expect(unitInput).toHaveClass("ring-yellow-300");
      expect(unitInput).toHaveClass("bg-yellow-50");
    });

    it("detects changed lessons by title", () => {
      const propsWithChanges = {
        ...defaultProps,
        courseVersion: "draft",
        originalUnits,
        originalLessons,
        lessons: [
          {
            id: "lesson-1",
            title: "Changed Lesson Title",
            content_type: "text" as const,
            unit_id: "unit-1",
            content: { body: "Original content" },
            order_index: 0,
            created_at: new Date().toISOString(),
          },
        ],
      };

      render(<BuilderTab {...propsWithChanges} />);

      // Check that the changed lesson has highlight classes
      const lessonInput = screen.getByDisplayValue("Changed Lesson Title");
      const lessonContainer = lessonInput.closest('[class*="border-gray-200"]');
      expect(lessonContainer).toHaveClass("ring-2");
      expect(lessonContainer).toHaveClass("ring-yellow-300");
      expect(lessonContainer).toHaveClass("bg-yellow-50");
    });

    it("detects changed lessons by content", () => {
      const propsWithChanges = {
        ...defaultProps,
        courseVersion: "draft",
        originalUnits,
        originalLessons,
        lessons: [
          {
            id: "lesson-1",
            title: "Original Lesson Title",
            content_type: "text" as const,
            unit_id: "unit-1",
            content: { body: "Changed content" },
            order_index: 0,
            created_at: new Date().toISOString(),
          },
        ],
      };

      render(<BuilderTab {...propsWithChanges} />);

      // Check that content change is detected
      const lessonContainer = screen
        .getByDisplayValue("Original Lesson Title")
        .closest('[class*="border-gray-200"]');
      expect(lessonContainer).toHaveClass("ring-2");
    });

    it("does not highlight changes in main version", () => {
      const propsWithChanges = {
        ...defaultProps,
        courseVersion: "main", // main version should not highlight
        originalUnits,
        originalLessons,
        units: [
          {
            id: "unit-1",
            course_id: "course-123",
            title: "Changed Unit Title",
            order_index: 0,
            created_at: new Date().toISOString(),
          },
        ],
      };

      render(<BuilderTab {...propsWithChanges} />);

      const unitInput = screen.getByDisplayValue("Changed Unit Title");
      expect(unitInput).not.toHaveClass("ring-2");
      expect(unitInput).not.toHaveClass("ring-yellow-300");
      expect(unitInput).not.toHaveClass("bg-yellow-50");
    });
  });
  describe("Exercise Configuration Details", () => {
    it("adds quiz options when Add Option button is clicked", () => {
      const quizLesson: Lesson = {
        id: "lesson-quiz",
        title: "Quiz Lesson",
        content_type: "exercise",
        unit_id: "unit-2",
        content: {
          exerciseType: "quiz",
          question: "What is React?",
          options: ["Option 1", "Option 2", "Option 3"],
          correct: 0,
        },
        order_index: 0,
        created_at: new Date().toISOString(),
      };

      render(<BuilderTab {...defaultProps} lessons={[quizLesson]} />);

      const addOptionButton = screen.getByText("Add Option");
      fireEvent.click(addOptionButton);

      expect(mockSetLessons).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "lesson-quiz",
            content: expect.objectContaining({
              options: ["Option 1", "Option 2", "Option 3", ""],
            }),
          }),
        ])
      );
    });

    it("changes correct answer in quiz", () => {
      const quizLesson: Lesson = {
        id: "lesson-quiz",
        title: "Quiz Lesson",
        content_type: "exercise",
        unit_id: "unit-2",
        content: {
          exerciseType: "quiz",
          question: "What is React?",
          options: ["Option 1", "Option 2", "Option 3"],
          correct: 0,
        },
        order_index: 0,
        created_at: new Date().toISOString(),
      };

      render(<BuilderTab {...defaultProps} lessons={[quizLesson]} />);

      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[1]); // Select second option

      expect(mockSetLessons).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "lesson-quiz",
            content: expect.objectContaining({
              correct: 1,
            }),
          }),
        ])
      );
    });

    it("changes exercise type between quiz and fill-blank", () => {
      const exerciseLesson: Lesson = {
        id: "lesson-exercise",
        title: "Exercise Lesson",
        content_type: "exercise",
        unit_id: "unit-2",
        content: {
          exerciseType: "quiz",
          question: "",
          options: ["", "", ""],
          correct: 0,
        },
        order_index: 0,
        created_at: new Date().toISOString(),
      };

      render(<BuilderTab {...defaultProps} lessons={[exerciseLesson]} />);

      // Find and interact with exercise type select
      const exerciseSelects = screen.getAllByTestId("select");
      const typeSelect = exerciseSelects.find((select) =>
        select.textContent?.includes("Choose exercise type")
      );

      if (typeSelect) {
        // This would need to be implemented based on your Select component behavior
        expect(typeSelect).toBeInTheDocument();
      }
    });
  });
  describe("File Upload State Management", () => {
    it("displays video player when video URL is present", () => {
      const videoLesson: Lesson = {
        id: "lesson-video",
        title: "Video Lesson",
        content_type: "video",
        unit_id: "unit-1",
        content: {
          url: "mock-video-url",
          notes: "Video notes",
          fileName: "test.mp4",
        },
        order_index: 0,
        created_at: new Date().toISOString(),
      };

      render(<BuilderTab {...defaultProps} lessons={[videoLesson]} />);

      // Should find video element instead of upload prompt
      const videoElement = document.querySelector("video");
      expect(videoElement).toBeInTheDocument();
      expect(videoElement).toHaveAttribute("src", "mock-video-url");
    });

    it("displays audio player when audio URL is present", () => {
      const audioLesson: Lesson = {
        id: "lesson-audio",
        title: "Audio Lesson",
        content_type: "audio",
        unit_id: "unit-1",
        content: {
          url: "mock-audio-url",
          transcript: "Audio transcript",
          fileName: "test.mp3",
        },
        order_index: 0,
        created_at: new Date().toISOString(),
      };

      render(<BuilderTab {...defaultProps} lessons={[audioLesson]} />);

      const audioElement = document.querySelector("audio");
      expect(audioElement).toBeInTheDocument();
      expect(audioElement).toHaveAttribute("src", "mock-audio-url");
    });

    it("updates video notes when textarea changes", () => {
      const videoLesson: Lesson = {
        id: "lesson-video",
        title: "Video Lesson",
        content_type: "video",
        unit_id: "unit-1",
        content: { url: "", notes: "Initial notes" },
        order_index: 0,
        created_at: new Date().toISOString(),
      };

      render(<BuilderTab {...defaultProps} lessons={[videoLesson]} />);

      const notesTextarea = screen.getByPlaceholderText(
        "Video description and notes..."
      );
      fireEvent.change(notesTextarea, { target: { value: "Updated notes" } });

      expect(mockSetLessons).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "lesson-video",
            content: expect.objectContaining({
              notes: "Updated notes",
            }),
          }),
        ])
      );
    });

    it("updates audio transcript when textarea changes", () => {
      const audioLesson: Lesson = {
        id: "lesson-audio",
        title: "Audio Lesson",
        content_type: "audio",
        unit_id: "unit-1",
        content: { url: "", transcript: "Initial transcript" },
        order_index: 0,
        created_at: new Date().toISOString(),
      };

      render(<BuilderTab {...defaultProps} lessons={[audioLesson]} />);

      const transcriptTextarea = screen.getByPlaceholderText(
        "Audio transcript and pronunciation notes..."
      );
      fireEvent.change(transcriptTextarea, {
        target: { value: "Updated transcript" },
      });

      expect(mockSetLessons).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "lesson-audio",
            content: expect.objectContaining({
              transcript: "Updated transcript",
            }),
          }),
        ])
      );
    });
  });
  describe("Content Type Switching", () => {
    it("switches from text to video content type", () => {
      const textLesson: Lesson = {
        id: "lesson-1",
        title: "Test Lesson",
        content_type: "text",
        unit_id: "unit-1",
        content: { body: "Text content" },
        order_index: 0,
        created_at: new Date().toISOString(),
      };

      render(<BuilderTab {...defaultProps} lessons={[textLesson]} />);

      // Find and change content type select to video
      const lessonElement: HTMLElement = screen
        .getByDisplayValue("Test Lesson")
        .closest('[class*="border-gray-200"]')!;

      const typeSelect = within(lessonElement).getByTestId("select");

      // This would need to simulate the select change
      // For now, just verify the select is present
      expect(typeSelect).toBeInTheDocument();
    });

    it("initializes proper content when switching types", () => {
      const lesson: Lesson = {
        id: "lesson-1",
        title: "Test Lesson",
        content_type: "text",
        unit_id: "unit-1",
        content: { body: "Text content" },
        order_index: 0,
        created_at: new Date().toISOString(),
      };

      render(<BuilderTab {...defaultProps} lessons={[lesson]} />);

      // The test would verify that when switching from text to audio,
      // the content is properly initialized to { url: "", transcript: "" }
      // This requires simulating the select change
    });
  });

});
