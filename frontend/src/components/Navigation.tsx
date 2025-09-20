import { Link, useLocation } from '@tanstack/react-router'
import { Button } from './ui/button'
import {
  House,
  Calendar,
  ChartLine,
  Target as DumbbellIcon,
  Gear,
  Play,
  Target,
  Timer,
  Clock
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: House },
  { name: 'Start Workout', href: '/plan', icon: Calendar },
  { name: 'Workout History', href: '/history', icon: Clock },
  { name: 'Interval Timer', href: '/intervals', icon: Timer },
  { name: 'Progress', href: '/progress', icon: ChartLine },
  { name: 'Exercises', href: '/movements', icon: DumbbellIcon },
  { name: 'Settings', href: '/settings', icon: Gear },
]

export function Navigation() {
  const location = useLocation()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">PPL Coach</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link key={item.name} to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "flex items-center space-x-2",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/plan">
              <Button className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Start Workout</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
