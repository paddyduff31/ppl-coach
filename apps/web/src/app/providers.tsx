import { APIProvider } from '@ppl-coach/api-client'
import { RouterProvider } from '@tanstack/react-router'
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
      <APIProvider enablePersistence={true}>
        <RouterProvider router={router} />
      </APIProvider>
    </ErrorBoundary>
  )
}
