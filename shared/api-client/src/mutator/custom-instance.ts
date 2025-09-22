import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Environment-aware API configuration
const getAPIConfig = () => {
  // Get API URL with fallback chain
  const baseURL =
    process.env.REACT_NATIVE_API_URL ||
    process.env.VITE_API_URL ||
    process.env.API_URL ||
    'http://localhost:5179'; // Match your backend port

  const timeout = parseInt(process.env.API_TIMEOUT || '30000', 10);
  const retryCount = parseInt(process.env.API_RETRY_COUNT || '3', 10);

  return { baseURL, timeout, retryCount };
};

const { baseURL, timeout, retryCount } = getAPIConfig();

// Create the main axios instance
export const axiosInstance = axios.create({
  baseURL,
  timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Network status tracking
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { isOnline = true; });
  window.addEventListener('offline', () => { isOnline = false; });
}

// Request interceptor for authentication and logging
axiosInstance.interceptors.request.use(
  (config) => {
    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() };

    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add correlation ID for request tracking
    config.headers['X-Correlation-ID'] = generateCorrelationId();

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with retry logic and error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - (response.config.metadata?.startTime || 0);
      console.log(`✅ API Response: ${response.status} ${response.config.url} (${duration}ms)`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & {
      metadata?: { retryCount?: number; startTime?: number };
    };

    // Don't retry if we're offline
    if (!isOnline) {
      return Promise.reject(createEnhancedError(error, 'NETWORK_OFFLINE'));
    }

    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const correlationId = error.response.headers['x-correlation-id'];

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error: ${status} ${config.url}`, {
          correlationId,
          data: error.response.data,
        });
      }

      // Handle authentication errors
      if (status === 401) {
        clearAuthToken();
        // Emit auth error event for app-wide handling
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-error', { detail: error }));
        }
        return Promise.reject(createEnhancedError(error, 'AUTH_REQUIRED'));
      }

      // Handle authorization errors
      if (status === 403) {
        return Promise.reject(createEnhancedError(error, 'FORBIDDEN'));
      }

      // Handle server errors (5xx) with retry
      if (status >= 500) {
        if (shouldRetry(config)) {
          return retryRequest(config);
        }
        return Promise.reject(createEnhancedError(error, 'SERVER_ERROR'));
      }

      // Handle client errors (4xx)
      if (status >= 400 && status < 500) {
        return Promise.reject(createEnhancedError(error, 'CLIENT_ERROR'));
      }
    }

    // Handle network errors with retry
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      if (shouldRetry(config)) {
        return retryRequest(config);
      }
      return Promise.reject(createEnhancedError(error, 'TIMEOUT'));
    }

    // Handle network connection errors with retry
    if (error.code === 'ERR_NETWORK' || !error.response) {
      if (shouldRetry(config)) {
        return retryRequest(config);
      }
      return Promise.reject(createEnhancedError(error, 'NETWORK_ERROR'));
    }

    return Promise.reject(createEnhancedError(error, 'UNKNOWN_ERROR'));
  }
);

// Retry logic
function shouldRetry(config: AxiosRequestConfig & { metadata?: { retryCount?: number } }): boolean {
  const currentRetryCount = config.metadata?.retryCount || 0;
  return currentRetryCount < retryCount && ['GET', 'PUT', 'DELETE'].includes(config.method?.toUpperCase() || '');
}

async function retryRequest(config: AxiosRequestConfig & { metadata?: { retryCount?: number } }): Promise<any> {
  const currentRetryCount = config.metadata?.retryCount || 0;
  const delay = Math.min(1000 * Math.pow(2, currentRetryCount), 5000); // Exponential backoff with max 5s

  // Wait before retrying
  await new Promise(resolve => setTimeout(resolve, delay));

  // Increment retry count
  config.metadata = { ...config.metadata, retryCount: currentRetryCount + 1 };

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Retrying request (attempt ${currentRetryCount + 1}/${retryCount}): ${config.url}`);
  }

  return axiosInstance(config);
}

// Enhanced error creation
function createEnhancedError(originalError: AxiosError, errorType: string) {
  return {
    ...originalError,
    type: errorType,
    isNetworkError: !originalError.response,
    isRetryable: ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR'].includes(errorType),
    timestamp: new Date().toISOString(),
    correlationId: originalError.response?.headers['x-correlation-id'],
  };
}

// Utility functions
function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

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
