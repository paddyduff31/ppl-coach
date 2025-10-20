import { useGetPersonalRecords, useGetProgressSummary, useGetMuscleGroupProgress } from '@ppl-coach/api-client'
import { useAuth } from './useAuth'

export interface PersonalRecord {
  id: string
  movementName: string
  weightKg: number
  reps: number
  estimatedOneRepMax: number
  achievedAt: string
}

export interface MuscleGroupProgress {
  muscleGroup: string
  totalSets: number
  totalVolume: number
  averageRpe: number
  lastWeekSets: number
  lastWeekVolume: number
}

export interface ProgressSummary {
  personalRecords: PersonalRecord[]
  muscleGroupProgress: MuscleGroupProgress[]
}

export function usePersonalRecords() {
  const { user } = useAuth()

  return useGetPersonalRecords(user?.id!, {
    query: {
      enabled: !!user?.id,
    }
  })
}

export function useProgressSummary() {
  const { user } = useAuth()

  return useGetProgressSummary(user?.id!, {
    query: {
      enabled: !!user?.id,
    }
  })
}

export function useMuscleGroupProgress() {
  const { user } = useAuth()

  const end = new Date()
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
  const params = {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }

  return useGetMuscleGroupProgress(user?.id!, params, {
    query: {
      enabled: !!user?.id,
    }
  })
}
