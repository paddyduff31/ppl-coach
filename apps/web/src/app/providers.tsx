import { APIProvider } from '@ppl-coach/api-client'
import { RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { router } from './router'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { AuthProvider } from '../hooks/useAuth'

export function Providers() {
  return (
    <ErrorBoundary level="page">
      <APIProvider enablePersistence={true}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </APIProvider>
      <Toaster />
    </ErrorBoundary>
  )
}
