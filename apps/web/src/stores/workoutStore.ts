import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface WorkoutState {
  // Active workout session
  currentWorkout: {
    id: string | null;
    name: string;
    startTime: Date | null;
    exercises: Array<{
      id: string;
      name: string;
      sets: Array<{
        reps: number;
        weight: number;
        completed: boolean;
        restStartTime?: Date;
      }>;
      completed: boolean;
    }>;
    totalRestTime: number;
    isActive: boolean;
  };

  // Timer states
  restTimer: {
    isActive: boolean;
    startTime: Date | null;
    duration: number; // in seconds
    exerciseId: string | null;
  };

  workoutTimer: {
    isActive: boolean;
    startTime: Date | null;
    pausedTime: number; // accumulated paused time
  };

  // UI states
  ui: {
    currentExerciseIndex: number;
    currentSetIndex: number;
    showRestTimer: boolean;
    showCompletedExercises: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };

  // Actions
  startWorkout: (workoutId: string, name: string, exercises: any[]) => void;
  completeSet: (exerciseId: string, setIndex: number, reps: number, weight: number) => void;
  startRestTimer: (duration: number, exerciseId: string) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  skipRest: () => void;
  completeExercise: (exerciseId: string) => void;
  finishWorkout: () => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  updateUI: (ui: Partial<WorkoutState['ui']>) => void;
  resetWorkout: () => void;
}

const initialState = {
  currentWorkout: {
    id: null,
    name: '',
    startTime: null,
    exercises: [],
    totalRestTime: 0,
    isActive: false,
  },
  restTimer: {
    isActive: false,
    startTime: null,
    duration: 0,
    exerciseId: null,
  },
  workoutTimer: {
    isActive: false,
    startTime: null,
    pausedTime: 0,
  },
  ui: {
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    showRestTimer: false,
    showCompletedExercises: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
};

export const useWorkoutStore = create<WorkoutState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        startWorkout: (workoutId, name, exercises) => set({
          currentWorkout: {
            id: workoutId,
            name,
            startTime: new Date(),
            exercises: exercises.map(ex => ({
              ...ex,
              sets: ex.sets.map((set: any) => ({ ...set, completed: false })),
              completed: false,
            })),
            totalRestTime: 0,
            isActive: true,
          },
          workoutTimer: {
            isActive: true,
            startTime: new Date(),
            pausedTime: 0,
          },
          ui: {
            ...get().ui,
            currentExerciseIndex: 0,
            currentSetIndex: 0,
          },
        }),

        completeSet: (exerciseId, setIndex, reps, weight) => set((state) => {
          const exercises = state.currentWorkout.exercises.map(ex =>
            ex.id === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((set, idx) =>
                    idx === setIndex
                      ? { ...set, reps, weight, completed: true }
                      : set
                  )
                }
              : ex
          );

          return {
            currentWorkout: {
              ...state.currentWorkout,
              exercises,
            }
          };
        }),

        startRestTimer: (duration, exerciseId) => set({
          restTimer: {
            isActive: true,
            startTime: new Date(),
            duration,
            exerciseId,
          },
          ui: {
            ...get().ui,
            showRestTimer: true,
          },
        }),

        pauseRestTimer: () => set((state) => ({
          restTimer: { ...state.restTimer, isActive: false },
        })),

        resumeRestTimer: () => set((state) => ({
          restTimer: { ...state.restTimer, isActive: true },
        })),

        skipRest: () => set({
          restTimer: initialState.restTimer,
          ui: { ...get().ui, showRestTimer: false },
        }),

        completeExercise: (exerciseId) => set((state) => ({
          currentWorkout: {
            ...state.currentWorkout,
            exercises: state.currentWorkout.exercises.map(ex =>
              ex.id === exerciseId ? { ...ex, completed: true } : ex
            ),
          },
        })),

        finishWorkout: () => set(initialState),

        pauseWorkout: () => set((state) => ({
          workoutTimer: { ...state.workoutTimer, isActive: false },
          currentWorkout: { ...state.currentWorkout, isActive: false },
        })),

        resumeWorkout: () => set((state) => ({
          workoutTimer: { ...state.workoutTimer, isActive: true },
          currentWorkout: { ...state.currentWorkout, isActive: true },
        })),

        updateUI: (ui) => set((state) => ({
          ui: { ...state.ui, ...ui },
        })),

        resetWorkout: () => set(initialState),
      }),
      {
        name: 'ppl-coach-workout-store',
        partialize: (state) => ({
          currentWorkout: state.currentWorkout,
          ui: state.ui,
        }),
      }
    ),
    { name: 'workout-store' }
  )
);
