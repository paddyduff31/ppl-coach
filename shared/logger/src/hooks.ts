import { useEffect, useRef } from 'react';
import { logger, LogLevel } from './logger';

// React hook for component-level logging
export const useLogger = (componentName: string) => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    logger.debug(`Component rendered: ${componentName}`, {
      renderCount: renderCount.current
    });
  });

  return {
    debug: (message: string, data?: any) =>
      logger.debug(`[${componentName}] ${message}`, data),

    info: (message: string, data?: any) =>
      logger.info(`[${componentName}] ${message}`, data),

    warn: (message: string, data?: any) =>
      logger.warn(`[${componentName}] ${message}`, data),

    error: (message: string, data?: any) =>
      logger.error(`[${componentName}] ${message}`, data),

    startTimer: (label: string) =>
      logger.startTimer(`[${componentName}] ${label}`),
  };
};

// Performance monitoring hooks
export const usePerformanceMonitor = () => {
  const timers = useRef<Map<string, number>>(new Map());

  const startMeasurement = (label: string) => {
    timers.current.set(label, performance.now());
    logger.debug(`Performance measurement started: ${label}`);
  };

  const endMeasurement = (label: string) => {
    const startTime = timers.current.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      logger.info(`Performance measurement: ${label}`, {
        duration: `${duration.toFixed(2)}ms`
      });
      timers.current.delete(label);
    }
  };

  return { startMeasurement, endMeasurement };
};

// Error boundary logging
export class ErrorBoundaryLogger {
  static logError(error: Error, errorInfo: any, componentStack?: string) {
    logger.error('React Error Boundary Caught Error', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack,
      errorInfo,
    });
  }
}

// API interceptor for automatic logging
export const createApiLogger = () => {
  return {
    request: (config: any) => {
      const startTime = performance.now();
      config.metadata = { startTime };

      logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });

      return config;
    },

    response: (response: any) => {
      const duration = performance.now() - response.config.metadata.startTime;

      logger.logApiCall(
        response.config.method?.toUpperCase() || 'GET',
        response.config.url,
        response.status,
        duration,
        {
          responseHeaders: response.headers,
          dataSize: JSON.stringify(response.data).length,
        }
      );

      return response;
    },

    error: (error: any) => {
      const config = error.config;
      const duration = config?.metadata?.startTime
        ? performance.now() - config.metadata.startTime
        : 0;

      logger.logApiCall(
        config?.method?.toUpperCase() || 'UNKNOWN',
        config?.url || 'UNKNOWN',
        error.response?.status || 0,
        duration,
        {
          errorMessage: error.message,
          errorCode: error.code,
        }
      );

      return Promise.reject(error);
    },
  };
};
