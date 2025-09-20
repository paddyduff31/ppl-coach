import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../api/endpoints'
import type { CreateSession, CreateSetLog } from '../../../api/schemas'

export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSession) => api.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => api.getSession(id!),
    enabled: !!id,
  })
}

export function useUserSessions(userId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['sessions', 'user', userId, startDate, endDate],
    queryFn: () => api.getUserSessions(userId, startDate, endDate),
    enabled: !!userId,
  })
}

export function useLogSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSetLog) => api.logSet(data),
    onSuccess: (_, variables) => {
      // Invalidate the session to refetch with new set
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] })
    },
  })
}

export function useDeleteSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (setId: string) => api.deleteSet(setId),
    onSuccess: () => {
      // Invalidate all sessions to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}