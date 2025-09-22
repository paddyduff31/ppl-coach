import { RouterProvider } from '@tanstack/react-router'
import { APIProvider } from '@ppl-coach/api-client'
import { Toaster } from 'sonner'
import { router } from './app/router'
import './App.css'

function App() {
  return (
    <APIProvider enablePersistence={true}>
      <div className="min-h-screen bg-background">
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </div>
    </APIProvider>
  )
}

export default App
