import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createOptimizedQueryClient, createQueryPersister } from '../utils/query';

// Conditional import for React Query DevTools (web only)
let ReactQueryDevtools: any = null;
try {
  // Only import devtools in web environment
  if (typeof window !== 'undefined') {
    ReactQueryDevtools = require('@tanstack/react-query-devtools').ReactQueryDevtools;
  }
} catch (e) {
  // DevTools not available, continue without them
}

let queryClientInstance: QueryClient | undefined;

/**
 * Get or create the global query client instance
 * Ensures we have a single instance across the app
 */
export function getQueryClient() {
  if (!queryClientInstance) {
    queryClientInstance = createOptimizedQueryClient();
  }
  return queryClientInstance;
}

/**
 * Enhanced API Provider with React Query setup and persistence
 * Works for both web and mobile with environment detection
 */
export interface APIProviderProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  /** Show React Query DevTools (defaults to dev environment detection) */
  showDevtools?: boolean;
  /** Enable query persistence (defaults to true) */
  enablePersistence?: boolean;
}

export function APIProvider({
  children,
  queryClient,
  showDevtools,
  enablePersistence = true
}: APIProviderProps) {
  const client = queryClient || getQueryClient();

  // Auto-detect development environment with cross-platform support
  const isDev = showDevtools ?? (
    process.env.NODE_ENV === 'development' ||
    (typeof globalThis !== 'undefined' && (globalThis as any).__DEV__) // React Native development flag
  );

  // Use persistence if enabled and we're in a browser environment
  if (enablePersistence && typeof window !== 'undefined') {
    const persister = createQueryPersister();

    return (
      <PersistQueryClientProvider
        client={client}
        persistOptions={{
          persister,
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
        }}
        onSuccess={() => {
          // Resume paused mutations and invalidate stale queries after restoration
          client.resumePausedMutations().then(() => {
            client.invalidateQueries({
              predicate: (query) => query.isStale(),
            });
          });
        }}
        onError={() => {
          console.warn('Query persistence failed');
          // Continue without persistence rather than breaking the app
        }}
      >
        {children}
        {/* Only show devtools in development and for web */}
        {isDev && ReactQueryDevtools && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </PersistQueryClientProvider>
    );
  }

  // Fallback to regular QueryClientProvider (for mobile or when persistence is disabled)
  return (
    <QueryClientProvider client={client}>
      {children}
      {/* Only show devtools in development and for web */}
      {isDev && typeof window !== 'undefined' && ReactQueryDevtools && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

/**
 * Hook to get the current query client
 * Useful for manual cache manipulation
 */
export { useQueryClient } from '@tanstack/react-query';
