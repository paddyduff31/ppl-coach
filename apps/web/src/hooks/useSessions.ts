import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

// API functions - replace with your actual API client
const fetchUserSessions = async (userId: string) => {
  const response = await fetch(`http://localhost:5179/api/sessions/user/${userId}`)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch sessions: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

const fetchSessionStats = async (userId: string) => {
  const response = await fetch(`http://localhost:5179/api/sessions/user/${userId}/stats`)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch session stats: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export function useUserSessions() {
  const { user, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: () => fetchUserSessions(user!.id),
    enabled: isAuthenticated && !!user?.id,
    retry: (failureCount, error) => {
      // Don't retry on 401/403 (auth issues) or 404 (user not found)
      const status = (error as any)?.response?.status
      if (status === 401 || status === 403 || status === 404) {
        return false
      }
      return failureCount < 3
    },
    onError: (error) => {
      console.error('Session fetch error:', error)
      toast.error(`Failed to load sessions: ${error.message}`)
    }
  })
}

export function useSessionStats() {
  const { user, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['sessionStats', user?.id],
    queryFn: () => fetchSessionStats(user!.id),
    enabled: isAuthenticated && !!user?.id,
    retry: (failureCount, error) => {
      // Don't retry on auth issues
      const status = (error as any)?.response?.status
      if (status === 401 || status === 403 || status === 404) {
        return false
      }
      return failureCount < 3
    },
    onError: (error) => {
      console.error('Session stats fetch error:', error)
      toast.error(`Failed to load session statistics: ${error.message}`)
    }
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await fetch('http://localhost:5179/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create session: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate sessions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['sessionStats', user?.id] })
      toast.success('Session created successfully!')
    },
    onError: (error) => {
      console.error('Session creation error:', error)
      toast.error(`Failed to create session: ${error.message}`)
    }
  })
}

export function useUpdateSession() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ sessionId, sessionData }: { sessionId: string, sessionData: any }) => {
      const response = await fetch(`http://localhost:5179/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update session: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Session updated successfully!')
    },
    onError: (error) => {
      console.error('Session update error:', error)
      toast.error(`Failed to update session: ${error.message}`)
    }
  })
}
