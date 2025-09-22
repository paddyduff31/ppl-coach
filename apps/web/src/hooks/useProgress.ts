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

  // Note: This hook might need params - check the generated API client for GetMuscleGroupProgressParams
  return useGetMuscleGroupProgress(user?.id!, {}, {
    query: {
      enabled: !!user?.id,
    }
  })
}
