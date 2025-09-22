import { useQuery } from '@tanstack/react-query'
import { api } from '../api/endpoints'
import { useUser } from './useUser'

type DayType = 1 | 2 | 3 // 1=Push, 2=Pull, 3=Legs

const DAY_TYPE_NAMES = {
  1: 'Push',
  2: 'Pull',
  3: 'Legs'
} as const

const DAY_TYPE_DESCRIPTIONS = {
  1: 'Chest, Shoulders, Triceps',
  2: 'Back, Biceps, Rear Delts',
  3: 'Quads, Hamstrings, Glutes, Calves'
} as const

export function useWorkoutPlan() {
  const { userId } = useUser()

  // Get recent sessions to determine next workout
  const { data: recentSessions } = useQuery({
    queryKey: ['sessions', 'user', userId, 'recent'],
    queryFn: () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return api.getUserSessions(
        userId,
        thirtyDaysAgo.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      )
    },
    enabled: !!userId,
  })

  const sessions = recentSessions?.data || []

  // Determine the next workout day type
  const getNextDayType = (): DayType => {
    if (sessions.length === 0) {
      // Start with Push if no sessions
      return 1
    }

    // Get the most recent session
    const lastSession = sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    // Cycle through Push -> Pull -> Legs -> Push...
    const lastDayType = lastSession.dayType as DayType
    return (lastDayType === 3 ? 1 : (lastDayType + 1)) as DayType
  }

  // Get workout streak
  const getWorkoutStreak = (): number => {
    if (sessions.length === 0) return 0

    const sortedSessions = sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date)
      sessionDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === streak) {
        streak++
      } else if (daysDiff === streak + 1) {
        // Allow one day gap
        streak++
      } else {
        break
      }
    }

    return streak
  }

  // Get this week's sessions
  const getThisWeekSessions = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Sunday
    startOfWeek.setHours(0, 0, 0, 0)

    return sessions.filter(session => {
      const sessionDate = new Date(session.date)
      return sessionDate >= startOfWeek
    })
  }

  // Check if today's workout is already done (must have actual sets logged)
  const isTodayComplete = (): boolean => {
    const today = new Date().toISOString().split('T')[0]
    return sessions.some(session => 
      session.date === today && 
      session.setLogs && 
      session.setLogs.length > 0
    )
  }

  // Get last workout info
  const getLastWorkout = () => {
    if (sessions.length === 0) return null

    const lastSession = sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    return {
      date: lastSession.date,
      dayType: lastSession.dayType as DayType,
      dayName: DAY_TYPE_NAMES[lastSession.dayType as DayType],
      setCount: lastSession.setLogs?.length || 0
    }
  }

  const nextDayType = getNextDayType()
  const thisWeekSessions = getThisWeekSessions()
  const lastWorkout = getLastWorkout()

  return {
    nextDayType,
    nextDayName: DAY_TYPE_NAMES[nextDayType],
    nextDayDescription: DAY_TYPE_DESCRIPTIONS[nextDayType],
    workoutStreak: getWorkoutStreak(),
    thisWeekSessions,
    lastWorkout,
    isTodayComplete: isTodayComplete(),
    totalSessions: sessions.length,
    isLoading: !recentSessions,
  }
}