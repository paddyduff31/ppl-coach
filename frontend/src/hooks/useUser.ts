import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/endpoints'

// Check if user exists in localStorage
const getStoredUserId = (): string | null => {
  return localStorage.getItem('ppl-coach-user-id')
}

const setStoredUserId = (id: string): void => {
  localStorage.setItem('ppl-coach-user-id', id)
}

export function useUser() {
  const queryClient = useQueryClient()
  const storedUserId = getStoredUserId()

  // Get user profile - only if we have a stored user ID
  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['user', storedUserId],
    queryFn: () => api.getProfile(storedUserId!),
    retry: false,
    enabled: !!storedUserId,
  })

  // Create user profile mutation
  const createUserMutation = useMutation({
    mutationFn: ({ email, displayName }: { email: string; displayName: string }) => 
      api.createProfile(email, displayName),
    onSuccess: (response) => {
      const userId = response.data.id
      setStoredUserId(userId)
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
    },
  })

  // Create user and store ID
  const createUser = async (email: string, displayName: string) => {
    try {
      const response = await createUserMutation.mutateAsync({ email, displayName })
      return response.data
    } catch (err) {
      console.error('Failed to create user:', err)
      throw err
    }
  }

  return {
    user: userProfile?.data,
    userId: userProfile?.data?.id,
    isLoading: isLoading || createUserMutation.isPending,
    error,
    createUser,
    isCreatingUser: createUserMutation.isPending
  }
}