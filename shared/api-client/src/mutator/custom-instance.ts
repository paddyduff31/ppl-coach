import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Create the main axios instance
export const axiosInstance = axios.create({
  baseURL: process.env.REACT_NATIVE_API_URL || process.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// Request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, etc.)
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe redirect to login
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

// Helper functions for token management with cross-platform support
function getAuthToken(): string | null {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    // Web environment
    return localStorage.getItem('authToken');
  }
  // Mobile environment or server-side - return null for now
  // The mobile app should handle token storage via AsyncStorage separately
  return null;
}

function clearAuthToken(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('authToken');
  }
  // Handle mobile token clearing separately in the mobile app
}

// Custom instance for Orval
export const customInstance = <T = any>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = axiosInstance({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }: AxiosResponse<T>) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
