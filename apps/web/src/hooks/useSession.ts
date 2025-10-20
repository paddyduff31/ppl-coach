import {
  useCreateSession as useCreateSessionMutation,
  useGetSession,
  useGetUserSessions,
  useLogSet as useLogSetMutation,
  useDeleteSet as useDeleteSetMutation,
} from '@ppl-coach/api-client'
import { useQueryClient } from '@tanstack/react-query'

export function useCreateSession() {
  const queryClient = useQueryClient()

  return useCreateSessionMutation({
    mutation: {
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
      },
    },
  })
}

export function useCreateSessionHook() {
  const queryClient = useQueryClient()

  return useCreateSessionMutation({
    mutation: {
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
      },
    },
  })
}

export function useSession(id: string | undefined) {
  return useGetSession(id!, {
    query: {
      enabled: !!id,
    },
  })
}

export function useUserSessions(userId: string, startDate?: string, endDate?: string) {
  return useGetUserSessions(userId!, { startDate, endDate }, {
    query: {
      enabled: !!userId,
    },
  })
}

export function useLogSet() {
  return useLogSetMutation()
}

export function useLogSetHook() {
  return useLogSetMutation()
}

export function useDeleteSet() {
  return useDeleteSetMutation()
}

export function useDeleteSetHook() {
  return useDeleteSetMutation()
}
