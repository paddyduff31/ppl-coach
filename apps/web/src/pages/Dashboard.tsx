import { Button } from '../components/ui/button'
import {
  Play,
  Lightning,
  Target,
  Calendar,
  Clock,
  ArrowRight,
  TrendUp,
  Timer,
  Barbell
} from '@phosphor-icons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useCreateSession } from '../hooks/useSession'
import { useUserSessions, useSessionStats } from '../hooks/useSessions'
import { useShuffleMovements } from '../hooks/useMovements'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
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

  // Dashboard-specific keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Enter',
      action: () => {
        if (!isTodayComplete) {
          startNextWorkout()
        }
      },
      description: 'Start workout (when available)'
    },
    {
      key: 's',
      metaKey: true,
      action: startNextWorkout,
      description: 'Start workout'
    }
  ])


  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Streamlined Header - Most Important Info First */}
        <div className="pt-16 pb-8 px-8 animate-fade-in-up">
          <div className="text-center">
            {isTodayComplete ? (
              /* Completed State - Celebrate Success */
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-600 uppercase tracking-wider">
                    Today Complete
                  </span>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lightning className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-3">
                  Well done!
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  {lastWorkout?.dayName} session completed • {workoutStreak} day streak
                </p>
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-green-50 rounded-2xl border border-green-200">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Come back tomorrow for your next workout
                  </span>
                </div>
              </div>
            ) : (
              /* Ready State - Focus on Next Action */
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    `bg-gradient-to-r ${DAY_TYPE_COLORS[nextDayType].replace('/20', '')}`
                  )} />
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {nextDayName} Day Ready
                  </span>
                </div>
                <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-4">
                  Ready for {nextDayName}?
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  {totalSessions === 0
                    ? "Start your fitness journey with a simple, effective Push/Pull/Legs split."
                    : nextDayDescription
                  }
                </p>
                
                {/* Primary Action - Most Prominent */}
                <div className="flex justify-center">
                  <Button
                    onClick={startNextWorkout}
                    disabled={createSessionMutation.isPending || userLoading}
                    className="h-16 px-12 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-2xl"
                  >
                    {createSessionMutation.isPending ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Starting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <Play className="h-6 w-6" />
                        Start {nextDayName} Workout
                        {lastWorkout && (
                          <span className="text-sm opacity-75">
                            Last: {new Date(lastWorkout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics - Only Most Important Stats */}
        <div className="px-8 py-8 border-t border-gray-100">
          <div className="grid md:grid-cols-3 gap-8 animate-stagger">
            <div className="text-center group">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{sessionStats.thisWeekSessions}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">This Week</div>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-100 transition-colors">
                <Lightning className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{sessionStats.workoutStreak}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Day Streak</div>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-100 transition-colors">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{Math.round(sessionStats.totalVolume).toLocaleString()}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Total Volume (kg)</div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Secondary Priority */}
        <div className="px-8 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/history" className="group">
              <div className="bg-white rounded-2xl p-8 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-200 hover:scale-[1.01]">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Workout History</h3>
                <p className="text-gray-500">
                  {sessionStats.thisWeekSessions > 0
                    ? `${sessionStats.thisWeekSessions} sessions this week`
                    : 'View your progress over time'
                  }
                </p>
              </div>
            </Link>

            <Link to="/progress" className="group">
              <div className="bg-white rounded-2xl p-8 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-200 hover:scale-[1.01]">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <TrendUp className="h-6 w-6 text-gray-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress & PRs</h3>
                <p className="text-gray-500">
                  Track your personal records and improvements
                </p>
              </div>
            </Link>

            <Link to="/plan" className="group">
              <div className="bg-white rounded-2xl p-8 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-200 hover:scale-[1.01]">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Barbell className="h-6 w-6 text-blue-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Plan Your Workout</h3>
                <p className="text-gray-500">
                  Customize your next {nextDayName.toLowerCase()} day session
                </p>
              </div>
            </Link>

            <Link to="/intervals" className="group">
              <div className="bg-white rounded-2xl p-8 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-200 hover:scale-[1.01]">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <Timer className="h-6 w-6 text-orange-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Interval Timer</h3>
                <p className="text-gray-500">
                  HIIT, Tabata, Norwegian 4x4 cardio sessions
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity - Tertiary Priority */}
        {allSessions.length > 0 && (
          <div className="px-8 pb-12">
            <div className="bg-white rounded-3xl p-8 border border-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <Link to="/history">
                  <Button variant="outline" className="text-sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
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
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                      onClick={() => navigate({ to: '/log/$id', params: { id: session.id } })}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${DAY_TYPE_COLORS[session.dayType as keyof typeof DAY_TYPE_COLORS].replace('from-', 'bg-').split(' ')[0].replace('/20', '')}`} />
                        <div>
                          <div className="font-medium text-gray-900">
                            {DAY_TYPE_NAMES[session.dayType as keyof typeof DAY_TYPE_NAMES]} Day
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(session.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{totalSets} sets</div>
                          <div className="text-xs text-gray-500">{Math.round(sessionVolume)}kg</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* First-time user guidance - Only show when truly needed */}
        {totalSessions === 0 && !isTodayComplete && (
          <div className="px-8 pb-12">
            <div className="bg-gray-50 rounded-3xl p-12 border border-gray-200/50">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Getting Started with PPL</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Push/Pull/Legs is a simple, effective split. Each muscle group gets focused work and adequate recovery.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
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
                  <div key={day.type} className="text-center p-6 bg-white rounded-2xl border border-gray-200">
                    <div className={`w-12 h-12 bg-${day.color}-50 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Target className={`h-6 w-6 text-${day.color}-600`} />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{day.type} Day</h4>
                    <p className="text-sm text-gray-600 mb-4">{day.description}</p>
                    <div className="space-y-1">
                      {day.exercises.map(exercise => (
                        <div key={exercise} className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                          {exercise}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

