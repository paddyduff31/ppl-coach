import {
  useCreateSession as useCreateSessionMutation,
  useGetSession,
  useGetUserSessions,
  useLogSet as useLogSetMutation,
  useDeleteSet as useDeleteSetMutation
} from '@ppl-coach/api-client'
import { useQueryClient } from '@tanstack/react-query'

export function useCreateSession() {
  const queryClient = useQueryClient()

  return useCreateSessionMutation({
    mutation: {
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['sessions'] })

        // Snapshot the previous value
        const previousSessions = queryClient.getQueryData(['sessions'])

        // Optimistically update with new session
        queryClient.setQueryData(['sessions'], (old: any[]) => {
          if (!old) return [variables]
          return [
            {
              ...variables,
              id: `temp-${Date.now()}`, // Temporary ID
              createdAt: new Date().toISOString(),
            },
            ...old
          ]
        })

        return { previousSessions }
      },
      onError: (err, newSession, context) => {
        queryClient.setQueryData(['sessions'], context?.previousSessions)
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
      },
    },
  })
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
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['sessions'] })

        // Snapshot the previous value
        const previousSessions = queryClient.getQueryData(['sessions'])

        // Optimistically add the set to the session
        queryClient.setQueryData(['sessions'], (old: any[]) => {
          if (!old) return old
          return old.map(session =>
            session.id === variables.sessionId
              ? {
                  ...session,
                  setLogs: [
                    ...(session.setLogs || []),
                    {
                      ...variables.data,
                      id: `temp-set-${Date.now()}`,
                      loggedAt: new Date().toISOString(),
                    }
                  ]
                }
              : session
          )
        })

        return { previousSessions }
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData(['sessions'], context?.previousSessions)
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
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
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['sessions'] })

        // Snapshot the previous value
        const previousSessions = queryClient.getQueryData(['sessions'])

        // Optimistically remove the set
        queryClient.setQueryData(['sessions'], (old: any[]) => {
          if (!old) return old
          return old.map(session =>
            session.id === variables.sessionId
              ? {
                  ...session,
                  setLogs: (session.setLogs || []).filter((set: any) => set.id !== variables.setId)
                }
              : session
          )
        })

        return { previousSessions }
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData(['sessions'], context?.previousSessions)
      },
      onSettled: () => {
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
