import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { 
  Plus, 
  Play, 
  Target, 
  Barbell,
  Clock,
  PencilSimple,
  Trash,
  Copy,
  Star,
  Users,
  Lightning,
  Calendar,
  MagnifyingGlass,
  Funnel,
  DotsThreeVertical
} from '@phosphor-icons/react'
import { useMovements, useShuffleMovements } from '../hooks/useMovements'
import { useCreateSession } from '../hooks/useSession'
import { useUser } from '../hooks/useUser'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { cn } from '../utils/utils'

// Mock workout data - in real app would come from API
const mockWorkouts = [
  {
    id: '1',
    name: 'Power Push',
    type: 'Push',
    exercises: 6,
    estimatedTime: 75,
    difficulty: 'Intermediate',
    lastUsed: '2 days ago',
    isTemplate: false,
    isFavorite: true,
    exercises_list: [
      { name: 'Bench Press', sets: '4x5', weight: '80kg' },
      { name: 'Overhead Press', sets: '4x6', weight: '50kg' },
      { name: 'Dips', sets: '3x8', weight: 'BW+15kg' },
      { name: 'Lateral Raises', sets: '3x12', weight: '12kg' },
      { name: 'Tricep Extensions', sets: '3x10', weight: '35kg' },
      { name: 'Push-ups', sets: '2xAMRAP', weight: 'BW' }
    ]
  },
  {
    id: '2',
    name: 'Heavy Pull',
    type: 'Pull',
    exercises: 5,
    estimatedTime: 80,
    difficulty: 'Advanced',
    lastUsed: '4 days ago',
    isTemplate: false,
    isFavorite: false,
    exercises_list: [
      { name: 'Deadlift', sets: '5x3', weight: '140kg' },
      { name: 'Pull-ups', sets: '4x6', weight: 'BW+10kg' },
      { name: 'Barbell Row', sets: '4x8', weight: '70kg' },
      { name: 'Face Pulls', sets: '3x15', weight: '25kg' },
      { name: 'Hammer Curls', sets: '3x10', weight: '18kg' }
    ]
  },
  {
    id: '3',
    name: 'Leg Destroyer',
    type: 'Legs',
    exercises: 7,
    estimatedTime: 90,
    difficulty: 'Advanced',
    lastUsed: '1 week ago',
    isTemplate: false,
    isFavorite: true,
    exercises_list: [
      { name: 'Back Squat', sets: '5x5', weight: '100kg' },
      { name: 'Romanian Deadlift', sets: '4x6', weight: '80kg' },
      { name: 'Bulgarian Split Squats', sets: '3x8', weight: '20kg' },
      { name: 'Leg Press', sets: '4x12', weight: '200kg' },
      { name: 'Walking Lunges', sets: '3x10', weight: '15kg' },
      { name: 'Calf Raises', sets: '4x15', weight: '60kg' },
      { name: 'Leg Curls', sets: '3x12', weight: '45kg' }
    ]
  },
  {
    id: '4',
    name: 'Beginner Push',
    type: 'Push',
    exercises: 4,
    estimatedTime: 45,
    difficulty: 'Beginner',
    lastUsed: 'Never',
    isTemplate: true,
    isFavorite: false,
    exercises_list: [
      { name: 'Push-ups', sets: '3x8', weight: 'BW' },
      { name: 'Dumbbell Press', sets: '3x10', weight: '15kg' },
      { name: 'Shoulder Press', sets: '3x8', weight: '12kg' },
      { name: 'Tricep Dips', sets: '2x8', weight: 'BW' }
    ]
  }
]

const workoutTypeColors = {
  'Push': 'from-blue-500 to-blue-600',
  'Pull': 'from-green-500 to-green-600', 
  'Legs': 'from-purple-500 to-purple-600'
} as const

const difficultyColors = {
  'Beginner': 'bg-green-100 text-green-700',
  'Intermediate': 'bg-orange-100 text-orange-700',
  'Advanced': 'bg-red-100 text-red-700'
} as const

export default function Workouts() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null)

  const createSessionMutation = useCreateSession()

  const filteredWorkouts = mockWorkouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'All' || workout.type === selectedType
    return matchesSearch && matchesType
  })

  const startWorkout = async (workout: any) => {
    if (!user?.id) return

    const dayTypeMap = { 'Push': 1, 'Pull': 2, 'Legs': 3 }
    
    try {
      const session = await createSessionMutation.mutateAsync({
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        dayType: dayTypeMap[workout.type as keyof typeof dayTypeMap],
        notes: `${workout.name} workout`
      })

      navigate({ to: '/log/$id', params: { id: session.data.id } })
    } catch (error) {
      console.error('Failed to start workout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="pt-16 pb-8 px-8 animate-fade-in-up">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6 animate-scale-in">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Workout Library
              </span>
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-4 animate-fade-in-up">
              Your Workouts
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
              Create, customize, and manage your workout routines for maximum results
            </p>
          </div>

          {/* Create New Workout Button */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold text-base transition-all duration-200 hover:scale-[1.02] shadow-xl"
            >
              <Plus className="h-5 w-5 mr-3" />
              Create New Workout
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-8 py-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlass className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-gray-200 rounded-xl bg-white"
              />
            </div>
            
            <div className="flex gap-2">
              {['All', 'Push', 'Pull', 'Legs'].map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="rounded-xl"
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Funnel className="h-4 w-4" />
              {filteredWorkouts.length} workouts
            </div>
          </div>
        </div>

        {/* Workout Grid */}
        <div className="px-8 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Clean Header - No gradients */}
                <div className="h-20 bg-gray-50 border-b border-gray-200 relative">
                  <div className="h-full flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center",
                        workout.type === 'Push' ? "bg-blue-100" :
                        workout.type === 'Pull' ? "bg-green-100" :
                        "bg-purple-100"
                      )}>
                        <Barbell className={cn(
                          "h-4 w-4",
                          workout.type === 'Push' ? "text-blue-600" :
                          workout.type === 'Pull' ? "text-green-600" :
                          "text-purple-600"
                        )} />
                      </div>
                      <div className="text-gray-700 font-semibold text-sm uppercase tracking-wider">
                        {workout.type} Day
                      </div>
                      {workout.isTemplate && (
                        <Star className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {workout.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                        <DotsThreeVertical className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{workout.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Barbell className="h-4 w-4" />
                        {workout.exercises} exercises
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {workout.estimatedTime} min
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={cn("text-xs font-medium", difficultyColors[workout.difficulty as keyof typeof difficultyColors])}>
                      {workout.difficulty}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Last used: {workout.lastUsed}
                    </span>
                  </div>

                  {/* Exercise Preview */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Exercises:</div>
                    <div className="space-y-1">
                      {workout.exercises_list.slice(0, 3).map((exercise, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">{exercise.name}</span>
                          <span className="text-gray-500 font-mono">{exercise.sets}</span>
                        </div>
                      ))}
                      {workout.exercises_list.length > 3 && (
                        <div className="text-xs text-gray-500 italic">
                          +{workout.exercises_list.length - 3} more exercises
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Button
                      onClick={() => startWorkout(workout)}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-10 font-medium transition-all duration-200"
                      disabled={createSessionMutation.isPending}
                    >
                      {createSessionMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWorkout(workout)}
                      className="rounded-xl"
                    >
                      <PencilSimple className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredWorkouts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No workouts found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ? `No workouts match "${searchQuery}"` : 'Create your first workout to get started'}
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 py-3"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workout
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions - Clean pastel backgrounds */}
        <div className="px-8 py-8 border-t border-gray-100">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Lightning className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Quick Templates</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Generate workouts from proven templates
              </p>
              <Button variant="outline" size="sm" className="w-full rounded-xl">
                Browse Templates
              </Button>
            </div>

            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Community</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Share and discover workouts from other users
              </p>
              <Button variant="outline" size="sm" className="w-full rounded-xl">
                Explore Community
              </Button>
            </div>

            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Workout Plans</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Create structured training programs
              </p>
              <Button variant="outline" size="sm" className="w-full rounded-xl">
                View Plans
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
