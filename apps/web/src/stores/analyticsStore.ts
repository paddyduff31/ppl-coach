import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface WorkoutMetrics {
  totalWorkouts: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  averageWorkoutDuration: number;
  favoriteExercises: Array<{ name: string; count: number }>;
  muscleGroupFrequency: Record<string, number>;
  weeklyConsistency: number;
  personalRecords: Array<{
    exercise: string;
    weight: number;
    reps: number;
    date: Date;
  }>;
}

interface AnalyticsState {
  metrics: WorkoutMetrics;
  insights: Array<{
    type: 'improvement' | 'consistency' | 'balance' | 'milestone';
    title: string;
    description: string;
    actionable?: string;
    priority: 'high' | 'medium' | 'low';
  }>;

  // Actions
  calculateMetrics: (workouts: any[]) => void;
  generateInsights: () => void;
  addPersonalRecord: (record: WorkoutMetrics['personalRecords'][0]) => void;
}

const initialMetrics: WorkoutMetrics = {
  totalWorkouts: 0,
  totalSets: 0,
  totalReps: 0,
  totalWeight: 0,
  averageWorkoutDuration: 0,
  favoriteExercises: [],
  muscleGroupFrequency: {},
  weeklyConsistency: 0,
  personalRecords: [],
};

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    (set, get) => ({
      metrics: initialMetrics,
      insights: [],

      calculateMetrics: (workouts) => {
        const metrics: WorkoutMetrics = {
          totalWorkouts: workouts.length,
          totalSets: workouts.reduce((sum, w) => sum + w.sets?.length || 0, 0),
          totalReps: workouts.reduce((sum, w) =>
            sum + (w.sets?.reduce((s: number, set: any) => s + set.reps, 0) || 0), 0),
          totalWeight: workouts.reduce((sum, w) =>
            sum + (w.sets?.reduce((s: number, set: any) => s + (set.weight * set.reps), 0) || 0), 0),
          averageWorkoutDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length,
          favoriteExercises: calculateFavoriteExercises(workouts),
          muscleGroupFrequency: calculateMuscleGroupFrequency(workouts),
          weeklyConsistency: calculateWeeklyConsistency(workouts),
          personalRecords: get().metrics.personalRecords,
        };

        set({ metrics });
      },

      generateInsights: () => {
        const { metrics } = get();
        const insights = [];

        // Consistency insights
        if (metrics.weeklyConsistency >= 0.8) {
          insights.push({
            type: 'consistency' as const,
            title: 'Excellent Consistency! 🔥',
            description: `You've maintained ${(metrics.weeklyConsistency * 100).toFixed(0)}% weekly consistency`,
            priority: 'high' as const,
          });
        } else if (metrics.weeklyConsistency < 0.5) {
          insights.push({
            type: 'consistency' as const,
            title: 'Let\'s Improve Consistency',
            description: 'Try scheduling workouts at the same time each day',
            actionable: 'Set up workout reminders in your calendar',
            priority: 'high' as const,
          });
        }

        // Balance insights
        const muscleGroups = Object.keys(metrics.muscleGroupFrequency);
        const imbalanced = muscleGroups.find(group =>
          metrics.muscleGroupFrequency[group] < metrics.totalWorkouts * 0.2
        );

        if (imbalanced) {
          insights.push({
            type: 'balance' as const,
            title: 'Muscle Group Balance',
            description: `Consider adding more ${imbalanced} exercises`,
            actionable: `Browse ${imbalanced} exercises in the movement library`,
            priority: 'medium' as const,
          });
        }

        // Progress insights
        const recentPRs = metrics.personalRecords.filter(pr =>
          new Date(pr.date).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
        );

        if (recentPRs.length > 0) {
          insights.push({
            type: 'milestone' as const,
            title: 'New Personal Records! 💪',
            description: `You set ${recentPRs.length} new PR${recentPRs.length > 1 ? 's' : ''} this week`,
            priority: 'high' as const,
          });
        }

        set({ insights });
      },

      addPersonalRecord: (record) => set((state) => ({
        metrics: {
          ...state.metrics,
          personalRecords: [...state.metrics.personalRecords, record],
        },
      })),
    }),
    { name: 'analytics-store' }
  )
);

function calculateFavoriteExercises(workouts: any[]): WorkoutMetrics['favoriteExercises'] {
  const exerciseCount: Record<string, number> = {};

  workouts.forEach(workout => {
    workout.exercises?.forEach((exercise: any) => {
      exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1;
    });
  });

  return Object.entries(exerciseCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function calculateMuscleGroupFrequency(workouts: any[]): Record<string, number> {
  const frequency: Record<string, number> = {};

  workouts.forEach(workout => {
    workout.exercises?.forEach((exercise: any) => {
      const muscleGroup = exercise.primaryMuscleGroup;
      if (muscleGroup) {
        frequency[muscleGroup] = (frequency[muscleGroup] || 0) + 1;
      }
    });
  });

  return frequency;
}

function calculateWeeklyConsistency(workouts: any[]): number {
  if (workouts.length === 0) return 0;

  const weeks = Math.ceil(workouts.length / 7);
  const expectedWorkouts = weeks * 3; // Assuming 3 workouts per week target

  return Math.min(workouts.length / expectedWorkouts, 1);
}
