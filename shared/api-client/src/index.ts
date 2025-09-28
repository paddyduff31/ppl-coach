// Re-export providers and custom instance
export { APIProvider, getQueryClient, useQueryClient } from './providers/api-provider';
export { customInstance } from './mutator/custom-instance';

// Re-export all generated hooks with proper names
export {
  useGetUserSessions,
  useGetAllMovements,
  useGetMovement,
  useGetMovementsByEquipment,
  useShuffleMovements as useShuffleMovementsMutation,
  useCreateSession,
  useGetSessionById as useGetSession,
  useUpdateSession,
  useLogSet,
  useGetUserSessionStats,
  useGetPersonalRecords,
  useGetMuscleGroupProgress,
  useGetProgressSummary,
  useGetProfile,
  useCreateProfile
} from './generated/pplCoachApi';

// Re-export all generated types
export * from './generated/model';

// Temporary stubs for hooks not yet implemented in the backend
export const useDeleteSet = () => ({
  mutate: () => console.log('Mock delete set'),
  isLoading: false
});