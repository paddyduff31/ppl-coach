import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { SessionDateEditor } from '../components/SessionDateEditor'
import {
  CaretLeft,
  CaretRight,
  Plus,
  Target,
  Clock,
  TrendUp,
  CalendarCheck,
  Lightning,
  Calendar as CalendarIcon,
  List,
  MagnifyingGlass,
  Barbell,
  Eye,
  Play,
  PencilSimple
} from '@phosphor-icons/react'
import { useUserSessions } from '../hooks/useSessions'
import { cn } from '../utils/utils'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DAY_TYPE_NAMES = {
  1: 'Push',
  2: 'Pull', 
  3: 'Legs'
} as const

const DAY_TYPE_COLORS = {
  1: 'bg-blue-100 text-blue-800 border-blue-200',
  2: 'bg-green-100 text-green-800 border-green-200',
  3: 'bg-purple-100 text-purple-800 border-purple-200'
} as const

const DAY_TYPE_ACCENT_COLORS = {
  1: 'bg-blue-500',
  2: 'bg-green-500',
  3: 'bg-purple-500'
} as const

type ViewType = 'calendar' | 'list'

export default function Calendar() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>('calendar')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month')
  const { data: sessions = [] } = useUserSessions()

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    sessions.forEach(session => {
      const date = new Date(session.date).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(session)
    })
    return grouped
  }, [sessions])

  // Filter sessions for list view
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
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
        monthAgo.setMonth(now.getMonth() - 1)
        withinPeriod = sessionDate >= monthAgo
      }
      
      // Search filter
      const matchesSearch = !searchQuery || 
        DAY_TYPE_NAMES[session.dayType as keyof typeof DAY_TYPE_NAMES]
          .toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      
      return withinPeriod && matchesSearch
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [sessions, selectedPeriod, searchQuery])

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    
    return days
  }, [currentDate])

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const today = new Date()
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const getSessionsForDate = (date: Date) => {
    return sessionsByDate[date.toDateString()] || []
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto pt-8 pb-8 px-8">
        {/* Header with View Switcher */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">
              Training Journey
            </h1>
            <p className="text-lg text-gray-600">
              Plan and track your workout progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <Button
                onClick={() => setViewType('calendar')}
                variant={viewType === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  viewType === 'calendar' 
                    ? "bg-white shadow-sm text-gray-900" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button
                onClick={() => setViewType('list')}
                variant={viewType === 'list' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  viewType === 'list' 
                    ? "bg-white shadow-sm text-gray-900" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
            
            <Button
              onClick={() => navigate({ to: '/plan' })}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-4 py-2 font-medium transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Workout
            </Button>
          </div>
        </div>

        {/* Calendar View */}
        {viewType === 'calendar' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-200/50 mb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={previousMonth}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  <CaretLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setCurrentDate(new Date())}
                  variant="outline"
                  size="sm"
                  className="rounded-xl px-4"
                >
                  Today
                </Button>
                <Button
                  onClick={nextMonth}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  <CaretRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {DAYS.map(day => (
                <div key={day} className="p-4 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((date, index) => {
                const daysSessions = getSessionsForDate(date)
                const hasWorkout = daysSessions.length > 0
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-[120px] p-3 border border-gray-100 rounded-xl transition-all duration-200 hover:border-gray-300 cursor-pointer",
                      isCurrentMonth(date) ? "bg-white" : "bg-gray-50",
                      isToday(date) && "ring-2 ring-blue-500 ring-opacity-50"
                    )}
                    onClick={() => {
                      if (hasWorkout) {
                        // Switch to list view and filter to this day
                        setViewType('list')
                        setSelectedPeriod('all')
                        setSearchQuery('')
                      } else {
                        navigate({ to: '/plan' })
                      }
                    }}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-2",
                      isCurrentMonth(date) ? "text-gray-900" : "text-gray-400",
                      isToday(date) && "text-blue-600"
                    )}>
                      {date.getDate()}
                    </div>

                    {/* Sessions for this day */}
                    <div className="space-y-1">
                      {daysSessions.slice(0, 2).map((session, sessionIndex) => {
                        const dayType = session.dayType as keyof typeof DAY_TYPE_NAMES
                        return (
                          <div
                            key={sessionIndex}
                            className={cn(
                              "px-2 py-1 rounded-lg text-xs font-medium border group relative",
                              DAY_TYPE_COLORS[dayType]
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-1">
                                  <CalendarCheck className="h-3 w-3" />
                                  {DAY_TYPE_NAMES[dayType]}
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                  {session.setLogs?.length || 0} sets
                                </div>
                              </div>
                              <SessionDateEditor
                                sessionId={session.id}
                                currentDate={session.date}
                                sessionName={`${DAY_TYPE_NAMES[dayType]} Day`}
                              >
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                                >
                                  <PencilSimple className="h-3 w-3" />
                                </button>
                              </SessionDateEditor>
                            </div>
                          </div>
                        )
                      })}
                      
                      {daysSessions.length > 2 && (
                        <div className="text-xs text-gray-500 px-2 py-1">
                          +{daysSessions.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {viewType === 'list' && (
          <div className="space-y-6">
            {/* List Controls */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/50">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <MagnifyingGlass className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input
                      placeholder="Search workouts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-gray-200 rounded-xl w-64"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {(['week', 'month', 'all'] as const).map((period) => (
                    <Button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      variant={selectedPeriod === period ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-xl capitalize"
                    >
                      {period === 'all' ? 'All Time' : `Last ${period}`}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Session List */}
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const dayType = session.dayType as keyof typeof DAY_TYPE_NAMES
                const sessionDate = new Date(session.date)
                
                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-3xl p-6 border border-gray-200/50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate({ to: `/log/${session.id}` })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
                          DAY_TYPE_ACCENT_COLORS[dayType]
                        )}>
                          <Barbell className="h-6 w-6" />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {DAY_TYPE_NAMES[dayType]} Day
                            </h3>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs font-medium",
                                DAY_TYPE_COLORS[dayType]
                              )}
                            >
                              {DAY_TYPE_NAMES[dayType]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {sessionDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {session.setLogs?.length || 0} sets
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendUp className="h-4 w-4" />
                              {Math.round(session.setLogs?.reduce((total: number, set: any) => 
                                total + (set.weightKg * set.reps), 0) || 0)} kg
                            </span>
                            {session.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {session.duration}m
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <SessionDateEditor
                          sessionId={session.id}
                          currentDate={session.date}
                          sessionName={`${DAY_TYPE_NAMES[dayType]} Day`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <PencilSimple className="h-4 w-4 mr-2" />
                            Edit Date
                          </Button>
                        </SessionDateEditor>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate({ to: `/log/${session.id}` })
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {session.isCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Create new session based on this one
                              navigate({ to: '/plan' })
                            }}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Repeat
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {session.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 italic">"{session.notes}"</p>
                      </div>
                    )}
                  </div>
                )
              })}
              
              {filteredSessions.length === 0 && (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No workouts found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery ? 'Try adjusting your search terms' : 'Start your fitness journey today'}
                  </p>
                  <Button
                    onClick={() => navigate({ to: '/plan' })}
                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 py-3"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Workout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats - Always visible */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-200/50">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CalendarCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {viewType === 'calendar' 
                ? sessions.filter(s => {
                    const sessionDate = new Date(s.date)
                    return sessionDate.getMonth() === currentDate.getMonth() && 
                           sessionDate.getFullYear() === currentDate.getFullYear()
                  }).length
                : filteredSessions.length}
            </div>
            <div className="text-sm text-gray-500">
              {viewType === 'calendar' ? 'This Month' : 'Filtered Sessions'}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-200/50">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {Math.round(sessions.reduce((total, s) => 
                total + (s.setLogs?.reduce((setTotal: number, set: any) => 
                  setTotal + (set.weightKg * set.reps), 0) || 0), 0
              ) / 1000)}k
            </div>
            <div className="text-sm text-gray-500">Total Volume (kg)</div>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center border border-gray-200/50">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Lightning className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {sessions.reduce((total, s) => total + (s.setLogs?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">Total Sets</div>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center border border-gray-200/50">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {sessions.length > 0 ? Math.round(sessions.length / 
                Math.max(1, Math.ceil((Date.now() - new Date(sessions[sessions.length - 1]?.date || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 7)))
              ) : 0}
            </div>
            <div className="text-sm text-gray-500">Workouts/Week</div>
          </div>
        </div>
      </div>
    </div>
  )
}
