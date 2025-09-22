import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createOptimizedQueryClient } from '../utils/query';

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
 * Enhanced API Provider with React Query setup
 * Works for both web and mobile with environment detection
 */
export interface APIProviderProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  /** Show React Query DevTools (defaults to dev environment detection) */
  showDevtools?: boolean;
}

export function APIProvider({
  children,
  queryClient,
  showDevtools
}: APIProviderProps) {
  const client = queryClient || getQueryClient();

  // Auto-detect development environment with cross-platform support
  const isDev = showDevtools ?? (
    process.env.NODE_ENV === 'development' ||
    (typeof globalThis !== 'undefined' && (globalThis as any).__DEV__) // React Native development flag
  );

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
