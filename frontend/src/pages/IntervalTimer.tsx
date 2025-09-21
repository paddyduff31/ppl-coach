import { useState, useEffect, useRef } from 'react'
import { Button } from '../components/ui/button'
import {
  Play,
  Pause,
  ArrowCounterClockwise,
  Timer as TimerIcon,
  Clock,
  Target,
  Plus,
  Minus,
  Lightning,
  Fire,
  Heart,
  TrendUp,
  SpeakerHigh,
  SpeakerX,
  CaretRight,
  Sparkle,
  Gauge
} from '@phosphor-icons/react'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { cn } from '../utils/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Timer, Norwegian4x4IntervalTimer } from '../components/common/Timer'

interface CustomInterval {
  name: string
  workTime: number
  restTime: number
  rounds: number
  description: string
  intensity: 'high' | 'medium' | 'low'
  icon: any
  color: string
  benefits: string[]
}

const PRESET_INTERVALS = [
  {
    name: 'Norwegian 4x4',
    workTime: 240, // 4 minutes
    restTime: 180, // 3 minutes
    rounds: 4,
    description: 'Elite VO2 Max protocol',
    intensity: 'high' as const,
    icon: Heart,
    color: 'red',
    benefits: ['Improves VO2 Max', 'Elite endurance', 'Heart health']
  },
  {
    name: 'Tabata',
    workTime: 20,
    restTime: 10,
    rounds: 8,
    description: 'Ultra high-intensity bursts',
    intensity: 'high' as const,
    icon: Lightning,
    color: 'purple',
    benefits: ['Burns fat fast', 'Boosts metabolism', 'Time efficient']
  },
  {
    name: 'HIIT Classic',
    workTime: 30,
    restTime: 30,
    rounds: 8,
    description: 'Balanced work-rest ratio',
    intensity: 'medium' as const,
    icon: Fire,
    color: 'orange',
    benefits: ['Fat burning', 'Cardio fitness', 'Beginner friendly']
  },
  {
    name: 'EMOM (10 min)',
    workTime: 60,
    restTime: 0,
    rounds: 10,
    description: 'Every minute on the minute',
    intensity: 'medium' as const,
    icon: Clock,
    color: 'blue',
    benefits: ['Consistent pacing', 'Strength endurance', 'Mental focus']
  },
  {
    name: 'Pyramid Power',
    workTime: 30,
    restTime: 15,
    rounds: 12,
    description: 'Progressive intensity',
    intensity: 'medium' as const,
    icon: TrendUp,
    color: 'green',
    benefits: ['Progressive overload', 'Endurance building', 'Varied stimulus']
  },
  {
    name: 'Sprint Intervals',
    workTime: 15,
    restTime: 45,
    rounds: 10,
    description: 'Short explosive bursts',
    intensity: 'high' as const,
    icon: Lightning,
    color: 'yellow',
    benefits: ['Power development', 'Speed training', 'Anaerobic capacity']
  }
]

export default function IntervalTimer() {
  const [selectedPreset, setSelectedPreset] = useState<CustomInterval | null>(null)
  const [customInterval, setCustomInterval] = useState<CustomInterval>({
    name: 'Custom Workout',
    workTime: 60,
    restTime: 30,
    rounds: 5,
    description: 'Your custom interval workout',
    intensity: 'medium',
    icon: Clock,
    color: 'blue',
    benefits: ['Custom training', 'Personalized intensity', 'Flexible timing']
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

  const getIntensityColor = (intensity: 'high' | 'medium' | 'low') => {
    switch (intensity) {
      case 'high': return 'from-red-500 to-orange-500'
      case 'medium': return 'from-blue-500 to-purple-500'
      case 'low': return 'from-green-500 to-blue-500'
    }
  }

  const getIntensityIcon = (intensity: 'high' | 'medium' | 'low') => {
    switch (intensity) {
      case 'high': return Lightning
      case 'medium': return Fire
      case 'low': return Heart
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Hero Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <TimerIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">Interval Training</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Elite Interval Timer
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform your cardio with scientifically-proven interval protocols.
              Get stronger, faster, and fitter with precision timing.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant={!showCustom ? 'default' : 'outline'}
              onClick={() => setShowCustom(false)}
              className="px-6 py-3 rounded-2xl font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              <Sparkle className="h-4 w-4 mr-2" />
              Preset Workouts
            </Button>
            <Button
              variant={showCustom ? 'default' : 'outline'}
              onClick={() => setShowCustom(true)}
              className="px-6 py-3 rounded-2xl font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200"
            >
              <Gauge className="h-4 w-4 mr-2" />
              Custom Timer
            </Button>
          </div>
        </div>

        {!showCustom ? (
          /* Preset Workouts */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Protocol</h2>
              <p className="text-lg text-gray-600">Elite training methods used by world-class athletes</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {PRESET_INTERVALS.map((preset, index) => {
                const IconComponent = preset.icon
                const IntensityIcon = getIntensityIcon(preset.intensity)

                return (
                  <div
                    key={preset.name}
                    className={cn(
                      "group relative cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1",
                      selectedPreset?.name === preset.name ? 'scale-[1.02] -translate-y-1' : ''
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => setSelectedPreset(preset)}
                  >
                    <div className={cn(
                      "relative bg-white rounded-3xl border-2 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl",
                      selectedPreset?.name === preset.name
                        ? 'border-gray-900 shadow-2xl'
                        : 'border-gray-100 hover:border-gray-200'
                    )}>
                      {/* Gradient Header */}
                      <div className={cn(
                        "h-24 bg-gradient-to-r relative overflow-hidden",
                        getIntensityColor(preset.intensity)
                      )}>
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute top-4 left-6 flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">{preset.name}</h3>
                            <div className="flex items-center gap-1 text-white/80 text-sm">
                              <IntensityIcon className="h-3 w-3" />
                              <span className="capitalize">{preset.intensity} intensity</span>
                            </div>
                          </div>
                        </div>

                        {selectedPreset?.name === preset.name && (
                          <div className="absolute top-4 right-6">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        <p className="text-gray-600 text-sm leading-relaxed">{preset.description}</p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 bg-gray-50 rounded-2xl">
                            <div className="text-2xl font-bold text-gray-900">{formatTime(preset.workTime)}</div>
                            <div className="text-xs text-gray-500 font-medium">Work</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-2xl">
                            <div className="text-2xl font-bold text-gray-900">{formatTime(preset.restTime)}</div>
                            <div className="text-xs text-gray-500 font-medium">Rest</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-2xl">
                            <div className="text-2xl font-bold text-gray-900">{preset.rounds}</div>
                            <div className="text-xs text-gray-500 font-medium">Rounds</div>
                          </div>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Benefits</div>
                          <div className="flex flex-wrap gap-1">
                            {preset.benefits.map((benefit, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Total Duration</span>
                          <span className="text-lg font-bold text-gray-900">{formatTime(getTotalDuration(preset))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Custom Timer Creator */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-700 p-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Custom Interval Timer</h2>
                    <p className="text-white/80">Design your perfect workout protocol</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="p-8 space-y-8">
                <div className="grid gap-8 md:grid-cols-3">
                  {/* Work Time */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                        <Fire className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Work Time</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-mono font-bold text-gray-900">
                          {formatTime(customInterval.workTime)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustTime('workTime', -15)}
                          className="flex-1 rounded-xl"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustTime('workTime', 15)}
                          className="flex-1 rounded-xl"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Rest Time */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Heart className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Rest Time</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-mono font-bold text-gray-900">
                          {formatTime(customInterval.restTime)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustTime('restTime', -15)}
                          className="flex-1 rounded-xl"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustTime('restTime', 15)}
                          className="flex-1 rounded-xl"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Rounds */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                        <TrendUp className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Rounds</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-mono font-bold text-gray-900">
                          {customInterval.rounds}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustRounds(-1)}
                          className="flex-1 rounded-xl"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustRounds(1)}
                          className="flex-1 rounded-xl"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-gray-900">
                      Total Duration: {formatTime(getTotalDuration(customInterval))}
                    </div>
                    <div className="text-gray-600">
                      {customInterval.rounds} rounds • {formatTime(customInterval.workTime)} work • {formatTime(customInterval.restTime)} rest
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={() => setSelectedPreset(customInterval)}
                  className="w-full h-16 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <CaretRight className="h-6 w-6 mr-3" />
                  Start Custom Workout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Timer */}
        {selectedPreset && (
          <div className="max-w-4xl mx-auto">
            <ImmersiveTimerDisplay interval={selectedPreset} onClose={() => setSelectedPreset(null)} />
          </div>
        )}
      </div>
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

// Immersive Timer Display - The premium timer experience
interface ImmersiveTimerDisplayProps {
  interval: CustomInterval
  onClose: () => void
}

function ImmersiveTimerDisplay({ interval, onClose }: ImmersiveTimerDisplayProps) {
  const [currentRound, setCurrentRound] = useState(1)
  const [isWorking, setIsWorking] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [hasStarted, setHasStarted] = useState(false) // Track if workout has ever been started
  const intervalRef = useRef<NodeJS.Timeout>()

  const IconComponent = interval.icon

  useEffect(() => {
    if (isActive && currentTime > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev <= 1) {
            return 0 // Let the other useEffect handle phase completion
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive]) // Only depend on isActive

  // Handle phase completion when currentTime reaches 0
  useEffect(() => {
    if (currentTime === 0 && isActive && hasStarted) {
      handlePhaseComplete()
    }
  }, [currentTime, isActive, hasStarted])

  const handlePhaseComplete = () => {
    if (isWorking) {
      // Work phase completed
      if (currentRound === interval.rounds) {
        // All rounds complete
        setIsComplete(true)
        setIsActive(false)
      } else {
        // Move to rest
        setIsWorking(false)
        setCurrentTime(interval.restTime)
      }
    } else {
      // Rest phase completed, move to next work phase
      setCurrentRound(prev => prev + 1)
      setIsWorking(true)
      setCurrentTime(interval.workTime)
    }
  }

  const startWorkout = () => {
    setIsActive(true)
    setIsWorking(true)
    setCurrentRound(1)
    setCurrentTime(interval.workTime)
    setIsComplete(false)
    setHasStarted(true)
  }

  const pauseResume = () => {
    setIsActive(!isActive)
  }

  const resetWorkout = () => {
    setIsActive(false)
    setIsWorking(false)
    setCurrentRound(1)
    setCurrentTime(0)
    setIsComplete(false)
    setHasStarted(false)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getPhaseColor = () => {
    if (isComplete) return 'from-green-500 to-emerald-500'
    if (isWorking) return 'from-red-500 to-orange-500'
    return 'from-blue-500 to-purple-500'
  }

  const getPhaseLabel = () => {
    if (isComplete) return 'Complete'
    if (isWorking) return 'Work'
    return 'Rest'
  }

  const progress = currentTime > 0 ?
    ((isWorking ? interval.workTime : interval.restTime) - currentTime) /
    (isWorking ? interval.workTime : interval.restTime) * 100 : 0

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className={cn(
          "bg-gradient-to-r p-8 relative overflow-hidden",
          getPhaseColor()
        )}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <IconComponent className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{interval.name}</h2>
                <p className="text-white/80">{getPhaseLabel()} Phase</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="p-12 text-center space-y-8">
          {!hasStarted ? (
            /* Start State - Only show when workout has never been started */
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-8xl font-mono font-bold text-gray-900">
                  {formatTime(interval.workTime)}
                </div>
                <div className="text-xl text-gray-600">Ready to start</div>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center p-4 bg-gray-50 rounded-2xl">
                  <div className="text-2xl font-bold text-gray-900">{interval.rounds}</div>
                  <div className="text-sm text-gray-500">Rounds</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-2xl">
                  <div className="text-2xl font-bold text-gray-900">{formatTime(interval.workTime)}</div>
                  <div className="text-sm text-gray-500">Work</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-2xl">
                  <div className="text-2xl font-bold text-gray-900">{formatTime(interval.restTime)}</div>
                  <div className="text-sm text-gray-500">Rest</div>
                </div>
              </div>

              <Button
                onClick={startWorkout}
                className="w-full h-16 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold text-xl transition-all duration-200 hover:scale-[1.02]"
              >
                <Play className="h-6 w-6 mr-3" />
                Start Workout
              </Button>
            </div>
          ) : isComplete ? (
            /* Complete State */
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-6xl">🎉</div>
                <div className="text-4xl font-bold text-gray-900">Workout Complete!</div>
                <div className="text-xl text-gray-600">
                  Great job! You completed {interval.rounds} rounds of {interval.name}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={resetWorkout}
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl font-semibold"
                >
                  <ArrowCounterClockwise className="h-5 w-5 mr-2" />
                  Go Again
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold"
                >
                  Finish
                </Button>
              </div>
            </div>
          ) : (
            /* Active/Paused Timer State - Show when workout has started but not complete */
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-8xl font-mono font-bold text-gray-900">
                  {formatTime(currentTime)}
                </div>
                <div className="text-xl text-gray-600">
                  Round {currentRound} of {interval.rounds} • {getPhaseLabel()}
                  {!isActive && !isComplete && (
                    <span className="text-orange-600 ml-2">• Paused</span>
                  )}
                </div>
              </div>

              {/* Progress Ring */}
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className={cn(
                      "transition-all duration-1000 ease-linear",
                      isWorking ? "text-red-500" : "text-blue-500"
                    )}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full",
                    isWorking ? "bg-red-500" : "bg-blue-500"
                  )} />
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={pauseResume}
                  variant="outline"
                  className="w-16 h-16 rounded-2xl"
                >
                  {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button
                  onClick={resetWorkout}
                  variant="outline"
                  className="w-16 h-16 rounded-2xl"
                >
                  <ArrowCounterClockwise className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}