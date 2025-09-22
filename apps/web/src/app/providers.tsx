import { APIProvider } from '@ppl-coach/api-client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { ErrorBoundary } from '../components/ErrorBoundary'

export function Providers() {
  return (
    <ErrorBoundary level="page">
      <APIProvider enablePersistence={true}>
        <RouterProvider router={router} />
      </APIProvider>
    </ErrorBoundary>
  )
}
