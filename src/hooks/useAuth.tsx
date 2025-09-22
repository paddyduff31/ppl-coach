import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export interface User {
  id: string
  email: string
  displayName: string
  createdAt: string
  lastLoginAt?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

/**
 * Authentication provider that manages user state and auth operations
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  const queryClient = useQueryClient()

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const token = getStoredToken()
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return
      }

      // Validate token and get user info
      const user = await validateToken(token)
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } else {
        clearStoredToken()
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      clearStoredToken()
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication initialization failed',
      })
    }
  }

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // TODO: Replace with actual API call when backend is ready
      const mockLoginResponse = await mockLogin(email, password)
      const { user, token } = mockLoginResponse

      // Store token
      storeToken(token)

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      // Clear any cached data from previous user
      queryClient.clear()
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }))
      throw error
    }
  }

  const register = async (email: string, password: string, displayName: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // TODO: Replace with actual API call when backend is ready
      const mockRegisterResponse = await mockRegister(email, password, displayName)
      const { user, token } = mockRegisterResponse

      // Store token
      storeToken(token)

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      // Clear any cached data
      queryClient.clear()
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed',
      }))
      throw error
    }
  }

  const logout = async () => {
    try {
      // TODO: Call logout endpoint when backend is ready

      // Clear local storage
      clearStoredToken()

      // Clear all cached data
      queryClient.clear()

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API call fails
      clearStoredToken()
      queryClient.clear()
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Token management utilities
const TOKEN_KEY = 'ppl-coach-auth-token'

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function storeToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

function clearStoredToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

// Mock authentication functions (replace with real API calls)
async function mockLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock validation
  if (email === 'demo@ppl-coach.com' && password === 'demo123') {
    return {
      user: {
        id: '31b641fe-111e-4cce-b582-1be8bbae72e7',
        email,
        displayName: 'Demo User',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token-' + Date.now(),
    }
  }

  throw new Error('Invalid email or password')
}

async function mockRegister(
  email: string,
  password: string,
  displayName: string
): Promise<{ user: User; token: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock user creation
  return {
    user: {
      id: 'user-' + Date.now(),
      email,
      displayName,
      createdAt: new Date().toISOString(),
    },
    token: 'mock-jwt-token-' + Date.now(),
  }
}

async function validateToken(token: string): Promise<User | null> {
  // TODO: Replace with actual token validation
  if (token.startsWith('mock-jwt-token-')) {
    return {
      id: '31b641fe-111e-4cce-b582-1be8bbae72e7',
      email: 'demo@ppl-coach.com',
      displayName: 'Demo User',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }
  }

  return null
}

/**
 * Hook to check if user has specific permissions
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth()

  return {
    canCreateWorkouts: isAuthenticated,
    canEditProfile: isAuthenticated,
    canViewProgress: isAuthenticated,
    canDeleteData: isAuthenticated,
    isOwner: (resourceUserId: string) => user?.id === resourceUserId,
  }
}

/**
 * HOC to protect routes that require authentication
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/onboarding'
      return null
    }

    return <Component {...props} />
  }
}