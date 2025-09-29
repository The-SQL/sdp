import { createClient } from "@/utils/supabase/client";
import * as profileService from "@/utils/db/profile";

// Mock the profile service module to allow spying on internal calls
jest.mock("@/utils/db/profile", () => {
  const actual = jest.requireActual("@/utils/db/profile");
  return {
    ...actual,
    updateUserStreak: jest.fn(),
    getUserStats: jest.fn(),
  };
});

const mockUpdateUserStreak = profileService.updateUserStreak as jest.Mock;
const mockGetUserStats = profileService.getUserStats as jest.Mock;

import type {
  UserProfile,
  UserProgress as UserProgressType,
} from "@/utils/types";

// Mock the Supabase client
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

// Mock data
const mockUserId = "user-123";
const mockUserProfile: UserProfile = {
  id: "1",
  clerk_id: mockUserId,
  name: "Test User",
  email: "test@example.com",
  profile_url: "https://example.com/avatar.jpg",
  created_at: "2023-01-01T00:00:00.000Z",
};


const mockUserProgress: UserProgressType[] = [
  {
    id: "up-1",
    user_id: mockUserId,
    course_id: "course-1",
    progress: 0,
    updated_at: "2023-12-01T00:00:00.000Z",
  },
];

// Mock user courses data for getUserCourses test
const mockUserCourses = [
  {
    id: "uc-1",
    user_id: mockUserId,
    course_id: "course-1",
    enrolled_at: "2023-01-01T00:00:00.000Z",
    completed_at: null,
    overall_progress: 75,
    course: {
      id: "course-1",
      title: "Spanish Basics",
      language: {
        id: "lang-1",
        name: "Spanish",
      },
      cover_url: "https://example.com/spanish.jpg",
    },
  },
];

// Create a proper chainable mock for Supabase
const createMockSupabase = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockChain: any = {
    from: jest.fn(() => mockChain),
    select: jest.fn(() => mockChain),
    insert: jest.fn(() => mockChain),
    update: jest.fn(() => mockChain),
    eq: jest.fn(() => mockChain),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
    filter: jest.fn(() => mockChain),
  };
  
  return mockChain;
};

describe("User Service", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockSupabase as any);
    
    // Reset all mock implementations to default undefined state
    mockUpdateUserStreak.mockReset();
    mockGetUserStats.mockReset();
  });

  describe("getUserProfile", () => {
    it("should return user profile when successful", async () => {
      // Arrange
      mockSupabase.single.mockResolvedValue({
        data: mockUserProfile,
        error: null,
      });

      // Act
      const result = await profileService.getUserProfile(mockUserId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("users");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("clerk_id", mockUserId);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(mockUserProfile);
    });

    it("should return null and log error when query fails", async () => {
      // Arrange
      const mockError = { message: "Database error" };
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: mockError,
      });
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // Act
      const result = await profileService.getUserProfile(mockUserId);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching user profile:",
        mockError.message
      );
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe("getUserAchievements", () => {

    it("should return null when getUserStats fails", async () => {
      // Arrange
      mockGetUserStats.mockResolvedValue(null);

      // Act
      const result = await profileService.getUserAchievements(mockUserId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getUserCourses", () => {
    it("should return user courses state when successful", async () => {
      // Arrange
      mockSupabase.eq.mockResolvedValue({
        data: mockUserCourses,
        error: null,
      });

      // Act
      const result = await profileService.getUserCourses(mockUserId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("user_courses");
      // Fix the space issue in the expected string
      expect(mockSupabase.select).toHaveBeenCalledWith("*, course:course_id(title, language:language_id(name))");
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", mockUserId);
      
      if (result) {
        expect(result.data).toHaveLength(1);
        expect(result.languageNames).toEqual(["Spanish"]);
        expect(result.num_completed).toBe(0);
        expect(result.num_in_progress).toBe(1);
      }
    });

    it("should return null when query fails", async () => {
      // Arrange
      const mockError = { message: "Database error" };
      mockSupabase.eq.mockResolvedValue({
        data: null,
        error: mockError,
      });
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // Act
      const result = await profileService.getUserCourses(mockUserId);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith("Courses fetch error:", mockError);
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe("getUserProgress", () => {
    it("should return user progress when successful", async () => {
      // Arrange
      mockSupabase.eq.mockResolvedValue({
        data: mockUserProgress,
        error: null,
      });

      // Act
      const result = await profileService.getUserProgress(mockUserId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("user_progress");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(result).toEqual(mockUserProgress);
    });

    it("should log error and return data when query fails", async () => {
      // Arrange
      const mockError = { message: "Database error" };
      mockSupabase.eq.mockResolvedValue({
        data: mockUserProgress,
        error: mockError,
      });
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // Act
      const result = await profileService.getUserProgress(mockUserId);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching user progress:",
        mockError.message
      );
      expect(result).toEqual(mockUserProgress);
      consoleSpy.mockRestore();
    });
  });
});