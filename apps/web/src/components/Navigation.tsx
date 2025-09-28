import { Link, useLocation } from '@tanstack/react-router'
import { Button } from './ui/button'
import {
  House,
  ChartLine,
  Barbell,
  Gear,
  Command,
  Clock,
  Target,
  Plus,
  Lightning,
  CalendarCheck,
  Calendar,
  Plugs,
  MagnifyingGlass,
  Sparkle,
  DotsSixVertical
} from '@phosphor-icons/react'
import { cn } from '../utils/utils'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useAuth } from '../hooks/useAuth'
import { useCreateSession } from '../hooks/useSession'
import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

const defaultNavigation = [
  { id: 'home', name: 'Home', href: '/', icon: House, shortcut: 'H' },
  { id: 'calendar', name: 'Calendar', href: '/calendar', icon: Calendar, shortcut: 'C' },
  { id: 'workouts', name: 'Workouts', href: '/plan', icon: CalendarCheck, shortcut: 'W' },
  { id: 'exercises', name: 'Exercises', href: '/movements', icon: Barbell, shortcut: 'E' },
  { id: 'history', name: 'History', href: '/history', icon: Clock, shortcut: 'Y' },
  { id: 'progress', name: 'Progress', href: '/progress', icon: ChartLine, shortcut: 'P' },
]

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const createSessionMutation = useCreateSession()

  // Arc-style states with localStorage persistence
  const [isHidden, setIsHidden] = useState(() => {
    const saved = localStorage.getItem('ppl-coach-sidebar-hidden')
    return saved ? JSON.parse(saved) : false
  })
  const [isFloating, setIsFloating] = useState(false)
  const [isDocked, setIsDocked] = useState(() => {
    const saved = localStorage.getItem('ppl-coach-sidebar-docked')
    return saved ? JSON.parse(saved) : true
  })
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const [navigation, setNavigation] = useState(() => {
    const saved = localStorage.getItem('ppl-coach-navigation-order')
    return saved ? JSON.parse(saved) : defaultNavigation
  })

  const sidebarRef = useRef<HTMLDivElement>(null)
  const hoverZoneRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    nextDayType,
    nextDayName,
    nextDayDescription,
    isTodayComplete
  } = useWorkoutPlan()

  // Emit initial state
  useEffect(() => {
    emitSidebarState(isHidden, isFloating, isDocked)
  }, [])

  // Handle mouse hover for floating sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isHidden && !isFloating) {
        // Show floating sidebar when hovering near left edge
        if (e.clientX <= 10) {
          setIsFloating(true)
        }
      }
    }

    const handleMouseLeave = () => {
      if (isFloating && !isDocked) {
        hoverTimeoutRef.current = setTimeout(() => {
          setIsFloating(false)
        }, 300)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    if (sidebarRef.current) {
      sidebarRef.current.addEventListener('mouseleave', handleMouseLeave)
      sidebarRef.current.addEventListener('mouseenter', () => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current)
        }
      })
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [isHidden, isFloating, isDocked])

  const emitSidebarState = (hidden: boolean, floating: boolean, docked: boolean) => {
    const event = new CustomEvent('sidebar-state-change', {
      detail: { isHidden: hidden, isFloating: floating, isDocked: docked }
    })
    window.dispatchEvent(event)
  }

  const toggleSidebar = () => {
    if (isHidden) {
      // Show and dock
      setIsHidden(false)
      setIsFloating(false)
      setIsDocked(true)
      localStorage.setItem('ppl-coach-sidebar-hidden', 'false')
      localStorage.setItem('ppl-coach-sidebar-docked', 'true')
      emitSidebarState(false, false, true)
    } else {
      // Hide completely
      setIsHidden(true)
      setIsFloating(false)
      setIsDocked(false)
      localStorage.setItem('ppl-coach-sidebar-hidden', 'true')
      localStorage.setItem('ppl-coach-sidebar-docked', 'false')
      emitSidebarState(true, false, false)
    }
  }

  const dockSidebar = () => {
    setIsHidden(false)
    setIsFloating(false)
    setIsDocked(true)
    localStorage.setItem('ppl-coach-sidebar-hidden', 'false')
    localStorage.setItem('ppl-coach-sidebar-docked', 'true')
    emitSidebarState(false, false, true)
  }

  const startNextWorkout = async () => {
    if (!user?.id) return

    try {
      const session = await createSessionMutation.mutateAsync({
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        dayType: nextDayType,
        notes: `${nextDayName} day workout`
      })

      navigate({ to: '/log/$id', params: { id: session.data.id } })
    } catch (error) {
      console.error('Failed to start workout:', error)
      navigate({ to: '/plan' })
    }
  }

  const handleStartWorkout = () => {
    if (!user?.id) {
      navigate({ to: '/onboarding' })
      return
    }

    if (isTodayComplete) {
      navigate({ to: '/plan' })
    } else {
      startNextWorkout()
    }
  }

  // Drag and drop for reordering
  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetItem: any) => {
    e.preventDefault()
    if (!draggedItem || draggedItem.id === targetItem.id) return

    const newNavigation = [...navigation]
    const draggedIndex = newNavigation.findIndex(item => item.id === draggedItem.id)
    const targetIndex = newNavigation.findIndex(item => item.id === targetItem.id)

    newNavigation.splice(draggedIndex, 1)
    newNavigation.splice(targetIndex, 0, draggedItem)

    setNavigation(newNavigation)
    localStorage.setItem('ppl-coach-navigation-order', JSON.stringify(newNavigation))
    setDraggedItem(null)
  }

  const shouldShowSidebar = !isHidden || isFloating

  return (
    <>
      {/* Hover Zone for Arc-style reveal */}
      {isHidden && (
        <div
          ref={hoverZoneRef}
          className="fixed top-0 left-0 w-4 h-full z-40"
        />
      )}

      {/* Arc-style Sidebar */}
      {shouldShowSidebar && (
        <div
          ref={sidebarRef}
          className={cn(
            "fixed z-50 w-72 bg-gray-100 transition-all duration-300 ease-out",
            isFloating
              ? "top-3 left-3 bottom-3 rounded-2xl shadow-2xl border border-gray-200/50"
              : isDocked
              ? "top-0 left-0 h-screen border-r border-gray-200"
              : "top-3 left-3 bottom-3 rounded-2xl shadow-2xl border border-gray-200/50"
          )}
        >
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">PPL Coach</span>
            </Link>

            <div className="flex items-center space-x-2">
              {isFloating && (
                <button
                  onClick={dockSidebar}
                  className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 transition-colors"
                >
                  ⚓
                </button>
              )}
              <button
                onClick={toggleSidebar}
                className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <Command className="h-3 w-3 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3 px-3 py-2 bg-white rounded-lg border border-gray-200">
              <MagnifyingGlass className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none"
              />
              <kbd className="px-1 py-0.5 text-xs text-gray-400 bg-gray-100 rounded">⌘K</kbd>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item)}
                    className="group cursor-move"
                  >
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group/link",
                        isActive
                          ? "bg-gray-200 text-gray-900"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )}
                    >
                      <DotsSixVertical className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.name}</span>
                      <div className="flex-1" />
                      <kbd className="px-1 py-0.5 text-xs text-gray-400 bg-gray-200/50 rounded opacity-0 group-hover/link:opacity-100 transition-opacity">
                        ⌘{item.shortcut}
                      </kbd>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <button
              onClick={handleStartWorkout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">
                {isTodayComplete ? 'New Workout' : `Start ${nextDayName || 'Workout'}`}
              </span>
            </button>

            <div className="flex items-center space-x-2">
              <Link
                to="/integrations"
                className={cn(
                  "flex-1 flex items-center justify-center p-2 rounded-lg transition-colors",
                  location.pathname === '/integrations'
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
              >
                <Plugs className="h-4 w-4" />
              </Link>
              <Link
                to="/settings"
                className={cn(
                  "flex-1 flex items-center justify-center p-2 rounded-lg transition-colors",
                  location.pathname === '/settings'
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
              >
                <Gear className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          {navigation.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg transition-colors min-w-[60px]",
                  isActive
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium mt-1">{item.name}</span>
              </Link>
            )
          })}
          <button
            onClick={handleStartWorkout}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-900 text-white min-w-[60px]"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium mt-1">Start</span>
          </button>
        </div>
      </div>

    </>
  )
}
