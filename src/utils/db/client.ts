import { createClient } from "@/utils/supabase/client";
import { Course } from "../types";

// Define interfaces for the Supabase response data
interface SupabaseCourse {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  estimated_duration: string | null;
  learning_objectives: string | null;
  profile_url: string | null;
  updated_at: string | null;
  languages: { name: string } | null;
  users: { name: string; profile_url: string | null; bio: string | null } | null;
  course_tags: Array<{ tags: { name: string } | null }>;
  course_feedback: Array<{
    id: string;
    rating: number;
    comment: string | null;
    created_at: string | null;
    users: { name: string; profile_url: string | null } | null;
  }>;
  user_courses: Array<{ id: string }>;
  units: Array<{
    id: string;
    title: string;
    order_index: number;
    lessons: Array<{
      id: string;
      title: string;
      content_type: string;
      order_index: number;
    }>;
  }>;
}

interface SupabaseCourseList {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  estimated_duration: string | null;
  profile_url: string | null;
  languages: { name: string } | null;
  users: { name: string } | null;
  course_tags: Array<{ tags: { name: string } | null }>;
  course_feedback: Array<{ rating: number }>;
  user_courses: Array<{ id: string }>;
}

// Existing functions remain the same
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

  return data.length > 0;
}

export async function insertCourse(course: Course): Promise<Course> {
  const supabase = createClient();

  console.log("Inserting course:", course);

  const { data, error } = await supabase
    .from("courses")
    .insert([course])
    .select();

  if (error) {
    console.error("Error inserting course:", error);
    throw error;
  }

  return data[0];
}

export async function updateCourse(
  courseId: string,
  updates: Partial<Course>
): Promise<Course> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", courseId)
    .select();

  if (error) {
    console.error("Error updating course:", error);
    throw error;
  }

  return data[0];
}

export const uploadImageToSupabase = async (
  file: File,
  bucket: string,
  fileName: string
): Promise<string> => {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).upload(fileName, file);
  if (error) {
    console.error("Error uploading image:", error.message);
    throw error;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
};

// NEW: Function to get all courses on explore courses page
export async function getAllCourses() {
  const supabase = createClient();

  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
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
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch courses');
  }

  // Transform the data with real ratings and enrollment numbers on explore courses page
  const transformedCourses = (courses as SupabaseCourseList[]).map(course => {
    const ratings = course.course_feedback?.map(fb => fb.rating) || [];
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
      : 0;
    
    const reviewCount = ratings.length;
    const enrolledStudents = course.user_courses?.length || 0;

    return {
      id: course.id,
      title: course.title,
      level: course.difficulty || 'Beginner',
      language: course.languages?.name || 'Unknown',
      image: course.profile_url || '/placeholder.svg',
      duration: course.estimated_duration || 'Unknown',
      students: enrolledStudents,
      rating: averageRating,
      reviews: reviewCount || "Be the first to review",
      author: course.users?.name || 'Unknown Author',
      description: course.description || 'No description available',
      tags: course.course_tags?.map(ct => ct.tags?.name).filter((name): name is string => name !== null) || ['Language'],
      isRecommended: Math.random() > 0.5,
      price: "Free"
    };
  });

  return transformedCourses;
}

// NEW: Function to get a single course by ID to view a course's details page
export async function getCourseById(id: string) {
  const supabase = createClient();

  function getDuration(type: string): string {
    switch (type) {
      case 'video': return '15 min';
      case 'audio': return '10 min';
      case 'text': return '10 min';
      case 'exercise': return '20 min';
      default: return '15 min';
    }
  }

  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      difficulty,
      estimated_duration,
      learning_objectives,
      profile_url,
      updated_at,
      languages(name),
      users!courses_author_id_fkey(name, profile_url, bio),
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
          order_index
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !course) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch course');
  }

  const supabaseCourse = course as unknown as SupabaseCourse;

  // Transform single course data to view a course's details page
  const ratings = supabaseCourse.course_feedback?.map(fb => fb.rating) || [];
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length : 0;
  
  const reviewCount = ratings.length;
  const enrolledStudents = supabaseCourse.user_courses?.length || 0;
  const tags = supabaseCourse.course_tags?.map(ct => ct.tags?.name).filter((name): name is string => name !== null) || ['Language'];

  const chapters = supabaseCourse.units.map(unit => {
    const lessons_detail = unit.lessons.map(lesson => ({
      title: lesson.title,
      duration: getDuration(lesson.content_type),
      type: lesson.content_type,
    }));

    const totalMin = lessons_detail.reduce((sum: number, l: { duration: string }) => sum + (parseInt(l.duration) || 0), 0);
    return {
      id: unit.id,
      title: unit.title,
      lessons: lessons_detail.length,
      duration: `${totalMin} min`,
      completed: false,
      lessons_detail,
    };
  });

  const totalLessons = chapters.reduce((acc: number, ch: { lessons: number }) => acc + ch.lessons, 0);

  const reviews_list = supabaseCourse.course_feedback.map(fb => ({
    id: fb.id,
    user: fb.users?.name || 'Anonymous',
    avatar: fb.users?.profile_url || '/placeholder.svg',
    rating: fb.rating,
    date: fb.created_at?.split('T')[0] || 'Unknown',
    comment: fb.comment || '',
  }));

  const transformedCourse = {
    id: supabaseCourse.id,
    title: supabaseCourse.title,
    subtitle: `Master the fundamentals of ${supabaseCourse.languages?.name || 'the'} language`,
    description: supabaseCourse.description || 'No description available',
    image: supabaseCourse.profile_url || '/placeholder.svg',
    author: {
      name: supabaseCourse.users?.name || 'Unknown Author',
      avatar: supabaseCourse.users?.profile_url || '/placeholder.svg',
      bio: supabaseCourse.users?.bio || 'Experienced instructor',
      rating: 4.9,
      students: 15000,
    },
    level: supabaseCourse.difficulty || 'Beginner',
    language: supabaseCourse.languages?.name || 'Unknown',
    duration: supabaseCourse.estimated_duration || 'Unknown',
    totalLessons,
    students: enrolledStudents,
    rating: averageRating,
    reviews: reviewCount,
    lastUpdated: supabaseCourse.updated_at?.split('T')[0] || 'Unknown',
    tags,
    price: "Free",
    whatYouWillLearn: supabaseCourse.learning_objectives 
      ? supabaseCourse.learning_objectives.split('\n').map(l => l.trim()).filter(Boolean)
      : ['Basics of the language', 'Essential vocabulary', 'Basic grammar'],
    requirements: [
      `No prior ${supabaseCourse.languages?.name || 'language'} knowledge required`,
      'Dedication to practice 30 minutes daily',
      'Access to audio playback for pronunciation',
    ],
    chapters,
    reviews_list,
  };

  return transformedCourse;
}

// NEW: Function to get recommended courses
export async function getRecommendedCourses() {

  const supabase = createClient();

  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      *,
      languages(name),
      users(name),
      course_feedback(
        rating
      ),
      user_courses(
        id
      )
    `)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch recommended courses');
  }

  const transformedCourses = (courses as SupabaseCourseList[]).map(course => {
    const ratings = course.course_feedback?.map(fb => fb.rating) || [];
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
      : 4.5;
    
    const reviewCount = ratings.length;
    const enrolledStudents = course.user_courses?.length || 0;

    return {
      id: course.id,
      title: course.title,
      level: course.difficulty || 'Beginner',
      language: course.languages?.name || 'Unknown',
      image: course.profile_url || '/placeholder.svg',
      duration: course.estimated_duration || '6 weeks',
      students: enrolledStudents,
      rating: averageRating,
      reviews: reviewCount,
      author: course.users?.name || 'Unknown Author',
      description: course.description || 'No description available',
      tags: ['Language'],
      isRecommended: true,
      price: "Free"
    };
  });

  return transformedCourses;
}


// Check if a course is favorited by the current user
export async function checkIfFavorited(courseId: string, userId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_favorite_courses')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
    console.error('Error checking favorite:', error);
    return false;
  }

  return !!data;
}

// Add course to favorites
export async function addToFavorites(courseId: string, userId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_favorite_courses')
    .insert([{ user_id: userId, course_id: courseId }]);

  if (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
}

// Remove course from favorites
export async function removeFromFavorites(courseId: string, userId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_favorite_courses')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
}