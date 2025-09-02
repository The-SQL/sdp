import { createClient } from "@/utils/supabase/client";

// Mock the Supabase client
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Import the actual module
import * as profileDb from "@/utils/db/profile";

// Define proper types for the mock Supabase client
type MockSupabase = {
  from: jest.Mock;
  select: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  maybeSingle: jest.Mock;
  insert: jest.Mock;
  upsert: jest.Mock;
  update: jest.Mock;
};

describe("Database Functions - Basic", () => {
  let mockSupabase: MockSupabase;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock Supabase client with proper method chaining
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    };

    // Handle method chaining for update
    (mockSupabase.update as jest.Mock).mockImplementation(() => ({
      eq: jest.fn().mockResolvedValue({ data: null, error: null })
    }));

    // Handle method chaining for insert
    (mockSupabase.insert as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: { current_streak: 1, longest_streak: 1 }, 
        error: null 
      })
    }));

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe("getUserProfile", () => {
    it("should return user profile when found", async () => {
      const mockProfile = {
        id: "1",
        clerk_id: "user-123",
        name: "Test User",
        email: "test@example.com",
      };

      mockSupabase.single.mockResolvedValue({ data: mockProfile, error: null });

      const result = await profileDb.getUserProfile("user-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("users");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("clerk_id", "user-123");
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });

    it("should handle errors gracefully", async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: { message: "Not found" } });

      const result = await profileDb.getUserProfile("user-123");

      expect(result).toBeNull();
    });
  });

  describe("getUserCourses", () => {
    it("should return user courses", async () => {
      const mockCourses = [
        {
          id: "1",
          course_id: "course-1",
          enrolled_at: "2023-01-01",
          completed_at: null,
          overall_progress: 50,
          course: {
            title: "Spanish for Beginners",
            language: {
              name: "Spanish"
            }
          }
        }
      ];

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnValue({ data: mockCourses, error: null })
      });

      const result = await profileDb.getUserCourses("user-123");

      expect(result).toEqual({
        data: [
          {
            id: "1",
            course_id: "course-1",
            enrolled_at: "2023-01-01",
            completed_at: null,
            overall_progress: 50,
            course_title: "Spanish for Beginners",
            course_cover: "",
          }
        ],
        languageNames: ["Spanish"],
        num_completed: 0,
        num_in_progress: 1
      });
    });

    it("should handle errors in getUserCourses", async () => {
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnValue({ data: null, error: { message: "Error" } })
      });

      const result = await profileDb.getUserCourses("user-123");

      expect(result).toBeNull();
    });
  });

  describe("getUserProgress", () => {
    it("should return user progress", async () => {
      const mockProgress = [
        { id: "1", user_id: "user-123", lesson_id: "lesson-1", status: "completed" }
      ];

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnValue({ data: mockProgress, error: null })
      });

      const result = await profileDb.getUserProgress("user-123");

      expect(result).toEqual(mockProgress);
    });

    it("should handle errors in getUserProgress", async () => {
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnValue({ data: null, error: { message: "Error" } })
      });

      const result = await profileDb.getUserProgress("user-123");

      expect(result).toBeNull();
    });
  });
});

// Separate describe block for functions that need different mocking
// describe("Database Functions - Advanced", () => {
//   let mockSupabase: any;

//   beforeEach(() => {
//     jest.clearAllMocks();
    
//     // Setup mock Supabase client with proper method chaining
//     mockSupabase = {
//       from: jest.fn().mockReturnThis(),
//       select: jest.fn().mockReturnThis(),
//       eq: jest.fn().mockReturnThis(),
//       single: jest.fn(),
//       maybeSingle: jest.fn(),
//       insert: jest.fn().mockReturnThis(),
//       upsert: jest.fn().mockReturnThis(),
//       update: jest.fn().mockReturnThis(),
//     };

//     (createClient as jest.Mock).mockReturnValue(mockSupabase);
//   });

//   // Test updateUserStreak with proper mocking
//   describe("updateUserStreak", () => {
//     it("should create new streak if none exists", async () => {
//       mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
      
//       // Mock the insert chain properly
//       mockSupabase.insert.mockImplementation(() => ({
//         select: jest.fn().mockReturnThis(),
//         single: jest.fn().mockResolvedValue({ 
//           data: { current_streak: 1, longest_streak: 1 }, 
//           error: null 
//         })
//       }));

//       const result = await profileDb.updateUserStreak("user-123");

//       expect(result).toEqual({ current_streak: 1, longest_streak: 1 });
//       expect(mockSupabase.insert).toHaveBeenCalled();
//     });

//     // it("should update existing streak when continuing streak", async () => {
//     //   const today = new Date();
//     //   const yesterday = new Date(today);
//     //   yesterday.setDate(yesterday.getDate() - 1);
      
//     //   mockSupabase.maybeSingle.mockResolvedValue({ 
//     //     data: { 
//     //       current_streak: 3, 
//     //       longest_streak: 5, 
//     //       updated_at: yesterday.toISOString() 
//     //     }, 
//     //     error: null 
//     //   });

//     //   // Mock the update chain
//     //   mockSupabase.update.mockImplementation(() => ({
//     //     eq: jest.fn().mockResolvedValue({ data: null, error: null })
//     //   }));

//     //   const result = await profileDb.updateUserStreak("user-123");

//     //   expect(result.current_streak).toBe(4);
//     //   expect(result.longest_streak).toBe(5);
//     //   expect(mockSupabase.update).toHaveBeenCalled();
//     // });

//     // it("should reset streak when broken", async () => {
//     //   const today = new Date();
//     //   const threeDaysAgo = new Date(today);
//     //   threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
//     //   mockSupabase.maybeSingle.mockResolvedValue({ 
//     //     data: { 
//     //       current_streak: 5, 
//     //       longest_streak: 5, 
//     //       updated_at: threeDaysAgo.toISOString() 
//     //     }, 
//     //     error: null 
//     //   });

//       // Mock the update chain
//       mockSupabase.update.mockImplementation(() => ({
//         eq: jest.fn().mockResolvedValue({ data: null, error: null })
//       }));

//       const result = await profileDb.updateUserStreak("user-123");

//       expect(result.current_streak).toBe(1);
//       expect(result.longest_streak).toBe(5);
//       expect(mockSupabase.update).toHaveBeenCalled();
//     });
//   });

//   // Test ensureUserInitialized
//   describe("ensureUserInitialized", () => {
//     // it("should create user streak if not exists", async () => {
//     //   mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
      
//     //   // Mock the insert chain
//     //   mockSupabase.insert.mockImplementation(() => ({
//     //     select: jest.fn().mockReturnThis(),
//     //     single: jest.fn().mockResolvedValue({ data: null, error: null })
//     //   }));

//     //   await profileDb.ensureUserInitialized("user-123");

//     //   expect(mockSupabase.insert).toHaveBeenCalled();
//     // });

//     it("should not create user streak if already exists", async () => {
//       mockSupabase.maybeSingle.mockResolvedValue({ 
//         data: { user_id: "user-123", current_streak: 3 }, 
//         error: null 
//       });

//       await profileDb.ensureUserInitialized("user-123");

//       expect(mockSupabase.insert).not.toHaveBeenCalled();
//     });
//   });
// });

// // Separate describe block for getUserStats and getUserAchievements with proper mocking
// describe("Database Functions - Complex", () => {
//   let mockSupabase: any;

//   beforeEach(() => {
//     jest.clearAllMocks();

//     // Setup mock Supabase client with method chaining
//     mockSupabase = {
//       from: jest.fn().mockReturnThis(),
//       select: jest.fn().mockReturnThis(),
//       eq: jest.fn().mockReturnThis(),
//       single: jest.fn(),
//       maybeSingle: jest.fn(),
//       insert: jest.fn().mockReturnThis(),
//       upsert: jest.fn().mockReturnThis(),
//       update: jest.fn().mockReturnThis(),
//     };

//     (createClient as jest.Mock).mockReturnValue(mockSupabase);
//   });

//   // ------------------ getUserStats tests ------------------
//   describe("getUserStats", () => {
//     it("should return user stats with all data available", async () => {
//       // Mock Supabase responses
//       mockSupabase.from.mockImplementation((table: string) => {
//         if (table === "user_progress") {
//           return {
//             select: jest.fn().mockReturnThis(),
//             eq: jest.fn().mockResolvedValue({
//               data: [
//                 { status: "completed" },
//                 { status: "completed" },
//                 { status: "in-progress" },
//               ],
//               error: null,
//             }),
//           };
//         }
//         if (table === "user_courses") {
//           return {
//             select: jest.fn().mockReturnThis(),
//             eq: jest.fn().mockResolvedValue({
//               data: [
//                 { completed_at: "2023-01-01", course: { language_id: "1" } },
//                 { completed_at: null, course: { language_id: "2" } },
//                 { completed_at: "2023-02-01", course: { language_id: "1" } },
//               ],
//               error: null,
//             }),
//           };
//         }
//         if (table === "quiz_attempts") {
//           return {
//             select: jest.fn().mockReturnThis(),
//             eq: jest.fn().mockResolvedValue({
//               data: [{ score: 60 }, { score: 40 }, { score: 80 }],
//               error: null,
//             }),
//           };
//         }
//         return mockSupabase;
//       });

//       const result = await profileDb.getUserStats("user-123");

//       expect(result).toEqual({
//         current_streak: 3,
//         longest_streak: 5,
//         total_lessons: 3,
//         total_points: 0,
//         lessons_completed: 2,
//         courses_completed: 2,
//         streak: 3,
//         languages_learned: 1,
//         quizzes_passed: 2,
//       });
//     });

//     it("should handle errors in individual queries gracefully", async () => {
//       // Simulate error in user_progress query
//       mockSupabase.from.mockImplementation((table: string) => {
//         if (table === "user_progress") {
//           return {
//             select: jest.fn().mockReturnThis(),
//             eq: jest.fn().mockResolvedValue({ data: null, error: { message: "Error" } }),
//           };
//         }
//         if (table === "user_courses") {
//           return {
//             select: jest.fn().mockReturnThis(),
//             eq: jest.fn().mockResolvedValue({ data: [{ completed_at: "2023-01-01", course: { language_id: "1" } }], error: null }),
//           };
//         }
//         if (table === "quiz_attempts") {
//           return {
//             select: jest.fn().mockReturnThis(),
//             eq: jest.fn().mockResolvedValue({ data: [{ score: 60 }], error: null }),
//           };
//         }
//         return mockSupabase;
//       });

//       const result = await profileDb.getUserStats("user-123");

//       expect(result).toEqual({
//         current_streak: 3,
//         longest_streak: 5,
//         total_lessons: 0,
//         total_points: 0,
//         lessons_completed: 0,
//         courses_completed: 1,
//         streak: 3,
//         languages_learned: 1,
//         quizzes_passed: 1,
//       });
//     });

//     it("should handle empty data responses", async () => {
//       mockSupabase.from.mockImplementation(() => ({
//         select: jest.fn().mockReturnThis(),
//         eq: jest.fn().mockResolvedValue({ data: [], error: null }),
//       }));

//       const result = await profileDb.getUserStats("user-123");

//       expect(result).toEqual({
//         current_streak: 3,
//         longest_streak: 5,
//         total_lessons: 0,
//         total_points: 0,
//         lessons_completed: 0,
//         courses_completed: 0,
//         streak: 3,
//         languages_learned: 0,
//         quizzes_passed: 0,
//       });
//     });
//   });

//   // ------------------ getUserAchievements tests ------------------
//   describe("getUserAchievements", () => {
//     beforeEach(() => {
//       // getUserStats is mocked via jest.mock override
//     });

//     it("should return user achievements with progress updates", async () => {
//       const mockAchievements = [
//         { id: "1", name: "First Lesson", description: "Complete your first lesson", type: "lesson_completed", requirement: { count: 1 } },
//       ];

//       const mockUserAchievements = [
//         { id: "1", user_id: "user-123", achievement_id: "1", progress: 1, earned: true, earned_at: "2023-01-01" },
//       ];

//       mockSupabase.from.mockImplementation((table: string) => {
//         if (table === "achievements") {
//           return { select: jest.fn().mockResolvedValue({ data: mockAchievements, error: null }) };
//         }
//         if (table === "user_achievements") {
//           return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: mockUserAchievements, error: null }) };
//         }
//         return mockSupabase;
//       });

//       mockSupabase.upsert.mockResolvedValue({ data: mockUserAchievements, error: null });

//       const result = await profileDb.getUserAchievements("user-123");

//       expect(result).toHaveLength(1);
//       expect(result![0]).toEqual({
//         id: "1",
//         name: "First Lesson",
//         description: "Complete your first lesson",
//         earned: true,
//         date: "Jan 1, 2023",
//         progress: 1,
//         goal: 1,
//       });
//     });

//     it("should handle errors when fetching achievements", async () => {
//       mockSupabase.from.mockImplementation((table: string) => {
//         if (table === "achievements") return { select: jest.fn().mockResolvedValue({ data: null, error: { message: "Error" } }) };
//         return mockSupabase;
//       });

//       const result = await profileDb.getUserAchievements("user-123");
//       expect(result).toBeNull();
//     });

//     it("should handle errors when fetching user achievements", async () => {
//       const mockAchievements = [{ id: "1", name: "First Lesson", description: "Complete your first lesson", type: "lesson_completed", requirement: { count: 1 } }];

//       mockSupabase.from.mockImplementation((table: string) => {
//         if (table === "achievements") return { select: jest.fn().mockResolvedValue({ data: mockAchievements, error: null }) };
//         if (table === "user_achievements") return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: null, error: { message: "Error" } }) };
//         return mockSupabase;
//       });

//       const result = await profileDb.getUserAchievements("user-123");
//       expect(result).toHaveLength(1);
//     });

//     it("should handle empty achievements list", async () => {
//       mockSupabase.from.mockImplementation((table: string) => {
//         if (table === "achievements") return { select: jest.fn().mockResolvedValue({ data: [], error: null }) };
//         if (table === "user_achievements") return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: [], error: null }) };
//         return mockSupabase;
//       });

//       const result = await profileDb.getUserAchievements("user-123");
//       expect(result).toEqual([]);
//     });
//   });
// });