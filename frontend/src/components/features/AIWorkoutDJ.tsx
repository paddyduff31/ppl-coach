import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Slider } from '../ui/slider'
import {
  MusicNote,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Heart,
  Lightning,
  Fire,
  Headphones,
  SpeakerHigh,
  SpeakerLow,
  Gauge,
  Brain,
  TrendUp
} from '@phosphor-icons/react'
import { cn } from '../../utils/utils'

interface Track {
  id: string
  title: string
  artist: string
  bpm: number
  energy: number // 0-100
  genre: string
  duration: number
  perfectFor: string[]
}

interface WorkoutPhase {
  phase: 'warmup' | 'working' | 'rest' | 'cooldown'
  intensity: number // 0-100
  duration: number
  recommendedBpm: [number, number] // min, max
  energyLevel: number
}

interface AIPlaylist {
  name: string
  description: string
  tracks: Track[]
  totalDuration: number
  avgBpm: number
  energyProfile: number[]
}

export function AIWorkoutDJ() {
  const [currentPhase, setCurrentPhase] = useState<WorkoutPhase>({
    phase: 'working',
    intensity: 85,
    duration: 45,
    recommendedBpm: [120, 140],
    energyLevel: 80
  })
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([75])
  const [aiMode, setAiMode] = useState(true)
  const [playlist, setPlaylist] = useState<AIPlaylist | null>(null)

  // Mock tracks database
  const trackDatabase: Track[] = [
    {
      id: '1',
      title: 'Till I Collapse',
      artist: 'Eminem',
      bpm: 85,
      energy: 95,
      genre: 'Hip Hop',
      duration: 297,
      perfectFor: ['heavy sets', 'deadlifts', 'max effort']
    },
    {
      id: '2', 
      title: 'Eye of the Tiger',
      artist: 'Survivor',
      bpm: 109,
      energy: 88,
      genre: 'Rock',
      duration: 246,
      perfectFor: ['compound movements', 'motivation', 'PR attempts']
    },
    {
      id: '3',
      title: 'Pump It',
      artist: 'Black Eyed Peas', 
      bpm: 124,
      energy: 92,
      genre: 'Hip Hop',
      duration: 213,
      perfectFor: ['high rep sets', 'accessories', 'pump work']
    },
    {
      id: '4',
      title: 'Bodies',
      artist: 'Drowning Pool',
      bpm: 152,
      energy: 98,
      genre: 'Metal',
      duration: 203,
      perfectFor: ['HIIT', 'cardio', 'explosive movements']
    },
    {
      id: '5',
      title: 'Weightless',
      artist: 'Marconi Union',
      bpm: 60,
      energy: 15,
      genre: 'Ambient',
      duration: 485,
      perfectFor: ['cool down', 'stretching', 'recovery']
    }
  ]

  // AI Music Selection Algorithm
  const selectOptimalTrack = (phase: WorkoutPhase, previousTracks: string[] = []) => {
    const availableTracks = trackDatabase.filter(track => !previousTracks.includes(track.id))
    
    // Score each track based on workout phase
    const scoredTracks = availableTracks.map(track => {
      let score = 0
      
      // BPM matching
      const [minBpm, maxBpm] = phase.recommendedBpm
      if (track.bpm >= minBpm && track.bpm <= maxBpm) {
        score += 30
      } else {
        const bpmDiff = Math.min(Math.abs(track.bpm - minBpm), Math.abs(track.bpm - maxBpm))
        score += Math.max(0, 30 - bpmDiff / 2)
      }
      
      // Energy level matching
      const energyDiff = Math.abs(track.energy - phase.energyLevel)
      score += Math.max(0, 25 - energyDiff / 4)
      
      // Phase-specific bonuses
      if (phase.phase === 'working' && track.perfectFor.includes('heavy sets')) score += 20
      if (phase.phase === 'rest' && track.energy < 50) score += 15
      if (phase.phase === 'warmup' && track.bpm < 100) score += 10
      if (phase.phase === 'cooldown' && track.perfectFor.includes('recovery')) score += 25
      
      return { track, score }
    })
    
    // Return highest scoring track
    scoredTracks.sort((a, b) => b.score - a.score)
    return scoredTracks[0]?.track || trackDatabase[0]
  }

  // Generate AI playlist based on workout plan
  const generateAIPlaylist = () => {
    const workoutPlan: WorkoutPhase[] = [
      { phase: 'warmup', intensity: 40, duration: 300, recommendedBpm: [80, 110], energyLevel: 50 },
      { phase: 'working', intensity: 85, duration: 2400, recommendedBpm: [110, 140], energyLevel: 85 },
      { phase: 'working', intensity: 90, duration: 1800, recommendedBpm: [120, 150], energyLevel: 90 },
      { phase: 'cooldown', intensity: 30, duration: 600, recommendedBpm: [60, 90], energyLevel: 30 }
    ]
    
    const selectedTracks: Track[] = []
    const usedTrackIds: string[] = []
    
    workoutPlan.forEach(phase => {
      const phaseDuration = phase.duration
      let currentDuration = 0
      
      while (currentDuration < phaseDuration) {
        const track = selectOptimalTrack(phase, usedTrackIds)
        selectedTracks.push(track)
        usedTrackIds.push(track.id)
        currentDuration += track.duration
      }
    })
    
    const aiPlaylist: AIPlaylist = {
      name: 'AI Push Day Mix',
      description: 'Algorithmically crafted for your workout intensity',
      tracks: selectedTracks,
      totalDuration: selectedTracks.reduce((sum, track) => sum + track.duration, 0),
      avgBpm: selectedTracks.reduce((sum, track) => sum + track.bpm, 0) / selectedTracks.length,
      energyProfile: selectedTracks.map(track => track.energy)
    }
    
    setPlaylist(aiPlaylist)
    setCurrentTrack(selectedTracks[0])
  }

  // Update music based on workout phase
  useEffect(() => {
    if (aiMode && currentPhase) {
      const optimalTrack = selectOptimalTrack(currentPhase)
      if (optimalTrack.id !== currentTrack?.id) {
        setCurrentTrack(optimalTrack)
      }
    }
  }, [currentPhase, aiMode])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'warmup': return 'text-blue-600 bg-blue-50'
      case 'working': return 'text-red-600 bg-red-50'
      case 'rest': return 'text-green-600 bg-green-50'
      case 'cooldown': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">AI Workout DJ</h1>
        </div>
        <p className="text-gray-600">Music that adapts to your workout intensity in real-time</p>
      </div>

      {/* Current Track Display */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                getPhaseColor(currentPhase.phase)
              )}>
                {currentPhase.phase.toUpperCase()}
              </div>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <Gauge className="h-4 w-4" />
                {currentPhase.intensity}% Intensity
              </div>
            </div>
            <Button
              onClick={() => setAiMode(!aiMode)}
              variant={aiMode ? "secondary" : "outline"}
              size="sm"
            >
              <Brain className="h-4 w-4 mr-1" />
              AI {aiMode ? 'ON' : 'OFF'}
            </Button>
          </div>

          {currentTrack && (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <MusicNote className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{currentTrack.title}</h3>
                <p className="opacity-90">{currentTrack.artist}</p>
                <div className="flex items-center gap-4 text-sm opacity-80 mt-1">
                  <span>{currentTrack.bpm} BPM</span>
                  <span>{currentTrack.energy}% Energy</span>
                  <span>{formatDuration(currentTrack.duration)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button variant="outline" size="sm">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button variant="outline" size="sm">
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm">
              <Shuffle className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Volume</span>
              <span>{volume[0]}%</span>
            </div>
            <div className="flex items-center gap-3">
              <SpeakerLow className="h-4 w-4 text-gray-400" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
              <SpeakerHigh className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp className="h-5 w-5" />
            AI Music Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {currentTrack?.bpm || 0}
              </div>
              <div className="text-sm text-blue-700">Optimal BPM</div>
              <div className="text-xs text-gray-500 mt-1">
                Matches your rep tempo
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {currentTrack?.energy || 0}%
              </div>
              <div className="text-sm text-red-700">Energy Match</div>
              <div className="text-xs text-gray-500 mt-1">
                Perfect for {currentPhase.phase}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium mb-1">Why this song?</div>
            <div className="text-sm text-gray-600">
              Selected for {currentPhase.intensity}% intensity {currentPhase.phase} phase. 
              {currentTrack && currentTrack.perfectFor.length > 0 && 
                ` Perfect for ${currentTrack.perfectFor.join(', ')}.`
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate AI Playlist */}
      <Card>
        <CardContent className="p-6 text-center">
          <Button 
            onClick={generateAIPlaylist}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Lightning className="h-4 w-4 mr-2" />
            Generate Complete Workout Playlist
          </Button>
          {playlist && (
            <div className="mt-4 text-sm text-gray-600">
              Generated "{playlist.name}" with {playlist.tracks.length} tracks 
              ({formatDuration(playlist.totalDuration)} total)
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
