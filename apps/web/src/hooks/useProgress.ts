import { useQuery } from '@tanstack/react-query'
import { http } from '../api/http'
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

  return useQuery({
    queryKey: ['progress', 'personal-records', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not found')
      const response = await http.get(`/api/progress/user/${user.id}/personal-records`)
      return response.data as PersonalRecord[]
    },
    enabled: !!user?.id,
  })
}

export function useProgressSummary() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['progress', 'summary', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not found')
      const response = await http.get(`/api/progress/user/${user.id}/summary`)
      return response.data as ProgressSummary
    },
    enabled: !!user?.id,
  })
}

export function useMuscleGroupProgress() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['progress', 'muscle-groups', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not found')
      const response = await http.get(`/api/progress/user/${user.id}/muscle-groups`)
      return response.data as MuscleGroupProgress[]
    },
    enabled: !!user?.id,
  })
}