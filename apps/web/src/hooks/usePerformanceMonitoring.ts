import { useEffect, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

export function usePerformanceMonitoring() {
  const { updatePerformanceMetrics, performanceMetrics } = useAppStore();

  const measurePageLoad = useCallback(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          updatePerformanceMetrics({
            loadTime: nav.loadEventEnd - nav.loadEventStart,
          });
        }

        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }

        if (entry.entryType === 'first-input') {
          const fid = entry as PerformanceEventTiming;
          console.log('FID:', fid.processingStart - fid.startTime);
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input'] });

    return () => observer.disconnect();
  }, [updatePerformanceMetrics]);

  const measureApiLatency = useCallback((requestStart: number) => {
    const latency = performance.now() - requestStart;
    updatePerformanceMetrics({
      apiLatency: latency,
    });
    return latency;
  }, [updatePerformanceMetrics]);

  const measureRenderTime = useCallback(() => {
    const startTime = performance.now();
    return () => {
      const renderTime = performance.now() - startTime;
      updatePerformanceMetrics({
        renderTime: Math.max(performanceMetrics.renderTime, renderTime),
      });
    };
  }, [updatePerformanceMetrics, performanceMetrics.renderTime]);

  useEffect(() => {
    const cleanup = measurePageLoad();
    return cleanup;
  }, [measurePageLoad]);

  return {
    measureApiLatency,
    measureRenderTime,
    performanceMetrics,
  };
}

// Custom hook for monitoring component render performance
export function useRenderPerformance(componentName: string) {
  const { measureRenderTime } = usePerformanceMonitoring();

  useEffect(() => {
    const endMeasurement = measureRenderTime();

    return () => {
      endMeasurement();
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render complete`);
      }
    };
  });
}
