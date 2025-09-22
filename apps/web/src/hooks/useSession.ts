import { useCreateSession as useCreateSessionMutation, useGetSession, useGetUserSessions, useLogSet as useLogSetMutation, useDeleteSet as useDeleteSetMutation } from '@ppl-coach/api-client'
import { useQueryClient } from '@tanstack/react-query'

export function useCreateSession() {
  const queryClient = useQueryClient()

  const mutation = useCreateSessionMutation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
      },
    },
  })

  return mutation
}

export function useCreateSessionHook() {
  const queryClient = useQueryClient()

  const mutation = useCreateSessionMutation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
      },
    },
  })

  return mutation
}

export function useSession(id: string | undefined) {
  return useGetSession(id!, {
    query: {
      enabled: !!id,
    },
  })
}

export function useUserSessions(userId: string, startDate?: string, endDate?: string) {
  return useGetUserSessions(userId!, {
    query: {
      enabled: !!userId,
    },
  })
}

export function useLogSet() {
  const queryClient = useQueryClient()

  return useLogSetMutation({
    mutation: {
      onSuccess: (_, variables) => {
        // Invalidate the session to refetch with new set
        queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] })
      },
    },
  })
}

export function useLogSetHook() {
  const queryClient = useQueryClient()

  return useLogSetMutation({
    mutation: {
      onSuccess: (_, variables) => {
        // Invalidate the session to refetch with new set
        queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] })
      },
    },
  })
}

export function useDeleteSet() {
  const queryClient = useQueryClient()

  return useDeleteSetMutation({
    mutation: {
      onSuccess: () => {
        // Invalidate all sessions to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
      },
    },
  })
}

export function useDeleteSetHook() {
  const queryClient = useQueryClient()

  return useDeleteSetMutation({
    mutation: {
      onSuccess: () => {
        // Invalidate all sessions to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
      },
    },
  })
}
