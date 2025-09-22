import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@ppl-coach/api-client'
import { Toaster } from 'sonner'
import { router } from './app/router'
import { queryClient } from './app/queryClient'
import './App.css'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}

export default App
