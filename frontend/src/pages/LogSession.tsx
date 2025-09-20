import { useState, useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Check, Trash, Clock, Target, Barbell, Pulse } from '@phosphor-icons/react'
import { useSession, useLogSet, useDeleteSet } from '../features/sessions/hooks/useSession'
import { useMovements } from '../features/sessions/hooks/useMovements'
import { Timer, SessionTimer } from '../features/sessions/components/Timer'
import type { CreateSetLog, Movement } from '../api/schemas'

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
  1: 'bg-blue-500',
  2: 'bg-green-500',
  3: 'bg-purple-500'
} as const

// Progression calculations would come from user's actual progression plan


export default function LogSession() {
  const { id } = useParams({ from: '/log/$id' })
  const navigate = useNavigate()

  const { data: session, isLoading: sessionLoading, error: sessionError } = useSession(id)
  const { data: movementsResponse } = useMovements()
  const movements = movementsResponse?.data || []
  const logSetMutation = useLogSet()
  const deleteSetMutation = useDeleteSet()

  const [sessionActive, setSessionActive] = useState(true)
  const [setInputs, setSetInputs] = useState<Record<string, SetInput>>({})
  // Week calculation would be based on user's actual progression plan

  // Group set logs by movement for display
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

  if (sessionLoading) {
    return <div className="container mx-auto p-6">Loading session...</div>
  }

  if (sessionError || !session?.data) {
    return <div className="container mx-auto p-6">Failed to load session</div>
  }

  const movementsInSession = Object.keys(setsByMovement)
    .map(id => movements?.find((m: any) => m.id === id))
    .filter(Boolean) as Movement[]


  const dayType = session.data.dayType as keyof typeof DAY_TYPE_NAMES

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${DAY_TYPE_COLORS[dayType]}`} />
          <div>
            <h1 className="text-3xl font-bold">
              {DAY_TYPE_NAMES[dayType]} Day Session
            </h1>
            <p className="text-muted-foreground">{session.data.date}</p>
          </div>
        </div>
        <SessionTimer isActive={sessionActive} onToggle={() => setSessionActive(!sessionActive)} />
      </div>

      {/* Session Info Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {DAY_TYPE_NAMES[dayType]} Day Workout
          </CardTitle>
          <CardDescription>
            {session?.data?.notes || `Focus on ${DAY_TYPE_NAMES[dayType].toLowerCase()} movements with proper form and controlled tempo.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <Barbell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Day Type</p>
                <p className="text-xs text-muted-foreground">{DAY_TYPE_NAMES[dayType]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Pulse className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Sets Logged</p>
                <p className="text-xs text-muted-foreground">{session?.data?.setLogs?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Session Time</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Movements</p>
                <p className="text-xs text-muted-foreground">{movementsInSession.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Log Sets Guide */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
            <Check className="h-5 w-5" />
            How to Log Your Sets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">1. Log Each Set</h4>
              <p className="text-sm text-blue-600">
                Enter weight, reps, and RPE (how hard it felt) for each set
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">2. Track Progress</h4>
              <p className="text-sm text-blue-600">
                Your sets are saved automatically and tracked over time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Movements currently in session */}
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

            // Target weight would come from user's progression plan in a real app

            return (
              <Card key={movement.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {movement.name}
                        {movement.isCompound && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Compound
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {movement.muscleGroups.join(', ')}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Movement Info */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Muscle Groups:</span>
                        <span className="font-medium">{movement.muscleGroups?.join(', ') || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Existing sets */}
                    {sets.length > 0 && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-6 gap-2 text-sm font-medium text-muted-foreground">
                          <span>Set</span>
                          <span>Weight</span>
                          <span>Reps</span>
                          <span>RPE</span>
                          <span>Tempo</span>
                          <span></span>
                        </div>
                        {sets.map((set: any) => (
                          <div key={set.id} className="grid grid-cols-6 gap-2 items-center">
                            <span className="text-sm">{set.setIndex}</span>
                            <span className="text-sm">{set.weightKg} kg</span>
                            <span className="text-sm">{set.reps}</span>
                            <span className="text-sm">{set.rpe || '-'}</span>
                            <span className="text-sm">{set.tempo || '-'}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSet(set.id)}
                              disabled={deleteSetMutation.isPending}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New set input */}
                    <div className="border-t pt-4 bg-muted/30 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="font-medium text-sm mb-2">Log Your Set</h4>
                        <p className="text-xs text-muted-foreground">
                          Enter your weight, reps, and how hard it felt (RPE)
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                        <div>
                          <Label className="text-xs font-medium">Weight (kg)</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 80"
                            value={input.weightKg}
                            onChange={(e) => updateSetInput(movement.id, 'weightKg', e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Reps</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 8"
                            value={input.reps}
                            onChange={(e) => updateSetInput(movement.id, 'reps', e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">RPE (1-10)</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 8"
                            min="1"
                            max="10"
                            step="0.5"
                            value={input.rpe}
                            onChange={(e) => updateSetInput(movement.id, 'rpe', e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Tempo (optional)</Label>
                          <Input
                            placeholder="3-1-1"
                            value={input.tempo}
                            onChange={(e) => updateSetInput(movement.id, 'tempo', e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Notes (optional)</Label>
                          <Input
                            placeholder="Good form"
                            value={input.notes}
                            onChange={(e) => updateSetInput(movement.id, 'notes', e.target.value)}
                            className="h-9"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          RPE = Rate of Perceived Exertion (1=easy, 10=max effort)
                        </div>
                        <Button
                          onClick={() => logSet(movement.id)}
                          disabled={!input.weightKg || !input.reps || logSetMutation.isPending}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          {logSetMutation.isPending ? 'Logging...' : 'Log Set'}
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {}}
                    >
                      Focus on this exercise
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* No exercises yet - show how to add them */}
          {movementsInSession.length === 0 && (
            <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-center text-primary flex items-center justify-center gap-2">
                  <Target className="h-5 w-5" />
                  Ready to Start Your {DAY_TYPE_NAMES[dayType]} Workout
                </CardTitle>
                <CardDescription className="text-center">
                  Add exercises to your workout by clicking the button below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Button 
                    onClick={() => {
                      // This would trigger the shuffle API and add exercises
                      // For now, just show a message
                      alert('Exercise generation will be implemented in the next update!')
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Generate Workout Plan
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    The system will automatically select exercises based on your day type and recent workouts
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rest Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <Timer initialSeconds={180} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Exercises:</span>
                  <span className="font-medium">{movementsInSession.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Sets:</span>
                  <span className="font-medium">{session.data.setLogs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Volume:</span>
                  <span className="font-medium">{totalVolume.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg RPE:</span>
                  <span className="font-medium">{averageRpe.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{session?.data?.date || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => {}}
              >
                <Target className="h-4 w-4 mr-2" />
                Clear Focus
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: '/progress' })}
              >
                <Pulse className="h-4 w-4 mr-2" />
                View Progress
              </Button>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={() => navigate({ to: '/' })}
          >
            <Check className="h-4 w-4 mr-2" />
            Complete Session
          </Button>
        </div>
      </div>
    </div>
  )
}