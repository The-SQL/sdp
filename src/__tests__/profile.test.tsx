// __tests__/Profile.test.tsx
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Profile from "@/app/(signed-in)/profile/page";
import { useUser } from "@clerk/nextjs";
import * as dbClient from "@/utils/db/client";
import { UserProgress } from "@/utils/types";

// --- MOCKS ---
jest.mock("@clerk/nextjs");
jest.mock("@/utils/supabase/client");
jest.mock("@/utils/db/client");

// --- MOCK USER DATA ---
const mockUser = { id: "user123" };
const mockProfile = {
  id: "profile123",
  clerk_id: "user123",
  name: "Test User",
  email: "test@example.com",
  bio: "Hello",
  location: "Earth",
  nativeLanguage: "English",
  profile_url: null,
  created_at: "2024-01-01T00:00:00Z",
};
const mockStats = {
  current_streak: 5,
  longest_streak: 10,
  totalLessons: 20,
  totalPoints: 100,
};
const mockAchievements = [
  {
    id: 1,
    name: "First Steps",
    description: "Do first lesson",
    earned: true,
    date: "2024-01-01",
  },
];
const mockCourses = {
  data: [],
  num_completed: 0,
  num_in_progress: 0,
  languageNames: [],
};
const mockProgress: UserProgress[] = [];

// --- TEST SUITE ---
describe("Profile Component - Functional Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (dbClient.getUserProfile as jest.Mock).mockResolvedValue(mockProfile);
    (dbClient.getUserStats as jest.Mock).mockResolvedValue(mockStats);
    (dbClient.getUserAchievements as jest.Mock).mockResolvedValue(
      mockAchievements
    );
    (dbClient.getUserCourses as jest.Mock).mockResolvedValue(mockCourses);
    (dbClient.getUserProgress as jest.Mock).mockResolvedValue(mockProgress);
  });

  // --- BASIC PROFILE TESTS ---
  test("loads and displays profile data correctly", async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.email)).toBeInTheDocument();
    });
  });

  test("handles empty profile fields gracefully", async () => {
    (dbClient.getUserProfile as jest.Mock).mockResolvedValue({
      ...mockProfile,
      bio: "",
      location: "",
      nativeLanguage: "",
      profile_url: null,
    });
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByText("No Bio")).toBeInTheDocument();
      expect(screen.getByText("Not Specified")).toBeInTheDocument();
    });
  });

  test("handles empty courses, achievements, progress", async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.queryByText(/completed courses/i)).toBeInTheDocument();
    });
  });

  test("saves edited profile data", async () => {
    render(<Profile />);
    await waitFor(() => screen.getByText(/edit profile/i));

    // Enter edit mode
    fireEvent.click(screen.getByText(/edit profile/i));
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Updated Name" },
    });
    fireEvent.change(screen.getByLabelText(/bio/i), {
      target: { value: "Updated Bio" },
    });

    // Save
    fireEvent.click(screen.getByText(/save changes/i));
    await waitFor(() => {
      const bioElements = screen.getAllByText("Updated Bio");
      expect(bioElements[0]).toBeInTheDocument();
    });
  });

  test("handles db fetch errors gracefully", async () => {
    (dbClient.getUserProfile as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );
    render(<Profile />);
    await waitFor(() => {
      expect(screen.queryByText(/edit profile/i)).not.toBeInTheDocument();
    });
  });

  test("renders streaks and edge percentages correctly", async () => {
    (dbClient.getUserStats as jest.Mock).mockResolvedValue({
      current_streak: 0,
      longest_streak: 0,
      totalLessons: 0,
      totalPoints: 0,
    });
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByTestId("current-streak")).toHaveTextContent("0");
      expect(screen.getByTestId("longest-streak")).toHaveTextContent("0");
      expect(screen.getByTestId("completed-courses")).toHaveTextContent("0");
      expect(screen.getByTestId("in-progress-courses")).toHaveTextContent("0");
    });
  });

  test("fallback avatar displays if profile_url missing", async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByText("T")).toBeInTheDocument(); // first letter of name
    });
  });
});

// --- TABS, STATS, COURSES, AND LANGUAGE BADGES TESTS ---
describe("Profile Component - Tabs, Stats, and Courses", () => {
  // Update the mockCoursesWithData to include proper structure
  const mockCoursesWithData = {
    data: [
      {
        id: "1",
        title: "React Basics",
        course_title: "React Basics",
        overall_progress: 75,
        completed_at: null,
      },
      {
        id: "2",
        title: "TypeScript Fundamentals",
        course_title: "TypeScript Fundamentals",
        overall_progress: 100,
        completed_at: "2024-01-01",
      },
    ],
    num_completed: 5,
    num_in_progress: 3,
    languageNames: ["Python", "JavaScript"],
  };
  const mockStatsExample = { totalLessons: 20, totalPoints: 50 };
  const mockStats1Example = { current_streak: 7, longest_streak: 10 };

  // In the second test suite, update the beforeEach
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useUser to return a loaded user
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: { id: "user123" },
    });

    // Mock all required database functions
    (dbClient.getUserProfile as jest.Mock).mockResolvedValue({
      id: "profile123",
      clerk_id: "user123",
      name: "Test User",
      email: "test@example.com",
      bio: "Hello",
      location: "Earth",
      nativeLanguage: "English",
      profile_url: null,
      created_at: "2024-01-01T00:00:00Z",
    });

    (dbClient.getUserStats as jest.Mock).mockResolvedValue({
      current_streak: 7,
      longest_streak: 10,
      totalLessons: 20,
      totalPoints: 50,
    });

    (dbClient.getUserCourses as jest.Mock).mockResolvedValue({
      data: [
        {
          id: "1",
          title: "React Basics",
          course_title: "React Basics",
          overall_progress: 75,
          completed_at: null,
        },
        {
          id: "2",
          title: "TypeScript Fundamentals",
          course_title: "TypeScript Fundamentals",
          overall_progress: 100,
          completed_at: "2024-01-01",
        },
      ],
      num_completed: 5,
      num_in_progress: 3,
      languageNames: ["Python", "JavaScript"],
    });

    (dbClient.getUserAchievements as jest.Mock).mockResolvedValue([]);
    (dbClient.getUserProgress as jest.Mock).mockResolvedValue([]);
  });

  test("renders all tabs correctly", async () => {
    render(<Profile />);
    await waitFor(() => {
      const tabLabels = [
        "Overview",
        "My Courses",
        "Achievements",
        "Favorites",
        "Settings",
      ];
      tabLabels.forEach((label) => {
        expect(screen.getByRole("tab", { name: label })).toBeInTheDocument();
      });
    });
  });

  test("Overview tab displays correct stats cards", async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByTestId("completed-courses")).toHaveTextContent("5");
      expect(screen.getByTestId("in-progress-courses")).toHaveTextContent("3");
      expect(screen.getByTestId("current-streak")).toHaveTextContent("7");
      expect(screen.getByTestId("longest-streak")).toHaveTextContent("10");
    });
  });

  test("learning languages badges render correctly", async () => {
    render(<Profile />);
    await waitFor(() => {
      mockCoursesWithData.languageNames.forEach((lang) => {
        expect(screen.getByText(lang)).toBeInTheDocument();
      });
    });
  });

  test("Overview tab is active by default", async () => {
    render(<Profile />);

    // Wait for the Overview tab content to load
    await waitFor(() => {
      expect(screen.getByText("Completed Courses")).toBeInTheDocument();
    });
  });
});

// Add these tests to your Profile test file

describe("Profile Component - Settings Tab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: { id: "user123" },
    });
    (dbClient.getUserProfile as jest.Mock).mockResolvedValue({
      id: "profile123",
      clerk_id: "user123",
      name: "Test User",
      email: "test@example.com",
      bio: "Hello",
      location: "Earth",
      nativeLanguage: "English",
      profile_url: null,
      created_at: "2024-01-01T00:00:00Z",
    });
    // Add other necessary mocks
  });

  // Update the Settings tab tests to use test IDs
  test("Settings tab displays personal information form", async () => {
    render(<Profile />);

    // Switch to Settings tab
    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: /settings/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("tab", { name: /settings/i }));

    // Check that all form fields are present using test IDs
    await waitFor(() => {
      expect(screen.getByTestId("name-input")).toBeInTheDocument();
      expect(screen.getByTestId("email-input")).toBeInTheDocument();
      expect(screen.getByTestId("bio-textarea")).toBeInTheDocument();
      expect(screen.getByTestId("location-input")).toBeInTheDocument();
      expect(screen.getByTestId("native-language-input")).toBeInTheDocument();
    });
  });

  test("Form fields are initially populated with user data", async () => {
    render(<Profile />);

    // Switch to Settings tab
    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: /settings/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("tab", { name: /settings/i }));

    // Check that form fields have correct initial values using test IDs
    await waitFor(() => {
      expect(screen.getByTestId("name-input")).toHaveValue("Test User");
      expect(screen.getByTestId("email-input")).toHaveValue("test@example.com");
      expect(screen.getByTestId("bio-textarea")).toHaveValue("Hello");
      expect(screen.getByTestId("location-input")).toHaveValue("Earth");
      expect(screen.getByTestId("native-language-input")).toHaveValue(
        "English"
      );
    });
  });

  test("Form fields are disabled when not in edit mode", async () => {
    render(<Profile />);

    // Switch to Settings tab
    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: /settings/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("tab", { name: /settings/i }));

    // Check that form fields are disabled using test IDs
    await waitFor(() => {
      expect(screen.getByTestId("name-input")).toBeDisabled();
      expect(screen.getByTestId("email-input")).toBeDisabled();
      expect(screen.getByTestId("bio-textarea")).toBeDisabled();
      expect(screen.getByTestId("location-input")).toBeDisabled();
      expect(screen.getByTestId("native-language-input")).toBeDisabled();
    });
  });

  test("Form fields become enabled when edit mode is activated", async () => {
    render(<Profile />);

    // Switch to Settings tab
    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: /settings/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("tab", { name: /settings/i }));

    // Click Edit Profile button
    await waitFor(() => {
      expect(screen.getByText(/edit profile/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/edit profile/i));

    // Check that form fields are enabled using test IDs (except email)
    await waitFor(() => {
      expect(screen.getByTestId("name-input")).toBeEnabled();
      expect(screen.getByTestId("email-input")).toBeDisabled(); // Email should remain disabled
      expect(screen.getByTestId("bio-textarea")).toBeEnabled();
      expect(screen.getByTestId("location-input")).toBeEnabled();
      expect(screen.getByTestId("native-language-input")).toBeEnabled();
    });
  });

  test("Form fields can be edited when in edit mode", async () => {
    render(<Profile />);

    // Switch to Settings tab and enter edit mode
    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: /settings/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("tab", { name: /settings/i }));

    await waitFor(() => {
      expect(screen.getByText(/edit profile/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/edit profile/i));

    // Change form values using test IDs
    fireEvent.change(screen.getByTestId("name-input"), {
      target: { value: "Updated Name" },
    });

    fireEvent.change(screen.getByTestId("bio-textarea"), {
      target: { value: "Updated Bio" },
    });

    fireEvent.change(screen.getByTestId("location-input"), {
      target: { value: "Updated Location" },
    });

    fireEvent.change(screen.getByTestId("native-language-input"), {
      target: { value: "Updated Language" },
    });

    // Verify the changes using test IDs
    expect(screen.getByTestId("name-input")).toHaveValue("Updated Name");
    expect(screen.getByTestId("bio-textarea")).toHaveValue("Updated Bio");
    expect(screen.getByTestId("location-input")).toHaveValue(
      "Updated Location"
    );
    expect(screen.getByTestId("native-language-input")).toHaveValue(
      "Updated Language"
    );
  });

  test("Email field is always disabled", async () => {
    render(<Profile />);

    // Switch to Settings tab
    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: /settings/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("tab", { name: /settings/i }));

    // Check that email is disabled in view mode
    await waitFor(() => {
      expect(screen.getByTestId("email-input")).toBeDisabled();
    });

    // Enter edit mode
    fireEvent.click(screen.getByText(/edit profile/i));

    // Check that email is still disabled in edit mode
    await waitFor(() => {
      expect(screen.getByTestId("email-input")).toBeDisabled();
    });
  });``
});
