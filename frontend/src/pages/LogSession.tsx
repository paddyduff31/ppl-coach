import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Check,
  Trash,
  Clock,
  Target,
  Barbell,
  Pulse,
  Plus,
  TrendUp,
  X,
  MagnifyingGlass,
  Shuffle
} from '@phosphor-icons/react'
import { useSession, useLogSet, useDeleteSet } from '../hooks/useSession'
import { useMovements, useShuffleMovements } from '../hooks/useMovements'
import { useUser } from '../hooks/useUser'
import { useUserSessions } from '../hooks/useSessions'
import { Timer, SessionTimer } from '../components/common/Timer'
import { SmartSetInput } from '../components/SmartSetInput'
import { LoadingState } from '../components/ui/loading'
import { SuccessFeedback, useSuccessFeedback } from '../components/SuccessFeedback'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import type { CreateSetLog, Movement } from '../api/schemas'
import { cn } from '../utils/utils'

interface SetInput {
  movementId: string
  weightKg: string
  reps: string
}

interface ExerciseNotes {
  [movementId: string]: string
}

const DAY_TYPE_NAMES = {
  1: 'Push',
  2: 'Pull',
  3: 'Legs'
} as const

const DAY_TYPE_COLORS = {
  1: 'from-blue-500/20 to-blue-600/20',
  2: 'from-green-500/20 to-green-600/20',
  3: 'from-purple-500/20 to-purple-600/20'
} as const

export default function LogSession() {
  const { id } = useParams({ from: '/log/$id' })
  const navigate = useNavigate()

  const { data: session, isLoading: sessionLoading, error: sessionError } = useSession(id)
  const { data: movementsResponse } = useMovements()
  const movements = movementsResponse?.data || []
  const { user } = useUser()
  const shuffleMovementsMutation = useShuffleMovements()
  const logSetMutation = useLogSet()
  const deleteSetMutation = useDeleteSet()
  const { data: allSessions = [] } = useUserSessions()
  const { feedback, showSuccess, hideSuccess } = useSuccessFeedback()

  // All useState hooks must be called consistently
  const [sessionActive, setSessionActive] = useState(true)
  const [setInputs, setSetInputs] = useState<Record<string, SetInput>>({})
  const [exerciseNotes, setExerciseNotes] = useState<ExerciseNotes>({})
  const [showExerciseSearch, setShowExerciseSearch] = useState(false)
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('')
  const [recommendedMovements, setRecommendedMovements] = useState<Movement[]>([])
  const [hasLoadedRecommendations, setHasLoadedRecommendations] = useState(false)

  // Keyboard shortcuts for this page
  useKeyboardShortcuts([
    {
      key: 'a',
      metaKey: true,
      action: () => setShowExerciseSearch(true),
      description: 'Add exercise'
    },
    {
      key: 'Escape',
      action: () => {
        setShowExerciseSearch(false)
      },
      description: 'Close modals'
    }
  ])

  // All useMemo hooks must be called consistently
  const setsByMovement = useMemo(() => {
    if (!session?.data) return {}

    return session.data.setLogs.reduce((acc: any, setLog: any) => {
      if (!acc[setLog.movementId]) {
        acc[setLog.movementId] = []
      }
      acc[setLog.movementId].push(setLog)
      return acc
    }, {} as Record<string, any[]>)
  }, [session])

  const movementsInSession = useMemo(() => {
    if (!session?.data) return []

    const sessionHasSets = session.data.setLogs.length > 0

    if (sessionHasSets) {
      // Show movements from actual sets AND movements that have been added to session
      const movementsWithSets = Object.keys(setsByMovement)
        .map(id => movements?.find((m: any) => m.id === id))
        .filter(Boolean) as Movement[]
      
      // Also include movements that have input forms but no sets yet
      const movementsWithInputs = Object.keys(setInputs)
        .map(id => movements?.find((m: any) => m.id === id))
        .filter(Boolean) as Movement[]
      
      // Combine and deduplicate
      const allMovements = [...movementsWithSets, ...movementsWithInputs]
      const uniqueMovements = allMovements.filter((movement, index, self) => 
        index === self.findIndex(m => m.id === movement.id)
      )
      
      return uniqueMovements
    } else {
      // Show recommended movements for empty sessions
      return recommendedMovements
    }
  }, [setsByMovement, movements, recommendedMovements, session?.data?.setLogs, setInputs])

  const totalVolume = useMemo(() => {
    if (!session?.data) return 0
    return session.data.setLogs.reduce((total: number, set: any) => total + (set.weightKg * set.reps), 0)
  }, [session])

  const averageRpe = useMemo(() => {
    if (!session?.data) return 0
    const setsWithRpe = session.data.setLogs.filter((set: any) => set.rpe)
    if (setsWithRpe.length === 0) return 0
    return setsWithRpe.reduce((sum: number, set: any) => sum + set.rpe, 0) / setsWithRpe.length
  }, [session])

  // Build workout history for smart progression
  const workoutHistory = useMemo(() => {
    const history: Record<string, any[]> = {}
    allSessions.forEach(session => {
      session.setLogs?.forEach((set: any) => {
        if (!history[set.movementId]) {
          history[set.movementId] = []
        }
        history[set.movementId].push({
          ...set,
          date: session.date
        })
      })
    })
    return history
  }, [allSessions])

  // Load recommended movements when session is empty
  useEffect(() => {
    if (!user?.id || !session?.data || hasLoadedRecommendations) return

    const sessionHasSets = session.data.setLogs.length > 0
    if (sessionHasSets) return // Session already has exercises

    const loadRecommendations = async () => {
      try {
        const result = await shuffleMovementsMutation.mutateAsync({
          dayType: session.data.dayType,
          userId: user.id,
          availableEquipment: [1, 2, 3, 4, 5] // Standard gym equipment
        })

        setRecommendedMovements(result.data || [])
        setHasLoadedRecommendations(true)

        // Pre-populate setInputs for recommended movements
        const prePopulatedInputs: Record<string, SetInput> = {}
        result.data?.forEach((movement: any) => {
          prePopulatedInputs[movement.id] = {
            movementId: movement.id,
            weightKg: '',
            reps: '',
          }
        })
        setSetInputs(prePopulatedInputs)
      } catch (error) {
        console.error('Failed to load recommended movements:', error)
      }
    }

    loadRecommendations()
  }, [user?.id, session?.data, hasLoadedRecommendations])

  // Early returns for loading and error states
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-6xl mx-auto pt-12 pb-8 px-6">
          <LoadingState message="Loading your workout session..." />
        </div>
      </div>
    )
  }

  if (sessionError || !session?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-4xl mx-auto pt-12 pb-8 px-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
          <p className="text-muted-foreground mb-6">This workout session could not be loaded.</p>
          <Button onClick={() => navigate({ to: '/' })}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const updateSetInput = (movementId: string, field: keyof SetInput, value: string) => {
    setSetInputs(prev => ({
      ...prev,
      [movementId]: {
        ...prev[movementId],
        movementId,
        [field]: value
      }
    }))
  }

  const logSet = async (movementId: string) => {
    const input = setInputs[movementId]
    if (!input || !input.weightKg || !input.reps) return

    const existingSets = setsByMovement[movementId] || []
    const setIndex = existingSets.length + 1

    const setData: CreateSetLog = {
      sessionId: id,
      movementId,
      setIndex,
      weightKg: parseFloat(input.weightKg),
      reps: parseInt(input.reps),
      notes: exerciseNotes[movementId] || undefined
    }

    try {
      await logSetMutation.mutateAsync(setData)

      // Check for PR (Personal Record)
      const isPersonalRecord = checkForPersonalRecord(movementId, setData.weightKg, setData.reps)

      if (isPersonalRecord) {
        showSuccess('pr_achieved', 'New Personal Record!',
          `${setData.weightKg}kg × ${setData.reps} reps`)
      } else {
        showSuccess('set_logged', undefined,
          `${setData.weightKg}kg × ${setData.reps} reps`)
      }

      // Clear reps but keep weight for next set
      setSetInputs(prev => ({
        ...prev,
        [movementId]: {
          movementId,
          weightKg: input.weightKg, // Keep weight for next set
          reps: '', // Clear reps for next set
        }
      }))
    } catch (error) {
      console.error('Failed to log set:', error)
    }
  }

  const checkForPersonalRecord = (movementId: string, weightKg: number, reps: number) => {
    // Get all historical sets for this movement (excluding current session)
    const historicalSets = allSessions
      .filter(s => s.id !== id) // Exclude current session
      .flatMap(session => session.setLogs || [])
      .filter(set => set.movementId === movementId)

    // Also get sets from current session that were already logged
    const currentSessionSets = (session?.data?.setLogs || [])
      .filter(set => set.movementId === movementId)

    const allPreviousSets = [...historicalSets, ...currentSessionSets]

    // If this is truly the first time doing this exercise ever, it's a PR
    if (allPreviousSets.length === 0) return true

    // Calculate estimated 1RM using Epley formula: weight * (1 + reps/30)
    const currentE1RM = weightKg * (1 + reps / 30)
    const previousBestE1RM = Math.max(
      ...allPreviousSets.map(set => set.weightKg * (1 + set.reps / 30))
    )

    // Only consider it a PR if it's significantly better (more than 0.1kg equivalent)
    return currentE1RM > previousBestE1RM + 0.1
  }

  const deleteSet = async (setId: string) => {
    try {
      await deleteSetMutation.mutateAsync(setId)
    } catch (error) {
      console.error('Failed to delete set:', error)
    }
  }

  const addExerciseToSession = (movement: Movement) => {
    setSetInputs(prev => ({
      ...prev,
      [movement.id]: {
        movementId: movement.id,
        weightKg: '',
        reps: ''
      }
    }))
    setShowExerciseSearch(false)
    setExerciseSearchQuery('')
  }

  const reshuffleExercises = async () => {
    if (!user?.id || !session?.data) return

    try {
      const result = await shuffleMovementsMutation.mutateAsync({
        dayType: session.data.dayType,
        userId: user.id,
        availableEquipment: [1, 2, 3, 4, 5] // Standard gym equipment
      })

      setRecommendedMovements(result.data || [])

      // Pre-populate setInputs for new recommended movements
      const prePopulatedInputs: Record<string, SetInput> = {}
      result.data?.forEach((movement: any) => {
        prePopulatedInputs[movement.id] = {
          movementId: movement.id,
          weightKg: '',
          reps: ''
        }
      })
      setSetInputs(prePopulatedInputs)
    } catch (error) {
      console.error('Failed to reshuffle exercises:', error)
    }
  }

  const filteredMovements = movements.filter((movement: Movement) =>
    movement.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
    movement.muscleGroups?.some(mg => mg.toLowerCase().includes(exerciseSearchQuery.toLowerCase()))
  )

  const dayType = session.data.dayType as keyof typeof DAY_TYPE_NAMES

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="pt-8 pb-8 px-8 border-b border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    `bg-gradient-to-r ${DAY_TYPE_COLORS[dayType].replace('/20', '')}`
                  )} />
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {DAY_TYPE_NAMES[dayType]} Day Session
                  </span>
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">
                  Active Workout
                </h1>
                <p className="text-lg text-gray-600">
                  {new Date(session.data.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <SessionTimer isActive={sessionActive} onToggle={() => setSessionActive(!sessionActive)} />
                <Button
                  onClick={reshuffleExercises}
                  disabled={shuffleMovementsMutation.isPending}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2 font-medium transition-all duration-200"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  {shuffleMovementsMutation.isPending ? 'Shuffling...' : 'Reshuffle'}
                </Button>
                <Button
                  onClick={() => navigate({ to: '/' })}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-4 py-2 font-medium transition-all duration-200"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Complete Session
                </Button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200/50">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">{movementsInSession.length}</div>
                <div className="text-sm text-gray-500">Exercises</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200/50">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Barbell className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">{session.data.setLogs.length}</div>
                <div className="text-sm text-gray-500">Sets Logged</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200/50">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">{Math.round(totalVolume).toLocaleString()}</div>
                <div className="text-sm text-gray-500">Volume (kg)</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200/50">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Pulse className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">{averageRpe ? averageRpe.toFixed(1) : 'N/A'}</div>
                <div className="text-sm text-gray-500">Avg RPE</div>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main workout area */}
              <div className="lg:col-span-3 space-y-6">

                {/* Add Exercise Section */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Exercises</h2>
                    <Button
                      onClick={() => setShowExerciseSearch(!showExerciseSearch)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2 font-medium transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>

                  {/* Exercise Search */}
                  {showExerciseSearch && (
                    <div className="mb-6 p-6 border border-gray-200 rounded-2xl bg-gray-50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative flex-1">
                          <MagnifyingGlass className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <Input
                            placeholder="Search exercises..."
                            value={exerciseSearchQuery}
                            onChange={(e) => setExerciseSearchQuery(e.target.value)}
                            className="pl-10 bg-white border-gray-200 rounded-xl h-12 text-base"
                          />
                        </div>
                        <Button
                          onClick={() => setShowExerciseSearch(false)}
                          className="bg-white hover:bg-gray-100 text-gray-600 rounded-xl px-3 py-3"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredMovements.slice(0, 10).map((movement) => (
                          <div
                            key={movement.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                            onClick={() => addExerciseToSession(movement)}
                          >
                            <div>
                              <div className="font-semibold text-gray-900">{movement.name}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {movement.muscleGroups?.join(', ')}
                              </div>
                            </div>
                            <Plus className="h-5 w-5 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Exercises */}
                {movementsInSession.map((movement) => {
                  const sets = setsByMovement[movement.id] || []
                  const input = setInputs[movement.id] || {
                    movementId: movement.id,
                    weightKg: '',
                    reps: ''
                  }

                  return (
                    <div
                      key={movement.id}
                      className="bg-white rounded-3xl p-8 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-semibold text-gray-900 mb-2">{movement.name}</h3>
                          <div className="flex items-center gap-4 mb-4">
                            <span className="text-gray-600">{movement.muscleGroups?.join(', ')}</span>
                            {movement.isCompound && (
                              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                                Compound
                              </span>
                            )}
                          </div>
                          
                          {/* Exercise Notes */}
                          <div className="mb-6">
                            <Input
                              placeholder="Exercise notes (form cues, setup, etc.)"
                              value={exerciseNotes[movement.id] || ''}
                              onChange={(e) => setExerciseNotes(prev => ({
                                ...prev,
                                [movement.id]: e.target.value
                              }))}
                              className="h-10 text-sm bg-gray-50 border-gray-200 rounded-lg text-gray-700 placeholder-gray-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Previous sets */}
                      {sets.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Sets Completed</h4>
                          <div className="space-y-3">
                            {sets.map((set: any, index) => (
                              <div
                                key={set.id}
                                className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200/50"
                              >
                                <div className="flex items-center gap-6">
                                  <span className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-sm font-semibold text-gray-700">
                                    {index + 1}
                                  </span>
                                  <div className="flex items-center gap-6 text-base">
                                    <span className="font-semibold text-gray-900">{set.weightKg}kg × {set.reps}</span>
                                    {set.notes && <span className="text-gray-600 italic">"{set.notes}"</span>}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => deleteSet(set.id)}
                                  disabled={deleteSetMutation.isPending}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 rounded-xl px-3 py-2"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Simplified Set Input */}
                      <SmartSetInput
                        weightKg={input.weightKg}
                        reps={input.reps}
                        onChange={(field, value) => updateSetInput(movement.id, field as keyof SetInput, value)}
                        onSubmit={() => logSet(movement.id)}
                        isSubmitting={logSetMutation.isPending}
                        setNumber={sets.length + 1}
                      />
                    </div>
                  )
                })}

                {/* Empty state */}
                {movementsInSession.length === 0 && (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/50">
                    <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready to Start Training</h3>
                    <p className="text-gray-500 mb-6">
                      Add exercises to your {DAY_TYPE_NAMES[dayType]} workout to get started
                    </p>
                    <Button
                      onClick={() => setShowExerciseSearch(true)}
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 py-3"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add First Exercise
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Rest Timer */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200/50">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Rest Timer
                  </h3>
                  <Timer initialSeconds={180} />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200/50">
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate({ to: '/progress' })}
                    >
                      <TrendUp className="h-4 w-4 mr-2" />
                      View Progress
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate({ to: '/history' })}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Session History
                    </Button>
                  </div>
                </div>

                {/* Session Summary */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200/50">
                  <h3 className="font-semibold mb-4">Session Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Exercises:</span>
                      <span className="font-medium">{movementsInSession.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Sets:</span>
                      <span className="font-medium">{session.data.setLogs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Volume:</span>
                      <span className="font-medium">{Math.round(totalVolume).toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg RPE:</span>
                      <span className="font-medium">{averageRpe ? averageRpe.toFixed(1) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SuccessFeedback
        show={feedback.show}
        type={feedback.type}
        message={feedback.message}
        details={feedback.details}
        onComplete={hideSuccess}
      />
    </>
  )
}
