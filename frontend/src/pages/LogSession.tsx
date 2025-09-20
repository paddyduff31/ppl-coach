import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Check,
  Trash,
  Clock,
  Target,
  Barbell,
  Pulse,
  Plus,
  ArrowRight,
  Play,
  TrendUp,
  Lightning,
  X,
  MagnifyingGlass,
  Shuffle
} from '@phosphor-icons/react'
import { useSession, useLogSet, useDeleteSet } from '../hooks/useSession'
import { useMovements, useShuffleMovements } from '../hooks/useMovements'
import { useUser } from '../hooks/useUser'
import { Timer, SessionTimer } from '../components/common/Timer'
import { LoadingState } from '../components/ui/loading'
import type { CreateSetLog, Movement } from '../api/schemas'
import { cn } from '../utils/utils'

interface SetInput {
  movementId: string
  weightKg: string
  reps: string
  rpe: string
  tempo: string
  notes: string
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

const DAY_TYPE_BORDERS = {
  1: 'border-blue-200',
  2: 'border-green-200',
  3: 'border-purple-200'
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

  // All useState hooks must be called consistently
  const [sessionActive, setSessionActive] = useState(true)
  const [setInputs, setSetInputs] = useState<Record<string, SetInput>>({})
  const [showExerciseSearch, setShowExerciseSearch] = useState(false)
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('')
  const [recommendedMovements, setRecommendedMovements] = useState<Movement[]>([])
  const [hasLoadedRecommendations, setHasLoadedRecommendations] = useState(false)
  const [focusedExercise, setFocusedExercise] = useState<string | null>(null)

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
      // Show movements from actual sets
      return Object.keys(setsByMovement)
        .map(id => movements?.find((m: any) => m.id === id))
        .filter(Boolean) as Movement[]
    } else {
      // Show recommended movements for empty sessions
      return recommendedMovements
    }
  }, [setsByMovement, movements, recommendedMovements, session?.data?.setLogs])

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
            rpe: '',
            tempo: '',
            notes: ''
          }
        })
        setSetInputs(prePopulatedInputs)
      } catch (error) {
        console.error('Failed to load recommended movements:', error)
      }
    }

    loadRecommendations()
  }, [user?.id, session?.data, hasLoadedRecommendations]) // Removed shuffleMovementsMutation from deps

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
      rpe: input.rpe ? parseFloat(input.rpe) : undefined,
      tempo: input.tempo || undefined,
      notes: input.notes || undefined
    }

    try {
      await logSetMutation.mutateAsync(setData)

      // Clear input for this movement
      setSetInputs(prev => ({
        ...prev,
        [movementId]: {
          movementId,
          weightKg: '',
          reps: '',
          rpe: '',
          tempo: '',
          notes: ''
        }
      }))
    } catch (error) {
      console.error('Failed to log set:', error)
    }
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
        reps: '',
        rpe: '',
        tempo: '',
        notes: ''
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
          reps: '',
          rpe: '',
          tempo: '',
          notes: ''
        }
      })
      setSetInputs(prePopulatedInputs)
    } catch (error) {
      console.error('Failed to reshuffle exercises:', error)
    }
  }

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

  const filteredMovements = movements.filter((movement: Movement) =>
    movement.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
    movement.muscleGroups?.some(mg => mg.toLowerCase().includes(exerciseSearchQuery.toLowerCase()))
  )

  const dayType = session.data.dayType as keyof typeof DAY_TYPE_NAMES

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-7xl mx-auto pt-8 pb-8 px-6">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "w-4 h-4 rounded-full",
                  `bg-gradient-to-r ${DAY_TYPE_COLORS[dayType].replace('from-', 'from-').replace('to-', 'to-').replace('/20', '')}`
                )} />
                <h1 className="text-3xl font-bold tracking-tight">
                  {DAY_TYPE_NAMES[dayType]} Day Session
                </h1>
              </div>
              <p className="text-muted-foreground">
                {new Date(session.data.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SessionTimer isActive={sessionActive} onToggle={() => setSessionActive(!sessionActive)} />
              <Button
                onClick={reshuffleExercises}
                variant="outline"
                className="btn-hover"
                disabled={shuffleMovementsMutation.isPending}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                {shuffleMovementsMutation.isPending ? 'Shuffling...' : 'Reshuffle'}
              </Button>
              <Button
                onClick={() => navigate({ to: '/' })}
                variant="outline"
                className="btn-hover"
              >
                <Check className="h-4 w-4 mr-2" />
                Complete Session
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-4 text-center">
              <Target className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-lg font-bold">{movementsInSession.length}</div>
              <div className="text-xs text-muted-foreground">Exercises</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Barbell className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-lg font-bold">{session.data.setLogs.length}</div>
              <div className="text-xs text-muted-foreground">Sets Logged</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <TrendUp className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-lg font-bold">{Math.round(totalVolume).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Volume (kg)</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Pulse className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-lg font-bold">{averageRpe ? averageRpe.toFixed(1) : 'N/A'}</div>
              <div className="text-xs text-muted-foreground">Avg RPE</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main workout area */}
          <div className="lg:col-span-3 space-y-6">

            {/* Add Exercise Button */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Exercises</h2>
                <Button
                  onClick={() => setShowExerciseSearch(!showExerciseSearch)}
                  className="btn-hover"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              </div>

              {/* Exercise Search */}
              {showExerciseSearch && (
                <div className="mb-6 p-4 border rounded-lg bg-muted/30 animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <MagnifyingGlass className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search exercises..."
                      value={exerciseSearchQuery}
                      onChange={(e) => setExerciseSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExerciseSearch(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {filteredMovements.slice(0, 10).map((movement) => (
                      <div
                        key={movement.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => addExerciseToSession(movement)}
                      >
                        <div>
                          <div className="font-medium">{movement.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {movement.muscleGroups?.join(', ')}
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
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
                reps: '',
                rpe: '',
                tempo: '',
                notes: ''
              }
              const isFocused = focusedExercise === movement.id

              return (
                <div
                  key={movement.id}
                  className={cn(
                    "glass rounded-2xl p-6 transition-all duration-300",
                    isFocused && "ring-2 ring-primary shadow-lg scale-[1.02]"
                  )}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{movement.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{movement.muscleGroups?.join(', ')}</span>
                        {movement.isCompound && (
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                            Compound
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={isFocused ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFocusedExercise(isFocused ? null : movement.id)}
                      >
                        <Target className="h-4 w-4 mr-1" />
                        {isFocused ? 'Unfocus' : 'Focus'}
                      </Button>
                    </div>
                  </div>

                  {/* Previous sets */}
                  {sets.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Sets Completed</h4>
                      <div className="space-y-2">
                        {sets.map((set: any, index) => (
                          <div
                            key={set.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                          >
                            <div className="flex items-center gap-6 text-sm">
                              <span className="font-medium w-8">#{index + 1}</span>
                              <span className="font-mono">{set.weightKg}kg × {set.reps}</span>
                              {set.rpe && <span className="text-muted-foreground">RPE {set.rpe}</span>}
                              {set.tempo && <span className="text-muted-foreground">{set.tempo}</span>}
                              {set.notes && <span className="text-muted-foreground italic">"{set.notes}"</span>}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSet(set.id)}
                              disabled={deleteSetMutation.isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add new set */}
                  <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Plus className="h-4 w-4 text-primary" />
                      Log Set #{sets.length + 1}
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Weight (kg)</Label>
                        <Input
                          type="number"
                          placeholder="80"
                          value={input.weightKg}
                          onChange={(e) => updateSetInput(movement.id, 'weightKg', e.target.value)}
                          className="h-9 font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Reps</Label>
                        <Input
                          type="number"
                          placeholder="8"
                          value={input.reps}
                          onChange={(e) => updateSetInput(movement.id, 'reps', e.target.value)}
                          className="h-9 font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">RPE (1-10)</Label>
                        <Input
                          type="number"
                          placeholder="8"
                          min="1"
                          max="10"
                          step="0.5"
                          value={input.rpe}
                          onChange={(e) => updateSetInput(movement.id, 'rpe', e.target.value)}
                          className="h-9 font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Tempo</Label>
                        <Input
                          placeholder="3-1-1"
                          value={input.tempo}
                          onChange={(e) => updateSetInput(movement.id, 'tempo', e.target.value)}
                          className="h-9 font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
                        <Input
                          placeholder="Good form"
                          value={input.notes}
                          onChange={(e) => updateSetInput(movement.id, 'notes', e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => logSet(movement.id)}
                      disabled={!input.weightKg || !input.reps || logSetMutation.isPending}
                      className="btn-hover w-full"
                    >
                      {logSetMutation.isPending ? (
                        'Logging...'
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Log Set
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}

            {/* Empty state */}
            {movementsInSession.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Start Training</h3>
                <p className="text-muted-foreground mb-6">
                  Add exercises to your {DAY_TYPE_NAMES[dayType]} workout to get started
                </p>
                <Button
                  onClick={() => setShowExerciseSearch(true)}
                  size="lg"
                  className="btn-hover"
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
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Rest Timer
              </h3>
              <Timer initialSeconds={180} />
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6">
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
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Session Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exercises:</span>
                  <span className="font-medium">{movementsInSession.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sets:</span>
                  <span className="font-medium">{session.data.setLogs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume:</span>
                  <span className="font-medium">{Math.round(totalVolume).toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg RPE:</span>
                  <span className="font-medium">{averageRpe ? averageRpe.toFixed(1) : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}