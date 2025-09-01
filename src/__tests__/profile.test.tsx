import {
  render,
  act,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import Profile from "@/app/(signed-in)/profile/page";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/utils/supabase/client";
import * as profileDb from "@/utils/db/profile";
import userEvent from '@testing-library/user-event';


// --- MOCKS ---
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/utils/db/profile", () => ({
  getUserProfile: jest.fn(),
  getUserStats: jest.fn(),
  getUserAchievements: jest.fn(),
  getUserProgress: jest.fn(),
  getUserCourses: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock the Loading component
jest.mock("@/components/loading", () => {
  return function MockLoading() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe("Profile functionality", () => {
  const mockEq = jest.fn().mockResolvedValue({ data: {}, error: null });
  const mockUpdate = jest.fn(() => ({ eq: mockEq }));
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        update: mockUpdate,
      }),
    });

    // Default successful responses
    (profileDb.getUserProfile as jest.Mock).mockResolvedValue({
      id: "1",
      clerk_id: "user-123",
      name: "Test User",
      email: "test@example.com",
      bio: "Hi there",
      profile_url: null,
      created_at: "2023-01-01T00:00:00Z",
      location: "SA",
      nativeLanguage: "Zulu",
    });
    (profileDb.getUserStats as jest.Mock).mockResolvedValue({
      lessons_completed: 5,
      current_streak: 2,
      longest_streak: 3,
      total_points: 50,
    });
    (profileDb.getUserAchievements as jest.Mock).mockResolvedValue([]);
    (profileDb.getUserProgress as jest.Mock).mockResolvedValue([]);
    (profileDb.getUserCourses as jest.Mock).mockResolvedValue({
      data: [],
      num_completed: 0,
      num_in_progress: 0,
      languageNames: [],
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("loads user data on mount", async () => {
    await act(async () => {
      render(<Profile />);
    });

    expect(profileDb.getUserProfile).toHaveBeenCalledWith("user-123");
    expect(profileDb.getUserStats).toHaveBeenCalledWith("user-123");
    expect(profileDb.getUserAchievements).toHaveBeenCalledWith("user-123");
    expect(profileDb.getUserProgress).toHaveBeenCalledWith("user-123");
    expect(profileDb.getUserCourses).toHaveBeenCalledWith("user-123");
  });

  it("updates user profile when saving", async () => {
    await act(async () => {
      render(<Profile />);
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // Find and click the edit button
    const editButton = screen.getByRole("button", { name: /edit/i });
    await act(async () => {
      fireEvent.click(editButton);
    });

    // Find and click the save button
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(createClient).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith(expect.any(Object));
    expect(mockEq).toHaveBeenCalledWith("clerk_id", "user-123");
  });

  // Test for timeout functionality - simplified approach
  it("sets up a timeout for data loading", async () => {
    // Mock all API calls to never resolve
    (profileDb.getUserProfile as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (profileDb.getUserStats as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (profileDb.getUserAchievements as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (profileDb.getUserProgress as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (profileDb.getUserCourses as jest.Mock).mockImplementation(() => new Promise(() => {}));

    await act(async () => {
      render(<Profile />);
    });

    // Verify that the timeout is set up by checking if console.error is called after timeout
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // The timeout should trigger console.error
    expect(console.error).toHaveBeenCalledWith("Data loading timed out");
  });
  // Test error handling for each API call
  it("handles getUserProfile error gracefully", async () => {
    (profileDb.getUserProfile as jest.Mock).mockRejectedValueOnce(
      new Error("DB error")
    );

    await act(async () => {
      render(<Profile />);
    });

    expect(profileDb.getUserProfile).toHaveBeenCalledWith("user-123");
  });

  it("handles getUserStats error gracefully", async () => {
    (profileDb.getUserStats as jest.Mock).mockRejectedValueOnce(
      new Error("DB error")
    );

    await act(async () => {
      render(<Profile />);
    });

    expect(profileDb.getUserStats).toHaveBeenCalledWith("user-123");
  });

  it("handles getUserAchievements error gracefully", async () => {
    (profileDb.getUserAchievements as jest.Mock).mockRejectedValueOnce(
      new Error("DB error")
    );

    await act(async () => {
      render(<Profile />);
    });

    expect(profileDb.getUserAchievements).toHaveBeenCalledWith("user-123");
  });

  it("handles getUserProgress error gracefully", async () => {
    (profileDb.getUserProgress as jest.Mock).mockRejectedValueOnce(
      new Error("DB error")
    );

    await act(async () => {
      render(<Profile />);
    });

    expect(profileDb.getUserProgress).toHaveBeenCalledWith("user-123");
  });

  it("handles getUserCourses error gracefully", async () => {
    (profileDb.getUserCourses as jest.Mock).mockRejectedValueOnce(
      new Error("DB error")
    );

    await act(async () => {
      render(<Profile />);
    });

    expect(profileDb.getUserCourses).toHaveBeenCalledWith("user-123");
  });

  it("handles multiple API errors gracefully", async () => {
    // Mock multiple API calls to fail
    (profileDb.getUserProfile as jest.Mock).mockRejectedValueOnce(new Error("DB error"));
    (profileDb.getUserStats as jest.Mock).mockRejectedValueOnce(new Error("DB error"));
    (profileDb.getUserAchievements as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    await act(async () => {
      render(<Profile />);
    });

    // All functions should still be called
    expect(profileDb.getUserProfile).toHaveBeenCalledWith("user-123");
    expect(profileDb.getUserStats).toHaveBeenCalledWith("user-123");
    expect(profileDb.getUserAchievements).toHaveBeenCalledWith("user-123");
  });
});



// Update the tab tests to use userEvent and proper waiting
describe("Profile Tabs functionality", () => {
  const mockEq = jest.fn().mockResolvedValue({ data: {}, error: null });
  const mockUpdate = jest.fn(() => ({ eq: mockEq }));
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });

    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        update: mockUpdate,
      }),
    });

    // Mock successful API responses with sample data
    (profileDb.getUserProfile as jest.Mock).mockResolvedValue({
      id: "1",
      clerk_id: "user-123",
      name: "Test User",
      email: "test@example.com",
      bio: "Hi there",
      profile_url: null,
      created_at: "2023-01-01T00:00:00Z",
      location: "SA",
      nativeLanguage: "Zulu",
    });

    (profileDb.getUserStats as jest.Mock).mockResolvedValue({
      lessons_completed: 5,
      current_streak: 2,
      longest_streak: 3,
      total_points: 50,
    });

    (profileDb.getUserAchievements as jest.Mock).mockResolvedValue([
      {
        id: "1",
        name: "First Lesson",
        description: "Complete your first lesson",
        earned: true,
        date: "2023-01-15",
        progress: 1,
        goal: 1,
      },
      {
        id: "2",
        name: "Week Streak",
        description: "Complete lessons for 7 days in a row",
        earned: false,
        progress: 3,
        goal: 7,
      },
    ]);

    (profileDb.getUserProgress as jest.Mock).mockResolvedValue([]);

    (profileDb.getUserCourses as jest.Mock).mockResolvedValue({
      data: [
        {
          id: "1",
          course_title: "Spanish for Beginners",
          overall_progress: 75,
          completed_at: null,
        },
        {
          id: "2",
          course_title: "French Basics",
          overall_progress: 100,
          completed_at: "2023-02-01T00:00:00Z",
        },
      ],
      num_completed: 1,
      num_in_progress: 1,
      languageNames: ["Spanish", "French"],
    });
  });

  it("renders user profile with default tab", async () => {
    await act(async () => {
      render(<Profile />);
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // Check that overview tab is active by default
    const overviewTab = screen.getByRole("tab", { name: /overview/i });
    expect(overviewTab).toHaveAttribute("data-state", "active");

    // Check overview content is displayed
    expect(screen.getByTestId("completed-courses")).toHaveTextContent("1");
    expect(screen.getByTestId("in-progress-courses")).toHaveTextContent("1");
    expect(screen.getByTestId("current-streak")).toHaveTextContent("2");
    expect(screen.getByTestId("longest-streak")).toHaveTextContent("3");

    // Check learning languages are displayed
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("French")).toBeInTheDocument();
  });

  it("switching to 'My Courses' tab shows course titles", async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<Profile />);
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // Switch to courses tab
    const coursesTab = screen.getByRole("tab", { name: /my courses/i });
    await user.click(coursesTab);

    // Wait for courses content to load
    await waitFor(() => {
      expect(screen.getByText("Spanish for Beginners")).toBeInTheDocument();
    });

    // Check course titles are displayed
    expect(screen.getByText("Spanish for Beginners")).toBeInTheDocument();
    expect(screen.getByText("French Basics")).toBeInTheDocument();
    
    // Check progress badges
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("switching to 'Achievements' tab shows earned and unearned achievements", async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<Profile />);
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // Switch to achievements tab
    const achievementsTab = screen.getByRole("tab", { name: /achievements/i });
    await user.click(achievementsTab);

    // Wait for achievements content to load
    await waitFor(() => {
      expect(screen.getByText("First Lesson")).toBeInTheDocument();
    });

    // Check achievements are displayed
    expect(screen.getByText("First Lesson")).toBeInTheDocument();
    expect(screen.getByText("Week Streak")).toBeInTheDocument();
    
    // Check progress bars for unearned achievements
    expect(screen.getByText("3/7")).toBeInTheDocument();
  });

  it("switching to 'Settings' tab allows editing profile", async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<Profile />);
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // Switch to settings tab
    const settingsTab = screen.getByRole("tab", { name: /settings/i });
    await user.click(settingsTab);

    // Wait for settings content to load
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Check settings form is displayed
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const bioTextarea = screen.getByLabelText(/bio/i);
    
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(bioTextarea).toBeInTheDocument();
    
    // Check inputs are initially disabled
    expect(nameInput).toBeDisabled();
    expect(bioTextarea).toBeDisabled();
    
    // Click edit button to enable editing
    const editButton = screen.getByRole("button", { name: /edit profile/i });
    await user.click(editButton);
    
    // Check inputs are now enabled
    expect(nameInput).toBeEnabled();
    expect(bioTextarea).toBeEnabled();
    
    // Test editing functionality
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Name");
    await user.clear(bioTextarea);
    await user.type(bioTextarea, "Updated bio");
    
    expect(nameInput).toHaveValue("Updated Name");
    expect(bioTextarea).toHaveValue("Updated bio");
  });

  it("shows empty state when no courses are available", async () => {
    const user = userEvent.setup();
    
    // Mock empty courses response
    (profileDb.getUserCourses as jest.Mock).mockResolvedValueOnce({
      data: [],
      num_completed: 0,
      num_in_progress: 0,
      languageNames: [],
    });

    await act(async () => {
      render(<Profile />);
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // Switch to courses tab
    const coursesTab = screen.getByRole("tab", { name: /my courses/i });
    await user.click(coursesTab);

    // Wait for empty state to appear
    await waitFor(() => {
      expect(screen.getByText("Start Learning")).toBeInTheDocument();
    });

    // Check empty state is displayed
    expect(screen.getByText("Start Learning")).toBeInTheDocument();
    expect(screen.getByText(/You haven't started learning yet/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /browse courses/i })).toBeInTheDocument();
  });
});