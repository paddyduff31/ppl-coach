import { describe, it, expect } from 'vitest'
import { MovementSchema, WorkoutSessionSchema, BodyMetricsSchema } from '../api/schemas'

describe('API Schemas', () => {
  it('validates Movement schema correctly', () => {
    const validMovement = {
      id: '1',
      name: 'Bench Press',
      dayType: 1,
      muscleGroups: ['Chest'],
      equipmentTypes: [1],
      isCompound: true,
    }

    const result = MovementSchema.safeParse(validMovement)
    expect(result.success).toBe(true)
  })

  it('validates WorkoutSession schema correctly', () => {
    const validSession = {
      id: '1',
      userId: 'user-1',
      date: '2024-01-15',
      dayType: 1,
      setLogs: [],
    }

    const result = WorkoutSessionSchema.safeParse(validSession)
    expect(result.success).toBe(true)
  })

  it('validates BodyMetrics schema correctly', () => {
    const validMetrics = {
      id: '1',
      date: '2024-01-15',
      weight: 70.5,
    }

    const result = BodyMetricsSchema.safeParse(validMetrics)
    expect(result.success).toBe(true)
  })
})