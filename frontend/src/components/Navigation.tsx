import { Link, useLocation } from '@tanstack/react-router'
import { Button } from './ui/button'
import {
  House,
  ChartLine,
  Target,
  Gear,
  Play,
  Command,
  Clock
} from '@phosphor-icons/react'
import { cn } from '../utils/utils'
import { useState } from 'react'

const navigation = [
  { name: 'Home', href: '/', icon: House, shortcut: 'H' },
  { name: 'Progress', href: '/progress', icon: ChartLine, shortcut: 'P' },
  { name: 'History', href: '/history', icon: Clock, shortcut: 'Y' },
  { name: 'Exercises', href: '/movements', icon: Target, shortcut: 'E' },
  { name: 'Settings', href: '/settings', icon: Gear, shortcut: ',' },
]

export function Navigation() {
  const location = useLocation()
  const [showShortcuts, setShowShortcuts] = useState(false)

  return (
    <>
      {/* Minimal top bar - Linear/Slack inspired */}
      <nav className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-12 items-center justify-between">
            {/* Logo - super minimal */}
            <Link
              to="/"
              className="flex items-center space-x-2 group"
            >
              <div className="relative">
                <Target className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-semibold tracking-tight hidden sm:block">PPL</span>
            </Link>

            {/* Center navigation - clean and minimal */}
            <div className="flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link key={item.name} to={item.href}>
                    <button
                      className={cn(
                        "relative flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
                        "hover:bg-accent/50 hover:scale-[1.02] active:scale-[0.98]",
                        isActive
                          ? "text-primary bg-accent shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden md:inline">{item.name}</span>

                      {/* Keyboard shortcut hint */}
                      {showShortcuts && (
                        <span className="hidden lg:inline-flex items-center justify-center w-5 h-5 text-xs bg-muted border rounded text-muted-foreground">
                          {item.shortcut}
                        </span>
                      )}

                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                      )}
                    </button>
                  </Link>
                )
              })}
            </div>

            {/* Actions - minimal */}
            <div className="flex items-center space-x-2">
              {/* Command palette hint */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 text-xs text-muted-foreground transition-colors rounded-md border border-border/50 bg-background/50">
                <Command className="h-3 w-3" />
                <span>Search</span>
                <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100">
                  ⌘K
                </kbd>
              </div>

              {/* Start workout - prominent but clean */}
              <Link to="/plan">
                <Button
                  size="sm"
                  className="btn-hover relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Play className="h-3.5 w-3.5 relative z-10" />
                  <span className="hidden sm:inline relative z-10 ml-1.5">Start</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <div className="fixed top-14 right-6 z-50 animate-fade-in">
          <div className="glass rounded-lg p-3 border border-border/50 shadow-lg">
            <div className="text-xs font-medium text-foreground mb-2">Shortcuts</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between space-x-4">
                <span className="text-muted-foreground">New workout</span>
                <kbd className="font-mono">⌘N</kbd>
              </div>
              <div className="flex justify-between space-x-4">
                <span className="text-muted-foreground">Search</span>
                <kbd className="font-mono">⌘K</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}