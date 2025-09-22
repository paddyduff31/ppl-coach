// Shared types for PPL Coach application
// These types can be used across frontend (web), mobile, and potentially backend

export interface Movement {
  id: string
  name: string
  dayType: DayType
  muscleGroups: string[]
  equipmentTypes: EquipmentType[]
  isCompound: boolean
}

export interface SetLog {
  id: string
  sessionId: string
  movementId: string
  movementName: string
  setIndex: number
  weightKg: number
  reps: number
  rpe?: number // 1-10 scale
  tempo?: string
  notes?: string
}

export interface WorkoutSession {
  id: string
  userId: string
  date: string // ISO date string
  dayType: DayType
  notes?: string
  setLogs: SetLog[]
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  heightCm?: number
  weightKg?: number
  birthDate?: string
  fitnessGoal?: string
  experienceLevel?: ExperienceLevel
}

// Create DTOs (Data Transfer Objects)
export interface CreateSetLogDto {
  sessionId: string
  movementId: string
  setIndex: number
  weightKg: number
  reps: number
  rpe?: number
  tempo?: string
  notes?: string
}

export interface CreateSessionDto {
  userId: string
  date: string
  dayType: DayType
  notes?: string
}

export interface UpdateSessionDto {
  id: string
  notes?: string
}

// Enums
export enum DayType {
  Push = 1,
  Pull = 2,
  Legs = 3
}

export enum EquipmentType {
  Barbell = 1,
  Dumbbell = 2,
  Cable = 3,
  Machine = 4,
  Bodyweight = 5,
  Kettlebell = 6,
  ResistanceBand = 7
}

export enum ExperienceLevel {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

// Progress tracking types
export interface PersonalRecord {
  movementId: string
  movementName: string
  maxWeight: number
  estimatedOneRepMax: number
  achievedAt: string
}

export interface VolumeData {
  weekStart: string
  totalSets: number
  totalVolume: number
  dayType: DayType
}

// Utility types
export type CreateMovementDto = Omit<Movement, 'id'>
export type UpdateMovementDto = Partial<Omit<Movement, 'id'>> & { id: string }
export type UpdateProfileDto = Partial<Omit<UserProfile, 'id' | 'email'>> & { id: string }

// Export commonly used type guards
export const isDayType = (value: number): value is DayType => {
  return Object.values(DayType).includes(value)
}

export const isEquipmentType = (value: number): value is EquipmentType => {
  return Object.values(EquipmentType).includes(value)
}