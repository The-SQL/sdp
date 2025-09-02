export type Course = {
  id?: string;
  author_id: string;
  language_id: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_duration: string;
  learning_objectives: string;
  profile_url: string;
  is_public: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Language = {
  id: string;
  name: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type Unit = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at?: string;
};

export type Lesson = {
  id: string;
  unit_id: string;
  title: string;
  content_type: string;
  content:object;
  order_index: number;
  created_at?: string;
};

// --- Profile data stored in Supabase `users` table ---
export interface UserProfile {
  id: string;
  clerk_id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  nativeLanguage?: string;
  profile_url?: string;
  created_at?: string;
}

// --- Editable profile subset for UI form ---
export interface EditableProfile {
  name: string;
  email: string;
  bio: string;
  location: string;
  nativeLanguage: string;
}

// --- User streaks (from `user_streaks`) ---
export interface UserStats {
  current_streak: number;
  longest_streak: number;
  total_lessons?: number;
  total_points?: number;
  lessons_completed: number;
  courses_completed: number;
  streak: number; // map from current_streak
  languages_learned: number;
  quizzes_passed: number;
}

// --- Achievements (from `user_achievements`) ---
export interface UserAchievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  date?: string;
  progress?: number;
  goal?: number;
}

// --- Course progress entry (from `user_courses`) ---
export interface UserCourse {
  id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  overall_progress: number;
  course_title: string;
  course_cover: string;
}

// --- Courses state after transformation ---
export interface UserCoursesState {
  data: UserCourse[];
  languageNames: string[];
  num_completed: number;
  num_in_progress: number;
}

// --- Progress (from `user_progress`) ---
export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  updated_at: string;
}
