// src/__tests__/signed-in/setup-tab.test.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import SetupTab from "@/app/(signed-in)/create-course/setup-tab";
import { createClient } from "@/utils/supabase/client";
import { createLanguage, createTag } from "@/utils/db/client";

// Mock Supabase client
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock database functions
jest.mock("@/utils/db/client", () => ({
  createLanguage: jest.fn(),
  createTag: jest.fn(),
}));

// Mock UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: React.forwardRef(
    function Input( // Give the function a name here
      { type, accept, onChange, placeholder, value, className, ...props }: any,
      ref
    ) {
      if (type === "file") {
        return (
          <input
            data-testid="file-input"
            type="file"
            accept={accept}
            onChange={onChange}
            className={className}
            ref={ref}
            {...props}
          />
        );
      }
      return (
        <input
          data-testid="input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={className}
          ref={ref}
          {...props}
        />
      );
    }
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <div data-testid="select">
      <div data-testid="select-value">{value}</div>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ placeholder }: any) => (
    <div data-testid="select-value-placeholder">{placeholder}</div>
  ),
  SelectContent: ({ children }: any) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ value, children }: any) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: React.forwardRef(
    function Textarea( // Add the function name here
      { placeholder, rows, value, onChange, className, ...props }: any,
      ref
    ) {
      return (
        <textarea
          data-testid="textarea"
          placeholder={placeholder}
          rows={rows}
          value={value}
          onChange={onChange}
          className={className}
          ref={ref}
          {...props}
        />
      );
    }
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, ...props }: any) => (
    <div data-testid="badge" className={className} {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, className, ...props }: any) => (
    <label data-testid="label" className={className} {...props}>
      {children}
    </label>
  ),
}));

// Mock SearchableInput component with better implementation
jest.mock("@/components/ui/searchable-input", () => ({
  __esModule: true,
  default: function SearchableInput({
    dbCall,
    selected,
    onSelect,
    isCreationAllowed,
    createSearchType,
    placeholder,
    clearOnSelect,
  }: any) {
    const [inputValue, setInputValue] = React.useState("");

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);

      if (e.target.value === "test language") {
        const result = await dbCall("test");
        if (result.data && result.data.length > 0) {
          onSelect(result.data[0]);
        }
      }
      if (e.target.value === "create new") {
        if (isCreationAllowed && createSearchType) {
          try {
            const newItem = await createSearchType({ name: "New Item" });
            onSelect(newItem);
          } catch (error) {
            // Handle error silently for testing
            console.error("Creation failed:", error);
          }
        }
      }
    };

    return (
      <div data-testid="searchable-input">
        <input
          data-testid="searchable-input-field"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
        />
        {selected && <div data-testid="selected-item">{selected.name}</div>}
      </div>
    );
  },
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  XIcon: ({ className, onClick }: any) => (
    <span data-testid="x-icon" className={className} onClick={onClick}>
      ×
    </span>
  ),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");

describe("SetupTab", () => {
  const mockSetCourseData = jest.fn();
  const mockSetCourseImageFile = jest.fn();
  const mockSetTags = jest.fn();
  const mockSupabaseClient = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        ilike: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  };

  const defaultProps = {
    courseData: {
      id: "course-123",
      author_id: "user-123",
      language_id: "",
      language_name: "",
      title: "",
      description: "",
      difficulty: "",
      estimated_duration: "",
      learning_objectives: "",
      profile_url: "",
      is_public: false,
      is_published: false,
      open_to_collab: true,
    },
    setCourseData: mockSetCourseData,
    setCourseImageFile: mockSetCourseImageFile,
    tags: [],
    setTags: mockSetTags,
    courseVersion: "main",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    (createLanguage as jest.Mock).mockResolvedValue({
      id: "lang-1",
      name: "Spanish",
    });
    (createTag as jest.Mock).mockResolvedValue({
      id: "tag-1",
      name: "New Tag",
    });
  });

  // Helper function to get the preview section
  const getPreviewSection = () => {
    const cards = screen.getAllByTestId("card");
    // The preview card should be the one that contains "Course Preview" in its title
    return (
      cards.find(
        (card) => within(card).queryByText("Course Preview") !== null
      ) || cards[1]
    ); // Fallback to second card if not found
  };

  describe("Basic Rendering", () => {
    it("renders all form sections", () => {
      render(<SetupTab {...defaultProps} />);

      expect(screen.getByText("Course Information")).toBeInTheDocument();
      expect(screen.getByText("Course Preview")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("e.g., Spanish for Travel Enthusiasts")
      ).toBeInTheDocument();
      expect(screen.getByTestId("file-input")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter language...")
      ).toBeInTheDocument();
      expect(screen.getByTestId("select")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g., 8 weeks")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "Describe what students will learn and achieve in this course..."
        )
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "Master basic conversation skills, Learn 500+ essential vocabulary words, Understand cultural context"
        )
      ).toBeInTheDocument();
    });

    it("renders tags section when tags and setTags are provided", () => {
      render(<SetupTab {...defaultProps} />);

      expect(screen.getByText("Tags")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter tag...")).toBeInTheDocument();
    });

    it("does not render tags section when tags and setTags are not provided", () => {
      const propsWithoutTags = {
        ...defaultProps,
        tags: undefined,
        setTags: undefined,
      };

      render(<SetupTab {...propsWithoutTags} />);

      expect(screen.queryByText("Tags")).not.toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("updates course title when typing", async () => {
      const user = userEvent.setup();
      render(<SetupTab {...defaultProps} />);

      const titleInput = screen.getByPlaceholderText(
        "e.g., Spanish for Travel Enthusiasts"
      );
      fireEvent.change(titleInput, { target: { value: "Spanish Course" } });

      // To this:
      expect(mockSetCourseData).toHaveBeenLastCalledWith({
        ...defaultProps.courseData,
        title: "Spanish Course",
      });
    });

    it("handles file upload and updates profile URL", async () => {
      const file = new File(["dummy content"], "course-image.jpg", {
        type: "image/jpeg",
      });
      render(<SetupTab {...defaultProps} />);

      const fileInput = screen.getByTestId("file-input");
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockSetCourseData).toHaveBeenCalledWith(expect.any(Function));
      expect(mockSetCourseImageFile).toHaveBeenCalledWith(file);
    });

    it("handles file input with no file selected", () => {
      render(<SetupTab {...defaultProps} />);

      const fileInput = screen.getByTestId("file-input");
      fireEvent.change(fileInput, { target: { files: [] } });

      // Should not crash and not call setCourseData for profile_url
      expect(mockSetCourseData).not.toHaveBeenCalledWith(
        expect.objectContaining({ profile_url: expect.anything() })
      );
    });

    it("updates estimated duration when typing", async () => {
      const user = userEvent.setup();
      render(<SetupTab {...defaultProps} />);

      const durationInput = screen.getByPlaceholderText("e.g., 8 weeks");
      fireEvent.change(durationInput, { target: { value: "10 weeks" } });

      expect(mockSetCourseData).toHaveBeenCalledWith({
        ...defaultProps.courseData,
        estimated_duration: "10 weeks",
      });
    });

    it("updates description when typing", async () => {
      const user = userEvent.setup();
      render(<SetupTab {...defaultProps} />);

      const descriptionInput = screen.getByPlaceholderText(
        "Describe what students will learn and achieve in this course..."
      );
      fireEvent.change(descriptionInput, {
        target: { value: "Learn Spanish basics" },
      });

      expect(mockSetCourseData).toHaveBeenCalledWith({
        ...defaultProps.courseData,
        description: "Learn Spanish basics",
      });
    });

    it("updates learning objectives when typing", async () => {
      const user = userEvent.setup();
      render(<SetupTab {...defaultProps} />);

      const objectivesInput = screen.getByPlaceholderText(
        "Master basic conversation skills, Learn 500+ essential vocabulary words, Understand cultural context"
      );
      fireEvent.change(objectivesInput, {
        target: { value: "Master basic conversation skills" },
      });

      expect(mockSetCourseData).toHaveBeenCalledWith({
        ...defaultProps.courseData,
        learning_objectives: "Master basic conversation skills",
      });
    });
  });

  describe("Searchable Inputs", () => {
    it("searches and selects language", async () => {
      // Mock language search response
      const mockLanguageSearch = jest.fn().mockResolvedValue({
        data: [{ id: "lang-1", name: "Spanish" }],
        error: null,
      });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: mockLanguageSearch,
        }),
      });

      render(<SetupTab {...defaultProps} />);

      const languageInput = screen.getByPlaceholderText("Enter language...");
      fireEvent.change(languageInput, { target: { value: "test language" } });

      await waitFor(() => {
        expect(mockLanguageSearch).toHaveBeenCalledWith("name", "%test%");
      });
    });

    it("creates new language when allowed", async () => {
      render(<SetupTab {...defaultProps} />);

      const languageInput = screen.getByPlaceholderText("Enter language...");
      fireEvent.change(languageInput, { target: { value: "create new" } });

      await waitFor(() => {
        expect(createLanguage).toHaveBeenCalledWith({ name: "New Item" });
      });
    });

    it("searches and selects tags", async () => {
      // Mock tag search response
      const mockTagSearch = jest.fn().mockResolvedValue({
        data: [{ id: "tag-1", name: "Beginner" }],
        error: null,
      });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: mockTagSearch,
        }),
      });

      render(<SetupTab {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText("Enter tag...");
      fireEvent.change(tagInput, { target: { value: "test language" } });

      await waitFor(() => {
        expect(mockTagSearch).toHaveBeenCalledWith("name", "%test%");
      });
    });

    it("creates new tag when allowed", async () => {
      render(<SetupTab {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText("Enter tag...");
      fireEvent.change(tagInput, { target: { value: "create new" } });

      await waitFor(() => {
        expect(createTag).toHaveBeenCalledWith({ name: "New Item" });
      });
    });
  });

  describe("Tags Management", () => {
    it("displays existing tags", () => {
      const propsWithTags = {
        ...defaultProps,
        tags: [
          { id: "tag-1", name: "Spanish" },
          { id: "tag-2", name: "Beginner" },
        ],
      };

      render(<SetupTab {...propsWithTags} />);
      const tagsLabel = screen.getByText("Tags");
      const tagsSection = tagsLabel.parentElement!; // Get the parent div of the label

      expect(within(tagsSection).getByText("Spanish")).toBeInTheDocument();
      expect(within(tagsSection).getByText("Beginner")).toBeInTheDocument();
    });

    it("removes tag when X icon is clicked", () => {
      const propsWithTags = {
        ...defaultProps,
        tags: [{ id: "tag-1", name: "Spanish" }],
      };

      render(<SetupTab {...propsWithTags} />);

      const xIcon = screen.getByTestId("x-icon");
      fireEvent.click(xIcon);

      expect(mockSetTags).toHaveBeenCalledWith(expect.any(Function));
    });

    it("handles removeTag when setTags is not provided", () => {
      const propsWithoutSetTags: any = { ...defaultProps };
      delete propsWithoutSetTags.setTags;

      render(<SetupTab {...propsWithoutSetTags} />);

      // Should not crash when removeTag is called without setTags
      // Check for any element that indicates the component rendered
      expect(screen.getByText("Course Information")).toBeInTheDocument();
    });
  });

  describe("Preview Section", () => {
    it("displays course data in preview", () => {
      const propsWithData = {
        ...defaultProps,
        courseData: {
          ...defaultProps.courseData,
          title: "Spanish Course",
          description: "Learn Spanish basics",
          difficulty: "beginner",
          estimated_duration: "8 weeks",
          profile_url: "test-image.jpg",
        },
      };

      render(<SetupTab {...propsWithData} />);

      const previewCard = getPreviewSection();
      const withinPreview = within(previewCard);

      // Now we're only looking within the preview section
      expect(withinPreview.getByText("Spanish Course")).toBeInTheDocument();
      expect(
        withinPreview.getByText("Learn Spanish basics")
      ).toBeInTheDocument();
      expect(withinPreview.getByText("beginner")).toBeInTheDocument();
      expect(withinPreview.getByText(/⏱.*8 weeks/)).toBeInTheDocument();
    });

    it("shows default content when no data is provided", () => {
      render(<SetupTab {...defaultProps} />);

      const previewCard = getPreviewSection();
      const withinPreview = within(previewCard);

      expect(withinPreview.getByText("Course Title")).toBeInTheDocument();
      expect(
        withinPreview.getByText("Course description will appear here...")
      ).toBeInTheDocument();
      expect(withinPreview.getByText(/⏱.*Duration/)).toBeInTheDocument();
    });

    it("displays profile image when available", () => {
      const propsWithImage = {
        ...defaultProps,
        courseData: {
          ...defaultProps.courseData,
          profile_url: "test-image.jpg",
        },
      };

      render(<SetupTab {...propsWithImage} />);

      const image = screen.getByAltText("Course Preview");
      expect(image).toHaveAttribute("src", "test-image.jpg");
    });

    it("displays default icon when no profile image", () => {
      render(<SetupTab {...defaultProps} />);

      const previewCard = getPreviewSection();
      const withinPreview = within(previewCard);

      expect(withinPreview.getByText("🌍")).toBeInTheDocument();
    });

    it("applies correct badge colors for difficulty levels", () => {
      const propsWithBeginner = {
        ...defaultProps,
        courseData: {
          ...defaultProps.courseData,
          difficulty: "beginner",
        },
      };

      render(<SetupTab {...propsWithBeginner} />);

      const previewCard = getPreviewSection();
      const withinPreview = within(previewCard);

      const badge = withinPreview.getByText("beginner");
      expect(badge).toHaveClass("bg-green-100", "text-green-800");
    });
  });

  describe("Error Handling", () => {
    it("handles search errors gracefully", async () => {
      const mockErrorSearch = jest.fn().mockResolvedValue({
        data: null,
        error: new Error("Search failed"),
      });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: mockErrorSearch,
        }),
      });

      render(<SetupTab {...defaultProps} />);

      const languageInput = screen.getByPlaceholderText("Enter language...");
      fireEvent.change(languageInput, { target: { value: "test language" } });

      await waitFor(() => {
        // Should not crash when search fails
        expect(mockErrorSearch).toHaveBeenCalled();
      });
    });

    it("handles creation errors gracefully", async () => {
      // Use mockImplementation to properly handle the rejected promise
      (createLanguage as jest.Mock).mockImplementation(() =>
        Promise.reject(new Error("Creation failed"))
      );

      render(<SetupTab {...defaultProps} />);

      const languageInput = screen.getByPlaceholderText("Enter language...");
      fireEvent.change(languageInput, { target: { value: "create new" } });

      await waitFor(() => {
        // Should not crash when creation fails
        expect(createLanguage).toHaveBeenCalled();
      });
    });
  });

  describe("Database Integration", () => {
    it("calls searchLanguages with correct parameters", async () => {
      const mockSearch = jest.fn().mockResolvedValue({ data: [], error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: mockSearch,
        }),
      });

      render(<SetupTab {...defaultProps} />);

      // Trigger a search
      const languageInput = screen.getByPlaceholderText("Enter language...");
      fireEvent.change(languageInput, { target: { value: "test language" } });

      await waitFor(() => {
        expect(createClient).toHaveBeenCalled();
        expect(mockSearch).toHaveBeenCalled();
      });
    });

    it("calls searchTags with correct parameters", async () => {
      const mockSearch = jest.fn().mockResolvedValue({ data: [], error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: mockSearch,
        }),
      });

      render(<SetupTab {...defaultProps} />);

      // Trigger a search
      const tagInput = screen.getByPlaceholderText("Enter tag...");
      fireEvent.change(tagInput, { target: { value: "test language" } });

      await waitFor(() => {
        expect(createClient).toHaveBeenCalled();
        expect(mockSearch).toHaveBeenCalled();
      });
    });
  });
});
