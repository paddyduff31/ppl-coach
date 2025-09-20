import { http } from './http'
import type {
  Movement,
  WorkoutSession,
  CreateSession,
  CreateSetLog
} from './schemas'

export const api = {
  // Movements
  getMovements: () => http.get<Movement[]>('/api/movements'),
  getMovement: (id: string) => http.get<Movement>(`/api/movements/${id}`),
  getMovementsByEquipment: (equipmentTypes: number[]) =>
    http.get<Movement[]>(`/api/movements/equipment?equipmentTypes=${equipmentTypes.join(',')}`),

  // Sessions
  createSession: (data: CreateSession) => http.post<WorkoutSession>('/api/sessions', data),
  getSession: (id: string) => http.get<WorkoutSession>(`/api/sessions/${id}`),
  getUserSessions: (userId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return http.get<WorkoutSession[]>(`/api/sessions/user/${userId}?${params}`)
  },

  // Set Logging
  logSet: (data: CreateSetLog) => http.post('/api/sessions/sets', data),
  deleteSet: (setId: string) => http.delete(`/api/sessions/sets/${setId}`),

  // User Profiles
  getProfileByEmail: (email: string) => http.get(`/api/profile/email/${email}`),
  getProfile: (id: string) => http.get(`/api/profile/${id}`),
  createProfile: (email: string, displayName: string) => http.post('/api/profile', null, { params: { email, displayName } }),
  updateProfile: (id: string, data: any) => http.put(`/api/profile/${id}`, data),

  // Progress
  getPersonalRecords: (userId: string) => http.get(`/api/progress/user/${userId}/personal-records`),
  getMuscleGroupProgress: (userId: string) => http.get(`/api/progress/user/${userId}/muscle-groups`),
  getProgressSummary: (userId: string) => http.get(`/api/progress/user/${userId}/summary`),

  // Shuffle/Plan Generation
  shuffleMovements: (data: { dayType: number; userId: string; availableEquipment: number[] }) =>
    http.post('/api/shuffle', data),
}