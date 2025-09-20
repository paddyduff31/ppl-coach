import { z } from 'zod'

// Updated to match backend DTOs
export const MovementSchema = z.object({
  id: z.string(),
  name: z.string(),
  dayType: z.number(), // 1=Push, 2=Pull, 3=Legs
  muscleGroups: z.array(z.string()),
  equipmentTypes: z.array(z.number()),
  isCompound: z.boolean(),
})

export const SetLogSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  movementId: z.string(),
  movementName: z.string(),
  setIndex: z.number(),
  weightKg: z.number(),
  reps: z.number(),
  rpe: z.number().min(1).max(10).optional(),
  tempo: z.string().optional(),
  notes: z.string().optional(),
})

export const CreateSetLogSchema = z.object({
  sessionId: z.string(),
  movementId: z.string(),
  setIndex: z.number(),
  weightKg: z.number(),
  reps: z.number(),
  rpe: z.number().min(1).max(10).optional(),
  tempo: z.string().optional(),
  notes: z.string().optional(),
})

export const WorkoutSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(), // DateOnly as string
  dayType: z.number(), // 1=Push, 2=Pull, 3=Legs
  notes: z.string().optional(),
  setLogs: z.array(SetLogSchema),
})

export const CreateSessionSchema = z.object({
  userId: z.string(),
  date: z.string(), // DateOnly as string
  dayType: z.number(), // 1=Push, 2=Pull, 3=Legs
  notes: z.string().optional(),
})

export const BodyMetricsSchema = z.object({
  id: z.string(),
  date: z.string(),
  weight: z.number(),
  bodyFat: z.number().optional(),
  measurements: z.record(z.string(), z.number()).optional(),
})

export const EquipmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  available: z.boolean(),
})

export const UserPreferencesSchema = z.object({
  units: z.enum(['kg', 'lb']),
  apiUrl: z.string(),
  theme: z.enum(['light', 'dark', 'system']),
})

// Interval Timer Session (e.g., Norwegian 4x4 cardio protocol)
export const IntervalSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  workInterval: z.number(), // seconds
  restInterval: z.number(), // seconds
  rounds: z.number(),
  createdAt: z.string(),
})

export const CreateIntervalSessionSchema = z.object({
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  workInterval: z.number(),
  restInterval: z.number(),
  rounds: z.number(),
})

// Workout Template for PPL programs
export const WorkoutTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  dayType: z.number(), // 1=Push, 2=Pull, 3=Legs
  movements: z.array(z.object({
    movementId: z.string(),
    sets: z.number(),
    reps: z.string(), // e.g., "8-12" or "4"
    rpe: z.number().optional(),
  })),
})

export type Movement = z.infer<typeof MovementSchema>
export type SetLog = z.infer<typeof SetLogSchema>
export type CreateSetLog = z.infer<typeof CreateSetLogSchema>
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>
export type CreateSession = z.infer<typeof CreateSessionSchema>
export type BodyMetrics = z.infer<typeof BodyMetricsSchema>
export type Equipment = z.infer<typeof EquipmentSchema>
export type UserPreferences = z.infer<typeof UserPreferencesSchema>
export type IntervalSession = z.infer<typeof IntervalSessionSchema>
export type CreateIntervalSession = z.infer<typeof CreateIntervalSessionSchema>
export type WorkoutTemplate = z.infer<typeof WorkoutTemplateSchema>