import { useQueryClient } from '@tanstack/react-query'
import { useGetProfile, useCreateProfile } from '@ppl-coach/api-client'

// Check if user exists in localStorage, fallback to default user for development
const getStoredUserId = (): string | null => {
  const stored = localStorage.getItem('ppl-coach-user-id')
  // Fallback to your default user ID for development
  return stored || '31b641fe-111e-4cce-b582-1be8bbae72e7'
}

const setStoredUserId = (id: string): void => {
  localStorage.setItem('ppl-coach-user-id', id)
}

export function useUser() {
  const queryClient = useQueryClient()
  const storedUserId = getStoredUserId()

  // If we're using the fallback user ID, store it in localStorage
  if (storedUserId === '31b641fe-111e-4cce-b582-1be8bbae72e7' && !localStorage.getItem('ppl-coach-user-id')) {
    setStoredUserId(storedUserId)
  }

  // Get user profile using the generated API client hook
  const { data: userProfile, isLoading, error } = useGetProfile(storedUserId!, {
    query: {
      retry: false,
      enabled: !!storedUserId,
      staleTime: 5 * 60 * 1000, // 5 minutes - profile data doesn't change often
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component mounts if data exists
    }
  })

  type UserProfile = {
    id: string
    email?: string
    name?: string
  }
  const profile = userProfile as UserProfile | undefined

  // Create user profile mutation using the generated API client hook
  const createUserMutation = useCreateProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user'] })
      },
    }
  })

  // Create user and store ID
  const createUser = async (email: string, displayName: string) => {
    try {
      await createUserMutation.mutateAsync({
        params: { email, displayName }
      })
    } catch (err) {
      console.error('Failed to create user:', err)
      throw err
    }
  }

  return {
    user: profile ?? null,
    userId: profile?.id ?? storedUserId,
    isLoading: isLoading || createUserMutation.isPending,
    error,
    createUser,
    isCreatingUser: createUserMutation.isPending
  }
}
