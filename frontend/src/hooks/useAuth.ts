import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useUser } from './useUser'

export function useAuth() {
  const navigate = useNavigate()
  const { user, isLoading, error } = useUser()

  useEffect(() => {
    // If not loading and there's an error (user not found), redirect to onboarding
    if (!isLoading && error) {
      navigate({ to: '/onboarding' })
    }
  }, [isLoading, error, navigate])

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error
  }
}
