import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  Calendar,
  Lightning,
  Target,
  ChartLine,
  Play,
  Clock,
  Barbell,
  Pulse,
  CheckCircle
} from '@phosphor-icons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '../hooks/useAuth'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useCreateSession } from '../features/sessions/hooks/useSession'

const DAY_TYPE_NAMES = {
  1: 'Push',
  2: 'Pull', 
  3: 'Legs'
} as const

// Mock data for development - in a real app this would come from the API
const mockProgressionData = [
  { week: 1, bench: 80, squat: 100, deadlift: 120, ohp: 50 },
  { week: 2, bench: 82, squat: 102.5, deadlift: 123, ohp: 51.25 },
  { week: 3, bench: 84, squat: 105, deadlift: 126, ohp: 52.5 },
  { week: 4, bench: 86, squat: 107.5, deadlift: 129, ohp: 53.75 },
]

const mockVolumeData = [
  { muscle: 'Chest', sets: 12, volume: 2400 },
  { muscle: 'Shoulders', sets: 10, volume: 1800 },
  { muscle: 'Triceps', sets: 8, volume: 1200 },
  { muscle: 'Back', sets: 14, volume: 2800 },
  { muscle: 'Biceps', sets: 6, volume: 900 },
  { muscle: 'Legs', sets: 16, volume: 3200 },
]

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff']

const DAY_TYPE_COLORS = {
  1: 'bg-blue-500',
  2: 'bg-green-500',
  3: 'bg-purple-500'
} as const

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isLoading: userLoading } = useAuth()
  const {
    nextDayType,
    nextDayName,
    nextDayDescription,
    workoutStreak,
    thisWeekSessions,
    lastWorkout,
    isTodayComplete,
    totalSessions
  } = useWorkoutPlan()
  const createSessionMutation = useCreateSession()

  const startNextWorkout = async () => {
    if (!user?.id) return
    
    try {
      const session = await createSessionMutation.mutateAsync({
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        dayType: nextDayType,
        notes: `${nextDayName} day workout`
      })

      navigate({ to: '/log/$id', params: { id: session.data.id } })
    } catch (error) {
      console.error('Failed to start workout:', error)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PPL Coach Dashboard</h1>
          <p className="text-muted-foreground">Track your Push/Pull/Legs progression</p>
        </div>
        <div className="flex gap-3">
          <Link to="/movements">
            <Button variant="outline" size="lg">
              <Target className="h-4 w-4 mr-2" />
              Browse Exercises
            </Button>
          </Link>
          <Link to="/plan">
            <Button size="lg">
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* Next Workout Card */}
      {!isTodayComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${DAY_TYPE_COLORS[nextDayType]}`} />
              Next Workout: {nextDayName} Day
            </CardTitle>
            <CardDescription>{nextDayDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {lastWorkout && (
                  <p className="text-sm text-muted-foreground">
                    Last: {lastWorkout.dayName} on {new Date(lastWorkout.date).toLocaleDateString()}
                  </p>
                )}
                <p className="text-sm font-medium">
                  Ready to continue your PPL split
                </p>
              </div>
              <Button
                onClick={startNextWorkout}
                disabled={createSessionMutation.isPending || userLoading}
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                {createSessionMutation.isPending ? 'Starting...' : `Start ${nextDayName}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today Complete Card */}
      {isTodayComplete && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Today's Workout Complete!
            </CardTitle>
            <CardDescription>Great job! Come back tomorrow for your next session.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-700">
                  Next up: {nextDayName} Day
                </p>
                <p className="text-sm text-green-600">
                  {nextDayDescription}
                </p>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-700">
                {workoutStreak} day streak
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {thisWeekSessions.length >= 3 ? 'Great week!' : `${3 - thisWeekSessions.length} more to go`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workout Streak</CardTitle>
            <Lightning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutStreak}</div>
            <p className="text-xs text-muted-foreground">
              {workoutStreak > 0 ? 'Keep it up!' : 'Start your streak today!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Barbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {totalSessions > 0 ? 'Strong progress!' : 'Start your journey'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Day</CardTitle>
            <Pulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nextDayName}</div>
            <p className="text-xs text-muted-foreground">
              Ready when you are
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PPL Guide for new users */}
      {totalSessions === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Welcome to PPL Coach!
            </CardTitle>
            <CardDescription>Get started with the Push/Pull/Legs training split</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-semibold">Push Day</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Chest, shoulders, and triceps. Pressing movements like bench press, overhead press, and dips.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Bench Press', 'OHP', 'Dips'].map(exercise => (
                    <Badge key={exercise} variant="outline" className="text-xs">
                      {exercise}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="font-semibold">Pull Day</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Back and biceps. Pulling movements like pull-ups, rows, and curls.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Pull-ups', 'Rows', 'Curls'].map(exercise => (
                    <Badge key={exercise} variant="outline" className="text-xs">
                      {exercise}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="font-semibold">Legs Day</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quads, hamstrings, glutes, and calves. Squats, deadlifts, and accessories.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Squats', 'Deadlifts', 'Lunges'].map(exercise => (
                    <Badge key={exercise} variant="outline" className="text-xs">
                      {exercise}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-3">Why PPL Works</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Balanced Training</h5>
                  <p className="text-xs text-muted-foreground">Each muscle group gets dedicated focus and recovery time</p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Flexible Schedule</h5>
                  <p className="text-xs text-muted-foreground">Adapt from 3x to 6x per week based on your goals</p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Progressive Overload</h5>
                  <p className="text-xs text-muted-foreground">Easy to track and increase weights systematically</p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Efficient Recovery</h5>
                  <p className="text-xs text-muted-foreground">Muscles rest and rebuild while others work</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={startNextWorkout}
                disabled={createSessionMutation.isPending || userLoading}
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Your First Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PPL Progression Chart */}
      {totalSessions > 0 && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartLine className="h-5 w-5" />
                  PPL Progression
                </CardTitle>
                <CardDescription>Weight progression over training cycles</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockProgressionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="bench" stroke="#8884d8" name="Bench Press" strokeWidth={2} />
                    <Line type="monotone" dataKey="squat" stroke="#82ca9d" name="Squat" strokeWidth={2} />
                    <Line type="monotone" dataKey="deadlift" stroke="#ffc658" name="Deadlift" strokeWidth={2} />
                    <Line type="monotone" dataKey="ohp" stroke="#ff7300" name="Overhead Press" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Weekly Volume Distribution
                </CardTitle>
                <CardDescription>Sets per muscle group this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockVolumeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ muscle, sets }) => `${muscle}: ${sets}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sets"
                    >
                      {mockVolumeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                This Week's Training Plan
              </CardTitle>
              <CardDescription>Your PPL training plan for Week 3</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    day: 'Monday',
                    type: 'Push',
                    exercises: ['Bench Press', 'Overhead Press', 'Dips', 'Lateral Raises'],
                    targetRpe: 8,
                    sets: '4x4'
                  },
                  {
                    day: 'Wednesday',
                    type: 'Pull',
                    exercises: ['Pull-ups', 'Barbell Rows', 'Face Pulls', 'Hammer Curls'],
                    targetRpe: 8,
                    sets: '4x4'
                  },
                  {
                    day: 'Friday',
                    type: 'Legs',
                    exercises: ['Squat', 'Romanian Deadlift', 'Bulgarian Split Squats', 'Calf Raises'],
                    targetRpe: 8,
                    sets: '4x4'
                  },
                ].map((workout) => (
                  <Card key={workout.day}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{workout.day}</CardTitle>
                      <CardDescription className="capitalize">{workout.type} Day</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Target RPE:</span>
                        <span className="font-medium">{workout.targetRpe}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Sets:</span>
                        <span className="font-medium">{workout.sets}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Exercises:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {workout.exercises.map((exercise, i) => (
                            <li key={i}>• {exercise}</li>
                          ))}
                        </ul>
                      </div>
                      <Button className="w-full" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Start Workout
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your last 5 workout sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {thisWeekSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Recent Workouts</h3>
                <p className="text-muted-foreground mb-4">
                  Start your first workout to see it appear here
                </p>
                <Button onClick={startNextWorkout} disabled={createSessionMutation.isPending}>
                  {createSessionMutation.isPending ? 'Starting...' : 'Start Your First Workout'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {thisWeekSessions.slice(0, 5).map((session) => {
                  const setLogs = session.setLogs || []
                  const totalVolume = setLogs.reduce((sum: number, set: any) =>
                    sum + (set.weightKg * set.reps), 0
                  )
                  const avgRpe = setLogs.length > 0
                    ? setLogs.reduce((sum: number, set: any) => sum + set.rpe, 0) / setLogs.length
                    : 0

                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate({ to: '/log/$id', params: { id: session.id } })}
                    >
                      <div>
                        <p className="font-medium capitalize">
                          {DAY_TYPE_NAMES[session.dayType as keyof typeof DAY_TYPE_NAMES]} Day
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{setLogs.length} sets</p>
                        <p className="text-muted-foreground">
                          {Math.round(totalVolume).toLocaleString()} kg • RPE {avgRpe.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {thisWeekSessions.length > 5 && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ to: '/history' })}
                    >
                      View All Sessions
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Records</CardTitle>
            <CardDescription>Your best lifts this cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { exercise: 'Bench Press', weight: '107 kg', date: '2024-01-15', previous: '105 kg' },
                { exercise: 'Squat', weight: '128 kg', date: '2024-01-11', previous: '125 kg' },
                { exercise: 'Deadlift', weight: '148 kg', date: '2024-01-11', previous: '145 kg' },
                { exercise: 'Overhead Press', weight: '53.75 kg', date: '2024-01-15', previous: '52.5 kg' },
              ].map((pr, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{pr.exercise}</p>
                    <p className="text-sm text-muted-foreground">{pr.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{pr.weight}</p>
                    <p className="text-sm text-green-600">+{parseFloat(pr.weight) - parseFloat(pr.previous)} kg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/plan">
              <Button className="w-full h-20 flex flex-col gap-2">
                <Play className="h-6 w-6" />
                <span>Start Workout</span>
              </Button>
            </Link>
            <Link to="/intervals">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Clock className="h-6 w-6" />
                <span>Interval Timer</span>
              </Button>
            </Link>
            <Link to="/progress">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <ChartLine className="h-6 w-6" />
                <span>View Progress</span>
              </Button>
            </Link>
            <Link to="/movements">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Target className="h-6 w-6" />
                <span>Browse Exercises</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
