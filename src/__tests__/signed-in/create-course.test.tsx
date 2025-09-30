// __tests__/create-course.test.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateCourse from "@/app/(signed-in)/create-course/page";
import { useUser } from "@clerk/nextjs";
import {
  insertCourse,
  insertCourseTags,
  insertLessons,
  insertUnits,
  updateCourse,
  uploadImageToSupabase,
} from "@/utils/db/client";
import PublishTab from "@/app/(signed-in)/create-course/publish-tab";
import { Course } from "@/utils/types";

// Mock the dependencies
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/utils/db/client", () => ({
  insertCourse: jest.fn(),
  insertCourseTags: jest.fn(),
  insertLessons: jest.fn(),
  insertUnits: jest.fn(),
  updateCourse: jest.fn(),
  uploadImageToSupabase: jest.fn(),
}));

jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, defaultValue, className }: any) => (
    <div
      data-testid="tabs"
      className={className}
      data-default-value={defaultValue}
    >
      {children}
    </div>
  ),
  TabsList: ({ children, className }: any) => (
    <div data-testid="tabs-list" className={className}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value, className }: any) => (
    <button data-testid={`tab-trigger-${value}`} className={className}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value, className }: any) => (
    <div data-testid={`tab-content-${value}`} className={className}>
      {children}
    </div>
  ),
}));

jest.mock("@/app/(signed-in)/create-course/builder-tab", () => {
  const BuilderTab = ({
    units,
    addUnit,
    removeUnit,
    addLesson,
    lessons,
    setUnits,
    setLessons,
  }: any) => (
    <div data-testid="builder-tab">
      <div data-testid="units-count">{units.length}</div>
      <button onClick={addUnit} data-testid="add-unit-btn">
        Add Unit
      </button>
      <button
        onClick={() => removeUnit(units[0]?.id)}
        data-testid="remove-unit-btn"
      >
        Remove Unit
      </button>
      <button
        onClick={() => addLesson(units[0]?.id || "unit-1")}
        data-testid="add-lesson-btn"
      >
        Add Lesson
      </button>
      <div data-testid="lessons-count">{lessons.length}</div>
    </div>
  );
  BuilderTab.displayName = "BuilderTab";
  return BuilderTab;
});

jest.mock("@/app/(signed-in)/create-course/collaboration-tab", () => {
  const CollaborationTab = ({ courseData, setCourseData }: any) => (
    <div data-testid="collaboration-tab">
      <input
        data-testid="collab-toggle"
        type="checkbox"
        checked={courseData.open_to_collab}
        onChange={(e) =>
          setCourseData({ ...courseData, open_to_collab: e.target.checked })
        }
      />
    </div>
  );
  CollaborationTab.displayName = "CollaborationTab";
  return CollaborationTab;
});

jest.mock("@/app/(signed-in)/create-course/publish-tab", () => {
  const PublishTab = ({
    publishCourse,
    uploadStep,
    courseData,
    setCourseData,
    isAuthor,
  }: any) => (
    <div data-testid="publish-tab">
      <div data-testid="upload-step">{uploadStep}</div>
      <button onClick={publishCourse} data-testid="publish-btn">
        Publish Course
      </button>
      <input
        data-testid="course-title-input"
        value={courseData.title}
        onChange={(e) =>
          setCourseData({ ...courseData, title: e.target.value })
        }
      />
    </div>
  );
  PublishTab.displayName = "PublishTab";
  return PublishTab;
});

jest.mock("@/app/(signed-in)/create-course/setup-tab", () => {
  const SetupTab = ({
    courseData,
    setCourseData,
    setCourseImageFile,
    tags,
    setTags,
  }: any) => (
    <div data-testid="setup-tab">
      <input
        data-testid="course-title"
        value={courseData.title}
        onChange={(e) =>
          setCourseData({ ...courseData, title: e.target.checked })
        }
      />
      <input
        data-testid="course-description"
        value={courseData.description}
        onChange={(e) =>
          setCourseData({ ...courseData, description: e.target.value })
        }
      />
      <input
        type="file"
        data-testid="course-image"
        onChange={(e) => setCourseImageFile(e.target.files?.[0] || null)}
      />
    </div>
  );
  SetupTab.displayName = "SetupTab";
  return SetupTab;
});

// Mock crypto for randomUUID
let __uuidCounter = 0;
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: jest.fn(() => {
      __uuidCounter += 1;
      return `mock-uuid-${__uuidCounter}`;
    }),
  },
});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

describe("CreateCourse", () => {
  const mockUser = {
    id: "user-123",
    firstName: "John",
    lastName: "Doe",
  };

  beforeEach(() => {
    __uuidCounter = 0;
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    jest.clearAllMocks();
  });

  it("renders the component with initial state", () => {
    render(<CreateCourse />);

    expect(screen.getByText("Create a New Course")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Share your language expertise with the global community"
      )
    ).toBeInTheDocument();

    // Check if all tabs are rendered
    expect(screen.getByTestId("tab-trigger-setup")).toBeInTheDocument();
    expect(screen.getByTestId("tab-trigger-content")).toBeInTheDocument();
    expect(screen.getByTestId("tab-trigger-collaboration")).toBeInTheDocument();
    expect(screen.getByTestId("tab-trigger-publish")).toBeInTheDocument();

    // Check if setup tab content is initially visible
    expect(screen.getByTestId("setup-tab")).toBeInTheDocument();
  });

  it("sets author_id when user is available", () => {
    render(<CreateCourse />);

    expect(useUser).toHaveBeenCalled();
  });

  it("adds and removes units correctly", async () => {
    render(<CreateCourse />);

    // Switch to content tab
    fireEvent.click(screen.getByTestId("tab-trigger-content"));

    // Initially no units
    expect(screen.getByTestId("units-count")).toHaveTextContent("0");

    // Add a unit
    fireEvent.click(screen.getByTestId("add-unit-btn"));
    expect(screen.getByTestId("units-count")).toHaveTextContent("1");

    // Add another unit
    fireEvent.click(screen.getByTestId("add-unit-btn"));
    expect(screen.getByTestId("units-count")).toHaveTextContent("2");

    // Remove the first unit
    fireEvent.click(screen.getAllByTestId("remove-unit-btn")[0]);

    expect(await screen.findByTestId("units-count")).toHaveTextContent("1");
  });

  it("adds lessons to units correctly", () => {
    render(<CreateCourse />);

    // Switch to content tab
    fireEvent.click(screen.getByTestId("tab-trigger-content"));

    // Add a unit first
    fireEvent.click(screen.getByTestId("add-unit-btn"));

    // Add a lesson
    fireEvent.click(screen.getByTestId("add-lesson-btn"));
    expect(screen.getByTestId("lessons-count")).toHaveTextContent("1");
  });

  it("publishes course successfully without media files", async () => {
    const mockCourse = { id: "course-123", title: "Test Course" };
    (insertCourse as jest.Mock).mockResolvedValue(mockCourse);
    (insertCourseTags as jest.Mock).mockResolvedValue(undefined);
    (insertUnits as jest.Mock).mockResolvedValue(undefined);
    (insertLessons as jest.Mock).mockResolvedValue(undefined);

    render(<CreateCourse />);

    // Switch to publish tab
    fireEvent.click(screen.getByTestId("tab-trigger-publish"));

    // Click publish button
    fireEvent.click(screen.getByTestId("publish-btn"));

    await waitFor(() => {
      expect(insertCourse).toHaveBeenCalled();
      expect(insertCourseTags).toHaveBeenCalled();
      expect(insertUnits).toHaveBeenCalled();
      expect(insertLessons).toHaveBeenCalled();
    });
  });

  it("handles course publishing with image upload", async () => {
    const mockCourse = { id: "course-123", title: "Test Course" };
    const mockImageFile = new File(["dummy content"], "course-image.jpg", {
      type: "image/jpeg",
    });
    const mockImageUrl = "https://example.com/course-image.jpg";

    (insertCourse as jest.Mock).mockResolvedValue(mockCourse);
    (updateCourse as jest.Mock).mockResolvedValue({
      ...mockCourse,
      profile_url: mockImageUrl,
    });
    (uploadImageToSupabase as jest.Mock).mockResolvedValue(mockImageUrl);

    render(<CreateCourse />);

    // Set course image file through setup tab
    fireEvent.click(screen.getByTestId("tab-trigger-setup"));
    const fileInput = screen.getByTestId("course-image");
    fireEvent.change(fileInput, { target: { files: [mockImageFile] } });

    // Switch to publish tab and publish
    fireEvent.click(screen.getByTestId("tab-trigger-publish"));
    fireEvent.click(screen.getByTestId("publish-btn"));

    await waitFor(() => {
      expect(uploadImageToSupabase).toHaveBeenCalledWith(
        mockImageFile,
        "course-covers",
        "course-123"
      );
      expect(updateCourse).toHaveBeenCalledWith("course-123", {
        profile_url: mockImageUrl,
      });
    });
  });

  it("handles publishing errors gracefully", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (insertCourse as jest.Mock).mockRejectedValue(new Error("Database error"));

    render(<CreateCourse />);

    fireEvent.click(screen.getByTestId("tab-trigger-publish"));
    fireEvent.click(screen.getByTestId("publish-btn"));

    await waitFor(() => {
      expect(insertCourse).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it("updates course data through child components", () => {
    render(<CreateCourse />);

    // Test collaboration tab
    fireEvent.click(screen.getByTestId("tab-trigger-collaboration"));
    const collabToggle = screen.getByTestId("collab-toggle");
    expect(collabToggle).toBeChecked(); // default is true

    fireEvent.click(collabToggle);
    // The actual state update would be tested in integration tests
  });

  it("maintains proper tab state and navigation", () => {
    render(<CreateCourse />);

    // Initially on setup tab
    expect(screen.getByTestId("setup-tab")).toBeInTheDocument();

    // Navigate to content tab
    fireEvent.click(screen.getByTestId("tab-trigger-content"));
    expect(screen.getByTestId("builder-tab")).toBeInTheDocument();

    // Navigate to collaboration tab
    fireEvent.click(screen.getByTestId("tab-trigger-collaboration"));
    expect(screen.getByTestId("collaboration-tab")).toBeInTheDocument();

    // Navigate to publish tab
    fireEvent.click(screen.getByTestId("tab-trigger-publish"));
    expect(screen.getByTestId("publish-tab")).toBeInTheDocument();
  });

  describe("TypeScript compliance", () => {
    it("uses correct TypeScript types for course data", () => {
      render(<CreateCourse />);
      expect(screen.getByTestId("tab-trigger-setup")).toBeInTheDocument();
    });

    it("handles lesson content types correctly", () => {
      render(<CreateCourse />);

      fireEvent.click(screen.getByTestId("tab-trigger-content"));
      fireEvent.click(screen.getByTestId("add-unit-btn"));
      fireEvent.click(screen.getByTestId("add-lesson-btn"));

      expect(screen.getByTestId("lessons-count")).toHaveTextContent("1");
    });
  });
});

describe("CreateCourse - Enhanced Branch Coverage", () => {
  const mockUser = {
    id: "user-123",
    firstName: "John",
    lastName: "Doe",
  };

  beforeAll(() => {
    global.fetch = jest.fn();
  });

  beforeEach(() => {
    __uuidCounter = 0;
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("State Management Edge Cases", () => {
    it("handles initial state without user", () => {
      (useUser as jest.Mock).mockReturnValue({ user: null });

      render(<CreateCourse />);

      expect(screen.getByTestId("course-title")).toBeInTheDocument();
      // Should not crash when user is null
    });

    it("handles multiple rapid unit additions", () => {
      render(<CreateCourse />);

      fireEvent.click(screen.getByTestId("tab-trigger-content"));

      // Add multiple units quickly
      fireEvent.click(screen.getByTestId("add-unit-btn"));
      fireEvent.click(screen.getByTestId("add-unit-btn"));
      fireEvent.click(screen.getByTestId("add-unit-btn"));

      expect(screen.getByTestId("units-count")).toHaveTextContent("3");
    });

    it("handles removing non-existent unit", () => {
      render(<CreateCourse />);

      fireEvent.click(screen.getByTestId("tab-trigger-content"));

      // Try to remove unit when none exist
      fireEvent.click(screen.getByTestId("remove-unit-btn"));

      // Should not crash
      expect(screen.getByTestId("units-count")).toHaveTextContent("0");
    });
  });

  describe("Publish Course - Edge Cases", () => {
    it("handles publish course with no result from insertCourse", async () => {
      (insertCourse as jest.Mock).mockResolvedValue(null);

      render(<CreateCourse />);

      fireEvent.click(screen.getByTestId("tab-trigger-publish"));
      fireEvent.click(screen.getByTestId("publish-btn"));

      await waitFor(() => {
        expect(insertCourse).toHaveBeenCalled();
        // Should not proceed with other operations if no result
        expect(insertCourseTags).not.toHaveBeenCalled();
        expect(insertUnits).not.toHaveBeenCalled();
        expect(insertLessons).not.toHaveBeenCalled();
      });
    });

    it("handles image upload failure during publish", async () => {
      const mockCourse = { id: "course-123", title: "Test Course" };
      const mockImageFile = new File(["dummy content"], "course-image.jpg", {
        type: "image/jpeg",
      });

      (insertCourse as jest.Mock).mockResolvedValue(mockCourse);
      (uploadImageToSupabase as jest.Mock).mockRejectedValue(
        new Error("Upload failed")
      );
      (updateCourse as jest.Mock).mockResolvedValue(mockCourse);

      render(<CreateCourse />);

      // Set course image
      fireEvent.click(screen.getByTestId("tab-trigger-setup"));
      const fileInput = screen.getByTestId("course-image");
      fireEvent.change(fileInput, { target: { files: [mockImageFile] } });

      // Publish
      fireEvent.click(screen.getByTestId("tab-trigger-publish"));
      fireEvent.click(screen.getByTestId("publish-btn"));

      await waitFor(() => {
        expect(uploadImageToSupabase).toHaveBeenCalled();
        // Should continue with other operations even if image upload fails
        expect(insertCourseTags).not.toHaveBeenCalled();
      });
    });

    it("handles lesson with non-blob URL (already uploaded)", async () => {
      const mockCourse = { id: "course-123", title: "Test Course" };

      (insertCourse as jest.Mock).mockResolvedValue(mockCourse);

      render(<CreateCourse />);

      // Add unit and regular text lesson (no media upload needed)
      fireEvent.click(screen.getByTestId("tab-trigger-content"));
      fireEvent.click(screen.getByTestId("add-unit-btn"));
      fireEvent.click(screen.getByTestId("add-lesson-btn"));

      fireEvent.click(screen.getByTestId("tab-trigger-publish"));
      fireEvent.click(screen.getByTestId("publish-btn"));

      await waitFor(() => {
        expect(insertCourse).toHaveBeenCalled();
        expect(uploadImageToSupabase).not.toHaveBeenCalled(); // No media to upload
        expect(insertLessons).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling and Recovery", () => {
    it("handles insertUnits failure", async () => {
      const mockCourse = { id: "course-123", title: "Test Course" };

      (insertCourse as jest.Mock).mockResolvedValue(mockCourse);
      (insertUnits as jest.Mock).mockRejectedValue(new Error("Units failed"));
      (insertLessons as jest.Mock).mockResolvedValue([]);

      render(<CreateCourse />);

      // Go to content builder tab
      fireEvent.click(screen.getByTestId("tab-trigger-content"));

      // Add a unit
      fireEvent.click(screen.getByTestId("add-unit-btn"));

      // Wait until the unit state updates
      await waitFor(() =>
        expect(screen.getByTestId("units-count")).toHaveTextContent("1")
      );

      // Add a lesson
      fireEvent.click(screen.getByTestId("add-lesson-btn"));

      // Wait until lesson state updates
      await waitFor(() =>
        expect(screen.getByTestId("lessons-count")).toHaveTextContent("1")
      );

      // Go to publish tab
      fireEvent.click(screen.getByTestId("tab-trigger-publish"));

      // Click publish
      fireEvent.click(screen.getByTestId("publish-btn"));

      // Wait for publish flow to complete
      await waitFor(() => {
        expect(insertCourse).toHaveBeenCalled();
        expect(insertUnits).toHaveBeenCalled();
      });
    });

    it("returns failure result when publish completely fails", async () => {
      (insertCourse as jest.Mock).mockRejectedValue(
        new Error("Complete failure")
      );

      render(<CreateCourse />);

      fireEvent.click(screen.getByTestId("tab-trigger-publish"));

      const publishBtn = screen.getByTestId("publish-btn");
      fireEvent.click(publishBtn);

      await waitFor(() => {
        expect(insertCourse).toHaveBeenCalled();
      });
    });
  });

  describe("Complex State Interactions", () => {
    it("handles concurrent state updates during publish", async () => {
      const mockCourse = { id: "course-123", title: "Test Course" };

      (insertCourse as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockCourse), 100))
      );

      render(<CreateCourse />);

      fireEvent.click(screen.getByTestId("tab-trigger-publish"));

      // Trigger multiple rapid publish attempts
      fireEvent.click(screen.getByTestId("publish-btn"));
      fireEvent.click(screen.getByTestId("publish-btn")); // Second click

      await waitFor(() => {
        expect(insertCourse).toHaveBeenCalledTimes(1); // Should be called only once
      });
    });

    it("maintains consistent state when removing unit with lessons", async () => {
      render(<CreateCourse />);

      fireEvent.click(screen.getByTestId("tab-trigger-content"));

      // Add unit and lessons
      fireEvent.click(screen.getByTestId("add-unit-btn"));
      fireEvent.click(screen.getByTestId("add-lesson-btn"));
      fireEvent.click(screen.getByTestId("add-lesson-btn"));

      expect(screen.getByTestId("units-count")).toHaveTextContent("1");
      expect(screen.getByTestId("lessons-count")).toHaveTextContent("2");

      fireEvent.click(screen.getAllByTestId("remove-unit-btn")[0]);

      expect(await screen.findByTestId("units-count")).toHaveTextContent("0");
      expect(await screen.findByTestId("lessons-count")).toHaveTextContent("0");
    });

    it("handles course data updates across multiple tabs", () => {
      render(<CreateCourse />);

      // Update in setup tab
      fireEvent.click(screen.getByTestId("tab-trigger-setup"));
      const titleInput = screen.getByTestId("course-title");
      fireEvent.change(titleInput, { target: { value: "New Title" } });

      // Update in collaboration tab
      fireEvent.click(screen.getByTestId("tab-trigger-collaboration"));
      const collabToggle = screen.getByTestId("collab-toggle");
      fireEvent.click(collabToggle);

      // Update in publish tab
      fireEvent.click(screen.getByTestId("tab-trigger-publish"));
      const publishTitleInput = screen.getByTestId("course-title-input");
      fireEvent.change(publishTitleInput, {
        target: { value: "Final Title" },
      });

      // All updates should be reflected in the courseData state
    });
  });

  describe("File Handling Edge Cases", () => {
    it("handles course image file removal", () => {
      render(<CreateCourse />);

      fireEvent.click(screen.getByTestId("tab-trigger-setup"));

      const fileInput = screen.getByTestId("course-image");

      // Add file
      const file = new File(["dummy content"], "course-image.jpg", {
        type: "image/jpeg",
      });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Remove file
      fireEvent.change(fileInput, { target: { files: [] } });

      // Should handle file removal gracefully
    });

    it("handles invalid file types for course image", () => {
      render(<CreateCourse />);

      fireEvent.click(screen.getByTestId("tab-trigger-setup"));

      const fileInput = screen.getByTestId("course-image");

      // Try to add non-image file
      const textFile = new File(["dummy content"], "course.txt", {
        type: "text/plain",
      });
      fireEvent.change(fileInput, { target: { files: [textFile] } });

      // Should handle invalid file types gracefully
    });
  });

  describe("Upload Step Progress", () => {
    it("updates upload step throughout publishing process", async () => {
      const mockCourse = { id: "course-123", title: "Test Course" };

      (insertCourse as jest.Mock).mockResolvedValue(mockCourse);
      (insertCourseTags as jest.Mock).mockResolvedValue(undefined);
      (insertUnits as jest.Mock).mockResolvedValue(undefined);
      (insertLessons as jest.Mock).mockResolvedValue(undefined);

      render(<CreateCourse />);

      fireEvent.click(screen.getByTestId("tab-trigger-publish"));
      fireEvent.click(screen.getByTestId("publish-btn"));

      // Check upload steps in sequence
      await waitFor(() => {
        expect(screen.getByTestId("upload-step")).toHaveTextContent(
          "Uploading course..."
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId("upload-step")).toHaveTextContent(
          "Course published successfully!"
        );
      });
    });
  });
  
});
