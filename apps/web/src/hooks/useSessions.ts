import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customInstance } from '@ppl-coach/api-client'
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

  const response = await customInstance<WorkoutSessionDto[]>({
    url,
    method: 'GET'
  })

  return response.data
}

const fetchUserSessionStats = async (userId: string) => {
  const response = await customInstance<SessionStats>({
    url: `/api/sessions/user/${userId}/stats`,
    method: 'GET'
  })

  return response.data
}

const createSession = async (sessionData: CreateSessionDto) => {
  const response = await customInstance<WorkoutSessionDto>({
    url: '/api/sessions',
    method: 'POST',
    data: sessionData
  })

  return response.data
}

const updateSession = async (sessionId: string, sessionData: CreateSessionDto) => {
  const response = await customInstance<WorkoutSessionDto>({
    url: `/api/sessions/${sessionId}`,
    method: 'PUT',
    data: sessionData
  })

  return response.data
}

// Proper TypeScript types
interface WorkoutSessionDto {
  id: string
  userId: string
  date: string
  dayType: number
  notes?: string
  setLogs: SetLogDto[]
}

interface SetLogDto {
  id: string
  sessionId: string
  movementId: string
  setIndex: number
  weightKg: number
  reps: number
  rpe?: number
  tempo?: string
  notes?: string
  createdAt: string
  movementName?: string
}

interface CreateSessionDto {
  userId: string
  date: string
  dayType: number
  notes?: string
}

interface SessionStats {
  totalSessions: number
  thisWeekSessions: number
  totalVolume: number
  workoutStreak: number
}

// Proper type-safe hooks with error handling
export function useUserSessions() {
  const { user, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: () => fetchUserSessions(user!.id),
    enabled: isAuthenticated && !!user?.id,
    retry: (failureCount, error: any) => {
      // Don't retry on auth issues
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false
      }
      return failureCount < 3
    },
    onError: (error: any) => {
      console.error('Session fetch error:', error)
      toast.error(`Failed to load sessions: ${error.response?.data?.detail || error.message}`)
    }
  })
}

export function useServerSessionStats() {
  const { user, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['sessionStats', user?.id],
    queryFn: () => fetchUserSessionStats(user!.id),
    enabled: isAuthenticated && !!user?.id,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false
      }
      return failureCount < 3
    },
    onError: (error: any) => {
      console.error('Session stats fetch error:', error)
      toast.error(`Failed to load session statistics: ${error.response?.data?.detail || error.message}`)
    }
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
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

  return useMutation({
    mutationFn: ({ sessionId, sessionData }: { sessionId: string, sessionData: CreateSessionDto }) =>
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
      const sessionDate = new Date(session.date)
      return sessionDate >= oneWeekAgo
    }).length

    // Calculate total volume
    const totalVolume = sessions.reduce((sum, session) => {
      const sessionVolume = (session.setLogs || []).reduce((setSum, setLog) => {
        return setSum + (setLog.weightKg * setLog.reps)
      }, 0)
      return sum + sessionVolume
    }, 0)

    // Calculate workout streak (consecutive days from today)
    const calculateWorkoutStreak = (sessions: WorkoutSessionDto[]): number => {
      if (sessions.length === 0) return 0

      // Sort sessions by date descending
      const sortedSessions = [...sessions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let streak = 0
      let currentDate = new Date(today)

      for (const session of sortedSessions) {
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
