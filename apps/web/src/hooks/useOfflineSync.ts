import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../stores/appStore';
import { useWorkoutStore } from '../stores/workoutStore';

interface SyncItem {
  id: string;
  type: 'workout' | 'set' | 'exercise' | 'progress';
  data: any;
  timestamp: Date;
  retryCount: number;
}

export function useOfflineSync() {
  const queryClient = useQueryClient();
  const { isOnline, updateLastSyncTime } = useAppStore();
  const { currentWorkout } = useWorkoutStore();

  // Store offline actions for later sync
  const addToSyncQueue = useCallback((item: Omit<SyncItem, 'retryCount'>) => {
    const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    syncQueue.push({ ...item, retryCount: 0 });
    localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
  }, []);

  // Process sync queue when back online
  const processSyncQueue = useCallback(async () => {
    const syncQueue: SyncItem[] = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    if (syncQueue.length === 0) return;

    const failedItems: SyncItem[] = [];

    for (const item of syncQueue) {
      try {
        switch (item.type) {
          case 'workout':
            await fetch('/api/workouts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data),
            });
            break;
          case 'set':
            await fetch(`/api/workouts/${item.data.workoutId}/sets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data),
            });
            break;
          case 'progress':
            await fetch('/api/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data),
            });
            break;
        }
      } catch (error) {
        console.error('Sync failed for item:', item.id, error);
        if (item.retryCount < 3) {
          failedItems.push({ ...item, retryCount: item.retryCount + 1 });
        }
      }
    }

    // Update sync queue with failed items
    localStorage.setItem('syncQueue', JSON.stringify(failedItems));

    // Invalidate queries to refresh data
    queryClient.invalidateQueries();
    updateLastSyncTime();
  }, [queryClient, updateLastSyncTime]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      processSyncQueue();
    }
  }, [isOnline, processSyncQueue]);

  // Persist workout data locally during offline sessions
  const saveWorkoutLocally = useCallback((workoutData: any) => {
    if (!isOnline) {
      const localWorkouts = JSON.parse(localStorage.getItem('localWorkouts') || '[]');
      localWorkouts.push({
        ...workoutData,
        id: `local_${Date.now()}`,
        isLocal: true,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('localWorkouts', JSON.stringify(localWorkouts));

      addToSyncQueue({
        id: `workout_${Date.now()}`,
        type: 'workout',
        data: workoutData,
        timestamp: new Date(),
      });
    }
  }, [isOnline, addToSyncQueue]);

  return {
    addToSyncQueue,
    processSyncQueue,
    saveWorkoutLocally,
    isOnline,
  };
}
