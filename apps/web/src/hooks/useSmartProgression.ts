import { useState, useMemo } from 'react'

interface SetLog {
  id: string
  movementId: string
  weightKg: number
  reps: number
  rpe?: number
  tempo?: string
  notes?: string
  date: string
}

interface SmartSuggestion {
  weightKg: number
  reps: number
  rpe?: number
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

interface WorkoutHistory {
  [movementId: string]: SetLog[]
}

export function useSmartProgression(
  movementId: string,
  currentSets: SetLog[],
  workoutHistory: WorkoutHistory
) {
  const [lastUsedValues, setLastUsedValues] = useState<{
    weightKg: string
    reps: string
    rpe: string
  }>({ weightKg: '', reps: '', rpe: '' })

  // Get historical data for this movement
  const movementHistory = useMemo(() => {
    return workoutHistory[movementId] || []
  }, [workoutHistory, movementId])

  // Get the last workout data for this movement
  const lastWorkoutSets = useMemo(() => {
    const sortedHistory = [...movementHistory].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const lastWorkoutDate = sortedHistory[0]?.date
    if (!lastWorkoutDate) return []

    return sortedHistory.filter(set => set.date === lastWorkoutDate)
  }, [movementHistory])

  // Smart suggestion for next set
  const suggestion = useMemo((): SmartSuggestion | null => {
    const currentSetNumber = currentSets.length + 1

    // If this is the first set of the session
    if (currentSets.length === 0) {
      // Use last workout's first set as baseline
      const lastFirstSet = lastWorkoutSets[0]
      if (lastFirstSet) {
        // Progressive overload logic
        if (lastFirstSet.rpe && lastFirstSet.rpe <= 7) {
          // Easy set - increase weight by 2.5kg
          return {
            weightKg: lastFirstSet.weightKg + 2.5,
            reps: lastFirstSet.reps,
            rpe: lastFirstSet.rpe,
            confidence: 'high',
            reason: `Last set felt easy (RPE ${lastFirstSet.rpe}), increasing weight`
          }
        } else if (lastFirstSet.rpe && lastFirstSet.rpe >= 9) {
          // Hard set - keep weight, try for more reps
          return {
            weightKg: lastFirstSet.weightKg,
            reps: lastFirstSet.reps + 1,
            confidence: 'medium',
            reason: `Last set was challenging (RPE ${lastFirstSet.rpe}), trying more reps`
          }
        } else {
          // Moderate difficulty - slight progression
          return {
            weightKg: lastFirstSet.weightKg + 1.25,
            reps: lastFirstSet.reps,
            confidence: 'medium',
            reason: 'Gradual progression from last workout'
          }
        }
      }
    } else {
      // For subsequent sets, use the previous set as baseline
      const previousSet = currentSets[currentSets.length - 1]
      if (previousSet) {
        // Typical set progression (same weight, might reduce reps)
        const expectedReps = Math.max(previousSet.reps - 1, Math.ceil(previousSet.reps * 0.8))
        return {
          weightKg: previousSet.weightKg,
          reps: expectedReps,
          rpe: previousSet.rpe ? Math.min(previousSet.rpe + 0.5, 10) : undefined,
          confidence: 'high',
          reason: `Continuing with same weight, adjusted reps for set ${currentSetNumber}`
        }
      }
    }

    return null
  }, [currentSets, lastWorkoutSets])

  // Auto-fill values based on suggestion or last used
  const getSmartDefaults = () => {
    if (suggestion) {
      return {
        weightKg: suggestion.weightKg.toString(),
        reps: suggestion.reps.toString(),
        rpe: suggestion.rpe?.toString() || lastUsedValues.rpe || '8'
      }
    }

    // Fallback to last used values
    return lastUsedValues
  }

  // Update last used values when a set is logged
  const updateLastUsed = (weightKg: string, reps: string, rpe: string) => {
    setLastUsedValues({ weightKg, reps, rpe })
  }

  // Quick adjustment suggestions
  const getQuickAdjustments = (currentWeight: number, currentReps: number) => {
    return {
      increaseWeight: {
        weightKg: currentWeight + 2.5,
        reps: currentReps,
        label: '+2.5kg'
      },
      decreaseWeight: {
        weightKg: Math.max(currentWeight - 2.5, 0),
        reps: currentReps,
        label: '-2.5kg'
      },
      increaseReps: {
        weightKg: currentWeight,
        reps: currentReps + 1,
        label: '+1 rep'
      },
      decreaseReps: {
        weightKg: currentWeight,
        reps: Math.max(currentReps - 1, 1),
        label: '-1 rep'
      }
    }
  }

  // Predict if user should increase weight next workout
  const getProgressionAdvice = () => {
    if (currentSets.length < 3) return null

    const avgRpe = currentSets
      .filter(set => set.rpe)
      .reduce((sum, set) => sum + (set.rpe || 0), 0) /
      currentSets.filter(set => set.rpe).length

    if (avgRpe <= 7) {
      return {
        type: 'increase_weight' as const,
        message: 'Sets felt easy today. Consider increasing weight next time!',
        suggestion: `Try ${currentSets[0].weightKg + 2.5}kg next workout`
      }
    } else if (avgRpe >= 9) {
      return {
        type: 'maintain' as const,
        message: 'Great intensity! Focus on form and consistency.',
        suggestion: 'Maintain current weight and aim for more reps'
      }
    }

    return {
      type: 'gradual' as const,
      message: 'Solid workout! Small progression recommended.',
      suggestion: `Try ${currentSets[0].weightKg + 1.25}kg or +1 rep next time`
    }
  }

  return {
    suggestion,
    getSmartDefaults,
    updateLastUsed,
    getQuickAdjustments,
    getProgressionAdvice,
    lastWorkoutSets
  }
}
