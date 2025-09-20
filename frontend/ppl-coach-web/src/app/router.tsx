import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import Dashboard from '../pages/Dashboard'
import Onboarding from '../pages/Onboarding'
import PlanDay from '../pages/PlanDay'
import LogSession from '../pages/LogSession'
import Progress from '../pages/Progress'
import Settings from '../pages/Settings'
import Movements from '../pages/Movements'
import IntervalTimer from '../pages/IntervalTimer'
import WorkoutHistory from '../pages/WorkoutHistory'
import { Navigation } from '../components/Navigation'

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Outlet />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    // Check if user exists, redirect to onboarding if not
    const userId = localStorage.getItem('ppl-coach-user-id')
    if (!userId) {
      window.location.href = '/onboarding'
      return null
    }
    return <Dashboard />
  },
})

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: Onboarding,
})

const planRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/plan',
  component: PlanDay,
})

const logSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/log/$id',
  component: LogSession,
})

const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/progress',
  component: Progress,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
})

const movementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/movements',
  component: Movements,
})

const intervalTimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/intervals',
  component: IntervalTimer,
})

const workoutHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: WorkoutHistory,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  planRoute,
  logSessionRoute,
  progressRoute,
  settingsRoute,
  movementsRoute,
  intervalTimerRoute,
  workoutHistoryRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}