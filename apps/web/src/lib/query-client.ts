import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/react-query-persist-client'

// Enhanced React Query configuration with smart caching
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache for 5 minutes by default
        staleTime: 5 * 60 * 1000,
        // Keep in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 3 times
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for critical data
        refetchOnWindowFocus: false,
        // Network mode handling
        networkMode: 'online',
      },
      mutations: {
        retry: 1,
        networkMode: 'online',
      },
    },
  })
}

// Intelligent cache invalidation patterns
export const cacheKeys = {
  // User data - invalidate frequently
  user: {
    profile: ['user', 'profile'] as const,
    settings: ['user', 'settings'] as const,
  },
  // Workout data - cache longer, invalidate on mutations
  workouts: {
    all: ['workouts'] as const,
    list: (filters?: Record<string, any>) => ['workouts', 'list', filters] as const,
    detail: (id: string) => ['workouts', 'detail', id] as const,
    templates: ['workouts', 'templates'] as const,
  },
  // Analytics - cache very long, background refresh
  analytics: {
    all: ['analytics'] as const,
    progress: (userId: string, timeRange: string) => ['analytics', 'progress', userId, timeRange] as const,
    summary: (userId: string) => ['analytics', 'summary', userId] as const,
  },
  // Reference data - cache very long (rarely changes)
  reference: {
    movements: ['reference', 'movements'] as const,
    equipment: ['reference', 'equipment'] as const,
  },
} as const

// Smart persister that only persists certain query types
export const createPersister = () => {
  return createSyncStoragePersister({
    storage: window.localStorage,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    // Only persist reference data and user preferences (not workout sessions)
    filter: (query) => {
      return query.queryKey[0] === 'reference' ||
             query.queryKey[0] === 'user' ||
             (query.queryKey[0] === 'analytics' && query.queryKey[1] === 'summary')
    },
  })
}

// Background sync for offline-first experience
export const setupOfflineSync = (queryClient: QueryClient) => {
  // Listen for online/offline events
  window.addEventListener('online', () => {
    queryClient.resumePausedMutations()
    queryClient.invalidateQueries({
      predicate: (query) => query.state.status === 'error'
    })
  })

  // Periodic background sync when online
  if (navigator.onLine) {
    setInterval(() => {
      // Refresh critical data every 5 minutes in background
      queryClient.refetchQueries({
        queryKey: cacheKeys.user.profile,
        type: 'active',
      })
    }, 5 * 60 * 1000)
  }
}
