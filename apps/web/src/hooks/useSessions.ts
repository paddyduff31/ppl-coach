import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customInstance } from '@ppl-coach/api-client'
import type { WorkoutSessionDto, CreateSessionDto } from '@ppl-coach/api-client'
import { useAuth } from './useAuth'
import { toast } from 'sonner'
import { useMemo } from 'react'

// Type-safe API functions using your customInstance
const fetchUserSessions = async (userId: string, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)

  const queryString = params.toString()
  const url = `/api/sessions/user/${userId}${queryString ? `?${queryString}` : ''}`

  try {
    const data = await customInstance<WorkoutSessionDto[]>({
      url,
      method: 'GET'
    })

    return data
  } catch (error: any) {
    console.error('Session fetch error:', error)
    toast.error(`Failed to load sessions: ${error.response?.data?.detail || error.message}`)
    throw error
  }
}

const fetchUserSessionStats = async (userId: string) => {
  try {
    const data = await customInstance<SessionStats>({
      url: `/api/sessions/user/${userId}/stats`,
      method: 'GET'
    })

    return data
  } catch (error: any) {
    console.error('Session stats fetch error:', error)
    toast.error(`Failed to load session statistics: ${error.response?.data?.detail || error.message}`)
    throw error
  }
}

const createSession = async (sessionData: CreateSessionDto) => {
  const data = await customInstance<WorkoutSessionDto>({
    url: '/api/sessions',
    method: 'POST',
    data: sessionData
  })

  return data
}

const updateSession = async (sessionId: string, sessionData: CreateSessionDto) => {
  const data = await customInstance<WorkoutSessionDto>({
    url: `/api/sessions/${sessionId}`,
    method: 'PUT',
    data: sessionData
  })

  return data
}

export interface SessionStats {
  totalSessions: number
  thisWeekSessions: number
  totalVolume: number
  workoutStreak: number
}

// Proper type-safe hooks with error handling
export function useUserSessions() {
  const { user, isAuthenticated } = useAuth()

  return useQuery<WorkoutSessionDto[], Error>({
    queryKey: ['sessions', user?.id],
    queryFn: () => fetchUserSessions(user!.id),
    enabled: isAuthenticated && !!user?.id,
  })
}

export function useServerSessionStats() {
  const { user, isAuthenticated } = useAuth()

  return useQuery<SessionStats, Error>({
    queryKey: ['sessionStats', user?.id],
    queryFn: () => fetchUserSessionStats(user!.id),
    enabled: isAuthenticated && !!user?.id,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation<WorkoutSessionDto, unknown, CreateSessionDto>({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['sessionStats', user?.id] })
      toast.success('Session created successfully!')
    },
    onError: (error: any) => {
      console.error('Session creation error:', error)
      toast.error(`Failed to create session: ${error.response?.data?.detail || error.message}`)
    }
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation<
    WorkoutSessionDto,
    unknown,
    { sessionId: string; sessionData: CreateSessionDto }
  >({
    mutationFn: ({ sessionId, sessionData }) =>
      updateSession(sessionId, sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['sessionStats', user?.id] })
      toast.success('Session updated successfully!')
    },
    onError: (error: any) => {
      console.error('Session update error:', error)
      toast.error(`Failed to update session: ${error.response?.data?.detail || error.message}`)
    }
  })
}

// Client-side session stats calculation
export function useSessionStats(sessions: WorkoutSessionDto[]) {
  return useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        thisWeekSessions: 0,
        totalVolume: 0,
        workoutStreak: 0
      }
    }

    // Calculate this week's sessions
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisWeekSessions = sessions.filter(session => {
      if (!session.date) return false
      const sessionDate = new Date(session.date)
      return sessionDate >= oneWeekAgo
    }).length

    // Calculate total volume
    const totalVolume = sessions.reduce((sum, session) => {
      const sessionVolume = (session.setLogs || []).reduce((setSum, setLog) => {
        const weight = setLog.weightKg ?? 0
        const reps = setLog.reps ?? 0
        return setSum + (weight * reps)
      }, 0)
      return sum + sessionVolume
    }, 0)

    // Calculate workout streak (consecutive days from today)
    const calculateWorkoutStreak = (sessions: WorkoutSessionDto[]): number => {
      if (sessions.length === 0) return 0

      // Sort sessions by date descending
      const sortedSessions = [...sessions]
        .filter((session) => !!session.date)
        .sort((a, b) =>
          new Date(b.date!).getTime() - new Date(a.date!).getTime()
      )

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let streak = 0
      let currentDate = new Date(today)

      for (const session of sortedSessions) {
        if (!session.date) continue
        const sessionDate = new Date(session.date)
        sessionDate.setHours(0, 0, 0, 0)

        if (sessionDate.getTime() === currentDate.getTime()) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else if (sessionDate.getTime() < currentDate.getTime()) {
          // If we found a session before the current expected date, streak is broken
          break
        }
      }

      return streak
    }

    const workoutStreak = calculateWorkoutStreak(sessions)

    return {
      totalSessions: sessions.length,
      thisWeekSessions,
      totalVolume: Math.round(totalVolume),
      workoutStreak
    }
  }, [sessions])
}
