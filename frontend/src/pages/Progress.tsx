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
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto pt-12 pb-8 px-6">
          <LoadingState message="Loading your progress..." />
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="pt-16 pb-12 px-8 border-b border-gray-100 animate-fade-in-up">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-6 animate-scale-in">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Progress Tracking
                </span>
              </div>
              <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-4 animate-fade-in-up">
                Start Tracking Progress
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
                Complete your first workout to see insights, progress charts, and personal records
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/50 mb-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ChartLine className="h-8 w-8 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Your Progress Awaits</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Once you complete a few workouts, you'll see detailed analytics about your strength gains and volume progression.
              </p>
              <Link to="/">
                <Button className="h-12 px-8 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold">
                  <Play className="h-5 w-5 mr-2" />
                  Start Your First Workout
                </Button>
              </Link>
            </div>

            {/* Preview Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-200/50">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-semibold mb-2">Personal Records</h3>
                <p className="text-sm text-gray-500">Track your best lifts and celebrate new PRs</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-200/50">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendUp className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-semibold mb-2">Strength Progression</h3>
                <p className="text-sm text-gray-500">Visualize your gains over time with clean charts</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-200/50">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Barbell className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-semibold mb-2">Volume Analysis</h3>
                <p className="text-sm text-gray-500">Optimize your training volume per muscle group</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="pt-16 pb-12 px-8 border-b border-gray-100 animate-fade-in-up">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6 animate-scale-in">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Progress Tracking
              </span>
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-4 animate-fade-in-up">
              Progress & PRs
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
              Track your strength gains, volume progression, and personal records
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 py-6 border-t border-gray-100">
          <div className="flex justify-center">
            <div className="flex gap-2">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'strength', label: 'Strength' },
                { key: 'volume', label: 'Volume' }
              ].map((tab) => (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.key as any)}
                  className="rounded-xl px-6"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-200/50">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendUp className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{sessionStats.totalSessions}</div>
              <div className="text-sm text-gray-500">Total Sessions</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-200/50">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Lightning className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{sessionStats.workoutStreak}</div>
              <div className="text-sm text-gray-500">Current Streak</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-200/50">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Barbell className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{Math.round(sessionStats.totalVolume).toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Volume (kg)</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-200/50">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{personalRecords?.length || 0}</div>
              <div className="text-sm text-gray-500">Personal Records</div>
            </div>
          </div>

          {/* Charts Section */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 border border-gray-200/50">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Weekly Progress</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="weekLabel" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sessions" 
                        stroke="#374151" 
                        strokeWidth={3}
                        dot={{ fill: '#374151', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#374151' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Personal Records */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Personal Records</h3>
            {personalRecords && personalRecords.length > 0 ? (
              <div className="space-y-4">
                {personalRecords.slice(0, 5).map((pr: any, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{pr.movementName}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(pr.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{pr.weightKg}kg × {pr.reps}</div>
                      <div className="text-sm text-gray-500">New PR</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No personal records yet. Keep training to set your first PR!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}