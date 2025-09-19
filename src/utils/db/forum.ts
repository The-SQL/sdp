import { createClient } from "@/utils/supabase/client";
import {
  ForumPost,
  ForumPostWithAuthor,
  ForumReply,
  ForumReplyWithAuthor,
  ForumPostLike,
  ForumReplyLike,
  PostsFilter,
  PaginationInfo,
} from "../types";

const POSTS_PER_PAGE = 10;

// Fetch posts based on filters
export const fetchPosts = async (
  filters: PostsFilter
): Promise<{ posts: ForumPostWithAuthor[]; pagination: PaginationInfo }> => {
  try {
    const supabase = createClient();
    const {
      searchQuery = "",
      category = "all",
      tags = [],
      page = 1,
      limit = POSTS_PER_PAGE,
    } = filters;

    let query = supabase
      .from("forum_posts")
      .select(
        `
        *,
        author:users(clerk_id, name, profile_url),
        replies:forum_replies(count),
        likes:forum_post_likes(count)
      `
      )
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply search filter
    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
      );
    }

    // Apply category filter
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Apply tags filter
    if (tags.length > 0) {
      query = query.contains("tags", tags);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }

    const formattedPosts = (posts || []).map((post) => ({
      ...post,
      replies_count: post.replies?.[0]?.count || 0,
      likes_count: post.likes?.[0]?.count || 0,
    }));

    return {
      posts: formattedPosts,
      pagination: {
        currentPage: page,
        hasMore: (posts?.length || 0) === limit,
        totalCount: count || 0,
      },
    };
  } catch (error) {
    console.error("Error in fetchPosts:", error);
    throw error;
  }
};

// Fetch posts based on user's interests (course tags)
export const fetchPostsByUserInterests = async (
  userId: string,
  page = 1,
  limit = POSTS_PER_PAGE
): Promise<{ posts: ForumPostWithAuthor[]; pagination: PaginationInfo }> => {
  try {
    const supabase = createClient();
    // Get user's enrolled courses
    const { data: userCourses, error: userCoursesError } = await supabase
      .from("user_courses")
      .select("course_id")
      .eq("user_id", userId);

    if (userCoursesError) {
      console.error("Error fetching user courses:", userCoursesError);
      throw userCoursesError;
    }

    const courseIds = userCourses?.map((course) => course.course_id) || [];

    // If user has no courses, return general posts
    if (courseIds.length === 0) {
      return fetchPosts({ page, limit });
    }

    // Get tags from user's courses
    const { data: courseTags, error: courseTagsError } = await supabase
      .from("course_tags")
      .select("tag_id")
      .in("course_id", courseIds);

    if (courseTagsError) {
      console.error("Error fetching course tags:", courseTagsError);
      throw courseTagsError;
    }

    const tagIds = courseTags?.map((tag) => tag.tag_id) || [];

    // Get tag names
    const { data: tags, error: tagsError } = await supabase
      .from("tags")
      .select("name")
      .in("id", tagIds);

    if (tagsError) {
      console.error("Error fetching tags:", tagsError);
      throw tagsError;
    }

    const tagNames = tags?.map((tag) => tag.name) || [];

    // Fetch posts with matching tags
    return fetchPosts({
      tags: tagNames.length > 0 ? tagNames : ["general"],
      page,
      limit,
    });
  } catch (error) {
    console.error("Error in fetchPostsByUserInterests:", error);
    throw error;
  }
};

// Create a new post
export const createPost = async (postData: {
  title: string;
  content: string;
  author_id: string;
  category: string;
  language: string;
  tags: string[];
}): Promise<ForumPost> => {
  try {
    const supabase = createClient();
    const { data: post, error } = await supabase
      .from("forum_posts")
      .insert([
        {
          ...postData,
          view_count: 0,
          like_count: 0,
          reply_count: 0,
          is_pinned: false,
          is_locked: false,
          is_hot: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      throw error;
    }

    return post;
  } catch (error) {
    console.error("Error in createPost:", error);
    throw error;
  }
};

// Get a single post by ID
export const getPost = async (postId: string): Promise<ForumPostWithAuthor> => {
  try {
    const supabase = createClient();
    // First, increment view count
    await supabase.rpc("increment_post_view_count", { post_id: postId });

    // Then get the post with author info
    const { data: post, error } = await supabase
      .from("forum_posts")
      .select(
        `
        *,
        author:users(clerk_id, name, profile_url),
        replies:forum_replies(count),
        likes:forum_post_likes(count)
      `
      )
      .eq("id", postId)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      throw error;
    }

    return {
      ...post,
      replies_count: post.replies?.[0]?.count || 0,
      likes_count: post.likes?.[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error in getPost:", error);
    throw error;
  }
};

// Get replies for a post
export const getPostReplies = async (
  postId: string,
  page = 1,
  limit = 20
): Promise<{ replies: ForumReplyWithAuthor[]; pagination: PaginationInfo }> => {
  try {
    const supabase = createClient();
    const {
      data: replies,
      error,
      count,
    } = await supabase
      .from("forum_replies")
      .select(
        `
        *,
        author:users(clerk_id, name, profile_url)
      `,
        { count: "exact" }
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("Error fetching replies:", error);
      throw error;
    }

    return {
      replies: replies || [],
      pagination: {
        currentPage: page,
        hasMore: (replies?.length || 0) === limit,
        totalCount: count || 0,
      },
    };
  } catch (error) {
    console.error("Error in getPostReplies:", error);
    throw error;
  }
};

// Create a reply to a post
export const createReply = async (replyData: {
  post_id: string;
  author_id: string;
  content: string;
}): Promise<ForumReply> => {
  try {
    const supabase = createClient();
    const { data: reply, error } = await supabase
      .from("forum_replies")
      .insert([replyData])
      .select()
      .single();

    if (error) {
      console.error("Error creating reply:", error);
      throw error;
    }

    return reply;
  } catch (error) {
    console.error("Error in createReply:", error);
    throw error;
  }
};

// Like a post
export const likePost = async (
  postId: string,
  userId: string
): Promise<void> => {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("forum_post_likes")
      .insert([{ post_id: postId, user_id: userId }]);

    if (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in likePost:", error);
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (
  postId: string,
  userId: string
): Promise<void> => {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("forum_post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error unliking post:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in unlikePost:", error);
    throw error;
  }
};

// Like a reply
export const likeReply = async (
  replyId: string,
  userId: string
): Promise<void> => {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("forum_reply_likes")
      .insert([{ reply_id: replyId, user_id: userId }]);

    if (error) {
      console.error("Error liking reply:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in likeReply:", error);
    throw error;
  }
};

// Unlike a reply
export const unlikeReply = async (
  replyId: string,
  userId: string
): Promise<void> => {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("forum_reply_likes")
      .delete()
      .eq("reply_id", replyId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error unliking reply:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in unlikeReply:", error);
    throw error;
  }
};

// Get user's activity stats
export const getUserActivity = async (
  userId: string
): Promise<{
  postsCreated: number;
  replies: number;
  likesReceived: number;
  reputation: number;
}> => {
  try {
    const supabase = createClient();
    
    // Get posts created by user
    const { count: postsCreated, error: postsError } = await supabase
      .from("forum_posts")
      .select("*", { count: "exact" })
      .eq("author_id", userId);

    if (postsError) {
      console.error("Error fetching user posts:", postsError);
      throw postsError;
    }

    // Get replies by user
    const { count: replies, error: repliesError } = await supabase
      .from("forum_replies")
      .select("*", { count: "exact" })
      .eq("author_id", userId);

    if (repliesError) {
      console.error("Error fetching user replies:", repliesError);
      throw repliesError;
    }

    // First get the post IDs created by the user
    const { data: userPosts, error: userPostsError } = await supabase
      .from("forum_posts")
      .select("id")
      .eq("author_id", userId);

    if (userPostsError) {
      console.error("Error fetching user post IDs:", userPostsError);
      throw userPostsError;
    }

    const userPostIds = userPosts?.map(post => post.id) || [];

    // Then get the reply IDs created by the user
    const { data: userReplies, error: userRepliesError } = await supabase
      .from("forum_replies")
      .select("id")
      .eq("author_id", userId);

    if (userRepliesError) {
      console.error("Error fetching user reply IDs:", userRepliesError);
      throw userRepliesError;
    }

    const userReplyIds = userReplies?.map(reply => reply.id) || [];

    // Get likes on user's posts
    let postLikes = 0;
    if (userPostIds.length > 0) {
      const { count: postLikesCount, error: postLikesError } = await supabase
        .from("forum_post_likes")
        .select("*", { count: "exact" })
        .in("post_id", userPostIds);

      if (postLikesError) {
        console.error("Error fetching post likes:", postLikesError);
        throw postLikesError;
      }
      postLikes = postLikesCount || 0;
    }

    // Get likes on user's replies
    let replyLikes = 0;
    if (userReplyIds.length > 0) {
      const { count: replyLikesCount, error: replyLikesError } = await supabase
        .from("forum_reply_likes")
        .select("*", { count: "exact" })
        .in("reply_id", userReplyIds);

      if (replyLikesError) {
        console.error("Error fetching reply likes:", replyLikesError);
        throw replyLikesError;
      }
      replyLikes = replyLikesCount || 0;
    }

    const likesReceived = postLikes + replyLikes;

    // Calculate reputation (simplified: 1 point per post, 0.5 per reply, 0.1 per like received)
    const reputation =
      (postsCreated || 0) + (replies || 0) * 0.5 + likesReceived * 0.1;

    return {
      postsCreated: postsCreated || 0,
      replies: replies || 0,
      likesReceived,
      reputation: Math.round(reputation),
    };
  } catch (error) {
    console.error("Error in getUserActivity:", error);
    throw error;
  }
};

// Add these functions to your forum database functions

// Check if user has liked a post
export const checkUserLikedPost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('forum_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    return !!data;
  } catch (error) {
    console.error('Error checking post like:', error);
    return false;
  }
};

// Check if user has liked a reply
export const checkUserLikedReply = async (replyId: string, userId: string): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('forum_reply_likes')
      .select('id')
      .eq('reply_id', replyId)
      .eq('user_id', userId)
      .single();

    return !!data;
  } catch (error) {
    console.error('Error checking reply like:', error);
    return false;
  }
};

// Get all post likes for a user
export const getUserPostLikes = async (userId: string): Promise<string[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('forum_post_likes')
      .select('post_id')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => item.post_id);
  } catch (error) {
    console.error('Error getting user post likes:', error);
    return [];
  }
};

// Get all reply likes for a user
export const getUserReplyLikes = async (userId: string): Promise<string[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('forum_reply_likes')
      .select('reply_id')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => item.reply_id);
  } catch (error) {
    console.error('Error getting user reply likes:', error);
    return [];
  }
};