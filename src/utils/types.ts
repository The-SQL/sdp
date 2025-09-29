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
  open_to_collab: boolean;
  language_name?: string; // optional, for easier access to language name
};

 export type Notification = {
  id: string;
  user_id: string;
  message: string;
  metadata?: Record<string,string>;
  is_read: boolean;
  created_at: string;
}

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

export type LessonContent =
  | { url?: string; notes?: string; fileName?: string }
  | { body?: string }
  | { url?: string; transcript?: string; fileName?: string }
  | {
      exerciseType: "quiz";
      question: string;
      options: string[];
      correct: number;
    }
  | {
      exerciseType: "fill-blank";
      sentence: string;
      blankIndex: number | null;
    };

export type Lesson = {
  id: string;
  unit_id: string;
  title: string;
  content_type: "video" | "text" | "audio" | "exercise";
  content: LessonContent;
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

/*
// --- Progress (from `user_progress`) ---
export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  updated_at: string;
}
  */

export interface UserProgress {
  lesson_id: string;
  status: "not_started" | "in_progress" | "completed";
  last_accessed?: string;
  score?: number;
}

export interface ForumCategory {
  name: string;
  description: string;
  posts: number;
  lastPost: string;
  icon: string;
  color: string;
  participants: number;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category: string;
  language: string;
  tags: string[];
  view_count: number;
  like_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_hot: boolean;
  last_reply_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ForumPostWithAuthor extends ForumPost {
  author: {
    clerk_id: string;
    name: string;
    profile_url: string;
    created_at: Date
  };
  replies_count: number;
  likes_count: number;
}

export interface ForumReply {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  like_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ForumReplyWithAuthor extends ForumReply {
  author: {
    clerk_id: string;
    name: string;
    profile_url: string;
  };
}

export interface ForumPostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: Date;
}

export interface ForumReplyLike {
  id: string;
  reply_id: string;
  user_id: string;
  created_at: Date;
}

export interface User {
  clerk_id: string;
  email: string;
  name: string;
  profile_url: string;
  bio: string;
  created_at: Date;
}

export interface PaginationInfo {
  currentPage: number;
  hasMore: boolean;
  totalCount?: number;
}

export interface PostsFilter {
  searchQuery?: string;
  category?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}
export type CollaboratorStatus =
  | "pending"
  | "active"
  | "rejected"
  | "cancelled";

export type Collaborators = {
  id?: string;
  course_id: string;
  user_id: string;
  status: CollaboratorStatus;
  created_at?: string;
};

export type SuggestedChangeStatus = "pending" | "approved" | "rejected";
export type SuggestedChangePayload = {
  course: Course;
  units: Unit[];
  lessons: Lesson[];
};
export type SuggestedChange = {
  id?: string;
  collaborator_id: string;
  course_id: string;
  summary: string;
  payload: SuggestedChangePayload;
  status: SuggestedChangeStatus;
  created_at?: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
};
