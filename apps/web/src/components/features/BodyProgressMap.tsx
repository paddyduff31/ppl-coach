import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import {
  TrendUp,
  TrendDown,
  Minus,
  Target,
  Crown
} from '@phosphor-icons/react'
import { cn } from '../../utils/utils'

interface MuscleGroupProgress {
  name: string
  volume: number
  growth: number // percentage change
  lastWorked: string
  strength: number // 0-100 scale
  color: string
  sets: number
}

interface BodyProgressMapProps {
  className?: string
}

export function BodyProgressMap({ className }: BodyProgressMapProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'volume' | 'growth' | 'strength'>('growth')

  // Mock data - in real app this would come from API
  const muscleData: Record<string, MuscleGroupProgress> = {
    chest: {
      name: 'Chest',
      volume: 12500,
      growth: 15.2,
      lastWorked: '2 days ago',
      strength: 85,
      color: '#ef4444',
      sets: 48
    },
    shoulders: {
      name: 'Shoulders',
      volume: 8200,
      growth: 8.7,
      lastWorked: '1 day ago',
      strength: 78,
      color: '#f59e0b',
      sets: 36
    },
    biceps: {
      name: 'Biceps',
      volume: 5400,
      growth: 12.3,
      lastWorked: '3 days ago',
      strength: 72,
      color: '#10b981',
      sets: 24
    },
    triceps: {
      name: 'Triceps',
      volume: 6800,
      growth: 18.9,
      lastWorked: '1 day ago',
      strength: 80,
      color: '#3b82f6',
      sets: 32
    },
    lats: {
      name: 'Lats',
      volume: 14200,
      growth: 11.1,
      lastWorked: '2 days ago',
      strength: 88,
      color: '#8b5cf6',
      sets: 42
    },
    traps: {
      name: 'Traps',
      volume: 7600,
      growth: 6.4,
      lastWorked: '2 days ago',
      strength: 75,
      color: '#06b6d4',
      sets: 28
    },
    abs: {
      name: 'Abs',
      volume: 2800,
      growth: -2.1,
      lastWorked: '4 days ago',
      strength: 65,
      color: '#84cc16',
      sets: 18
    },
    quads: {
      name: 'Quadriceps',
      volume: 18900,
      growth: 22.4,
      lastWorked: '1 day ago',
      strength: 92,
      color: '#dc2626',
      sets: 54
    },
    hamstrings: {
      name: 'Hamstrings',
      volume: 13400,
      growth: 16.8,
      lastWorked: '1 day ago',
      strength: 84,
      color: '#ea580c',
      sets: 38
    },
    glutes: {
      name: 'Glutes',
      volume: 11200,
      growth: 19.7,
      lastWorked: '1 day ago',
      strength: 89,
      color: '#c026d3',
      sets: 42
    },
    calves: {
      name: 'Calves',
      volume: 4200,
      growth: 4.2,
      lastWorked: '3 days ago',
      strength: 68,
      color: '#7c3aed',
      sets: 16
    }
  }

  const getMuscleIntensity = (muscle: MuscleGroupProgress) => {
    const value = viewMode === 'volume' ? muscle.volume / 20000 : 
                 viewMode === 'growth' ? Math.max(0, muscle.growth / 25) :
                 muscle.strength / 100
    return Math.min(1, Math.max(0.2, value))
  }

  const getMuscleColor = (muscle: MuscleGroupProgress) => {
    const intensity = getMuscleIntensity(muscle)
    if (viewMode === 'growth') {
      return muscle.growth > 0 
        ? `rgba(34, 197, 94, ${intensity})` // Green for growth
        : `rgba(239, 68, 68, ${Math.abs(muscle.growth) / 10})` // Red for decline
    }
    return `rgba(59, 130, 246, ${intensity})` // Blue for volume/strength
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 10) return <Crown className="h-3 w-3 text-yellow-500" />
    if (growth > 0) return <TrendUp className="h-3 w-3 text-green-500" />
    if (growth < 0) return <TrendDown className="h-3 w-3 text-red-500" />
    return <Minus className="h-3 w-3 text-gray-400" />
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Body Progress Map
          </CardTitle>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode('growth')}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-all",
                viewMode === 'growth' 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Growth
            </button>
            <button
              onClick={() => setViewMode('volume')}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-all",
                viewMode === 'volume' 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Volume
            </button>
            <button
              onClick={() => setViewMode('strength')}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-all",
                viewMode === 'strength' 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Strength
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Interactive Body Diagram */}
          <div className="relative">
            <div className="text-center mb-4">
              <h3 className="font-medium text-gray-900 mb-1">Click muscles to see details</h3>
              <p className="text-sm text-gray-500">
                Showing: {viewMode === 'growth' ? 'Growth %' : viewMode === 'volume' ? 'Volume' : 'Strength'}
              </p>
            </div>
            
            {/* SVG Body Diagram */}
            <div className="flex justify-center">
              <svg width="200" height="400" viewBox="0 0 200 400" className="drop-shadow-sm">
                {/* Head */}
                <circle cx="100" cy="30" r="20" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2"/>
                
                {/* Torso */}
                <rect x="70" y="50" width="60" height="100" rx="15" fill="#f9fafb" stroke="#d1d5db" strokeWidth="2"/>
                
                {/* Chest */}
                <ellipse 
                  cx="100" cy="75" rx="25" ry="15" 
                  fill={getMuscleColor(muscleData.chest)}
                  stroke="#374151" strokeWidth="1"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => setSelectedMuscle('chest')}
                />
                
                {/* Abs */}
                <rect 
                  x="85" y="95" width="30" height="35" rx="5"
                  fill={getMuscleColor(muscleData.abs)}
                  stroke="#374151" strokeWidth="1"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => setSelectedMuscle('abs')}
                />
                
                {/* Shoulders */}
                <circle 
                  cx="60" cy="65" r="12" 
                  fill={getMuscleColor(muscleData.shoulders)}
                  stroke="#374151" strokeWidth="1"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => setSelectedMuscle('shoulders')}
                />
                <circle 
                  cx="140" cy="65" r="12" 
                  fill={getMuscleColor(muscleData.shoulders)}
                  stroke="#374151" strokeWidth="1"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => setSelectedMuscle('shoulders')}
                />
                
                {/* Arms */}
                <rect x="35" y="70" width="15" height="60" rx="7" fill="#f9fafb" stroke="#d1d5db" strokeWidth="2"/>
                <rect x="150" y="70" width="15" height="60" rx="7" fill="#f9fafb" stroke="#d1d5db" strokeWidth="2"/>
                
                {/* Biceps */}
                <ellipse 
                  cx="42" cy="90" rx="6" ry="15" 
                  fill={getMuscleColor(muscleData.biceps)}
                  stroke="#374151" strokeWidth="1"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => setSelectedMuscle('biceps')}
                />
                <ellipse 
                  cx="158" cy="90" rx="6" ry="15" 
                  fill={getMuscleColor(muscleData.biceps)}
                  stroke="#374151" strokeWidth="1"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => setSelectedMuscle('biceps')}
                />
                
                {/* Triceps */}
                <ellipse 
                  cx="48" cy="90" rx="4" ry="12" 
                  fill={getMuscleColor(muscleData.triceps)}
                  stroke="#374151" strokeWidth="1"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => setSelectedMuscle('triceps')}
                />
                <ellipse 
                  cx="152" cy="90" rx="4" ry="12" 
                  fill={getMuscleColor(muscleData.triceps)}
                  stroke="#374151" strokeWidth="1"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => setSelectedMuscle('triceps')}
                />
                
                {/* Legs */}
                <rect x="80" y="160" width="18" height="80" rx="9" fill="#f9fafb" stroke="#d1d5db" strokeWidth="2"/>
                <rect x="102" y="160" width="18" height="80" rx="9" fill="#f9fafb" stroke="#d1d5db" strokeWidth="2"/>
                
                {/* Quads */}
                <ellipse 
                  cx="89" cy="190" rx="8" ry="25" 
                  fill={getMuscleColor(muscleData.quads)}
                  stroke="#374151" strokeWidth="1"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => setSelectedMuscle('quads')}
                />
                <ellipse 
                  cx="111" cy="190" rx="8" ry="25" 
                  fill={getMuscleColor(muscleData.quads)}
                  stroke="#374151" strokeWidth="1"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => setSelectedMuscle('quads')}
                />
                
                {/* Calves */}
                <ellipse 
                  cx="89" cy="270" rx="6" ry="15" 
                  fill={getMuscleColor(muscleData.calves)}
                  stroke="#374151" strokeWidth="1"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => setSelectedMuscle('calves')}
                />
                <ellipse 
                  cx="111" cy="270" rx="6" ry="15" 
                  fill={getMuscleColor(muscleData.calves)}
                  stroke="#374151" strokeWidth="1"
                  className="cursor-pointer hover:stroke-2 transition-all"
                  onClick={() => setSelectedMuscle('calves')}
                />
              </svg>
            </div>
          </div>

          {/* Muscle Details */}
          <div className="space-y-4">
            {selectedMuscle ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {muscleData[selectedMuscle].name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {getGrowthIcon(muscleData[selectedMuscle].growth)}
                    <Badge 
                      className={cn(
                        muscleData[selectedMuscle].growth > 0 
                          ? "bg-green-100 text-green-700"
                          : muscleData[selectedMuscle].growth < 0
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {muscleData[selectedMuscle].growth > 0 ? '+' : ''}
                      {muscleData[selectedMuscle].growth.toFixed(1)}% growth
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(muscleData[selectedMuscle].volume / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-blue-700">Volume (kg)</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {muscleData[selectedMuscle].sets}
                    </div>
                    <div className="text-xs text-purple-700">Total Sets</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {muscleData[selectedMuscle].strength}%
                    </div>
                    <div className="text-xs text-green-700">Strength Score</div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="text-sm font-medium text-orange-600">
                      {muscleData[selectedMuscle].lastWorked}
                    </div>
                    <div className="text-xs text-orange-700">Last Worked</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${muscleData[selectedMuscle].strength}%` }}
                  />
                </div>
                <div className="text-center text-xs text-gray-500">
                  Strength Development: {muscleData[selectedMuscle].strength}%
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a muscle group</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Click on any muscle in the body diagram to see detailed progress, volume, and growth statistics.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="font-medium text-gray-900 mb-4">Quick Overview</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(muscleData).slice(0, 4).map(([key, muscle]) => (
              <button
                key={key}
                onClick={() => setSelectedMuscle(key)}
                className={cn(
                  "p-3 rounded-lg border transition-all text-left hover:border-blue-300",
                  selectedMuscle === key 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{muscle.name}</span>
                  {getGrowthIcon(muscle.growth)}
                </div>
                <div className="text-xs text-gray-600">
                  {muscle.growth > 0 ? '+' : ''}{muscle.growth.toFixed(1)}%
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
