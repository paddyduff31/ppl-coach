// Export the custom axios instance for direct use if needed
export { axiosInstance } from './mutator/custom-instance';

// Export all generated API hooks and functions
export * from './generated/pplCoachApi';
export * from './generated/model';

// Export centralized utilities from both web and mobile apps
export * from './utils/pagination';
export * from './utils/query';
export * from './utils/health-check';
export { APIProvider, getQueryClient, useQueryClient } from './providers/api-provider';

// React Query provider setup utility (legacy export for compatibility)
import { createOptimizedQueryClient } from './utils/query';
export const createQueryClient = createOptimizedQueryClient;

// Utility function to configure the API base URL
export const configureApiClient = (baseURL: string, authToken?: string) => {
  const { axiosInstance } = require('./mutator/custom-instance');
  axiosInstance.defaults.baseURL = baseURL;

  if (authToken) {
    axiosInstance.defaults.headers.Authorization = `Bearer ${authToken}`;
  }
};

// Utility function to set auth token
export const setAuthToken = (token: string) => {
  const { axiosInstance } = require('./mutator/custom-instance');
  axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
};

// Utility function to clear auth token
export const clearAuthToken = () => {
  const { axiosInstance } = require('./mutator/custom-instance');
  delete axiosInstance.defaults.headers.Authorization;
};

// Note: Generated API hooks and types will be available after running `npm run api:generate`
// They will be automatically exported from './generated' and './generated/model'
