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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Header */}
        <div className="text-center space-y-6 mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <ChartLine className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">Your Journey</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Progress Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Track your PPL journey and celebrate every gain.
              Your consistency is building strength.
            </p>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50" />
            <div className="relative p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{sessionStats.thisWeekSessions}</div>
              <div className="text-sm font-medium text-gray-600">This Week</div>
              <div className="text-xs text-gray-500 mt-1">Workouts completed</div>
            </div>
          </div>

          <div className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50" />
            <div className="relative p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Barbell className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{Math.round(sessionStats.totalVolume).toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600">Total Volume</div>
              <div className="text-xs text-gray-500 mt-1">Kilograms lifted</div>
            </div>
          </div>

          <div className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-50" />
            <div className="relative p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Pulse className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{sessionStats.averageRpe || 'N/A'}</div>
              <div className="text-sm font-medium text-gray-600">Average RPE</div>
              <div className="text-xs text-gray-500 mt-1">Effort intensity</div>
            </div>
          </div>

          <div className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50" />
            <div className="relative p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Lightning className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{sessionStats.workoutStreak}</div>
              <div className="text-sm font-medium text-gray-600">Day Streak</div>
              <div className="text-xs text-gray-500 mt-1">Consistency</div>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-2 inline-flex">
            {[
              { key: 'overview', label: 'Overview', icon: ChartLine, gradient: 'from-blue-500 to-cyan-500' },
              { key: 'strength', label: 'Strength', icon: Trophy, gradient: 'from-yellow-500 to-orange-500' },
              { key: 'volume', label: 'Volume', icon: Barbell, gradient: 'from-purple-500 to-indigo-500' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`relative flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'text-white bg-gradient-to-r shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } ${activeTab === tab.key ? tab.gradient : ''}`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.key ? 'text-white' : ''}`} />
                <span>{tab.label}</span>
                {activeTab === tab.key && (
                  <div className="absolute inset-0 bg-gradient-to-r opacity-20 rounded-xl" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {chartData.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 group hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Weekly Sessions</h3>
                      <p className="text-sm text-gray-500">Your training consistency</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="weekLabel"
                        axisLine={false}
                        tickLine={false}
                        className="text-gray-600 text-xs"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        className="text-gray-600 text-xs"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar
                        dataKey="sessions"
                        radius={[8, 8, 0, 0]}
                        fill="url(#blueGradient)"
                      />
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 group hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                      <TrendUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Volume Progression</h3>
                      <p className="text-sm text-gray-500">Your strength gains over time</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="weekLabel"
                        axisLine={false}
                        tickLine={false}
                        className="text-gray-600 text-xs"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        className="text-gray-600 text-xs"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="url(#greenGradient)"
                        strokeWidth={4}
                        dot={{ fill: '#10b981', strokeWidth: 3, r: 6, stroke: 'white' }}
                        activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 3, fill: 'white' }}
                      />
                      <defs>
                        <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
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
          <div className="space-y-8">
            {personalRecords && personalRecords.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalRecords.map((pr, index) => (
                  <div
                    key={pr.id}
                    className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-60" />

                    <div className="relative p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                            Personal Record
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {new Date(pr.achievedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight">
                        {pr.movementName}
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Best Set</span>
                          <span className="text-2xl font-bold text-gray-900">
                            {pr.weightKg}kg × {pr.reps}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Est. 1RM</span>
                          <span className="text-lg font-bold text-gray-900">
                            {Math.round(pr.estimatedOneRepMax)}kg
                          </span>
                        </div>
                      </div>

                      {/* Progress indicator */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span>Keep pushing your limits!</span>
                        </div>
                      </div>
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