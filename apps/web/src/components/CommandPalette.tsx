import { useEffect, useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  CommandIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  ChartLineIcon,
  ClockIcon,
  TargetIcon,
  GearIcon,
  TimerIcon,
  HouseIcon,
  ArrowRightIcon,
  KeyboardIcon
} from '@phosphor-icons/react'
import { cn } from '../utils/utils'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  action: () => void
  icon: React.ComponentType<any>
  keywords: string[]
  category: 'navigation' | 'actions' | 'recent'
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-home',
      title: 'Home',
      subtitle: 'Go to dashboard',
      action: () => navigate({ to: '/' }),
      icon: HouseIcon,
      keywords: ['home', 'dashboard', 'main'],
      category: 'navigation'
    },
    {
      id: 'nav-progress',
      title: 'Progress',
      subtitle: 'View your progress and PRs',
      action: () => navigate({ to: '/progress' }),
      icon: ChartLineIcon,
      keywords: ['progress', 'chart', 'pr', 'personal record'],
      category: 'navigation'
    },
    {
      id: 'nav-history',
      title: 'Workout History',
      subtitle: 'View past workouts',
      action: () => navigate({ to: '/history' }),
      icon: ClockIcon,
      keywords: ['history', 'past', 'workouts', 'sessions'],
      category: 'navigation'
    },
    {
      id: 'nav-exercises',
      title: 'Exercises',
      subtitle: 'Browse exercise library',
      action: () => navigate({ to: '/movements' }),
      icon: TargetIcon,
      keywords: ['exercises', 'movements', 'library'],
      category: 'navigation'
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      subtitle: 'Configure your preferences',
      action: () => navigate({ to: '/settings' }),
      icon: GearIcon,
      keywords: ['settings', 'preferences', 'config'],
      category: 'navigation'
    },

    // Actions
    {
      id: 'action-start-workout',
      title: 'Start Workout',
      subtitle: 'Begin your next workout session',
      action: () => navigate({ to: '/plan' }),
      icon: PlayIcon,
      keywords: ['start', 'workout', 'begin', 'train'],
      category: 'actions'
    },
    {
      id: 'action-timer',
      title: 'Interval Timer',
      subtitle: 'Start interval timer',
      action: () => navigate({ to: '/intervals' }),
      icon: TimerIcon,
      keywords: ['timer', 'interval', 'rest'],
      category: 'actions'
    }
  ]

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
  )

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = []
    }
    acc[command.category].push(command)
    return acc
  }, {} as Record<string, CommandItem[]>)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            onClose()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands, onClose])

  if (!isOpen) return null

  const categoryLabels = {
    navigation: 'Navigation',
    actions: 'Actions',
    recent: 'Recent'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-lg mx-4">
        <div className="glass rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center px-4 py-3 border-b border-border/50">
            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            />
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <kbd className="px-2 py-1 bg-muted/50 rounded border">↑↓</kbd>
              <span>navigate</span>
              <kbd className="px-2 py-1 bg-muted/50 rounded border">↵</kbd>
              <span>select</span>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <CommandIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No commands found</p>
              </div>
            ) : (
              <div className="py-2">
                {Object.entries(groupedCommands).map(([category, items]) => (
                  <div key={category} className="mb-1">
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </div>
                    <div className="space-y-1 px-2">
                      {items.map((command) => {
                        const globalIndex = filteredCommands.indexOf(command)
                        const isSelected = globalIndex === selectedIndex

                        return (
                          <button
                            key={command.id}
                            onClick={() => {
                              command.action()
                              onClose()
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              "w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-150",
                              "hover:bg-accent/50 hover:scale-[1.01] active:scale-[0.99]",
                              isSelected && "bg-primary text-primary-foreground shadow-sm"
                            )}
                          >
                            <command.icon className={cn(
                              "h-5 w-5 mr-3 flex-shrink-0",
                              isSelected ? "text-primary-foreground" : "text-muted-foreground"
                            )} />
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "font-medium text-sm",
                                isSelected ? "text-primary-foreground" : "text-foreground"
                              )}>
                                {command.title}
                              </div>
                              {command.subtitle && (
                                <div className={cn(
                                  "text-xs truncate",
                                  isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                  {command.subtitle}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <ArrowRightIcon className="h-4 w-4 ml-2 text-primary-foreground/70 flex-shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 bg-muted/20">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <KeyboardIcon className="h-3 w-3" />
              <span>Tip: Use keyboard shortcuts for faster navigation</span>
            </div>
            <button
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <kbd className="px-2 py-1 bg-muted/50 rounded border">ESC</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
