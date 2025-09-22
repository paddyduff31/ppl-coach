import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate } from '@tanstack/react-router'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: Error | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Check if user is already logged in (from localStorage or token)
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // For now, we'll simulate a user - replace with real API call
      const mockUser = {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'demo@pplcoach.com',
        name: 'Demo User'
      }

      setUser(mockUser)
    } catch (err) {
      setError(err as Error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // TODO: Replace with real authentication API call
      console.log('Login attempt:', { email, password })

      // For now, just set a mock user
      await checkAuthStatus()
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthRedirect() {
  const { user, isLoading, error } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Only redirect to onboarding if there's a specific 404 error (user not found)
    // Don't redirect on network errors or other temporary issues
    if (!isLoading && error && error.message?.includes('404')) {
      navigate({ to: '/onboarding' })
    }
  }, [isLoading, error, navigate])

  return null
}
