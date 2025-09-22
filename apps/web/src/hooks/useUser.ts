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
    }
  })

  // Create user profile mutation using the generated API client hook
  const createUserMutation = useCreateProfile({
    mutation: {
      onSuccess: (response) => {
        const userId = response.data.id
        setStoredUserId(userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] })
      },
    }
  })

  // Create user and store ID
  const createUser = async (email: string, displayName: string) => {
    try {
      const response = await createUserMutation.mutateAsync({
        params: { email, displayName }
      })
      return response.data
    } catch (err) {
      console.error('Failed to create user:', err)
      throw err
    }
  }

  return {
    user: userProfile,
    userId: userProfile?.id,
    isLoading: isLoading || createUserMutation.isPending,
    error,
    createUser,
    isCreatingUser: createUserMutation.isPending
  }
}
