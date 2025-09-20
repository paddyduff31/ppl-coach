import { Button } from '../components/ui/button'
import {
  Play,
  Lightning,
  Target,
  Calendar,
  Clock,
  ArrowRight,
  TrendUp
} from '@phosphor-icons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useCreateSession } from '../hooks/useSession'
import { useUserSessions, useSessionStats } from '../hooks/useSessions'
import { useShuffleMovements } from '../hooks/useMovements'
import { cn } from '../utils/utils'

const DAY_TYPE_NAMES = {
  1: 'Push',
  2: 'Pull',
  3: 'Legs'
} as const

const DAY_TYPE_COLORS = {
  1: 'from-blue-500/20 to-blue-600/20',
  2: 'from-green-500/20 to-green-600/20',
  3: 'from-purple-500/20 to-purple-600/20'
} as const

const DAY_TYPE_BORDERS = {
  1: 'border-blue-200',
  2: 'border-green-200',
  3: 'border-purple-200'
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
  const shuffleMovementsMutation = useShuffleMovements()
  const { data: allSessions = [] } = useUserSessions()
  const sessionStats = useSessionStats(allSessions)

  const startNextWorkout = async () => {
    if (!user?.id) return

    try {
      // Create the session
      const session = await createSessionMutation.mutateAsync({
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        dayType: nextDayType,
        notes: `${nextDayName} day workout`
      })

      // Navigate to session - exercises will be auto-loaded there
      navigate({ to: '/log/$id', params: { id: session.data.id } })
    } catch (error) {
      console.error('Failed to start workout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-4xl mx-auto pt-12 pb-8 px-6">

        {/* Hero Section - Clean and focused */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            {isTodayComplete ? 'Well done!' : `Ready for ${nextDayName}?`}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isTodayComplete
              ? "You've completed today's workout. Come back tomorrow for your next session."
              : totalSessions === 0
                ? "Start your fitness journey with a simple, effective Push/Pull/Legs split."
                : nextDayDescription
            }
          </p>
        </div>

        {/* Main Action Card */}
        {!isTodayComplete && (
          <div className={cn(
            "relative overflow-hidden rounded-2xl border p-8 mb-8 animate-fade-in transition-all duration-300 hover:shadow-lg",
            `bg-gradient-to-br ${DAY_TYPE_COLORS[nextDayType]}`,
            DAY_TYPE_BORDERS[nextDayType]
          )}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-2xl font-bold mb-2 flex items-center gap-3">
                    <Target className="h-8 w-8" />
                    {nextDayName} Day
                  </div>
                  {lastWorkout && (
                    <p className="text-sm text-muted-foreground">
                      Last: {lastWorkout.dayName} on {new Date(lastWorkout.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  onClick={startNextWorkout}
                  disabled={createSessionMutation.isPending || userLoading}
                  size="lg"
                  className="btn-hover h-12 px-8 text-base font-semibold"
                >
                  {createSessionMutation.isPending ? (
                    'Starting...'
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start Workout
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Subtle background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <Target className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Today Complete State */}
        {isTodayComplete && (
          <div className="glass rounded-2xl border border-green-200/50 p-8 mb-8 animate-fade-in bg-gradient-to-br from-green-50/50 to-emerald-50/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightning className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-green-900">Workout Complete!</h2>
              <p className="text-green-700 mb-6">
                Great job finishing today's {lastWorkout?.dayName} session
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-sm font-medium text-green-800">
                <Lightning className="h-4 w-4" />
                {workoutStreak} day streak
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - Real data! */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-6 text-center group hover:shadow-md transition-all duration-200">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <div className="text-2xl font-bold mb-1">{sessionStats.thisWeekSessions}</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>

          <div className="glass rounded-xl p-6 text-center group hover:shadow-md transition-all duration-200">
            <Lightning className="h-8 w-8 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <div className="text-2xl font-bold mb-1">{sessionStats.workoutStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>

          <div className="glass rounded-xl p-6 text-center group hover:shadow-md transition-all duration-200">
            <TrendUp className="h-8 w-8 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <div className="text-2xl font-bold mb-1">{sessionStats.totalSessions}</div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </div>

          <div className="glass rounded-xl p-6 text-center group hover:shadow-md transition-all duration-200">
            <Target className="h-8 w-8 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <div className="text-2xl font-bold mb-1">{Math.round(sessionStats.totalVolume).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Volume (kg)</div>
          </div>
        </div>

        {/* Quick Actions - Focused on core actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link to="/history" className="group">
            <div className="glass rounded-xl p-6 text-left hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="font-semibold mb-1">Workout History</div>
              <div className="text-sm text-muted-foreground">
                {sessionStats.thisWeekSessions > 0
                  ? `${sessionStats.thisWeekSessions} sessions this week`
                  : 'View your progress over time'
                }
              </div>
            </div>
          </Link>

          <Link to="/progress" className="group">
            <div className="glass rounded-xl p-6 text-left hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <TrendUp className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="font-semibold mb-1">Progress & PRs</div>
              <div className="text-sm text-muted-foreground">
                Track your personal records and improvements
              </div>
            </div>
          </Link>
        </div>

        {/* First-time user guidance - Clean and minimal */}
        {totalSessions === 0 && (
          <div className="glass rounded-2xl p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-3">Getting Started with PPL</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Push/Pull/Legs is a simple, effective split that works for beginners and advanced lifters alike.
                Each muscle group gets focused work and adequate recovery.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  type: 'Push',
                  color: 'blue',
                  description: 'Chest, shoulders, triceps',
                  exercises: ['Bench Press', 'Overhead Press', 'Dips']
                },
                {
                  type: 'Pull',
                  color: 'green',
                  description: 'Back, biceps, rear delts',
                  exercises: ['Pull-ups', 'Rows', 'Curls']
                },
                {
                  type: 'Legs',
                  color: 'purple',
                  description: 'Quads, hamstrings, glutes',
                  exercises: ['Squats', 'Deadlifts', 'Lunges']
                }
              ].map((day, i) => (
                <div key={day.type} className="text-center">
                  <div className={`w-16 h-16 bg-${day.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Target className={`h-8 w-8 text-${day.color}-600`} />
                  </div>
                  <h3 className="font-semibold mb-2">{day.type} Day</h3>
                  <p className="text-sm text-muted-foreground mb-4">{day.description}</p>
                  <div className="space-y-1">
                    {day.exercises.map(exercise => (
                      <div key={exercise} className="text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1 inline-block mr-1">
                        {exercise}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={startNextWorkout}
                disabled={createSessionMutation.isPending || userLoading}
                size="lg"
                className="btn-hover h-12 px-8 text-base font-semibold"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Your First Workout
              </Button>
            </div>
          </div>
        )}

        {/* Recent Sessions Preview - Clean list */}
        {allSessions.length > 0 && (
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Sessions</h2>
              <Link to="/history">
                <Button variant="ghost" size="sm" className="text-sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {allSessions.slice(0, 3).map((session, i) => {
                const setLogs = session.setLogs || []
                const totalSets = setLogs.length
                const sessionVolume = setLogs.reduce((sum, set) => sum + (set.weightKg * set.reps), 0)

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => navigate({ to: '/log/$id', params: { id: session.id } })}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${DAY_TYPE_COLORS[session.dayType as keyof typeof DAY_TYPE_COLORS].replace('from-', 'bg-').split(' ')[0].replace('/20', '')}`} />
                      <div>
                        <div className="font-medium">
                          {DAY_TYPE_NAMES[session.dayType as keyof typeof DAY_TYPE_NAMES]} Day
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{totalSets} sets</div>
                        <div className="text-xs text-muted-foreground">{Math.round(sessionVolume)}kg</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}