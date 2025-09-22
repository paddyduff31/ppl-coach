import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { queryClient } from './queryClient'
import { router } from './router'
import { ErrorBoundary } from '../components/ui/error-boundary'

export function Providers() {
  return (
    <ErrorBoundary
      name="App Root"
      onError={(error, errorInfo) => {
        console.error('🚨 Root Error Boundary caught error:', error)
        console.error('Error Info:', errorInfo)
      }}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-right"
            position="bottom"
          />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}