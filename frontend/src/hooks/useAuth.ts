import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useUser } from './useUser'

export function useAuth() {
  const navigate = useNavigate()
  const { user, isLoading, error } = useUser()

  useEffect(() => {
    // Only redirect to onboarding if there's a specific 404 error (user not found)
    // Don't redirect on network errors or other temporary issues
    if (!isLoading && error && error.message?.includes('404')) {
      navigate({ to: '/onboarding' })
    }
  }, [isLoading, error, navigate])

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error
  }
}
