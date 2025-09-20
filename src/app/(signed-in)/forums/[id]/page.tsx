"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MessageSquare,
  Heart,
  Reply,
  Share2,
  Bookmark,
  ChevronRight,
  Send,
  Calendar,
  Tag,
  Loader2, // Import loader for loading state
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/nextjs";
import {
  getPost,
  getPostReplies,
  createReply,
  likePost,
  unlikePost,
  likeReply,
  unlikeReply,
  getUserPostLikes,
  getUserReplyLikes,
} from "@/utils/db/forum";
import { checkProfanity } from "@/utils/moderation"; // Import profanity check
import { useToast } from "@/components/ui/toast"; // Import toast
import { ForumPostWithAuthor, ForumReplyWithAuthor } from "@/utils/types";

export default function DiscussionPage() {
  const [newReply, setNewReply] = useState("");
  const [post, setPost] = useState<ForumPostWithAuthor | null>(null);
  const [replies, setReplies] = useState<ForumReplyWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLikedPosts, setUserLikedPosts] = useState<Set<string>>(new Set());
  const [userLikedReplies, setUserLikedReplies] = useState<Set<string>>(
    new Set()
  );
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    username: string;
  } | null>(null);

  const params = useParams();
  const postId = params.id as string;
  const { user } = useUser();
  const toast = useToast(); // Initialize toast

  const handleStartReply = (replyId: string, username: string) => {
    setReplyingTo({ id: replyId, username });
    
    // Scroll to the reply form
    setTimeout(() => {
      const formElement = document.getElementById('reply-form');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }, 100);
  };

  // Fetch post, replies, and user likes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [postData, repliesData] = await Promise.all([
          getPost(postId),
          getPostReplies(postId, 1, 50),
        ]);

        setPost(postData);
        setReplies(repliesData.replies || []);

        // Fetch user likes if user is logged in
        if (user) {
          const [postLikes, replyLikes] = await Promise.all([
            getUserPostLikes(user.id),
            getUserReplyLikes(user.id),
          ]);

          setUserLikedPosts(new Set(postLikes));
          setUserLikedReplies(new Set(replyLikes));
        }
      } catch (error) {
        console.error("Error fetching discussion data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchData();
    }
  }, [postId, user]);

  // Handle reply submission
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postId || !newReply.trim()) return;

    setIsSubmitting(true);
    try {
      let content = newReply;

      // If replying to a specific reply, mention the user
      if (replyingTo) {
        content = `@${replyingTo.username} ${content}`;
      }

      // Check for profanity
      const result = await checkProfanity(content);
      
      if (result.contains_profanity) {
        toast({
          title: "Profanity Detected",
          description: "Your reply contains inappropriate language. Please revise it before posting.",
          duration: 5000,
        });
        return; // Stop submission
      }

      await createReply({
        post_id: postId,
        author_id: user.id,
        content: content.trim(),
        parent_reply_id: replyingTo?.id,
      });

      // Reset form
      setNewReply("");
      setReplyingTo(null);

      // Refresh replies
      const updatedReplies = await getPostReplies(postId, 1, 50);
      setReplies(updatedReplies.replies || []);
      
      // Show success toast
      toast({
        title: "Reply Posted",
        description: "Your reply has been successfully posted!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle post like
  const handlePostLike = async () => {
    if (!user || !post) return;

    try {
      const hasLiked = userLikedPosts.has(post.id);

      if (hasLiked) {
        await unlikePost(post.id, user.id);
        setUserLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(post.id);
          return newSet;
        });
        setPost((prev) =>
          prev ? { ...prev, like_count: prev.like_count - 1 } : null
        );
      } else {
        await likePost(post.id, user.id);
        setUserLikedPosts((prev) => new Set(prev).add(post.id));
        setPost((prev) =>
          prev ? { ...prev, like_count: prev.like_count + 1 } : null
        );
      }
    } catch (error) {
      console.error("Error toggling post like:", error);
    }
  };

  // Handle reply like
  const handleReplyLike = async (replyId: string) => {
    if (!user) return;

    try {
      const hasLiked = userLikedReplies.has(replyId);

      if (hasLiked) {
        await unlikeReply(replyId, user.id);
        setUserLikedReplies((prev) => {
          const newSet = new Set(prev);
          newSet.delete(replyId);
          return newSet;
        });
        setReplies((prev) =>
          prev.map((reply) =>
            reply.id === replyId
              ? { ...reply, like_count: reply.like_count - 1 }
              : reply
          )
        );
      } else {
        await likeReply(replyId, user.id);
        setUserLikedReplies((prev) => new Set(prev).add(replyId));
        setReplies((prev) =>
          prev.map((reply) =>
            reply.id === replyId
              ? { ...reply, like_count: reply.like_count + 1 }
              : reply
          )
        );
      }
    } catch (error) {
      console.error("Error toggling reply like:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Discussion Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The discussion you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/forums">
            <Button>Back to Forums</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center text-sm text-gray-500">
          <Link href="/forums" className="hover:text-blue-600">
            Forums
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/forums" className="hover:text-blue-600">
            {post.category}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-gray-700 truncate">{post.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Discussion Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Original Post */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {post.title}
                  </CardTitle>
                  <Badge variant="outline">{post.language}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={post.author.profile_url || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {post.author.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-800">
                      {post.author.name || "Unknown"}
                    </span>
                  </div>
                  <span>
                    Posted{" "}
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-gray-700">
                  {post.content.split("\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t flex items-center justify-between text-gray-500">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={handlePostLike}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          userLikedPosts.has(post.id)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                      {post.like_count} Likes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {replies.length} Replies
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Replies Section */}
            <div className="flex flex-col h-[60vh]">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {replies.length} Replies
              </h2>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {replies.map((reply) => (
                  <Card
                    key={reply.id}
                    className="border border-gray-200 bg-gray-50/50"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              reply.author?.profile_url || "/placeholder.svg"
                            }
                          />
                          <AvatarFallback>
                            {reply.author?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">
                                {reply.author?.name || "Unknown"}
                              </span>
                              {reply.author_id === post.author_id && (
                                <Badge className="text-xs bg-blue-100 text-blue-800">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(reply.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            {reply.content}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-gray-500 flex items-center gap-1"
                              onClick={() => handleReplyLike(reply.id)}
                            >
                              <Heart
                                className={`h-3 w-3 ${
                                  userLikedReplies.has(reply.id)
                                    ? "fill-red-500 text-red-500"
                                    : ""
                                }`}
                              />
                              {reply.like_count}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-gray-500 flex items-center gap-1"
                              onClick={() =>
                                handleStartReply(
                                  reply.id,
                                  reply.author?.name || "Unknown"
                                )
                              }
                            >
                              <Reply className="h-3 w-3" /> Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Reply Form */}
            {user ? (
              <Card id="reply-form">
                <CardHeader>
                  <CardTitle className="text-lg">Leave a Reply</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add the replyingTo indicator here */}
                  {replyingTo && (
                    <div className="flex items-center justify-between text-sm text-blue-600 mb-4 p-3 bg-blue-50 rounded-md">
                      <span>Replying to @{replyingTo.username}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  <form onSubmit={handleSubmitReply} className="space-y-4">
                    <Textarea
                      placeholder="Share your thoughts..."
                      rows={5}
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      required
                      ref={(el) => {
                        // Auto-focus the textarea when replying to someone
                        if (replyingTo && el) {
                          setTimeout(() => el.focus(), 100);
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isSubmitting || !newReply.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Post Reply
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    You need to be logged in to reply to this discussion.
                  </p>
                  <Link href="/sign-in">
                    <Button>Sign In</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About Discussion */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">About this Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Heart className="h-4 w-4" /> Likes
                    </span>
                    <span className="font-semibold text-gray-900">
                      {post.like_count}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Replies
                    </span>
                    <span className="font-semibold text-gray-900">
                      {replies.length}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Created
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-600 flex items-center gap-2 mt-1">
                      <Tag className="h-4 w-4" /> Tags
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end ml-4">
                      {post.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-blue-100"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            {/* <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link
                    href="/forums/guidelines"
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Community Guidelines
                  </Link>
                  <Link
                    href="/forums/help"
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forum Help & FAQ
                  </Link>
                  <Link
                    href="/forums/moderators"
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Contact Moderators
                  </Link>
                  <Link
                    href="/forums/feedback"
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Feedback & Suggestions
                  </Link>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
}