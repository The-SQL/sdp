"use client";

import { useState } from "react";
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
} from "lucide-react";

const getDiscussionData = (id: string) => {
  const discussions = {
    "1": {
      id: 1,
      title: "Looking for Spanish conversation partner",
      author: "Carlos_M",
      authorAvatar: "/placeholder.svg",
      authorTitle: "Intermediate Learner",
      authorReputation: 890,
      authorJoined: "Jan 2024",
      category: "Language Exchange",
      time: "2 hours ago",
      language: "Spanish",
      tags: ["spanish", "conversation", "language-exchange", "intermediate"],
      likes: 8,
      views: 89,
      bookmarks: 5,
      content: `
        <p>¡Hola a todos!</p>
        <p>I'm looking for someone to practice Spanish conversation with. I'm at an intermediate level and would love to help with English in return.</p>
        <br/>
        <p>I'm particularly interested in:</p>
        <ul>
          <li>Casual conversation practice</li>
          <li>Discussing current events in Spanish</li>
          <li>Learning about different Spanish-speaking cultures</li>
        </ul>
        <br/>
        <p>I'm available most evenings EST and weekends. Please let me know if you're interested!</p>
      `,
      replies: [
        {
          id: "r1",
          author: "Maria_Rodriguez",
          authorAvatar: "/placeholder.svg",
          authorTitle: "Native Spanish Speaker",
          authorReputation: 1200,
          time: "1 hour ago",
          content:
            "¡Hola Carlos! I'd be happy to practice with you. I'm a native Spanish speaker from Mexico and I'm looking to improve my English. Send me a message!",
          likes: 3,
        },
      ],
    },
    "2": {
      id: 2,
      title: "Best resources for Japanese Kanji practice?",
      author: "SakuraLearner",
      authorAvatar: "/placeholder.svg",
      authorTitle: "Beginner",
      authorReputation: 340,
      authorJoined: "Feb 2024",
      category: "Course Help",
      time: "3 hours ago",
      language: "Japanese",
      tags: ["japanese", "kanji", "study-resources", "beginner"],
      likes: 15,
      views: 156,
      bookmarks: 8,
      content: `
        <p>こんにちは everyone!</p>
        <p>I'm struggling with Kanji memorization and would love to hear about your favorite resources.</p>
        <br/>
        <h4 class="font-semibold">What I've tried so far:</h4>
        <ul>
          <li>Anki flashcards</li>
          <li>WaniKani (but it's quite expensive)</li>
          <li>Writing practice sheets</li>
        </ul>
        <br/>
        <p>What apps, books, or methods have worked best for you? Any free alternatives to WaniKani?</p>
      `,
      replies: [
        {
          id: "r1",
          author: "YukiTanaka",
          authorAvatar: "/placeholder.svg",
          authorTitle: "Advanced Learner",
          authorReputation: 890,
          time: "2 hours ago",
          content:
            "I highly recommend Kanji Study app for Android. It's free and has great stroke order practice. Also, try writing stories with the kanji you learn!",
          likes: 5,
        },
      ],
    },
    "3": {
      id: 3,
      title: "French pronunciation tips for beginners",
      author: "Marie_Paris",
      authorAvatar: "/placeholder.svg",
      authorTitle: "Native French Speaker",
      authorReputation: 1250,
      authorJoined: "Mar 2023",
      category: "General Discussion",
      time: "4 hours ago",
      language: "French",
      tags: ["pronunciation", "french", "beginner-tips", "speaking"],
      likes: 23,
      views: 234,
      bookmarks: 12,
      content: `
        <p>Bonjour tout le monde!</p>
        <p>As a native French speaker, I've noticed many beginners struggle with the same pronunciation challenges. I'd like to share some tips that have helped my students improve quickly. I hope they can help you too!</p>
        <br/>
        <h4 class="font-semibold">1. The French 'R' sound</h4>
        <p>This is probably the most famous one! It's not rolled like in Spanish or guttural like in German. It's a soft sound made in the back of your throat. Try gargling with water to feel where the sound comes from, then try to make the sound without water.</p>
        <br/>
        <h4 class="font-semibold">2. Nasal Vowels (on, en, in, un)</h4>
        <p>In French, when a vowel is followed by 'n' or 'm', it often becomes a nasal sound. The key is to let the air pass through both your mouth and your nose. A good trick is to try saying the vowel while lightly pinching your nose – you should feel the vibration.</p>
        <br/>
        <h4 class="font-semibold">3. The Silent 'H' and final consonants</h4>
        <p>The 'h' is almost always silent in French ('homme' is pronounced 'omm'). Also, many final consonants are silent (e.g., in 'petit', 'grand', 'trop'). There are exceptions, of course, but this is a good general rule.</p>
        <br/>
        <p>What are some other pronunciation challenges you've faced? Let's discuss them below!</p>
      `,
      replies: [
        {
          id: "r1",
          author: "PierreDubois",
          authorAvatar: "/placeholder.svg",
          authorTitle: "Advanced Learner",
          authorReputation: 890,
          time: "3 hours ago",
          content:
            "This is fantastic, Marie! The tip about gargling for the 'R' sound is brilliant. I've been struggling with that for months. The nasal vowels are my other big challenge. It's hard to know when to pronounce the 'n' and when not to.",
          likes: 5,
        },
        {
          id: "r2",
          author: "JaneDoeLearns",
          authorAvatar: "/placeholder.svg",
          authorTitle: "Beginner",
          authorReputation: 120,
          time: "3 hours ago",
          content:
            "Thank you so much! I'm always confused about liaisons (linking words together). For example, when do you pronounce the 's' in 'les amis'? It feels so random sometimes.",
          likes: 8,
        },
        {
          id: "r3",
          author: "Marie_Paris",
          authorAvatar: "/placeholder.svg",
          authorTitle: "Native French Speaker",
          authorReputation: 1250,
          time: "2 hours ago",
          isOP: true,
          content:
            "Great question, Jane! That's an excellent topic for another post. The short answer is that liaisons are mandatory in some cases (like after determiners 'les', 'des', 'mes'), optional in others, and forbidden in some. I'll gather some resources for you!",
          likes: 10,
        },
      ],
    },
  };

  return discussions[id as keyof typeof discussions] || discussions["3"]; // Default to discussion 3 if ID not found
};

export default function DiscussionPage() {
  const [newReply, setNewReply] = useState("");
  const params = useParams();
  const discussionId = params.id as string;

  const discussionData = getDiscussionData(discussionId);

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
            {discussionData.category}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-gray-700 truncate">{discussionData.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Discussion Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Original Post */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {discussionData.title}
                  </CardTitle>
                  <Badge variant="outline">{discussionData.language}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={discussionData.authorAvatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {discussionData.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-800">
                      {discussionData.author}
                    </span>
                  </div>
                  <span>Posted {discussionData.time}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: discussionData.content }}
                />
                <div className="mt-6 pt-4 border-t flex items-center justify-between text-gray-500">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Heart className="h-4 w-4" />
                      {discussionData.likes} Likes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {discussionData.replies.length} Replies
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
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                {discussionData.replies.length} Replies
              </h2>
              {discussionData.replies.map((reply) => (
                <Card
                  key={reply.id}
                  className="border border-gray-200 bg-gray-50/50"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={reply.authorAvatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {reply.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">
                              {reply.author}
                            </span>
                            {"isOP" in reply && reply.isOP && (
                              <Badge className="text-xs bg-blue-100 text-blue-800">
                                OP
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {reply.time}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{reply.content}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-500 flex items-center gap-1"
                          >
                            <Heart className="h-3 w-3" /> {reply.likes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-500 flex items-center gap-1"
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

            {/* Reply Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leave a Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts..."
                    rows={5}
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Post Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Post Author Card */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">About the Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage
                      src={discussionData.authorAvatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {discussionData.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {discussionData.author}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {discussionData.authorTitle}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Reputation</span>
                    <span className="font-semibold text-blue-600">
                      {discussionData.authorReputation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Joined</span>
                    <span className="font-semibold text-gray-900">
                      {discussionData.authorJoined}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-transparent"
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>

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
                      {discussionData.likes}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Replies
                    </span>
                    <span className="font-semibold text-gray-900">
                      {discussionData.replies.length}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Bookmark className="h-4 w-4" /> Bookmarks
                    </span>
                    <span className="font-semibold text-gray-900">
                      {discussionData.bookmarks}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Created
                    </span>
                    <span className="font-semibold text-gray-900">
                      {discussionData.time}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-600 flex items-center gap-2 mt-1">
                      <Tag className="h-4 w-4" /> Tags
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end ml-4">
                      {discussionData.tags.map((tag) => (
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

            {/* Quick Links (Reused from previous page for consistency) */}
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
