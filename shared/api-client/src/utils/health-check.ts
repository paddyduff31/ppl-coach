import { axiosInstance } from '../mutator/custom-instance';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  responseTime: number;
  version?: string;
  environment?: string;
  services?: {
    database: 'healthy' | 'unhealthy';
    api: 'healthy' | 'unhealthy';
    cache?: 'healthy' | 'unhealthy';
  };
  error?: string;
}

export interface SystemStatus {
  isOnline: boolean;
  apiHealth: HealthCheckResult | null;
  lastChecked: string | null;
  consecutiveFailures: number;
}

class HealthCheckService {
  private systemStatus: SystemStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    apiHealth: null,
    lastChecked: null,
    consecutiveFailures: 0,
  };

  private listeners: Array<(status: SystemStatus) => void> = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly HEALTH_CHECK_INTERVAL = 120000; // 2 minutes
  private readonly MAX_CONSECUTIVE_FAILURES = 3;

  constructor() {
    // Listen for network changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }

    // Start periodic health checks
    this.startPeriodicChecks();
  }

  /**
   * Perform a health check against the API
   */
  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const response = await axiosInstance.get('/health', {
        timeout: 5000,
      });

      const responseTime = Date.now() - startTime;
      const result: HealthCheckResult = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime,
        ...response.data,
      };

      this.updateSystemStatus(true, result);
      return result;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const result: HealthCheckResult = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        error: error.message || 'Health check failed',
      };

      this.updateSystemStatus(false, result);
      return result;
    }
  }

  /**
   * Quick connectivity check (doesn't hit health endpoint)
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      await axiosInstance.head('/', { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current system status
   */
  getSystemStatus(): SystemStatus {
    return { ...this.systemStatus };
  }

  /**
   * Subscribe to system status changes
   */
  subscribe(listener: (status: SystemStatus) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Start periodic health checks
   */
  startPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      if (this.systemStatus.isOnline) {
        this.checkHealth();
      }
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Force an immediate health check
   */
  async forceCheck(): Promise<HealthCheckResult> {
    return this.checkHealth();
  }

  private handleOnline(): void {
    this.systemStatus.isOnline = true;
    this.systemStatus.consecutiveFailures = 0;
    this.notifyListeners();

    // Immediately check health when coming back online
    this.checkHealth();
  }

  private handleOffline(): void {
    this.systemStatus.isOnline = false;
    this.notifyListeners();
  }

  private updateSystemStatus(isHealthy: boolean, healthResult: HealthCheckResult): void {
    this.systemStatus.apiHealth = healthResult;
    this.systemStatus.lastChecked = new Date().toISOString();

    if (isHealthy) {
      this.systemStatus.consecutiveFailures = 0;
    } else {
      this.systemStatus.consecutiveFailures++;
    }

    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getSystemStatus());
      } catch (error) {
        console.error('Error notifying health check listener:', error);
      }
    });
  }
}

// Singleton instance
export const healthCheckService = new HealthCheckService();

// React hook for using health check in components
export function useHealthCheck() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(
    healthCheckService.getSystemStatus()
  );

  useEffect(() => {
    const unsubscribe = healthCheckService.subscribe(setSystemStatus);
    return unsubscribe;
  }, []);

  const forceCheck = useCallback(() => {
    return healthCheckService.forceCheck();
  }, []);

  const checkConnectivity = useCallback(() => {
    return healthCheckService.checkConnectivity();
  }, []);

  return {
    systemStatus,
    forceCheck,
    checkConnectivity,
    isOnline: systemStatus.isOnline,
    isApiHealthy: systemStatus.apiHealth?.status === 'healthy',
    consecutiveFailures: systemStatus.consecutiveFailures,
  };
}

// Utility functions for React imports
import { useState, useEffect, useCallback } from 'react';

// Export health status constants
export const HEALTH_STATUS = {
  HEALTHY: 'healthy' as const,
  UNHEALTHY: 'unhealthy' as const,
  DEGRADED: 'degraded' as const,
} as const;

export type HealthStatus = typeof HEALTH_STATUS[keyof typeof HEALTH_STATUS];