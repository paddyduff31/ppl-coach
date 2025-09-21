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
  Users,
  Trophy,
  Eye,
  MusicNote,
  Brain,
  Crown
} from '@phosphor-icons/react'
import { cn } from '../utils/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: House, shortcut: 'H' },
  { name: 'Calendar', href: '/calendar', icon: Calendar, shortcut: 'C' },
  { name: 'Workouts', href: '/plan', icon: CalendarCheck, shortcut: 'W' },
  { name: 'Exercises', href: '/movements', icon: Barbell, shortcut: 'E' },
  { name: 'History', href: '/history', icon: Clock, shortcut: 'Y' },
  { name: 'Progress', href: '/progress', icon: ChartLine, shortcut: 'P' },
]

export function Navigation() {
  const location = useLocation()

  return (
    <>
      {/* Clean sidebar navigation */}
      <div className="fixed left-0 top-0 z-50 h-screen w-16 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center h-16 group relative"
        >
          <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div className="absolute left-20 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            PPL Coach
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center py-8 space-y-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link key={item.name} to={item.href} className="group relative">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative",
                    isActive
                      ? "bg-gray-100 text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gray-900 rounded-r-full" />
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {item.name}
                  <kbd className="ml-2 px-1 py-0.5 bg-gray-700 rounded text-xs">
                    ⌘{item.shortcut}
                  </kbd>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col items-center space-y-4 pb-6">
          {/* Integrations */}
          <Link to="/integrations" className="group relative">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                location.pathname === '/integrations'
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              )}
            >
              <Plugs className="h-5 w-5" />
            </div>
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Integrations
              <kbd className="ml-2 px-1 py-0.5 bg-gray-700 rounded text-xs">⌘I</kbd>
            </div>
          </Link>

          {/* Settings */}
          <Link to="/settings" className="group relative">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                location.pathname === '/settings'
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              )}
            >
              <Gear className="h-5 w-5" />
            </div>
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Settings
              <kbd className="ml-2 px-1 py-0.5 bg-gray-700 rounded text-xs">⌘,</kbd>
            </div>
          </Link>
        </div>
      </div>

      {/* Top bar for actions and quick access */}
      <div className="fixed top-0 left-16 right-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        {/* Page context */}
        <div className="flex items-center space-x-4">
          {/* Quick search */}
          <button
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors min-w-[200px] justify-start"
            onClick={() => {}} // Would open command palette
          >
            <Command className="h-4 w-4" />
            <span>Search exercises, workouts...</span>
            <kbd className="ml-auto px-1 py-0.5 bg-gray-200 rounded text-xs">⌘K</kbd>
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex items-center space-x-3">
          {/* NEW AWESOME FEATURES - Premium Feature Bar */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <Crown className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Premium Features:</span>
            
            {/* AI Form Coach */}
            <Link to="/form-coach" className="group relative">
              <div className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-md transition-all duration-200",
                location.pathname === '/form-coach' 
                  ? "bg-purple-500 text-white" 
                  : "hover:bg-purple-100 text-purple-600"
              )}>
                <Eye className="h-3 w-3" />
                <span className="text-xs font-medium">AI Form Coach</span>
              </div>
            </Link>
            
            {/* Social Hub */}
            <Link to="/social" className="group relative">
              <div className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-md transition-all duration-200",
                location.pathname === '/social' 
                  ? "bg-blue-500 text-white" 
                  : "hover:bg-blue-100 text-blue-600"
              )}>
                <Users className="h-3 w-3" />
                <span className="text-xs font-medium">Social Hub</span>
              </div>
            </Link>
            
            {/* Challenges */}
            <Link to="/challenges" className="group relative">
              <div className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-md transition-all duration-200",
                location.pathname === '/challenges' 
                  ? "bg-yellow-500 text-white" 
                  : "hover:bg-yellow-100 text-yellow-600"
              )}>
                <Trophy className="h-3 w-3" />
                <span className="text-xs font-medium">Challenges</span>
              </div>
            </Link>
            
            {/* AI DJ */}
            <Link to="/workout-dj" className="group relative">
              <div className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-md transition-all duration-200",
                location.pathname === '/workout-dj' 
                  ? "bg-pink-500 text-white" 
                  : "hover:bg-pink-100 text-pink-600"
              )}>
                <MusicNote className="h-3 w-3" />
                <span className="text-xs font-medium">AI DJ</span>
              </div>
            </Link>
          </div>

          {/* Intervals */}
          <Link to="/intervals" className="group">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <Lightning className="h-4 w-4" />
              <span className="text-sm font-medium">Intervals</span>
            </div>
          </Link>

          {/* Start workout */}
          <Link to="/plan">
            <Button
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* Main content offset */}
      <div className="pl-16 pt-16">
        {/* This creates the proper spacing for the main content */}
      </div>
    </>
  )
}