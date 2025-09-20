import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import {
  Play,
  Pause,
  ArrowCounterClockwise,
  Timer as TimerIcon,
  Clock,
  Target,
  Plus,
  Minus
} from '@phosphor-icons/react'
import { Timer, Norwegian4x4IntervalTimer } from '../features/sessions/components/Timer'

interface CustomInterval {
  name: string
  workTime: number
  restTime: number
  rounds: number
}

const PRESET_INTERVALS = [
  {
    name: 'Norwegian 4x4',
    workTime: 240, // 4 minutes
    restTime: 180, // 3 minutes
    rounds: 4
  },
  {
    name: 'HIIT Classic',
    workTime: 30,
    restTime: 30,
    rounds: 8
  },
  {
    name: 'Tabata',
    workTime: 20,
    restTime: 10,
    rounds: 8
  },
  {
    name: 'EMOM (10 min)',
    workTime: 60,
    restTime: 0,
    rounds: 10
  },
  {
    name: 'Circuit Training',
    workTime: 45,
    restTime: 15,
    rounds: 12
  }
]

export default function IntervalTimer() {
  const [selectedPreset, setSelectedPreset] = useState<CustomInterval | null>(null)
  const [customInterval, setCustomInterval] = useState<CustomInterval>({
    name: 'Custom Workout',
    workTime: 60,
    restTime: 30,
    rounds: 5
  })
  const [showCustom, setShowCustom] = useState(false)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTotalDuration = (interval: CustomInterval) => {
    const totalWorkTime = interval.workTime * interval.rounds
    const totalRestTime = interval.restTime * (interval.rounds - 1) // No rest after last round
    return totalWorkTime + totalRestTime
  }

  const updateCustomInterval = (field: keyof CustomInterval, value: string | number) => {
    setCustomInterval(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const adjustTime = (field: 'workTime' | 'restTime', change: number) => {
    setCustomInterval(prev => ({
      ...prev,
      [field]: Math.max(5, prev[field] + change) // Minimum 5 seconds
    }))
  }

  const adjustRounds = (change: number) => {
    setCustomInterval(prev => ({
      ...prev,
      rounds: Math.max(1, prev.rounds + change) // Minimum 1 round
    }))
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interval Timer</h1>
          <p className="text-muted-foreground text-lg">
            High-intensity interval training and cardio workouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showCustom ? 'default' : 'outline'}
            onClick={() => setShowCustom(!showCustom)}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Custom Timer
          </Button>
        </div>
      </div>

      {/* Preset Intervals */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Preset Workouts</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRESET_INTERVALS.map((preset) => (
            <Card
              key={preset.name}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedPreset?.name === preset.name
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-accent'
              }`}
              onClick={() => setSelectedPreset(preset)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{preset.name}</CardTitle>
                <CardDescription>
                  {preset.rounds} rounds • {formatTime(getTotalDuration(preset))} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Work:</span>
                    <span className="font-medium">{formatTime(preset.workTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rest:</span>
                    <span className="font-medium">{formatTime(preset.restTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rounds:</span>
                    <span className="font-medium">{preset.rounds}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Timer */}
      {showCustom && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Custom Interval Timer
            </CardTitle>
            <CardDescription>Create your own interval workout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Work Time */}
              <div className="space-y-2">
                <Label htmlFor="work-time">Work Time</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustTime('workTime', -15)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="text-center font-mono text-lg min-w-20">
                    {formatTime(customInterval.workTime)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustTime('workTime', 15)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Rest Time */}
              <div className="space-y-2">
                <Label htmlFor="rest-time">Rest Time</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustTime('restTime', -15)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="text-center font-mono text-lg min-w-20">
                    {formatTime(customInterval.restTime)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustTime('restTime', 15)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Rounds */}
              <div className="space-y-2">
                <Label htmlFor="rounds">Rounds</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustRounds(-1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="text-center font-mono text-lg min-w-20">
                    {customInterval.rounds}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustRounds(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold">
                Total Duration: {formatTime(getTotalDuration(customInterval))}
              </div>
              <div className="text-sm text-muted-foreground">
                {customInterval.rounds} rounds of {formatTime(customInterval.workTime)} work, {formatTime(customInterval.restTime)} rest
              </div>
            </div>

            <Button
              onClick={() => setSelectedPreset(customInterval)}
              className="w-full"
              size="lg"
            >
              Use Custom Timer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Timer */}
      {selectedPreset && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TimerIcon className="h-5 w-5" />
              {selectedPreset.name}
            </CardTitle>
            <CardDescription>
              {selectedPreset.rounds} rounds • {formatTime(selectedPreset.workTime)} work, {formatTime(selectedPreset.restTime)} rest
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPreset.name === 'Norwegian 4x4' ? (
              <Norwegian4x4IntervalTimer />
            ) : (
              <IntervalTimerComponent interval={selectedPreset} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            About Interval Training
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Norwegian 4x4</h3>
              <p className="text-sm text-muted-foreground">
                High-intensity cardio protocol with 4 minutes of work at 85-95% max heart rate,
                followed by 3 minutes of active recovery. Excellent for improving VO2 max.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">HIIT Benefits</h3>
              <p className="text-sm text-muted-foreground">
                High-Intensity Interval Training improves cardiovascular fitness, burns calories efficiently,
                and can be completed in shorter time periods than traditional cardio.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tabata Protocol</h3>
              <p className="text-sm text-muted-foreground">
                20 seconds of ultra-high intensity exercise followed by 10 seconds of rest,
                repeated for 8 rounds (4 minutes total). Originally developed for Olympic speedskaters.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">EMOM Training</h3>
              <p className="text-sm text-muted-foreground">
                Every Minute On the Minute training allows you to control intensity and rest periods
                while maintaining consistent work output throughout the session.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Generic interval timer component for non-Norwegian 4x4 workouts
interface IntervalTimerComponentProps {
  interval: CustomInterval
}

function IntervalTimerComponent({ interval }: IntervalTimerComponentProps) {
  const [currentRound, setCurrentRound] = useState(1)
  const [isWorking, setIsWorking] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const getCurrentTime = () => isWorking ? interval.workTime : interval.restTime
  const getCurrentPhase = () => isWorking ? 'Work' : 'Rest'

  const handleComplete = () => {
    if (isWorking) {
      // Work period finished, start rest (unless it's the last round)
      if (currentRound === interval.rounds) {
        // Last round completed
        setIsActive(false)
        setCurrentRound(1)
        setIsWorking(false)
      } else {
        setIsWorking(false)
      }
    } else {
      // Rest period finished, start next round
      setCurrentRound(currentRound + 1)
      setIsWorking(true)
    }
  }

  const startWorkout = () => {
    setIsActive(true)
    setIsWorking(true)
    setCurrentRound(1)
  }

  const resetWorkout = () => {
    setIsActive(false)
    setIsWorking(false)
    setCurrentRound(1)
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-lg font-medium">
          Round {currentRound} of {interval.rounds} - {getCurrentPhase()}
        </div>
        {isActive && currentRound === interval.rounds && !isWorking && (
          <div className="text-sm text-green-600 font-medium mt-1">
            Workout Complete! 🎉
          </div>
        )}
      </div>

      {!isActive ? (
        <div className="space-y-2">
          <Button onClick={startWorkout} className="w-full" size="lg">
            <Play className="h-4 w-4 mr-2" />
            Start {interval.name}
          </Button>
        </div>
      ) : (
        <>
          <Timer
            key={`${currentRound}-${isWorking}`}
            initialSeconds={getCurrentTime()}
            onComplete={handleComplete}
            showPresets={false}
            showControls={false}
          />
          <div className="flex gap-2">
            <Button onClick={resetWorkout} variant="outline" className="flex-1">
              <ArrowCounterClockwise className="h-4 w-4 mr-2" />
              Reset Workout
            </Button>
          </div>
        </>
      )}
    </div>
  )
}