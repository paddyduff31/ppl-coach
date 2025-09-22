import { useGetUserSessions, useUpdateSession as useUpdateSessionMutation } from '@ppl-coach/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'

export interface SessionSetLog {
  id: string
  movementId: string
  movementName: string
  weightKg: number
  reps: number
  rpe: number
  tempo: string
  notes: string
  loggedAt: string
}

export interface WorkoutSession {
  id: string
  userId: string
  date: string
  dayType: number
  notes: string
  setLogs: SessionSetLog[]
  createdAt: string
}

export interface SessionStats {
  totalSessions: number
  thisWeekSessions: number
  totalVolume: number
  averageRpe: number
  workoutStreak: number
  lastWorkoutDate?: string
}

export function useUserSessions() {
  const { user } = useAuth()

  return useGetUserSessions(user?.id!, {
    query: {
      enabled: !!user?.id,
    }
  })
}

export function useSessionStats(sessions: WorkoutSession[] = []) {
  // Calculate stats from sessions data
  const stats: SessionStats = {
    totalSessions: sessions.length,
    thisWeekSessions: getThisWeekSessions(sessions).length,
    totalVolume: calculateTotalVolume(sessions),
    averageRpe: calculateAverageRpe(sessions),
    workoutStreak: calculateWorkoutStreak(sessions),
    lastWorkoutDate: getLastWorkoutDate(sessions),
  }

  return stats
}

function getThisWeekSessions(sessions: WorkoutSession[]): WorkoutSession[] {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  startOfWeek.setHours(0, 0, 0, 0)

  return sessions.filter(session => {
    const sessionDate = new Date(session.date)
    return sessionDate >= startOfWeek
  })
}

function calculateTotalVolume(sessions: WorkoutSession[]): number {
  return sessions.reduce((total, session) => {
    const sessionVolume = session.setLogs.reduce((sessionTotal, set) => {
      return sessionTotal + (set.weightKg * set.reps)
    }, 0)
    return total + sessionVolume
  }, 0)
}

function calculateAverageRpe(sessions: WorkoutSession[]): number {
  const allSets = sessions.flatMap(session => session.setLogs)
  const setsWithRpe = allSets.filter(set => set.rpe > 0)

  if (setsWithRpe.length === 0) return 0

  const totalRpe = setsWithRpe.reduce((sum, set) => sum + set.rpe, 0)
  return Math.round((totalRpe / setsWithRpe.length) * 10) / 10
}

function calculateWorkoutStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0

  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const session of sortedSessions) {
    const sessionDate = new Date(session.date)
    sessionDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff <= 1) {
      streak++
      currentDate = sessionDate
    } else if (daysDiff > 2) {
      // Allow one rest day, but more than 2 days breaks the streak
      break
    }
  }

  return streak
}

function getLastWorkoutDate(sessions: WorkoutSession[]): string | undefined {
  if (sessions.length === 0) return undefined

  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return sortedSessions[0]?.date
}

export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useUpdateSessionMutation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
      },
    }
  })
}

export function useUpdateSessionHook() {
  const queryClient = useQueryClient()

  return useUpdateSessionMutation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
      },
    }
  })
}
