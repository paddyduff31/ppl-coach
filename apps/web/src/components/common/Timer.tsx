import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Timer as TimerIcon, Play, Pause, ArrowCounterClockwise, Bell, Plus, Minus } from '@phosphor-icons/react'

interface TimerProps {
  initialSeconds?: number
  onComplete?: () => void
  presetTimes?: number[]
  showPresets?: boolean
  showControls?: boolean
}

export function Timer({ 
  initialSeconds = 120, 
  onComplete, 
  presetTimes = [60, 90, 120, 180, 300], 
  showPresets = true,
  showControls = true
}: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(false)
  const [initialTime, setInitialTime] = useState(initialSeconds)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    let interval: number | null = null

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds <= 1) {
            setIsActive(false)
            setHasCompleted(true)
            onComplete?.()
            return 0
          }
          return prevSeconds - 1
        })
      }, 1000)
    } else if (!isActive && seconds !== 0) {
      if (interval) clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, seconds, onComplete])

  const toggle = () => {
    setIsActive(!isActive)
    setHasCompleted(false)
  }

  const reset = () => {
    setSeconds(initialTime)
    setIsActive(false)
    setHasCompleted(false)
  }

  const setTime = (time: number) => {
    setSeconds(time)
    setInitialTime(time)
    setIsActive(false)
    setHasCompleted(false)
  }

  const addTime = (amount: number) => {
    const newTime = Math.min(seconds + amount, 3600) // Max 1 hour
    setSeconds(newTime)
    setInitialTime(newTime)
  }

  const subtractTime = (amount: number) => {
    const newTime = Math.max(seconds - amount, 10) // Min 10 seconds
    setSeconds(newTime)
    setInitialTime(newTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const remainingSeconds = time % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const progress = ((initialTime - seconds) / initialTime) * 100

  return (
    <div className="space-y-4">
      {/* Timer Display */}
      <div className="text-center">
        <div className={`text-3xl font-mono font-bold ${hasCompleted ? 'text-green-600' : ''}`}>
          {formatTime(seconds)}
        </div>
        {hasCompleted && (
          <div className="flex items-center justify-center gap-1 text-green-600 text-sm mt-1">
            <Bell className="h-4 w-4" />
            <span>Time's up!</span>
          </div>
        )}
        <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ease-linear ${
              hasCompleted ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Preset Times */}
      {showPresets && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Quick Set</div>
          <div className="flex gap-2 flex-wrap">
            {presetTimes.map((time) => (
              <Button
                key={time}
                variant="outline"
                size="sm"
                onClick={() => setTime(time)}
                className="text-xs"
              >
                {formatTime(time)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="space-y-3">
          {/* Time Adjustment */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => subtractTime(15)}
              disabled={isActive}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">Adjust</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTime(15)}
              disabled={isActive}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Controls */}
          <div className="flex gap-2">
            <Button
              onClick={toggle}
              variant={isActive ? "destructive" : "default"}
              size="sm"
              className="flex-1"
            >
              {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isActive ? 'Pause' : 'Start'}
            </Button>

            <Button onClick={reset} variant="outline" size="sm">
              <ArrowCounterClockwise className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface SessionTimerProps {
  isActive: boolean
  onToggle: () => void
  showToggle?: boolean
}

export function SessionTimer({ isActive, onToggle, showToggle = true }: SessionTimerProps) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    let interval: number | null = null

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1)
      }, 1000)
    } else {
      if (interval) clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive])

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const remainingSeconds = time % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <TimerIcon className="h-4 w-4" />
        <span className="font-mono">{formatTime(seconds)}</span>
      </div>
      {showToggle && (
        <Button
          variant={isActive ? "destructive" : "default"}
          size="sm"
          onClick={onToggle}
        >
          {isActive ? 'Pause' : 'Resume'}
        </Button>
      )}
    </div>
  )
}

// PPL Rest Timer with preset rest periods
export function PPLRestTimer() {
  const [selectedRest, setSelectedRest] = useState(180) // 3 minutes default

  const restPeriods = [
    { time: 60, label: '1 min', description: 'Light sets' },
    { time: 120, label: '2 min', description: 'Moderate sets' },
    { time: 180, label: '3 min', description: 'Heavy sets' },
    { time: 240, label: '4 min', description: 'Max effort' },
    { time: 300, label: '5 min', description: 'Compound lifts' },
  ]

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-semibold mb-2">Rest Timer</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Recommended rest between sets for optimal recovery
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {restPeriods.map((period) => (
          <Button
            key={period.time}
            variant={selectedRest === period.time ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRest(period.time)}
            className="flex flex-col h-auto py-2"
          >
            <span className="font-medium">{period.label}</span>
            <span className="text-xs text-muted-foreground">{period.description}</span>
          </Button>
        ))}
      </div>

      <Timer
        initialSeconds={selectedRest}
        presetTimes={restPeriods.map(p => p.time)}
        showPresets={false}
      />
    </div>
  )
}

// Norwegian 4x4 Interval Timer (for cardio workouts)
export function Norwegian4x4IntervalTimer() {
  const [currentRound, setCurrentRound] = useState(1)
  const [isWorking, setIsWorking] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const totalRounds = 4
  const workTime = 240 // 4 minutes
  const restTime = 180 // 3 minutes

  const getCurrentTime = () => isWorking ? workTime : restTime
  const getCurrentPhase = () => isWorking ? 'Work' : 'Rest'

  const handleComplete = () => {
    if (isWorking) {
      // Work period finished, start rest
      setIsWorking(false)
    } else {
      // Rest period finished
      if (currentRound < totalRounds) {
        setCurrentRound(currentRound + 1)
        setIsWorking(true)
      } else {
        // Workout complete
        setIsActive(false)
        setCurrentRound(1)
        setIsWorking(false)
      }
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
        <h3 className="font-semibold mb-2">Norwegian 4x4 Interval Timer</h3>
        <p className="text-sm text-muted-foreground mb-4">
          4 rounds of 4 minutes work, 3 minutes rest
        </p>
        <div className="text-lg font-medium">
          Round {currentRound} of {totalRounds} - {getCurrentPhase()}
        </div>
      </div>

      {!isActive ? (
        <div className="space-y-2">
          <Button onClick={startWorkout} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Start Norwegian 4x4
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
          <Button onClick={resetWorkout} variant="outline" className="w-full">
            <ArrowCounterClockwise className="h-4 w-4 mr-2" />
            Reset Workout
          </Button>
        </>
      )}
    </div>
  )
}
