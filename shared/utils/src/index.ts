// Shared utilities for PPL Coach application
import type { DayType, EquipmentType } from '@ppl-coach/shared-types'

// Date utilities
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]! // YYYY-MM-DD format
}

export const parseDate = (dateString: string): Date => {
  return new Date(dateString)
}

export const isToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

export const isThisWeek = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return d >= startOfWeek && d <= endOfWeek
}

// Workout utilities
export const getDayTypeName = (dayType: DayType): string => {
  switch (dayType) {
    case 1:
      return 'Push'
    case 2:
      return 'Pull'
    case 3:
      return 'Legs'
    default:
      return 'Unknown'
  }
}

export const getEquipmentTypeName = (equipmentType: EquipmentType): string => {
  switch (equipmentType) {
    case 1:
      return 'Barbell'
    case 2:
      return 'Dumbbell'
    case 3:
      return 'Cable'
    case 4:
      return 'Machine'
    case 5:
      return 'Bodyweight'
    case 6:
      return 'Kettlebell'
    case 7:
      return 'Resistance Band'
    default:
      return 'Unknown'
  }
}

// 1RM calculation using Epley formula
export const calculateOneRepMax = (weight: number, reps: number): number => {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

// Volume calculation
export const calculateVolume = (weight: number, reps: number): number => {
  return weight * reps
}

// RPE utilities
export const rpeToPercentageOneRM = (rpe: number): number => {
  const rpeChart: Record<number, number> = {
    10: 100,
    9: 97,
    8: 93,
    7: 88,
    6: 84,
    5: 81,
    4: 79,
    3: 76,
    2: 74,
    1: 72
  }
  return rpeChart[rpe] || 100
}

// Validation utilities
export const isValidWeight = (weight: number): boolean => {
  return weight > 0 && weight <= 1000 // reasonable weight range in kg
}

export const isValidReps = (reps: number): boolean => {
  return reps > 0 && reps <= 100 // reasonable rep range
}

export const isValidRPE = (rpe: number): boolean => {
  return rpe >= 1 && rpe <= 10
}

// String utilities
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const formatMuscleGroups = (muscleGroups: string[]): string => {
  if (muscleGroups.length === 0) return ''
  if (muscleGroups.length === 1) return capitalizeFirst(muscleGroups[0]!)
  if (muscleGroups.length === 2) return `${capitalizeFirst(muscleGroups[0]!)} & ${capitalizeFirst(muscleGroups[1]!)}`

  const formatted = muscleGroups.slice(0, -1).map(capitalizeFirst).join(', ')
  return `${formatted} & ${capitalizeFirst(muscleGroups[muscleGroups.length - 1]!)}`
}

// API utilities
export const createQueryParams = (params: Record<string, string | number | boolean | undefined>): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString()
}

// Local storage utilities (for web/mobile)
export const storage = {
  set: (key: string, value: unknown): void => {
    try {
      const serialized = JSON.stringify(value)
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, serialized)
      }
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${error}`)
    }
  },

  get: <T>(key: string, defaultValue?: T): T | undefined => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
      }
      return defaultValue
    } catch (error) {
      console.warn(`Failed to read from localStorage: ${error}`)
      return defaultValue
    }
  },

  remove: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Failed to remove from localStorage: ${error}`)
    }
  },

  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear()
      }
    } catch (error) {
      console.warn(`Failed to clear localStorage: ${error}`)
    }
  }
}