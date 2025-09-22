// Export the custom axios instance for direct use if needed
export { axiosInstance, customInstance } from './mutator/custom-instance';

// Export all generated API hooks and functions
export * from './generated/pplCoachApi';
export * from './generated/model';

// Export centralized utilities from both web and mobile apps
export * from './utils/pagination';
export * from './utils/query';
export * from './utils/health-check';
export { APIProvider, getQueryClient, useQueryClient } from './providers/api-provider';

// Temporary stub exports for missing hooks (until backend endpoints are created)
// These will be replaced with actual generated hooks once the backend is complete
export const useShuffleMovementsMutation = () => ({ mutate: () => {}, isLoading: false });
export const useGetSession = () => ({ data: null, isLoading: false, error: null });
export const useDeleteSet = () => ({ mutate: () => {}, isLoading: false });
export const useGetProfile = () => ({ data: null, isLoading: false, error: null });
export const useCreateProfile = () => ({ mutate: () => {}, isLoading: false });
export const useGetAllMovements = () => ({ data: [], isLoading: false, error: null });
export const useGetUserSessions = () => ({ data: [], isLoading: false, error: null });
export const useGetProgressSummary = () => ({ data: null, isLoading: false, error: null });
export const useGetMuscleGroupProgress = () => ({ data: null, isLoading: false, error: null });
export const useGetMovementsByEquipment = () => ({ data: [], isLoading: false, error: null });

// Note: Generated API hooks and types will be available after running `npm run api:generate`
// They will be automatically exported from './generated' and './generated/model'
