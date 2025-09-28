import { ReactNode, useState, useEffect } from 'react'
import { cn } from '../utils/utils'

interface ContentWrapperProps {
  children: ReactNode
}

export function ContentWrapper({ children }: ContentWrapperProps) {
  // Sync with Navigation component state from localStorage
  const [sidebarDocked, setSidebarDocked] = useState(() => {
    const saved = localStorage.getItem('ppl-coach-sidebar-docked')
    return saved ? JSON.parse(saved) : true
  })
  const [sidebarHidden, setSidebarHidden] = useState(() => {
    const saved = localStorage.getItem('ppl-coach-sidebar-hidden')
    return saved ? JSON.parse(saved) : false
  })

  // Listen for sidebar state changes via custom events
  useEffect(() => {
    const handleSidebarChange = (event: CustomEvent) => {
      setSidebarDocked(event.detail.isDocked)
      setSidebarHidden(event.detail.isHidden)
    }

    window.addEventListener('sidebar-state-change', handleSidebarChange)
    return () => window.removeEventListener('sidebar-state-change', handleSidebarChange)
  }, [])

  const shouldShowRoundedContent = sidebarDocked && !sidebarHidden

  return (
    <div
      className={cn(
        "transition-all duration-300 h-screen pb-20 lg:pb-0",
        shouldShowRoundedContent ? "lg:pl-72 lg:pr-3 lg:pt-3 lg:pb-3" : "lg:pl-0"
      )}
      style={{
        backgroundColor: shouldShowRoundedContent ? '#f3f4f6' : 'white'
      }}
    >
      {shouldShowRoundedContent ? (
        <div className="h-full bg-white rounded-2xl shadow-sm relative ml-3">
          <div className="h-full overflow-y-scroll p-6 no-scrollbar">
            {children}
          </div>
        </div>
      ) : (
        <div className="h-full">
          {children}
        </div>
      )}
    </div>
  )
}