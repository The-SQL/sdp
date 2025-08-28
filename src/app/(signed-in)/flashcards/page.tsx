"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RotateCcw,
  Share2,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  Star,
  Users,
  TrendingUp,
  Volume2,
} from "lucide-react"

export default function Flashcards() {
  const [currentCard, setCurrentCard] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyMode, setStudyMode] = useState("review")
  const [searchQuery, setSearchQuery] = useState("")

  const flashcardSets = [
    {
      id: 1,
      title: "Spanish Basics - Greetings",
      language: "Spanish",
      cards: 25,
      progress: 80,
      lastStudied: "2 hours ago",
      difficulty: "Beginner",
      author: "Maria Rodriguez",
      isPublic: true,
      downloads: 1234,
      rating: 4.8,
      reviews: 89,
      tags: ["greetings", "basics", "conversation"],
    },
    {
      id: 2,
      title: "French Verbs - Present Tense",
      language: "French",
      cards: 40,
      progress: 65,
      lastStudied: "1 day ago",
      difficulty: "Intermediate",
      author: "Pierre Dubois",
      isPublic: true,
      downloads: 892,
      rating: 4.6,
      reviews: 67,
      tags: ["verbs", "grammar", "present-tense"],
    },
    {
      id: 3,
      title: "Japanese Hiragana",
      language: "Japanese",
      cards: 46,
      progress: 45,
      lastStudied: "3 days ago",
      difficulty: "Beginner",
      author: "Yuki Tanaka",
      isPublic: false,
      downloads: 0,
      rating: 0,
      reviews: 0,
      tags: ["hiragana", "writing", "characters"],
    },
    {
      id: 4,
      title: "German Articles & Nouns",
      language: "German",
      cards: 60,
      progress: 30,
      lastStudied: "1 week ago",
      difficulty: "Intermediate",
      author: "Hans Mueller",
      isPublic: true,
      downloads: 567,
      rating: 4.7,
      reviews: 45,
      tags: ["articles", "nouns", "grammar"],
    },
  ]

  const publicSets = [
    {
      id: 5,
      title: "Essential Spanish Travel Phrases",
      language: "Spanish",
      cards: 35,
      author: "TravelLinguist",
      downloads: 2156,
      rating: 4.9,
      reviews: 234,
      difficulty: "Beginner",
      tags: ["travel", "phrases", "essential"],
      isNew: true,
    },
    {
      id: 6,
      title: "Advanced French Business Vocabulary",
      language: "French",
      cards: 80,
      author: "BusinessFrench",
      downloads: 1789,
      rating: 4.7,
      reviews: 156,
      difficulty: "Advanced",
      tags: ["business", "vocabulary", "professional"],
      isNew: false,
    },
    {
      id: 7,
      title: "Japanese JLPT N5 Vocabulary",
      language: "Japanese",
      cards: 120,
      author: "JLPTMaster",
      downloads: 3245,
      rating: 4.8,
      reviews: 389,
      difficulty: "Beginner",
      tags: ["jlpt", "n5", "vocabulary"],
      isNew: false,
    },
  ]

  const currentFlashcard = {
    front: "Hola",
    back: "Hello",
    pronunciation: "/ˈo.la/",
    example: "Hola, ¿cómo estás?",
    exampleTranslation: "Hello, how are you?",
    difficulty: "easy",
    nextReview: "2024-01-25",
  }

  const studyStats = {
    cardsStudied: 156,
    streak: 7,
    accuracy: 85,
    timeSpent: "2h 34m",
    cardsReviewed: 89,
    cardsLearned: 23,
    cardsDue: 12,
  }

  const filteredSets = flashcardSets.filter(
    (set) =>
      set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredPublicSets = publicSets.filter(
    (set) =>
      set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flashcards</h1>
          <p className="text-gray-600">Master vocabulary with spaced repetition learning</p>
        </div>

        <Tabs defaultValue="study" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="study">Study</TabsTrigger>
            <TabsTrigger value="my-sets">My Sets</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
          </TabsList>

          <TabsContent value="study" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Study Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Flashcard */}
                <Card className="min-h-[500px] border border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Spanish Basics - Greetings</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Beginner</Badge>
                        <Button variant="outline" size="sm">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={32} className="flex-1" />
                      <span className="text-sm text-gray-600">8 of 25 cards</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center">
                    <div
                      className="w-full max-w-md h-80 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center"
                      onClick={() => setShowAnswer(!showAnswer)}
                    >
                      {!showAnswer ? (
                        <div className="text-center p-8">
                          <div className="text-5xl font-bold text-gray-900 mb-4">{currentFlashcard.front}</div>
                          <div className="text-gray-600 text-lg mb-2">{currentFlashcard.pronunciation}</div>
                          <div className="text-gray-400 text-sm">Click to reveal answer</div>
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <div className="text-4xl font-bold text-blue-600 mb-3">{currentFlashcard.back}</div>
                          <div className="text-gray-700 text-base mb-2 italic">{currentFlashcard.example}</div>
                          <div className="text-gray-500 text-sm">{currentFlashcard.exampleTranslation}</div>
                          <div className="mt-4 text-xs text-gray-400">Next review: {currentFlashcard.nextReview}</div>
                        </div>
                      )}
                    </div>

                    {showAnswer && (
                      <div className="flex gap-3 mt-8">
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                          onClick={() => {
                            setShowAnswer(false)
                            setCurrentCard(currentCard + 1)
                          }}
                        >
                          😞 Hard (1 day)
                        </Button>
                        <Button
                          variant="outline"
                          className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 bg-transparent"
                          onClick={() => {
                            setShowAnswer(false)
                            setCurrentCard(currentCard + 1)
                          }}
                        >
                          😐 Good (3 days)
                        </Button>
                        <Button
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                          onClick={() => {
                            setShowAnswer(false)
                            setCurrentCard(currentCard + 1)
                          }}
                        >
                          😊 Easy (1 week)
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-4 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentCard(Math.max(0, currentCard - 1))}
                        disabled={currentCard === 0}
                      >
                        ← Previous
                      </Button>
                      <Button variant="outline" onClick={() => setShowAnswer(false)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Card
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAnswer(false)
                          setCurrentCard(currentCard + 1)
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Skip →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Study Sidebar */}
              <div className="space-y-6">
                {/* Study Stats */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">{"Today's Progress"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{studyStats.cardsStudied}</div>
                        <div className="text-sm text-gray-600">Cards studied</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-xl font-bold text-orange-600">{studyStats.streak}</div>
                          <div className="text-xs text-gray-600">Day streak</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-green-600">{studyStats.accuracy}%</div>
                          <div className="text-xs text-gray-600">Accuracy</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Cards Due</span>
                          <span className="font-semibold text-red-600">{studyStats.cardsDue}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Reviewed</span>
                          <span className="font-semibold text-blue-600">{studyStats.cardsReviewed}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">New Learned</span>
                          <span className="font-semibold text-green-600">{studyStats.cardsLearned}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Study Modes */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Study Mode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant={studyMode === "review" ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setStudyMode("review")}
                      >
                        🎯 Review Due Cards ({studyStats.cardsDue})
                      </Button>
                      <Button
                        variant={studyMode === "learn" ? "default" : "outline"}
                        className="w-full justify-start bg-transparent"
                        onClick={() => setStudyMode("learn")}
                      >
                        📚 Learn New Cards
                      </Button>
                      <Button
                        variant={studyMode === "mixed" ? "default" : "outline"}
                        className="w-full justify-start bg-transparent"
                        onClick={() => setStudyMode("mixed")}
                      >
                        🔄 Mixed Review
                      </Button>
                      <Button
                        variant={studyMode === "speed" ? "default" : "outline"}
                        className="w-full justify-start bg-transparent"
                        onClick={() => setStudyMode("speed")}
                      >
                        ⚡ Speed Round
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Card to Set
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share This Set
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Export Cards
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-sets" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search your flashcard sets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* My Flashcard Sets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSets.map((set) => (
                <Card key={set.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{set.title}</h3>
                      <div className="flex items-center gap-1">
                        {set.isPublic && <Share2 className="h-4 w-4 text-blue-600" />}
                        <Button variant="ghost" size="sm">
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{set.language}</span>
                        <span>{set.cards} cards</span>
                        <Badge
                          variant="outline"
                          className={
                            set.difficulty === "Beginner"
                              ? "border-green-200 text-green-800"
                              : set.difficulty === "Intermediate"
                                ? "border-yellow-200 text-yellow-800"
                                : "border-red-200 text-red-800"
                          }
                        >
                          {set.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <Progress value={set.progress} className="flex-1" />
                        <span className="text-sm font-medium text-gray-700">{set.progress}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {set.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {set.isPublic && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>{set.downloads}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            <span>{set.rating}</span>
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mb-4">Last studied: {set.lastStudied}</div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                          Study
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Discover new flashcard sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Public Sets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublicSets.map((set) => (
                <Card key={set.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{set.title}</h3>
                      {set.isNew && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{set.language}</span>
                        <span>{set.cards} cards</span>
                        <Badge
                          variant="outline"
                          className={
                            set.difficulty === "Beginner"
                              ? "border-green-200 text-green-800"
                              : set.difficulty === "Intermediate"
                                ? "border-yellow-200 text-yellow-800"
                                : "border-red-200 text-red-800"
                          }
                        >
                          {set.difficulty}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">by {set.author}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>{set.downloads}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{set.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{set.reviews}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {set.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                          Add to Library
                        </Button>
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card className="max-w-2xl mx-auto border border-gray-200">
              <CardHeader>
                <CardTitle>Create New Flashcard Set</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Set Title</label>
                    <Input placeholder="e.g., Spanish Travel Phrases" />
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Difficulty</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Visibility</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Who can see this?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private (Only me)</SelectItem>
                        <SelectItem value="public">Public (Everyone)</SelectItem>
                        <SelectItem value="unlisted">Unlisted (Link only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Textarea placeholder="Describe what this flashcard set covers..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tags (comma separated)</label>
                  <Input placeholder="e.g., travel, phrases, beginner" />
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Create Set</Button>
                  <Button variant="outline" className="bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Import from File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
