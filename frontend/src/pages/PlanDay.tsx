import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Shuffle, 
  Play, 
  Target, 
  Barbell,
  Pulse, 
  Clock,
  Calendar,
  Trophy,
} from '@phosphor-icons/react'
import { useShuffleMovements } from '../features/sessions/hooks/useMovements'
import { useCreateSession } from '../features/sessions/hooks/useSession'
import { useUser } from '../hooks/useUser'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import type { Movement } from '../api/schemas'

type DayType = 1 | 2 | 3 // 1=Push, 2=Pull, 3=Legs

const DAY_TYPE_NAMES = {
  1: 'push',
  2: 'pull',
  3: 'legs'
} as const

const DAY_TYPE_COLORS = {
  1: 'bg-blue-500',
  2: 'bg-green-500',
  3: 'bg-purple-500'
} as const

const DAY_TYPE_DESCRIPTIONS = {
  1: 'Chest, Shoulders, Triceps',
  2: 'Back, Biceps, Rear Delts',
  3: 'Quads, Hamstrings, Glutes, Calves'
} as const

// Progression data would come from user's actual progression plan in a real app

const mockWorkoutTemplates = {
  1: [ // Push
    { name: 'Bench Press', sets: 4, reps: 4, rpe: 8, rest: '3-5 min' },
    { name: 'Overhead Press', sets: 4, reps: 4, rpe: 8, rest: '3-5 min' },
    { name: 'Dips', sets: 3, reps: 8, rpe: 7, rest: '2-3 min' },
    { name: 'Lateral Raises', sets: 3, reps: 12, rpe: 7, rest: '1-2 min' },
  ],
  2: [ // Pull
    { name: 'Pull-ups', sets: 4, reps: 4, rpe: 8, rest: '3-5 min' },
    { name: 'Barbell Row', sets: 4, reps: 4, rpe: 8, rest: '3-5 min' },
    { name: 'Face Pulls', sets: 3, reps: 15, rpe: 7, rest: '1-2 min' },
    { name: 'Hammer Curls', sets: 3, reps: 10, rpe: 7, rest: '1-2 min' },
  ],
  3: [ // Legs
    { name: 'Squat', sets: 4, reps: 4, rpe: 8, rest: '3-5 min' },
    { name: 'Romanian Deadlift', sets: 4, reps: 4, rpe: 8, rest: '3-5 min' },
    { name: 'Bulgarian Split Squats', sets: 3, reps: 8, rpe: 7, rest: '2-3 min' },
    { name: 'Calf Raises', sets: 3, reps: 15, rpe: 7, rest: '1-2 min' },
  ]
}

export default function PlanDay() {
  const navigate = useNavigate()
  const { user, isLoading: userLoading } = useUser()
  const {
    nextDayType,
    nextDayName,
    nextDayDescription,
    lastWorkout,
    isTodayComplete
  } = useWorkoutPlan()

  const [selectedDayType, setSelectedDayType] = useState<DayType | null>(nextDayType)
  const [shuffledMovements, setShuffledMovements] = useState<Movement[]>([])
  const [showTemplate, setShowTemplate] = useState(false)

  const shuffleMutation = useShuffleMovements()
  const createSessionMutation = useCreateSession()

  const generatePlan = async () => {
    if (!selectedDayType || !user?.id) return

    try {
      // Using available equipment - for now assume all equipment is available
      const availableEquipment = [1, 2, 3, 4, 5] // This would come from user equipment settings

      const result = await shuffleMutation.mutateAsync({
        dayType: selectedDayType,
        userId: user.id,
        availableEquipment
      })

      setShuffledMovements(result.data)
    } catch (error) {
      console.error('Failed to shuffle movements:', error)
    }
  }

  const startWorkoutSession = async (dayType?: DayType) => {
    const typeToUse = dayType || selectedDayType
    if (!typeToUse) return

    if (!user?.id) return
    
    try {
      // First generate exercises for this workout
      const availableEquipment = [1, 2, 3, 4, 5] // This would come from user equipment settings
      await shuffleMutation.mutateAsync({
        dayType: typeToUse,
        userId: user.id,
        availableEquipment
      })

      // Then create the session
      const session = await createSessionMutation.mutateAsync({
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        dayType: typeToUse,
        notes: `${DAY_TYPE_NAMES[typeToUse]} day workout`
      })
      
      navigate({ to: '/log/$id', params: { id: session.data.id } })
    } catch (error) {
      console.error('Failed to create workout session:', error)
    }
  }

  const toggleTemplate = () => {
    setShowTemplate(!showTemplate)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plan Your Workout</h1>
          <p className="text-muted-foreground text-lg">
            PPL Training - {isTodayComplete ? 'Plan Tomorrow' : 'Start Today'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Target className="h-3 w-3 mr-1" />
            PPL Split
          </Badge>
          {!isTodayComplete && (
            <Badge variant="default" className="text-sm">
              <Pulse className="h-3 w-3 mr-1" />
              Next: {nextDayName}
            </Badge>
          )}
          {lastWorkout && (
            <Badge variant="outline" className="text-sm">
              Last: {lastWorkout.dayName}
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Start Section */}
      {!isTodayComplete && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${DAY_TYPE_COLORS[nextDayType]}`} />
              Recommended: {nextDayName} Day
            </CardTitle>
            <CardDescription>
              {nextDayDescription} • {lastWorkout && `Last workout: ${lastWorkout.dayName} on ${new Date(lastWorkout.date).toLocaleDateString()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => startWorkoutSession(nextDayType)}
                disabled={createSessionMutation.isPending || userLoading}
                size="lg"
                className="flex items-center gap-2"
              >
                <Play className="h-5 w-5" />
                {createSessionMutation.isPending ? 'Starting...' : `Start ${nextDayName} Workout`}
              </Button>
              <div className="text-sm text-muted-foreground">
                Or select a different day type below
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PPL Info Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Push/Pull/Legs System
          </CardTitle>
          <CardDescription>
            Structured strength training with progressive overload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <Barbell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Progression Rate</p>
                <p className="text-xs text-muted-foreground">2.5% per week</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Pulse className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Target RPE</p>
                <p className="text-xs text-muted-foreground">8.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Rest Period</p>
                <p className="text-xs text-muted-foreground">3-5 minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Frequency</p>
                <p className="text-xs text-muted-foreground">3x per week</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Type Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Select Training Day</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {([1, 2, 3] as DayType[]).map((dayType) => (
            <Card
              key={dayType}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedDayType === dayType
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-accent'
              }`}
              onClick={() => setSelectedDayType(dayType)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${DAY_TYPE_COLORS[dayType]}`} />
                  <CardTitle className="capitalize text-lg">{DAY_TYPE_NAMES[dayType]}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {DAY_TYPE_DESCRIPTIONS[dayType]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exercises:</span>
                    <span className="font-medium">{mockWorkoutTemplates[dayType].length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sets:</span>
                    <span className="font-medium">
                      {mockWorkoutTemplates[dayType].reduce((sum, ex) => sum + ex.sets, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Duration:</span>
                    <span className="font-medium">45-60 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {selectedDayType && (
        <div className="flex gap-4">
          <Button
            onClick={generatePlan}
            disabled={shuffleMutation.isPending}
            className="flex items-center gap-2"
            size="lg"
          >
            <Shuffle className="h-5 w-5" />
            {shuffleMutation.isPending ? 'Generating...' : 'Shuffle Exercises'}
          </Button>

          <Button
            onClick={toggleTemplate}
            variant="outline"
            className="flex items-center gap-2"
            size="lg"
          >
            <Target className="h-5 w-5" />
            {showTemplate ? 'Hide' : 'Show'} Template
          </Button>

          <Button
            onClick={startWorkoutSession}
            disabled={createSessionMutation.isPending}
            className="flex items-center gap-2"
            size="lg"
          >
            <Play className="h-5 w-5" />
            {createSessionMutation.isPending ? 'Starting...' : 'Start Workout'}
          </Button>
        </div>
      )}

      {/* Workout Template */}
      {selectedDayType && showTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {DAY_TYPE_NAMES[selectedDayType].toUpperCase()} Day Template
            </CardTitle>
            <CardDescription>Recommended exercises for {DAY_TYPE_NAMES[selectedDayType].toLowerCase()} day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockWorkoutTemplates[selectedDayType].map((exercise, i) => {
                // Target weight would come from user's progression plan
                return (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">{exercise.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps} reps @ RPE {exercise.rpe}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Rest: {exercise.rest}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Start with comfortable weight
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Workout */}
      {shuffledMovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                <span className="capitalize">{DAY_TYPE_NAMES[selectedDayType!]} Day Workout</span>
              </div>
              <Button
                onClick={startWorkoutSession}
                disabled={createSessionMutation.isPending}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {createSessionMutation.isPending ? 'Starting...' : 'Start Session'}
              </Button>
            </CardTitle>
            <CardDescription>Your personalized workout for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shuffledMovements.map((movement, i) => {
                // Target weight would come from user's progression plan
                return (
                  <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{movement.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {movement.muscleGroups.join(', ')}
                          {movement.isCompound && ' • Compound'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Start with comfortable weight
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Focus on form
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Cycle Progress
          </CardTitle>
          <CardDescription>Your PPL progression this cycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">1</div>
              <div className="text-sm text-muted-foreground">Current Week</div>
              <div className="text-xs text-muted-foreground">Start your journey</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">PPL</div>
              <div className="text-sm text-muted-foreground">Program</div>
              <div className="text-xs text-muted-foreground">Push/Pull/Legs</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">8.0</div>
              <div className="text-sm text-muted-foreground">Target RPE</div>
              <div className="text-xs text-muted-foreground">Perfect intensity</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">3x</div>
              <div className="text-sm text-muted-foreground">Per Week</div>
              <div className="text-xs text-muted-foreground">Frequency</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}