import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Calendar, 
  Barbell, 
  Target, 
  ArrowLeft,
  Eye,
  ChartLine
} from '@phosphor-icons/react'
import { useUser } from '../hooks/useUser'
import { useUserSessions } from '../hooks/useSessions'

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
  const { userId } = useUser()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month')
  
  // Calculate date range based on selected period
  const getDateRange = () => {
    const now = new Date()
    switch (selectedPeriod) {
      case 'week':
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        return {
          startDate: weekAgo.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        }
      case 'month':
        const monthAgo = new Date(now)
        monthAgo.setDate(now.getDate() - 30)
        return {
          startDate: monthAgo.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        }
      case 'all':
        return { startDate: undefined, endDate: undefined }
    }
  }

  const { startDate, endDate } = getDateRange()
  const { data: sessionsResponse, isLoading } = useUserSessions(userId!, startDate, endDate)
  const sessions = sessionsResponse?.data || []

  const calculateSessionStats = (session: any) => {
    const setLogs = session.setLogs || []
    const totalVolume = setLogs.reduce((sum: number, set: any) => 
      sum + (set.weightKg * set.reps), 0
    )
    const avgRpe = setLogs.length > 0 
      ? setLogs.reduce((sum: number, set: any) => sum + set.rpe, 0) / setLogs.length 
      : 0
    
    return {
      totalVolume: Math.round(totalVolume),
      avgRpe: avgRpe.toFixed(1),
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
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getPeriodStats = () => {
    if (sessions.length === 0) return null

    const totalSessions = sessions.length
    const totalSets = sessions.reduce((sum, session) => sum + (session.setLogs?.length || 0), 0)
    const totalVolume = sessions.reduce((sum, session) => {
      const sessionVolume = (session.setLogs || []).reduce((s: number, set: any) => 
        s + (set.weightKg * set.reps), 0
      )
      return sum + sessionVolume
    }, 0)

    return {
      totalSessions,
      totalSets,
      totalVolume: Math.round(totalVolume)
    }
  }

  const stats = getPeriodStats()

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Workout History</h1>
            <p className="text-muted-foreground">View and analyze your past workout sessions</p>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter by Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { key: 'week', label: 'Last 7 Days' },
              { key: 'month', label: 'Last 30 Days' },
              { key: 'all', label: 'All Time' }
            ].map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period.key as any)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Period Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <ChartLine className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalSets}</p>
                  <p className="text-sm text-muted-foreground">Total Sets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Barbell className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalVolume.toLocaleString()} kg</p>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Sessions</CardTitle>
          <CardDescription>
            {sessions.length === 0 
              ? 'No sessions found for the selected period'
              : `${sessions.length} session${sessions.length === 1 ? '' : 's'} found`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Workouts Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first workout to see it appear here
              </p>
              <Button onClick={() => navigate({ to: '/plan' })}>
                Start Your First Workout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const stats = calculateSessionStats(session)
                const dayType = session.dayType as keyof typeof DAY_TYPE_NAMES
                
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${DAY_TYPE_COLORS[dayType]}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium capitalize">
                            {DAY_TYPE_NAMES[dayType]} Day
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {stats.setCount} sets
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(session.date)}
                        </p>
                        {session.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="font-medium">{stats.totalVolume.toLocaleString()} kg</p>
                        <p className="text-muted-foreground">Volume</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">RPE {stats.avgRpe}</p>
                        <p className="text-muted-foreground">Avg RPE</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{stats.exerciseCount}</p>
                        <p className="text-muted-foreground">Exercises</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewSession(session.id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
