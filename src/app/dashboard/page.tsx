import { Button } from "@/components/ui/button";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
} from "@clerk/nextjs";

async function Page() {
//   const user = await currentUser();
//   if (!user) redirect("/");
  return (
    <div className="bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {displayName}!</h1>
          <p className="text-gray-600">Continue your language learning journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Courses */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
                <Button variant="outline" asChild>
                  <Link href="/courses">Browse More</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {currentCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={course.image || "/placeholder.svg"}
                          alt={course.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">{course.name}</h3>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{course.quizScore}% avg</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{course.nextLesson}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <span>
                              {course.completedLessons}/{course.totalLessons} lessons
                            </span>
                            <span>{course.timeSpent} studied</span>
                            <span>Last: {course.lastStudied}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={course.progress} className="flex-1" />
                            <span className="text-sm font-medium text-gray-700">{course.progress}%</span>
                          </div>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                          <Link href={`/course/${course.id}/learn`}>Continue</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Learning Goals */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Learning Goals</h2>
                <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set a New Learning Goal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Goal Description</label>
                        <Textarea
                          placeholder="e.g., Complete intermediate French course"
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Target Date</label>
                        <Input type="date" value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} />
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Create Goal</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-3">
                {goals.map((goal) => (
                  <Card key={goal.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{goal.title}</h3>
                        <div className="flex items-center gap-2">
                          {goal.reminder && <Bell className="h-4 w-4 text-blue-600" />}
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={goal.progress} className="flex-1" />
                        <span className="text-sm font-medium text-gray-700">{goal.progress}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Weekly Progress */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  This Week's Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-3 mb-6">
                  {weeklyActivity.map((day, index) => (
                    <div key={day.day} className="text-center">
                      <div className="text-xs text-gray-500 mb-2">{day.day}</div>
                      <div
                        className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-xs font-medium ${
                          day.studied ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {day.studied ? day.lessons : "0"}
                      </div>
                      {day.studied && <div className="text-xs text-gray-500 mt-1">{day.minutes}m</div>}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{currentStreak}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{totalMinutesThisWeek}</div>
                    <div className="text-sm text-gray-600">Minutes This Week</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Study Time</span>
                  <span className="font-semibold text-gray-900">47h 30m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lessons Completed</span>
                  <span className="font-semibold text-gray-900">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold text-blue-600">{currentStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Languages Learning</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Achievement Points</span>
                  <span className="font-semibold text-yellow-600">425</span>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h2>
              <div className="space-y-3">
                {achievements.slice(0, 4).map((achievement, index) => (
                  <Card
                    key={index}
                    className={`border ${
                      achievement.earned ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl ${achievement.earned ? "" : "grayscale opacity-50"}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-medium text-sm ${achievement.earned ? "text-green-800" : "text-gray-600"}`}
                          >
                            {achievement.name}
                          </h3>
                          <p className={`text-xs ${achievement.earned ? "text-green-600" : "text-gray-500"}`}>
                            {achievement.description}
                          </p>
                          {!achievement.earned && achievement.progress && (
                            <div className="mt-2">
                              <Progress value={(achievement.progress / achievement.total) * 100} className="h-1" />
                              <span className="text-xs text-gray-500">
                                {achievement.progress}/{achievement.total}
                              </span>
                            </div>
                          )}
                        </div>
                        {achievement.earned && (
                          <Badge className="bg-green-100 text-green-800 text-xs">+{achievement.points}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/achievements">View All Achievements</Link>
                </Button>
              </div>
            </div>

            {/* Starred Courses */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Starred Courses</h2>
              <div className="space-y-3">
                {starredCourses.map((course, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-gray-900">{course.name}</h3>
                          <p className="text-xs text-gray-600">by {course.author}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{course.rating}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/starred">View All Starred</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
