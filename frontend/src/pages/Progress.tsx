import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  TrendUp,
  Calendar,
  Target,
  Barbell,
  Pulse,
  ChartLine,
  Trophy,
  Clock,
  Play,
  Lightning
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { usePersonalRecords, useProgressSummary } from '../hooks/useProgress'
import { useUserSessions, useSessionStats } from '../hooks/useSessions'
import { LoadingState, SkeletonCard } from '../components/ui/loading'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Progress() {
  const [activeTab, setActiveTab] = useState<'overview' | 'strength' | 'volume'>('overview')

  const { data: personalRecords, isLoading: prLoading } = usePersonalRecords()
  const { data: progressSummary, isLoading: summaryLoading } = useProgressSummary()
  const { data: sessions = [], isLoading: sessionsLoading } = useUserSessions()
  const sessionStats = useSessionStats(sessions)

  const isLoading = prLoading || summaryLoading || sessionsLoading
  const hasData = sessions.length > 0 || personalRecords?.length || progressSummary?.personalRecords?.length

  // Generate weekly data from sessions
  const weeklyData = sessions.reduce((acc, session) => {
    const weekStart = new Date(session.date)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekKey = weekStart.toISOString().split('T')[0]

    if (!acc[weekKey]) {
      acc[weekKey] = {
        week: weekKey,
        sessions: 0,
        volume: 0,
        avgRpe: 0,
        totalRpe: 0,
        rpeCount: 0
      }
    }

    acc[weekKey].sessions++
    const sessionVolume = session.setLogs.reduce((sum, set) => sum + (set.weightKg * set.reps), 0)
    acc[weekKey].volume += sessionVolume

    const sessionRpes = session.setLogs.filter(set => set.rpe > 0)
    if (sessionRpes.length > 0) {
      const sessionAvgRpe = sessionRpes.reduce((sum, set) => sum + set.rpe, 0) / sessionRpes.length
      acc[weekKey].totalRpe += sessionAvgRpe
      acc[weekKey].rpeCount++
    }

    return acc
  }, {} as Record<string, any>)

  const chartData = Object.values(weeklyData).map((week: any) => ({
    ...week,
    avgRpe: week.rpeCount > 0 ? Math.round((week.totalRpe / week.rpeCount) * 10) / 10 : 0,
    weekLabel: `Week ${Object.keys(weeklyData).indexOf(week.week) + 1}`
  })).slice(-8) // Last 8 weeks

  // Muscle group data from sessions
  const muscleGroupData = progressSummary?.muscleGroupProgress || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-6xl mx-auto pt-12 pb-8 px-6">
          <LoadingState message="Loading your progress..." />
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-4xl mx-auto pt-12 pb-8 px-6">
          {/* Empty State - Beautifully designed */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Start Tracking Progress</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete your first workout to see amazing insights, progress charts, and personal records.
            </p>
          </div>

          <div className="glass rounded-2xl p-8 text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChartLine className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your Progress Awaits</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Once you complete a few workouts, you'll see detailed analytics about your strength gains,
              volume progression, and personal records.
            </p>
            <Link to="/plan">
              <Button size="lg" className="btn-hover h-12 px-8 text-base font-semibold">
                <Play className="h-5 w-5 mr-2" />
                Start Your First Workout
              </Button>
            </Link>
          </div>

          {/* Preview of what's coming */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass rounded-xl p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Personal Records</h3>
              <p className="text-sm text-muted-foreground">Track your best lifts and celebrate new PRs</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <TrendUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Strength Progression</h3>
              <p className="text-sm text-muted-foreground">Visualize your gains over time with beautiful charts</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <Barbell className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Volume Analysis</h3>
              <p className="text-sm text-muted-foreground">Optimize your training volume per muscle group</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-6xl mx-auto pt-12 pb-8 px-6">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Progress Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Track your PPL journey and celebrate your gains
          </p>
        </div>

        {/* Key Metrics - Real data! */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-6 text-center group hover:shadow-md transition-all duration-200">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <div className="text-2xl font-bold mb-1">{sessionStats.thisWeekSessions}</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>

          <div className="glass rounded-xl p-6 text-center group hover:shadow-md transition-all duration-200">
            <Barbell className="h-8 w-8 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <div className="text-2xl font-bold mb-1">{Math.round(sessionStats.totalVolume).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Volume (kg)</div>
          </div>

          <div className="glass rounded-xl p-6 text-center group hover:shadow-md transition-all duration-200">
            <Pulse className="h-8 w-8 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <div className="text-2xl font-bold mb-1">{sessionStats.averageRpe || 'N/A'}</div>
            <div className="text-sm text-muted-foreground">Average RPE</div>
          </div>

          <div className="glass rounded-xl p-6 text-center group hover:shadow-md transition-all duration-200">
            <Lightning className="h-8 w-8 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <div className="text-2xl font-bold mb-1">{sessionStats.workoutStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-muted/50 p-1 rounded-lg">
          {[
            { key: 'overview', label: 'Overview', icon: ChartLine },
            { key: 'strength', label: 'Strength', icon: Trophy },
            { key: 'volume', label: 'Volume', icon: Barbell },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                activeTab === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {chartData.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Weekly Sessions</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="weekLabel" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Volume Progression</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="weekLabel" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Not Enough Data Yet</h3>
                <p className="text-muted-foreground">Complete a few more workouts to see progression charts</p>
              </div>
            )}
          </div>
        )}

        {/* Strength Tab */}
        {activeTab === 'strength' && (
          <div className="space-y-6">
            {personalRecords && personalRecords.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalRecords.map((pr) => (
                  <div key={pr.id} className="glass rounded-xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(pr.achievedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2">{pr.movementName}</h3>
                    <div className="text-2xl font-bold mb-1">{pr.weightKg}kg × {pr.reps}</div>
                    <div className="text-sm text-muted-foreground">
                      Est. 1RM: {Math.round(pr.estimatedOneRepMax)}kg
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Personal Records Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start lifting to track your personal bests and estimated 1RMs
                </p>
                <Link to="/plan">
                  <Button className="btn-hover">
                    <Play className="h-4 w-4 mr-2" />
                    Start Training
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Volume Tab */}
        {activeTab === 'volume' && (
          <div className="space-y-6">
            {muscleGroupData.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Sets per Muscle Group</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={muscleGroupData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="muscleGroup" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalSets" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Volume Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={muscleGroupData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="totalVolume"
                        label={({ muscleGroup, totalVolume }) => `${muscleGroup}: ${Math.round(totalVolume)}kg`}
                      >
                        {muscleGroupData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 text-center">
                <Barbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Volume Data Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Complete workouts to see volume analysis per muscle group
                </p>
                <Link to="/plan">
                  <Button className="btn-hover">
                    <Play className="h-4 w-4 mr-2" />
                    Start Training
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}