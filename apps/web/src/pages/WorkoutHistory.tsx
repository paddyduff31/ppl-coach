import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Calendar, 
  Barbell, 
  Target, 
  Clock,
  Eye,
  ChartLine,
  Lightning,
  TrendUp,
  Play,
  MagnifyingGlass,
  Funnel
} from '@phosphor-icons/react'
import { useUserSessions, useSessionStats } from '../hooks/useSessions'
import { cn } from '../utils/utils'

const DAY_TYPE_NAMES = {
  1: 'Push',
  2: 'Pull', 
  3: 'Legs'
} as const

const DAY_TYPE_COLORS = {
  1: 'bg-blue-500',
  2: 'bg-green-500',
  3: 'bg-purple-500'
} as const

export default function WorkoutHistory() {
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: allSessions = [], isLoading } = useUserSessions()
  const sessionStats = useSessionStats(allSessions)

  // Filter sessions based on period and search
  const filteredSessions = allSessions.filter(session => {
    const sessionDate = new Date(session.date)
    const now = new Date()
    
    // Period filter
    let withinPeriod = true
    if (selectedPeriod === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      withinPeriod = sessionDate >= weekAgo
    } else if (selectedPeriod === 'month') {
      const monthAgo = new Date(now)
      monthAgo.setDate(now.getDate() - 30)
      withinPeriod = sessionDate >= monthAgo
    }

    // Search filter
    const matchesSearch = searchQuery === '' || 
      DAY_TYPE_NAMES[session.dayType as keyof typeof DAY_TYPE_NAMES].toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.notes?.toLowerCase().includes(searchQuery.toLowerCase())

    return withinPeriod && matchesSearch
  })

  const calculateSessionStats = (session: any) => {
    const setLogs = session.setLogs || []
    const totalVolume = setLogs.reduce((sum: number, set: any) => 
      sum + (set.weightKg * set.reps), 0
    )
    const avgRpe = setLogs.length > 0 
      ? setLogs.reduce((sum: number, set: any) => sum + (set.rpe || 0), 0) / setLogs.length 
      : 0
    
    return {
      totalVolume: Math.round(totalVolume),
      avgRpe: avgRpe > 0 ? avgRpe.toFixed(1) : 'N/A',
      setCount: setLogs.length,
      exerciseCount: new Set(setLogs.map((set: any) => set.movementId)).size
    }
  }

  const viewSession = (sessionId: string) => {
    navigate({ to: '/log/$id', params: { id: sessionId } })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    })
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="pt-16 pb-12 px-8 border-b border-gray-100 animate-fade-in-up">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6 animate-scale-in">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Workout History
              </span>
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-4 animate-fade-in-up">
              Your Training Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
              {filteredSessions.length > 0 
                ? `${filteredSessions.length} sessions in the ${selectedPeriod === 'all' ? 'total' : `last ${selectedPeriod}`}`
                : "Your workout history will appear here as you train"
              }
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="px-8 py-8 border-t border-gray-100">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{sessionStats.thisWeekSessions}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">This Week</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Lightning className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{sessionStats.workoutStreak}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Current Streak</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{sessionStats.totalSessions}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Total Sessions</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{Math.round(sessionStats.totalVolume).toLocaleString()}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Total Volume (kg)</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-8 py-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlass className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-gray-200 rounded-xl bg-white"
              />
            </div>
            
            <div className="flex gap-2">
              {[
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'all', label: 'All Time' }
              ].map((period) => (
                <Button
                  key={period.key}
                  variant={selectedPeriod === period.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.key as any)}
                  className="rounded-xl"
                >
                  {period.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Funnel className="h-4 w-4" />
              {filteredSessions.length} sessions
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="px-8 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading workout history...</div>
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const stats = calculateSessionStats(session)
                const dayType = session.dayType as keyof typeof DAY_TYPE_NAMES
                
                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    onClick={() => viewSession(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-3 h-3 rounded-full", DAY_TYPE_COLORS[dayType])} />
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {DAY_TYPE_NAMES[dayType]} Day
                            </h3>
                            <p className="text-gray-600">{formatDate(session.date)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6 text-center">
                          <div>
                            <div className="text-lg font-bold text-gray-900">{stats.exerciseCount}</div>
                            <div className="text-xs text-gray-500">Exercises</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">{stats.setCount}</div>
                            <div className="text-xs text-gray-500">Sets</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">{stats.totalVolume.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Volume (kg)</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">{stats.avgRpe}</div>
                            <div className="text-xs text-gray-500">Avg RPE</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            viewSession(session.id)
                          }}
                          className="rounded-xl"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                          <ChartLine className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    {session.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 italic">"{session.notes}"</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No matching workouts' : 'No workouts yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? `No sessions match "${searchQuery}" in the selected time period`
                  : 'Start your first workout to see your training history here'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => navigate({ to: '/' })}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 py-3"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start First Workout
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {filteredSessions.length > 0 && (
          <div className="px-8 py-8 border-t border-gray-100">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ChartLine className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Detailed Analytics</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  View comprehensive progress charts and trends
                </p>
                <Button
                  onClick={() => navigate({ to: '/progress' })}
                  variant="outline" 
                  size="sm" 
                  className="w-full rounded-xl"
                >
                  View Progress
                </Button>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Start New Workout</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Continue your training with a new session
                </p>
                <Button
                  onClick={() => navigate({ to: '/' })}
                  variant="outline" 
                  size="sm" 
                  className="w-full rounded-xl"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
