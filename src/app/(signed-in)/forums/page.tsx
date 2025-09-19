"use client";

import Loading from "@/components/loading";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Search,
  Plus,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Heart,
  Reply,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fetchPosts, getUserActivity, createPost } from "@/utils/db/forum";
import {
  ForumPostWithAuthor,
  PaginationInfo,
  PostsFilter,
} from "@/utils/types";
import { useUser } from "@clerk/nextjs";

export default function Forums() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [posts, setPosts] = useState<ForumPostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    hasMore: true,
  });
  const [userActivity, setUserActivity] = useState({
    postsCreated: 0,
    replies: 0,
    likesReceived: 0,
    reputation: 0,
    memberSince: "",
  });

  const { user, isLoaded: isUserLoaded } = useUser();

  const forumCategories = [
    {
      name: "General Discussion",
      description: "General language learning topics and discussions",
      posts: 1247,
      lastPost: "2 hours ago",
      icon: "💬",
      color: "bg-blue-50 border-blue-200",
      participants: 234,
    },
    {
      name: "Language Exchange",
      description: "Find conversation partners and practice together",
      posts: 892,
      lastPost: "1 hour ago",
      icon: "🌍",
      color: "bg-green-50 border-green-200",
      participants: 156,
    },
    {
      name: "Study Groups",
      description: "Join or create study groups with fellow learners",
      posts: 634,
      lastPost: "3 hours ago",
      icon: "👥",
      color: "bg-purple-50 border-purple-200",
      participants: 89,
    },
    {
      name: "Course Help",
      description: "Get help with specific courses and lessons",
      posts: 1156,
      lastPost: "30 minutes ago",
      icon: "❓",
      color: "bg-yellow-50 border-yellow-200",
      participants: 198,
    },
    {
      name: "Cultural Exchange",
      description: "Share and learn about different cultures",
      posts: 445,
      lastPost: "4 hours ago",
      icon: "🎭",
      color: "bg-pink-50 border-pink-200",
      participants: 67,
    },
    {
      name: "Success Stories",
      description: "Celebrate achievements and inspire others",
      posts: 289,
      lastPost: "1 day ago",
      icon: "🎉",
      color: "bg-orange-50 border-orange-200",
      participants: 45,
    },
  ];

  // Fetch posts based on current filters
  const loadPosts = useCallback(
    async (page = 1, reset = false) => {
      setIsLoading(true);
      try {
        let result;

        // Only filter by user interests when there's no search query, no category filter, AND user exists
        if (searchQuery || selectedCategory !== "all") {
          const filters: PostsFilter = {
            searchQuery: searchQuery || undefined,
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            page,
          };
          result = await fetchPosts(filters);
        } else {
          // Show all posts when no user is logged in and no filters are applied
          result = await fetchPosts({ page });
        }

        // Ensure we always have an array, even if result.posts is undefined
        const postsArray = result.posts || [];

        if (reset) {
          setPosts(postsArray);
        } else {
          setPosts((prev) => [...prev, ...postsArray]);
        }

        setPagination(result.pagination);
      } catch (error) {
        console.error("Error fetching posts:", error);
        // Set empty array on error to prevent undefined issues
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, selectedCategory, user]
  );

  // Load user activity and community stats
  const loadAdditionalData = useCallback(async () => {
    try {
      setIsActivityLoading(true);
      if (user) {
        const activity = await getUserActivity(user.id);
        setUserActivity({
          ...activity,
          memberSince: new Date(
            user.createdAt || Date.now()
          ).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        });
      }
    } catch (error) {
      console.error("Error loading additional data:", error);
    } finally {
      setIsActivityLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isUserLoaded) {
      // Load posts first, then load additional data
      const loadData = async () => {
        await loadPosts(1, true);
        if (user) {
          await loadAdditionalData();
        }
      };

      loadData();
    }
  }, [isUserLoaded, loadPosts, loadAdditionalData, user]);

  // Load more posts
  const loadMore = () => {
    if (!isLoading && pagination.hasMore) {
      const nextPage = pagination.currentPage + 1;
      loadPosts(nextPage, false);
    }
  };

  // Handle new post creation
  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const language = formData.get("language") as string;
    const content = formData.get("content") as string;

    try {
      await createPost({
        title,
        content,
        author_id: user.id,
        category,
        language,
        tags: [language.toLowerCase()],
      });

      setNewPostOpen(false);
      loadPosts(1, true); // Reload posts to show the new one
    } catch (error) {
      console.error("Error creating post:", error);
      // Here you could add error state to show a message to the user
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Community Forums
          </h1>
          <p className="text-gray-600">
            Connect with fellow language learners from around the world
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {forumCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Discussion</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <Input
                        name="title"
                        placeholder="What would you like to discuss?"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {forumCategories.map((category) => (
                            <SelectItem
                              key={category.name}
                              value={category.name}
                            >
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Language
                      </label>
                      <Select name="language" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="japanese">Japanese</SelectItem>
                          <SelectItem value="german">German</SelectItem>
                          <SelectItem value="mandarin">Mandarin</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Content
                      </label>
                      <Textarea
                        name="content"
                        placeholder="Share your thoughts, questions, or experiences..."
                        rows={6}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Tags
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (
                                tagInput.trim() &&
                                !tags.includes(tagInput.trim())
                              ) {
                                setTags([...tags, tagInput.trim()]);
                              }
                              setTagInput("");
                            }
                          }}
                          placeholder="Press Enter to add a tag"
                          className="flex-1"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="flex items-center gap-1 cursor-pointer hover:bg-red-100"
                            onClick={() =>
                              setTags(tags.filter((_, i) => i !== idx))
                            }
                          >
                            #{tag}
                            <span className="text-red-500 text-xs ml-1">×</span>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Post Discussion
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setNewPostOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Forum Categories Grid */}
            {searchQuery === "" && selectedCategory === "all" && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Forum Categories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {forumCategories.map((category, index) => (
                    <Card
                      key={index}
                      className={`border hover:shadow-md transition-shadow cursor-pointer ${category.color}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{category.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {category.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {category.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{category.posts} posts</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{category.participants} members</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{category.lastPost}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Discussions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {searchQuery || selectedCategory !== "all"
                    ? "Search Results"
                    : "Recent Discussions"}
                </h2>
                <span className="text-sm text-gray-500">
                  {posts.length} discussions
                </span>
              </div>

              {isLoading && posts.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {posts.length === 0 && !isLoading ? (
                    <Card className="border border-gray-200 shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                        <MessageSquare className="h-10 w-10 text-gray-400 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700">
                          No discussions found
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Try adjusting your search or explore different
                          categories.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/forums/${post.id}`}
                          className="block"
                        >
                          <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={
                                      post.author.profile_url ||
                                      "/placeholder.svg"
                                    }
                                  />
                                  <AvatarFallback>
                                    {post.author.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-lg text-gray-900">
                                        {post.title}
                                      </h3>
                                      {post.is_hot && (
                                        <Badge className="bg-red-100 text-red-800 text-xs">
                                          <TrendingUp className="h-3 w-3 mr-1" />
                                          Hot
                                        </Badge>
                                      )}
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {post.language}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {post.content.substring(0, 150)}
                                    {post.content.length > 150 ? "..." : ""}
                                  </p>
                                  <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <span className="font-medium text-gray-700">
                                      by {post.author.name || "Unknown"}
                                    </span>
                                    <span>in {post.category}</span>
                                    <div className="flex items-center gap-1">
                                      <Reply className="h-3 w-3" />
                                      <span>{post.reply_count} replies</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      <span>{post.view_count} views</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Heart className="h-3 w-3" />
                                      <span>{post.like_count} likes</span>
                                    </div>
                                    <span>
                                      {formatDistanceToNow(
                                        new Date(post.created_at),
                                        {
                                          addSuffix: true,
                                        }
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}

                  {pagination.hasMore && (
                    <div className="mt-6 flex justify-center">
                      <Button
                        onClick={loadMore}
                        disabled={isLoading}
                        variant="outline"
                        className="mt-4"
                      >
                        {isLoading ? "Loading..." : "Load More"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Activity */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Your Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isActivityLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Posts Created
                      </span>
                      <span className="font-semibold text-gray-900">
                        {userActivity.postsCreated}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Replies</span>
                      <span className="font-semibold text-gray-900">
                        {userActivity.replies}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Likes Received
                      </span>
                      <span className="font-semibold text-gray-900">
                        {userActivity.likesReceived}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reputation</span>
                      <span className="font-semibold text-blue-600">
                        {userActivity.reputation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Member Since
                      </span>
                      <span className="font-semibold text-gray-900">
                        {userActivity.memberSince}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100"
                  >
                    #spanish-grammar
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100"
                  >
                    #conversation-practice
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100"
                  >
                    #japanese-kanji
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100"
                  >
                    #french-pronunciation
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100"
                  >
                    #study-tips
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100"
                  >
                    #language-exchange
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100"
                  >
                    #beginner-help
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100"
                  >
                    #cultural-insights
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border border-gray-200">
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
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
