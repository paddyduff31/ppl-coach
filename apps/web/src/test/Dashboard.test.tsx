import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock Phosphor icons
vi.mock('@phosphor-icons/react', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
}))

import Dashboard from '../pages/Dashboard'

describe('Dashboard', () => {
  it('renders dashboard title', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders key metrics cards', () => {
    render(<Dashboard />)
    expect(screen.getByText("This Week's Sets")).toBeInTheDocument()
    expect(screen.getByText('Next Suggested Day')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })

  it('renders recent sessions', () => {
    render(<Dashboard />)
    expect(screen.getByText('Recent Sessions')).toBeInTheDocument()
  })
})