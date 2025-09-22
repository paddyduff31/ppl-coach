import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Heart,
  DeviceMobile,
  ChartLine,
  TrendUp,
  Lightning,
  Shield,
  CheckCircle,
  XCircle,
  DeviceTablet,
  Clock,
  Target,
  Plus,
  ArrowsClockwise,
  CircleDashed,
  CalendarBlank,
  GoogleLogo,
  Warning,
  Info
} from '@phosphor-icons/react'
import { useUserSessions } from '../hooks/useSessions'
import { cn } from '../utils/utils'

interface HealthData {
  heartRate?: number
  steps?: number
  activeCalories?: number
  workoutMinutes?: number
  restingHeartRate?: number
  bodyWeight?: number
  lastSync?: string
}

interface AppleHealthConfig {
  enabled: boolean
  permissions: {
    heartRate: boolean
    steps: boolean
    activeCalories: boolean
    workouts: boolean
    bodyWeight: boolean
  }
  autoSync: boolean
  syncWorkouts: boolean
}

interface GoogleCalendarConfig {
  enabled: boolean
  calendarId: string
  autoSchedule: boolean
  reminderMinutes: number
  syncCompletedWorkouts: boolean
  workoutDuration: number
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  description: string
  type: 'push' | 'pull' | 'legs'
}

export default function Integrations() {
  const [healthData, setHealthData] = useState<HealthData>({})
  const [config, setConfig] = useState<AppleHealthConfig>({
    enabled: false,
    permissions: {
      heartRate: false,
      steps: false,
      activeCalories: false,
      workouts: false,
      bodyWeight: false
    },
    autoSync: false,
    syncWorkouts: true
  })
  const [calendarConfig, setCalendarConfig] = useState<GoogleCalendarConfig>({
    enabled: false,
    calendarId: '',
    autoSchedule: true,
    reminderMinutes: 30,
    syncCompletedWorkouts: true,
    workoutDuration: 90
  })
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const { data: sessions = [] } = useUserSessions()

  useEffect(() => {
    // Load saved configurations
    const savedConfig = localStorage.getItem('apple-health-config')
    const savedCalendarConfig = localStorage.getItem('google-calendar-config')
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
    
    if (savedCalendarConfig) {
      const calendarData = JSON.parse(savedCalendarConfig)
      setCalendarConfig(calendarData)
      if (calendarData.enabled) {
        loadUpcomingEvents()
      }
    }

    // Mock health data for demo
    setHealthData({
      heartRate: 72,
      steps: 8456,
      activeCalories: 342,
      workoutMinutes: 45,
      restingHeartRate: 65,
      bodyWeight: 75.5,
      lastSync: new Date().toISOString()
    })
  }, [])

  const connectToAppleHealth = async () => {
    setIsConnecting(true)
    
    try {
      // In a real app, this would use HealthKit APIs
      // For demo purposes, we'll simulate the connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newConfig = {
        ...config,
        enabled: true,
        permissions: {
          heartRate: true,
          steps: true,
          activeCalories: true,
          workouts: true,
          bodyWeight: true
        }
      }
      
      setConfig(newConfig)
      localStorage.setItem('apple-health-config', JSON.stringify(newConfig))
      setLastSyncTime(new Date())
      
    } catch (error) {
      console.error('Failed to connect to Apple Health:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectFromAppleHealth = () => {
    const newConfig = {
      ...config,
      enabled: false,
      permissions: {
        heartRate: false,
        steps: false,
        activeCalories: false,
        workouts: false,
        bodyWeight: false
      }
    }
    
    setConfig(newConfig)
    localStorage.setItem('apple-health-config', JSON.stringify(newConfig))
    setHealthData({})
    setLastSyncTime(null)
  }

  const syncNow = async () => {
    if (!config.enabled) return
    
    setIsConnecting(true)
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update health data with new values
      setHealthData({
        heartRate: Math.floor(Math.random() * 20) + 65,
        steps: Math.floor(Math.random() * 5000) + 6000,
        activeCalories: Math.floor(Math.random() * 200) + 250,
        workoutMinutes: sessions.reduce((total, session) => total + (session.duration || 45), 0),
        restingHeartRate: Math.floor(Math.random() * 10) + 60,
        bodyWeight: 75.5 + (Math.random() - 0.5) * 2,
        lastSync: new Date().toISOString()
      })
      
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const toggleAutoSync = () => {
    const newConfig = { ...config, autoSync: !config.autoSync }
    setConfig(newConfig)
    localStorage.setItem('apple-health-config', JSON.stringify(newConfig))
  }

  const toggleWorkoutSync = () => {
    const newConfig = { ...config, syncWorkouts: !config.syncWorkouts }
    setConfig(newConfig)
    localStorage.setItem('apple-health-config', JSON.stringify(newConfig))
  }

  const connectToGoogleCalendar = async () => {
    setIsConnectingCalendar(true)
    
    try {
      // In a real app, this would use Google Calendar API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newConfig = {
        ...calendarConfig,
        enabled: true,
        calendarId: 'primary'
      }
      
      setCalendarConfig(newConfig)
      localStorage.setItem('google-calendar-config', JSON.stringify(newConfig))
      
      // Load upcoming events
      loadUpcomingEvents()
      
    } catch (error) {
      console.error('Failed to connect to Google Calendar:', error)
    } finally {
      setIsConnectingCalendar(false)
    }
  }

  const disconnectFromGoogleCalendar = () => {
    const newConfig = {
      ...calendarConfig,
      enabled: false,
      calendarId: ''
    }
    
    setCalendarConfig(newConfig)
    localStorage.setItem('google-calendar-config', JSON.stringify(newConfig))
    setUpcomingEvents([])
  }

  const loadUpcomingEvents = () => {
    // Mock upcoming workout events
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Push Day Workout',
        start: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // +90 mins
        description: 'Chest, Shoulders, Triceps',
        type: 'push'
      },
      {
        id: '2',
        title: 'Pull Day Workout',
        start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        description: 'Back, Biceps, Rear Delts',
        type: 'pull'
      },
      {
        id: '3',
        title: 'Legs Day Workout',
        start: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // In 4 days
        end: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        description: 'Quads, Hamstrings, Glutes, Calves',
        type: 'legs'
      }
    ]
    
    setUpcomingEvents(mockEvents)
  }

  const toggleCalendarAutoSchedule = () => {
    const newConfig = { ...calendarConfig, autoSchedule: !calendarConfig.autoSchedule }
    setCalendarConfig(newConfig)
    localStorage.setItem('google-calendar-config', JSON.stringify(newConfig))
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto pt-8 pb-8 px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">
              Health Integrations
            </h1>
            <p className="text-lg text-gray-600">
              Connect with Apple Health, Apple Watch, and other health platforms
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Apple Health Connection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Apple Health Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                    <CircleDashed className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Apple Health</h2>
                    <p className="text-gray-600">Sync workouts and health metrics</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {config.enabled ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl border border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-xl border border-gray-200">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Disconnected</span>
                    </div>
                  )}
                </div>
              </div>

              {!config.enabled ? (
                <div className="text-center py-8">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Connect to Apple Health
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Sync your workout data, track health metrics, and get insights from your Apple Watch
                  </p>
                  <Button
                    onClick={connectToAppleHealth}
                    disabled={isConnecting}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-6 py-3 font-medium"
                  >
                    {isConnecting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Connecting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CircleDashed className="h-5 w-5" />
                        Connect Apple Health
                      </div>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Health Data Grid */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <div className="text-2xl font-semibold text-gray-900">{healthData.heartRate}</div>
                      <div className="text-sm text-gray-500">Heart Rate (bpm)</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <ChartLine className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-semibold text-gray-900">{healthData.steps?.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Steps Today</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <Lightning className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-2xl font-semibold text-gray-900">{healthData.activeCalories}</div>
                      <div className="text-sm text-gray-500">Active Calories</div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Last synced: {lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Never'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={syncNow}
                        disabled={isConnecting}
                        variant="outline"
                        className="rounded-xl"
                      >
                        <ArrowsClockwise className={cn("h-4 w-4 mr-2", isConnecting && "animate-spin")} />
                        Sync Now
                      </Button>
                      
                      <Button
                        onClick={disconnectFromAppleHealth}
                        variant="outline"
                        className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Apple Watch Integration */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <DeviceMobile className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Apple Watch</h2>
                  <p className="text-gray-600">Real-time workout tracking and heart rate monitoring</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Features Available</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700">Real-time heart rate monitoring</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700">Workout detection and logging</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700">Rest timer notifications</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700">Set completion haptic feedback</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Coming Soon</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Voice commands for logging sets</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Automatic weight suggestions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Form analysis via motion sensors</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Sync Settings */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/50">
              <h3 className="font-semibold text-gray-900 mb-4">Sync Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Auto Sync</div>
                    <div className="text-sm text-gray-500">Automatically sync every 15 minutes</div>
                  </div>
                  <button
                    onClick={toggleAutoSync}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative",
                      config.autoSync ? "bg-blue-500" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full transition-transform absolute top-1",
                      config.autoSync ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Sync Workouts</div>
                    <div className="text-sm text-gray-500">Send workout data to Apple Health</div>
                  </div>
                  <button
                    onClick={toggleWorkoutSync}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative",
                      config.syncWorkouts ? "bg-blue-500" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full transition-transform absolute top-1",
                      config.syncWorkouts ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>
              </div>
            </div>

            {/* Data Permissions */}
            {config.enabled && (
              <div className="bg-white rounded-3xl p-6 border border-gray-200/50">
                <h3 className="font-semibold text-gray-900 mb-4">Data Permissions</h3>
                
                <div className="space-y-3">
                  {Object.entries(config.permissions).map(([key, granted]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      {granted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Calendar Integration */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center">
                    <GoogleLogo className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Google Calendar</h2>
                    <p className="text-gray-600">Sync workouts as calendar events</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {calendarConfig.enabled ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl border border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-xl border border-gray-200">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Disconnected</span>
                    </div>
                  )}
                </div>
              </div>

              {!calendarConfig.enabled ? (
                <div className="text-center py-8">
                  <GoogleLogo className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Connect to Google Calendar
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Sync your workout sessions to Google Calendar as events
                  </p>
                  <Button
                    onClick={connectToGoogleCalendar}
                    disabled={isConnectingCalendar}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl px-6 py-3 font-medium"
                  >
                    {isConnectingCalendar ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Connecting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CircleDashed className="h-5 w-5" />
                        Connect Google Calendar
                      </div>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Upcoming Events */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Upcoming Workout Events</h4>
                    
                    <div className="space-y-3">
                      {upcomingEvents.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No upcoming events. Schedule a workout!
                        </p>
                      ) : (
                        upcomingEvents.map(event => (
                          <div key={event.id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-gray-500">
                                {event.start.toLocaleString('default', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="text-xs rounded-full" style={{ backgroundColor: event.type === 'push' ? '#fef2f2' : event.type === 'pull' ? '#eef6ff' : '#f0fff4' }}>
                                <span className="text-gray-800 font-medium">
                                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)} Day
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-lg font-semibold text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">{event.description}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Calendar Settings */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Calendar Settings</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Auto Schedule</div>
                          <div className="text-sm text-gray-500">Automatically create events for workouts</div>
                        </div>
                        <button
                          onClick={toggleCalendarAutoSchedule}
                          className={cn(
                            "w-11 h-6 rounded-full transition-colors relative",
                            calendarConfig.autoSchedule ? "bg-blue-500" : "bg-gray-200"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 bg-white rounded-full transition-transform absolute top-1",
                            calendarConfig.autoSchedule ? "translate-x-6" : "translate-x-1"
                          )} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Sync Completed Workouts</div>
                          <div className="text-sm text-gray-500">Add completed workouts to calendar</div>
                        </div>
                        <button
                          onClick={toggleWorkoutSync}
                          className={cn(
                            "w-11 h-6 rounded-full transition-colors relative",
                            calendarConfig.syncCompletedWorkouts ? "bg-blue-500" : "bg-gray-200"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 bg-white rounded-full transition-transform absolute top-1",
                            calendarConfig.syncCompletedWorkouts ? "translate-x-6" : "translate-x-1"
                          )} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/50">
              <h3 className="font-semibold text-gray-900 mb-4">Health Insights</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Resting Heart Rate</span>
                    <span className="font-medium">{healthData.restingHeartRate} bpm</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Body Weight</span>
                    <span className="font-medium">{healthData.bodyWeight?.toFixed(1)} kg</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Weekly Workouts</span>
                    <span className="font-medium">{Math.min(sessions.length, 5)}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.min(sessions.length * 20, 100)}%`}} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
