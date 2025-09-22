import { QueryClient } from '@tanstack/react-query';
import { getQueryKey } from './pagination';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

/**
 * Enhanced query client with optimized defaults for the PPL Coach app
 */
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours (increased for better persistence)
        refetchOnWindowFocus: false,
        refetchOnMount: 'always',
        refetchOnReconnect: 'always',
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors except 408, 429
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return error?.response?.status === 408 || error?.response?.status === 429;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: (failureCount, error: any) => {
          // Don't retry mutations on client errors
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        onError: (error) => {
          console.error('Mutation failed:', error);
          // Could add toast notification here
        },
      },
    },
  });
};

/**
 * Create persister for query cache persistence
 */
export const createQueryPersister = () => {
  return createSyncStoragePersister({
    storage: typeof window !== 'undefined' ? window.localStorage : null,
    key: 'ppl-coach-cache',
    serialize: JSON.stringify,
    deserialize: (value: string) => {
      try {
        return JSON.parse(value);
      } catch {
        // If parsing fails, return null to trigger fresh fetch
        return null;
      }
    },
    throttleTime: 1000, // Throttle saves to avoid excessive writes
  });
};

/**
 * Invalidate related queries after mutations
 * Common pattern for keeping data in sync
 */
export const invalidateQueries = {
  // User-related queries
  user: (queryClient: QueryClient, userId?: string) => {
    queryClient.invalidateQueries({ queryKey: getQueryKey('getUser', userId ? { userId } : undefined) });
    queryClient.invalidateQueries({ queryKey: getQueryKey('getProfile', userId ? { userId } : undefined) });
  },

  // Session-related queries
  sessions: (queryClient: QueryClient, userId?: string) => {
    queryClient.invalidateQueries({ queryKey: getQueryKey('getUserSessions') });
    queryClient.invalidateQueries({ queryKey: getQueryKey('getSession') });
    if (userId) {
      queryClient.invalidateQueries({ queryKey: getQueryKey('getUserSessions', { userId }) });
    }
  },

  // Movement-related queries
  movements: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: getQueryKey('getMovements') });
    queryClient.invalidateQueries({ queryKey: getQueryKey('getMovementsByEquipment') });
  },

  // Progress-related queries
  progress: (queryClient: QueryClient, userId?: string) => {
    queryClient.invalidateQueries({ queryKey: getQueryKey('getPersonalRecords') });
    queryClient.invalidateQueries({ queryKey: getQueryKey('getMuscleGroupProgress') });
    queryClient.invalidateQueries({ queryKey: getQueryKey('getProgressSummary') });
    if (userId) {
      queryClient.invalidateQueries({ queryKey: getQueryKey('getPersonalRecords', { userId }) });
      queryClient.invalidateQueries({ queryKey: getQueryKey('getMuscleGroupProgress', { userId }) });
      queryClient.invalidateQueries({ queryKey: getQueryKey('getProgressSummary', { userId }) });
    }
  },

  // Invalidate all user-related data
  all: (queryClient: QueryClient) => {
    queryClient.invalidateQueries();
  }
};

/**
 * Common query options for different types of data
 */
export const queryOptions = {
  // User profile data - cache longer since it changes infrequently
  userProfile: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },

  // Session data - moderate caching
  sessions: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  },

  // Movement data - cache aggressively since it's relatively static
  movements: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  },

  // Progress data - fresh data important for motivation
  progress: {
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes
  },

  // Real-time data - always fetch fresh
  realtime: {
    staleTime: 0,
    gcTime: 1000 * 60 * 5, // 5 minutes
  }
};

/**
 * Error handling utilities
 */
export const errorHandlers = {
  // Generic error handler with user-friendly messages
  generic: (error: any) => {
    console.error('API Error:', error);

    if (error?.response?.status === 401) {
      return 'Please log in to continue';
    }

    if (error?.response?.status === 403) {
      return 'You do not have permission to perform this action';
    }

    if (error?.response?.status === 404) {
      return 'The requested data was not found';
    }

    if (error?.response?.status >= 500) {
      return 'Server error. Please try again later';
    }

    return error?.response?.data?.message || error?.message || 'Something went wrong';
  },

  // Network error handler
  network: (error: any) => {
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      return 'Network connection error. Please check your internet connection';
    }
    return errorHandlers.generic(error);
  }
};
