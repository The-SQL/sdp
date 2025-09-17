"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Search, Plus, MessageSquare, Users, TrendingUp, Clock, Heart, Reply } from "lucide-react"

export default function Forums() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [newPostOpen, setNewPostOpen] = useState(false)

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
  ]

  const recentPosts = [
    {
      id: 1,
      title: "Looking for Spanish conversation partner",
      author: "Carlos_M",
      authorAvatar: "/placeholder.svg",
      category: "Language Exchange",
      replies: 12,
      views: 89,
      time: "2 hours ago",
      language: "Spanish",
      isHot: true,
      likes: 8,
      lastReply: "Maria_Rodriguez",
      excerpt:
        "I'm looking for someone to practice Spanish conversation with. I'm intermediate level and would love to help with English in return...",
    },
    {
      id: 2,
      title: "Best resources for Japanese Kanji practice?",
      author: "SakuraLearner",
      authorAvatar: "/placeholder.svg",
      category: "Course Help",
      replies: 8,
      views: 156,
      time: "3 hours ago",
      language: "Japanese",
      isHot: false,
      likes: 15,
      lastReply: "YukiTanaka",
      excerpt:
        "I'm struggling with Kanji memorization. What are your favorite apps, books, or methods for learning Kanji effectively?",
    },
    {
      id: 3,
      title: "French pronunciation tips for beginners",
      author: "Marie_Paris",
      authorAvatar: "/placeholder.svg",
      category: "General Discussion",
      replies: 15,
      views: 234,
      time: "4 hours ago",
      language: "French",
      isHot: true,
      likes: 23,
      lastReply: "PierreDubois",
      excerpt:
        "As a native French speaker, I'd like to share some pronunciation tips that helped my students improve quickly...",
    },
    {
      id: 4,
      title: "Weekly German Study Group - Join us!",
      author: "DeutschMeister",
      authorAvatar: "/placeholder.svg",
      category: "Study Groups",
      replies: 6,
      views: 67,
      time: "5 hours ago",
      language: "German",
      isHot: false,
      likes: 12,
      lastReply: "HansMueller",
      excerpt:
        "We meet every Tuesday at 7 PM EST to practice German conversation and help each other with grammar questions...",
    },
    {
      id: 5,
      title: "How I became fluent in Mandarin in 2 years",
      author: "MandarinSuccess",
      authorAvatar: "/placeholder.svg",
      category: "Success Stories",
      replies: 23,
      views: 445,
      time: "1 day ago",
      language: "Mandarin",
      isHot: true,
      likes: 67,
      lastReply: "LiWei",
      excerpt:
        "I want to share my journey from complete beginner to fluent in Mandarin. Here's what worked for me and what didn't...",
    },
  ]

  const filteredPosts = recentPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Forums</h1>
          <p className="text-gray-600">Connect with fellow language learners from around the world</p>
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Title</label>
                      <Input placeholder="What would you like to discuss?" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {forumCategories.map((category) => (
                            <SelectItem key={category.name} value={category.name}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Language</label>
                      <Select>
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
                      <label className="text-sm font-medium text-gray-700">Content</label>
                      <Textarea placeholder="Share your thoughts, questions, or experiences..." rows={6} />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Post Discussion</Button>
                      <Button variant="outline" onClick={() => setNewPostOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Forum Categories Grid */}
            {searchQuery === "" && selectedCategory === "all" && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Forum Categories</h2>
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
                            <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{category.description}</p>
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
                  {searchQuery || selectedCategory !== "all" ? "Search Results" : "Recent Discussions"}
                </h2>
                <span className="text-sm text-gray-500">{filteredPosts.length} discussions</span>
              </div>
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.authorAvatar || "/placeholder.svg"} />
                          <AvatarFallback>{post.author.split("_")[0].charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Link href={`/forums/${post.id}`}>
                                <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                                  {post.title}
                                </h3>
                              </Link>
                              {post.isHot && (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Hot
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {post.language}
                            </Badge>
                          </div>
                          <Link href={`/forums/${post.id}`}>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2 hover:text-gray-800 cursor-pointer transition-colors">
                              {post.excerpt}
                            </p>
                          </Link>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="font-medium text-gray-700">by {post.author}</span>
                            <span>in {post.category}</span>
                            <div className="flex items-center gap-1">
                              <Reply className="h-3 w-3" />
                              <span>{post.replies} replies</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{post.views} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span>{post.likes} likes</span>
                            </div>
                            <span>{post.time}</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Last reply by <span className="font-medium">{post.lastReply}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Posts Created</span>
                    <span className="font-semibold text-gray-900">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Replies</span>
                    <span className="font-semibold text-gray-900">67</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Likes Received</span>
                    <span className="font-semibold text-gray-900">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reputation</span>
                    <span className="font-semibold text-blue-600">425</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="font-semibold text-gray-900">Jan 2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                    #spanish-grammar
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                    #conversation-practice
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                    #japanese-kanji
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                    #french-pronunciation
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                    #study-tips
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                    #language-exchange
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                    #beginner-help
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                    #cultural-insights
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Online Now</span>
                    </div>
                    <span className="font-semibold text-gray-900">234 users</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Total Members</span>
                    </div>
                    <span className="font-semibold text-gray-900">15,678</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Posts Today</span>
                    </div>
                    <span className="font-semibold text-gray-900">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">New Members</span>
                    </div>
                    <span className="font-semibold text-gray-900">12 today</span>
                  </div>
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
                  <Link href="/forums/guidelines" className="block text-sm text-blue-600 hover:text-blue-700">
                    Community Guidelines
                  </Link>
                  <Link href="/forums/help" className="block text-sm text-blue-600 hover:text-blue-700">
                    Forum Help & FAQ
                  </Link>
                  <Link href="/forums/moderators" className="block text-sm text-blue-600 hover:text-blue-700">
                    Contact Moderators
                  </Link>
                  <Link href="/forums/feedback" className="block text-sm text-blue-600 hover:text-blue-700">
                    Feedback & Suggestions
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
