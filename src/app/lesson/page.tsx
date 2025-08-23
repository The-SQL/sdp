import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function Lesson() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-black">
              ← Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
                <span className="text-xs font-bold">OS</span>
              </div>
              <span className="font-bold">OSLearn</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Progress value={65} className="w-32" />
              <span className="text-sm font-medium">Lesson 12 of 20</span>
            </div>
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              M
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">🇪🇸</div>
            <div>
              <h1 className="text-2xl font-bold">Spanish for Beginners</h1>
              <p className="text-gray-600">Lesson 12: Past Tense (Pretérito Perfecto)</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Beginner</Badge>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold mb-4">Introduction to Past Tense</h2>
                <p className="text-gray-700 mb-6">
                  In this lesson, we'll learn how to talk about completed actions in the past using the pretérito
                  perfecto (present perfect) tense. This tense is formed using "haber" + past participle.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-2">Formula:</h3>
                  <p className="text-sm">Subject + haber (conjugated) + past participle</p>
                  <p className="text-sm mt-2">
                    <strong>Example:</strong> Yo <em>he comido</em> (I have eaten)
                  </p>
                </div>

                <h3 className="font-semibold mb-3">Conjugation of "haber":</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <p>
                      <strong>Yo</strong> he
                    </p>
                    <p>
                      <strong>Tú</strong> has
                    </p>
                    <p>
                      <strong>Él/Ella</strong> ha
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <strong>Nosotros</strong> hemos
                    </p>
                    <p>
                      <strong>Vosotros</strong> habéis
                    </p>
                    <p>
                      <strong>Ellos</strong> han
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🎵 Audio Practice</h3>
                  <div className="flex items-center gap-3">
                    <Button size="sm" className="bg-blue-600">
                      ▶ Play
                    </Button>
                    <span className="text-sm">Listen to native pronunciation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Practice Exercise */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold mb-4">Practice Exercise</h2>
                <p className="text-gray-700 mb-6">
                  Complete the sentence with the correct form of the present perfect tense:
                </p>

                <div className="bg-gray-100 p-6 rounded-lg mb-6">
                  <p className="text-lg mb-4">María _____ (comer) en ese restaurante antes.</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="answer" className="text-blue-600" />
                      <span>ha comido</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="answer" />
                      <span>has comido</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="answer" />
                      <span>he comido</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="bg-blue-600">Check Answer</Button>
                  <Button variant="outline">Skip</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lesson Progress */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Lesson Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Introduction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Grammar Rules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Practice Exercise</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">Speaking Practice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">Lesson Review</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vocabulary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Key Vocabulary</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="font-medium">comer</p>
                    <p className="text-sm text-gray-600">to eat</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="font-medium">antes</p>
                    <p className="text-sm text-gray-600">before</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="font-medium">restaurante</p>
                    <p className="text-sm text-gray-600">restaurant</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    📝 Take Notes
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    💬 Ask Question
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    🔄 Repeat Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button variant="outline">← Previous Lesson</Button>
          <div className="text-center">
            <p className="text-sm text-gray-600">Lesson 12 of 20</p>
            <Progress value={60} className="w-32 mx-auto mt-1" />
          </div>
          <Button className="bg-black text-white">Next Lesson →</Button>
        </div>
      </div>
    </div>
  )
}
