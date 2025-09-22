import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useEffect } from 'react';

interface AppState {
  // Connection state
  isOnline: boolean;
  isConnecting: boolean;
  lastSyncTime: Date | null;

  // Performance tracking
  performanceMetrics: {
    loadTime: number;
    renderTime: number;
    apiLatency: number;
  };

  // User preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    autoSync: boolean;
  };

  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  setConnecting: (isConnecting: boolean) => void;
  updatePerformanceMetrics: (metrics: Partial<AppState['performanceMetrics']>) => void;
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void;
  updateLastSyncTime: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      isOnline: navigator.onLine,
      isConnecting: false,
      lastSyncTime: null,
      performanceMetrics: {
        loadTime: 0,
        renderTime: 0,
        apiLatency: 0,
      },
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: true,
        autoSync: true,
      },

      setOnlineStatus: (isOnline) => set({ isOnline }),
      setConnecting: (isConnecting) => set({ isConnecting }),
      updatePerformanceMetrics: (metrics) =>
        set((state) => ({
          performanceMetrics: { ...state.performanceMetrics, ...metrics }
        })),
      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences }
        })),
      updateLastSyncTime: () => set({ lastSyncTime: new Date() }),
    }),
    {
      name: 'ppl-coach-app-store',
    }
  )
);

// Network status hook
export const useNetworkStatus = () => {
  const { isOnline, setOnlineStatus } = useAppStore();

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  return isOnline;
};
