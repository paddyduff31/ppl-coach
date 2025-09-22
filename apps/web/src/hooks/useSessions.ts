import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customInstance } from '@ppl-coach/api-client'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

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

export function useSessionStats() {
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
