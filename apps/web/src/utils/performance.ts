// Performance monitoring utilities
export const performanceMonitor = {
  measurePageLoad: (pageName: string) => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          console.log(`${pageName} - Load Time:`, nav.loadEventEnd - nav.loadEventStart);
          console.log(`${pageName} - DOM Interactive:`, nav.domInteractive - nav.navigationStart);
        }
      }
    });
    observer.observe({ entryTypes: ['navigation'] });
  },

  measureLCP: () => {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  },

  measureCLS: () => {
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

// Bundle size analyzer for development
export const bundleAnalyzer = {
  logChunkSizes: () => {
    if (import.meta.env.DEV) {
      const chunks = performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('.js'))
        .map(entry => ({
          name: entry.name.split('/').pop(),
          size: entry.transferSize,
          loadTime: entry.duration
        }))
        .sort((a, b) => b.size - a.size);

      console.table(chunks);
    }
  }
};
