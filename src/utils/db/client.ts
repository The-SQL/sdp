import { createClient } from "@/utils/supabase/client";
import {
    Course,
    UserAchievement,
    UserCourse,
    UserCoursesState,
    UserProfile,
    UserProgress,
    UserStats,
    LearningGoal,
    FavCourse,
    SupabaseFavoriteRow,
} from "../types";
import { makeSupabaseMock } from "@/__mocks__/supabase";
import { create } from "domain";

export interface SupabaseCourseList {
  id: string;
  title: string;
  author_id: string;
  description: string | null;
  difficulty: string | null;
  estimated_duration: string | null;
  profile_url: string | null;
  is_public: boolean;
  is_published: boolean;
  languages: { name: string } | null;
  users: { name: string } | null;
  course_tags: Array<{ tags: { name: string } | null }>;
  course_feedback: Array<{ rating: number }>;
  user_courses: Array<{ id: string }>;
}

// Define interfaces for the transformed course data
interface AuthorStats {
  clerk_id: string;
  name: string;
  profile_url: string | null;
  bio: string | null;
  courses: { count: number } | null;
  students: { count: number } | null;
}

interface UnitWithLessons {
  id: string;
  title: string;
  order_index: number;
  lessons: Array<{
    id: string;
    title: string;
    content_type: string;
    order_index: number;
    duration: number;
  }>;
}

interface CourseFeedback {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
  users: { name: string; profile_url: string | null } | null;
}


interface CourseTagWithTag {
  tags: { name: string } | null;
}

interface CourseWithRelations {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  estimated_duration: string | null;
  profile_url: string | null;
  is_public: boolean;
  is_published: boolean;
  languages: { name: string } | null;
  users: { name: string } | null;
  course_feedback: Array<{ rating: number }>;
  user_courses: Array<{ id: string }>;
  course_tags: CourseTagWithTag[];
}

interface EnrolledLanguageData {
  courses: {
    language_id: string;
    languages: { name: string };
  } | null;
}

/**
 * Checks if a user exists in the database based on their Clerk ID
 * @param clerk_id - The Clerk user ID to check
 * @returns Boolean indicating if the user exists
 */
export async function checkUserExists(clerk_id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerk_id);

  if (error) {
    console.error("Error checking user existence:", error);
    throw error;
  }

  return data ? data.length > 0 : false;
}


/**
 * Uploads an image file to Supabase storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name
 * @param fileName - The name to give the uploaded file
 * @returns The public URL of the uploaded image
 */
export const uploadImageToSupabase = async (
  file: File,
  bucket: string,
  fileName: string
): Promise<string> => {
  const supabase = createClient();

  // Upload with upsert true to replace existing file if present
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    console.error("Error uploading image:", uploadError.message || uploadError);
    throw uploadError;
  }

  // getPublicUrl does not return an error object — only data with publicUrl
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return data.publicUrl;
};


/**
 * Fetches all public and published courses for the explore page
 * @returns Array of transformed course data with ratings and enrollment info
 */
export async function getAllCourses() {
  const supabase = createClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      languages(name),
      course_tags(
        tags(name)
      ),
      users(name),
      course_feedback(
        rating
      ),
      user_courses(
        id
      )
    `
    )
    .eq("is_public", true)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to fetch courses");
  }

  if(!courses) {
    return [];
  }

  const transformedCourses = (courses as SupabaseCourseList[]).map((course) => {
    const ratings = course.course_feedback?.map((fb) => fb.rating) || [];
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) /
          ratings.length
        : 0;

    const reviewCount = ratings.length;
    const enrolledStudents = course.user_courses?.length || 0;

    return {
      id: course.id,
      title: course.title,
      level: course.difficulty || "Beginner",
      language: course.languages?.name || "Unknown",
      image: course.profile_url || "/placeholder.svg",
      duration: course.estimated_duration || "Unknown",
      students: enrolledStudents,
      rating: averageRating,
      reviews: reviewCount || "No reviews yet",
      author: course.users?.name || "Unknown Author",
      description: course.description || "No description available",
      tags: course.course_tags
        ?.map((ct) => ct.tags?.name)
        .filter((name): name is string => name != null) || ["Language"],
      isRecommended: Math.random() > 0.5,
      price: "Free",
      isPublic: course.is_public || false,
      isPublished: course.is_published || false,
    };
  });

  return transformedCourses;
}

/**
 * Fetches detailed information about a specific course by ID
 * @param id - The course ID to fetch
 * @returns Detailed course information including author stats, reviews, and curriculum
 */
export async function getCourseById(id: string) {
  const supabase = createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      languages(name),
      users!courses_author_id_fkey(
        clerk_id,
        name, 
        profile_url, 
        bio,
        courses:courses!courses_author_id_fkey(count),
        students:user_courses(count)
      ),
      course_tags(
        tags(name)
      ),
      course_feedback(
        id,
        rating,
        comment,
        created_at,
        users(name, profile_url)
      ),
      user_courses(
        id
      ),
      units(
        id,
        title,
        order_index,
        lessons(
          id,
          title,
          content_type,
          order_index,
          duration
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !course) {
    console.error("Supabase error:", error);
    throw new Error("Failed to fetch course");
  }

  const supabaseCourse = course as {
    id: string;
    title: string;
    description: string | null;
    difficulty: string | null;
    estimated_duration: string | null;
    learning_objectives: string | null;
    open_to_collab: boolean | null;
    author_id: string | null;
    profile_url: string | null;
    is_public: boolean;
    is_published: boolean;
    updated_at: string | null;
    languages: { name: string } | null;
    users: AuthorStats | null;
    course_tags: Array<{ tags: { name: string } | null }>;
    course_feedback: CourseFeedback[];
    user_courses: Array<{ id: string }>;
    units: UnitWithLessons[];
  };

  const authorId = supabaseCourse.users?.clerk_id;
  let authorCoursesCount = 0;
  let authorStudentsCount = 0;

  if (authorId) {
    const { count: publishedCoursesCount, error: coursesError } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("author_id", authorId)
      .eq("is_published", true)
      .eq("is_public", true);

    if (!coursesError) {
      authorCoursesCount = publishedCoursesCount || 0;
    }

    const { data: authorCourses, error: authorCoursesError } = await supabase
      .from("courses")
      .select(
        `
        id,
        user_courses(count)
      `
      )
      .eq("author_id", authorId)
      .eq("is_published", true)
      .eq("is_public", true);

    if (!authorCoursesError && authorCourses) {
      authorStudentsCount = authorCourses.reduce(
        (total: number, course: { user_courses: Array<{ count: number }> }) => {
          return total + (course.user_courses?.[0]?.count || 0);
        },
        0
      );
    }
  }

  const ratings =
    supabaseCourse.course_feedback?.map((fb: CourseFeedback) => fb.rating) ||
    [];
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) /
        ratings.length
      : 0;

  const reviewCount = ratings.length;
  const enrolledStudents = supabaseCourse.user_courses?.length || 0;
  const tags = supabaseCourse.course_tags
    ?.map((ct: { tags: { name: string } | null }) => ct.tags?.name)
    .filter((name): name is string => name != null) || ["Language"];

  // Ensure units and lessons are ordered by their order_index
  if (Array.isArray(supabaseCourse.units)) {
    supabaseCourse.units.sort((a, b) =>
      (Number(a.order_index) || 0) - (Number(b.order_index) || 0)
    );

    supabaseCourse.units.forEach((unit: UnitWithLessons) => {
      if (Array.isArray(unit.lessons)) {
        unit.lessons.sort((a, b) =>
          (Number(a.order_index) || 0) - (Number(b.order_index) || 0)
        );
      }
    });
  }

  const chapters = supabaseCourse.units.map((unit: UnitWithLessons) => {
    const lessons_detail = unit.lessons.map(
      (lesson: { title: string; duration: number; content_type: string }) => ({
        title: lesson.title,
        duration: `${lesson.duration} min`,
        type: lesson.content_type,
      })
    );

    const totalMin = lessons_detail.reduce(
      (sum: number, l: { duration: string }) =>
        sum + (parseInt(l.duration) || 0),
      0
    );

    return {
      id: unit.id,
      title: unit.title,
      lessons: lessons_detail.length,
      duration: `${totalMin} min`,
      completed: false,
      lessons_detail,
    };
  });

  const totalLessons = chapters.reduce(
    (acc: number, ch: { lessons: number }) => acc + ch.lessons,
    0
  );

  const reviews_list = supabaseCourse.course_feedback.map(
    (fb: CourseFeedback) => ({
      id: fb.id,
      user: fb.users?.name || "Anonymous",
      avatar: fb.users?.profile_url || "/placeholder.png",
      rating: fb.rating,
      date: fb.created_at?.split("T")[0] || "Unknown",
      comment: fb.comment || "",
    })
  );

  const transformedCourse = {
    id: supabaseCourse.id,
    title: supabaseCourse.title,
    author_id: supabaseCourse.author_id || "Unknown",
    open_to_collab: supabaseCourse.open_to_collab || false,
    subtitle: `Master the fundamentals of ${supabaseCourse.languages?.name || "the"} language`,
    description: supabaseCourse.description || "No description available",
    image: supabaseCourse.profile_url || "/placeholder.svg",
    author: {
      name: supabaseCourse.users?.name || "Unknown Author",
      avatar: supabaseCourse.users?.profile_url || "/placeholder.",
      bio: supabaseCourse.users?.bio || "Experienced instructor",
      rating: 4.9,
      students: authorStudentsCount,
      courses_count: authorCoursesCount,
    },
    level: supabaseCourse.difficulty || "Beginner",
    language: supabaseCourse.languages?.name || "Unknown",
    duration: supabaseCourse.estimated_duration || "Unknown",
    totalLessons,
    students: enrolledStudents,
    rating: averageRating,
    reviews: reviewCount,
    lastUpdated: supabaseCourse.updated_at?.split("T")[0] || "Unknown",
    tags,
    price: "Free",
    whatYouWillLearn: supabaseCourse.learning_objectives
      ? supabaseCourse.learning_objectives
          .split("\n")
          .map((l: string) => l.trim())
          .filter(Boolean)
      : ["Basics of the language", "Essential vocabulary", "Basic grammar"],
    requirements: [
      `No prior ${supabaseCourse.languages?.name || "language"} knowledge required`,
      "Dedication to practice 30 minutes daily",
      "Access to audio playback for pronunciation",
    ],
    chapters,
    reviews_list,
    isPublic: supabaseCourse.is_public || false,
    isPublished: supabaseCourse.is_published || false,
  };

  return transformedCourse;
}

/**
 * Fetches a limited number of recommended courses (public and published)
 * @returns Array of recommended courses with transformed data
 */
export async function getRecommendedCourses() {
  const supabase = createClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      languages(name),
      users(name),
      course_feedback(
        rating
      ),
      user_courses(
        id
      )
    `
    )
    .eq("is_public", true)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to fetch recommended courses");
  }

  if(!courses) {
    return [];
  }

  const transformedCourses = (courses as SupabaseCourseList[]).map((course) => {
    const ratings = course.course_feedback?.map((fb) => fb.rating) || [];
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) /
          ratings.length
        : 4.5;

    const reviewCount = ratings.length;
    const enrolledStudents = course.user_courses?.length || 0;

    return {
      id: course.id,
      title: course.title,
      level: course.difficulty || "Beginner",
      language: course.languages?.name || "Unknown",
      image: course.profile_url || "/placeholder.svg",
      duration: course.estimated_duration || "6 weeks",
      students: enrolledStudents,
      rating: averageRating,
      reviews: reviewCount,
      author: course.users?.name || "Unknown Author",
      description: course.description || "No description available",
      tags: ["Language"],
      isRecommended: true,
      price: "Free",
      isPublic: course.is_public || false,
      isPublished: course.is_published || false,
    };
  });

  return transformedCourses;
}

/**
 * Checks if a course is favorited by a specific user
 * @param courseId - The course ID to check
 * @param userId - The user ID to check against
 * @returns Boolean indicating if the course is favorited by the user
 */
export async function checkIfFavorited(
  courseId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_favorite_courses")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking favorite:", error);
    return false;
  }

  return !!data;
}

/**
 * Adds a course to a user's favorites
 * @param courseId - The course ID to add to favorites
 * @param userId - The user ID who is favoriting the course
 */
export async function addToFavorites(
  courseId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("user_favorite_courses")
    .insert([{ user_id: userId, course_id: courseId }]);

  if (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
}

/**
 * Removes a course from a user's favorites
 * @param courseId - The course ID to remove from favorites
 * @param userId - The user ID who is unfavoriting the course
 */
export async function removeFromFavorites(
  courseId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("user_favorite_courses")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
}

export async function getFavorites(userId: string): Promise<FavCourse[]>{
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_favorite_courses')
    .select('courses(title, difficulty, author:author_id(name))')
    .eq('user_id', userId)
  if(error){
    console.error('Error fetching favorites:', error.message);
    return [];
  }
  console.log("Favorite courses raw:", data);

  return (data as unknown as SupabaseFavoriteRow[]).map((row) => ({
    title: row.courses?.title ?? 'Untitled',
    difficulty: row.courses?.difficulty ?? 'Unknown',
    author: row.courses?.author?.name ?? 'Unknown Author',
  }));
}

/**
 * Checks if a user is enrolled in a specific course
 * @param courseId - The course ID to check
 * @param userId - The user ID to check against
 * @returns Boolean indicating if the user is enrolled in the course
 */
export async function checkIfEnrolled(
  courseId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_courses")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking enrollment:", error);
    return false;
  }

  return !!data;
}

/**
 * Enrolls a user in a specific course
 * @param courseId - The course ID to enroll in
 * @param userId - The user ID to enroll in the course
 */
export async function enrollInCourse(
  courseId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("user_courses")
    .insert([{ user_id: userId, course_id: courseId }]);

  if (error) {
    console.error("Error enrolling in course:", error);
    throw error;
  }
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error.message);
    return null;
  }

  return data;
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user stats:", error.message);
    return null;
  }

  return data;
}

export async function getUserAchievements(
  userId: string
): Promise<UserAchievement[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user achievements:", error.message);
    return null;
  }

  return data;
}

export async function getUserProgress(
  userId: string
): Promise<UserProgress[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user progress:", error.message);
    return null;
  }

  return data;
}

export async function getUserCourses(
  userId: string
): Promise<UserCoursesState | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_courses")
    .select(
      `
        *,
        course:course_id (
          title,
          language:language_id (name),
          profile_url
        )
      `
    )
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Courses fetch error:", error);
    return null;
  }

  const userCourses: UserCourse[] = data.map((c) => ({
    id: c.id,
    course_id: c.course_id,
    enrolled_at: c.enrolled_at,
    completed_at: c.completed_at,
    overall_progress: c.overall_progress,
    course_title: c.course.title,
    course_cover: c.course.profile_url || "/placeholder.svg",
  }));

  const languageNames = [...new Set(data.map((c) => c.course.language.name))];
  const num_completed = userCourses.filter(
    (c) => c.completed_at !== null
  ).length;
  const num_in_progress = userCourses.filter(
    (c) => c.completed_at === null
  ).length;

  return {
    data: userCourses,
    languageNames,
    num_completed,
    num_in_progress,
  };
}

//Adding new learning goal to database

export async function addLearningGoal(description: string, targetDate: Date, user_id: string): Promise<LearningGoal | null>{
  const supabase = createClient()
  const { data, error } = await supabase
    .from('learning_goals')
    .insert([{ description, target_date: targetDate, user_id }])
    .select()
    .single()
  
  if(error){
    console.error('Error adding learning goal:', error.message);
    return null;
  }

  return data as LearningGoal;
}

export async function getLearningGoals(userId: string): Promise<LearningGoal[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('learning_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
    if(error){
      console.error('Fetch error:', error.message);
      return [];
    }

    return data ?? [];
}

export async function completeLearningGoal(userId: string, description: string){
  const supabase = createClient();

  const { data, error } = await supabase
    .from('learning_goals')
    .update({completed : true})
    .eq('user_id', userId)
    .eq('description', description)

    if(error){
      console.error('Can not update learning goal:', error.message);
      throw error;
    }

    return data;
}

export async function getCoursesByAuthor(
  authorId: string
): Promise<Course[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("author_id", authorId);

  if (error) {
    console.error("Error fetching courses by author:", error.message);
    return null;
  }

  return data;
}

export async function getPersonalizedRecommendedCourses(
  userId: string
): Promise<SupabaseCourseList[]> {
  const supabase = createClient();

  try {
    // Get user's enrolled courses and their tags
    const { data: userCourses } = await supabase
      .from("user_courses")
      .select("course_id")
      .eq("user_id", userId);

    const { data: favoriteCourses } = await supabase
      .from("user_favorite_courses")
      .select("course_id")
      .eq("user_id", userId);

    // Get tags from user's enrolled courses
    const enrolledCourseIds = userCourses?.map((uc) => uc.course_id) || [];
    const favoriteCourseIds = favoriteCourses?.map((fc) => fc.course_id) || [];

    let userTags: string[] = [];

    if (enrolledCourseIds.length > 0) {
      const { data: enrolledCourseTags } = await supabase
        .from("course_tags")
        .select("tags(name)")
        .in("course_id", enrolledCourseIds);

      userTags =
        (enrolledCourseTags as CourseTagWithTag[] | null)
          ?.map((ct: CourseTagWithTag) => ct.tags?.name)
          .filter((name: string | undefined): name is string => name != null) ||
        [];
    }

    // Get all public, published courses that user is NOT enrolled in
    const { data: allCourses, error } = await supabase
      .from("courses")
      .select(
        `
        *,
        languages(name),
        users(name),
        course_feedback(rating),
        user_courses(id),
        course_tags(tags(name))
      `
      )
      .eq("is_public", true)
      .eq("is_published", true)
      .not(
        "id",
        "in",
        `(${enrolledCourseIds.length > 0 ? enrolledCourseIds.join(",") : "00000000-0000-0000-0000-000000000000"})`
      );

    if (error) throw error;

    // If no courses found (user enrolled in everything), return empty array
    if (!allCourses || allCourses.length === 0) {
      return [];
    }

    // Score courses based on relevance
    const scoredCourses = await Promise.all(
      (allCourses || []).map(
        async (
          course
        ): Promise<{ course: SupabaseCourseList; score: number }> => {
          const courseData = course as unknown as CourseWithRelations;
          let score = 0;

          // Calculate tag similarity (only if user has enrolled courses)
          if (enrolledCourseIds.length > 0) {
            const courseTags = courseData.course_tags
              .map((ct: CourseTagWithTag) => ct.tags?.name)
              .filter(
                (name: string | undefined): name is string => name != null
              );

            const tagMatches = courseTags.filter((tag: string) =>
              userTags.some(
                (userTag: string) =>
                  userTag.toLowerCase().includes(tag.toLowerCase()) ||
                  tag.toLowerCase().includes(userTag.toLowerCase())
              )
            ).length;

            score += tagMatches * 3;
          }

          // Boost if similar to favorited courses (but not enrolled)
          if (favoriteCourseIds.includes(courseData.id)) {
            score += 5;
          }

          // Check if user is learning this language (from enrolled courses)
          if (courseData.languages?.name && enrolledCourseIds.length > 0) {
            const { data: enrolledLanguages } = await supabase
              .from("user_courses")
              .select("courses!inner(language_id, languages!inner(name))")
              .eq("user_id", userId);

            const userLanguages =
              (enrolledLanguages as EnrolledLanguageData[] | null)
                ?.map((el: EnrolledLanguageData) => el.courses?.languages.name)
                .filter(
                  (name: string | undefined): name is string => name != null
                ) || [];

            if (userLanguages.includes(courseData.languages.name)) {
              score += 2;
            }
          }

          // Consider course rating and popularity
          const ratings = courseData.course_feedback.map(
            (fb: { rating: number }) => fb.rating
          );
          const averageRating =
            ratings.length > 0
              ? ratings.reduce(
                  (sum: number, rating: number) => sum + rating,
                  0
                ) / ratings.length
              : 0;

          score += averageRating * 0.5;
          score += (courseData.user_courses?.length || 0) * 0.1;

          return { course: course as unknown as SupabaseCourseList, score };
        }
      )
    );

    // Sort by score and return top 3
    return scoredCourses
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.course);
  } catch (error) {
    console.error("Error generating personalized recommendations:", error);
    // Fallback to general recommended courses (excluding enrolled ones)
    const fallback = await getRecommendedCourses();
    return fallback as unknown as SupabaseCourseList[];
  }
}

/**
 * Gets all favorited course IDs for a user
 * @param userId - The user ID to check
 * @returns Array of favorited course IDs
 */
export async function getUserFavoriteCourseIds(
  userId: string
): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_favorite_courses")
    .select("course_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user favorites:", error);
    return [];
  }

  if(!data) {
    return [];
  }
  
  return data.map((item) => item.course_id);
}
