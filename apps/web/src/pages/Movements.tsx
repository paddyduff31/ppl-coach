import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/endpoints'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from '@phosphor-icons/react'

export default function Movements() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
    
    const { data: movementsResponse, isLoading } = useQuery({
    queryKey: ['movements'],
    queryFn: () => api.getMovements()
  })

  // Ensure movements is always an array
  const movements = Array.isArray(movementsResponse?.data) ? movementsResponse.data : []

  const equipmentTypes = [
    { value: 'Bodyweight', label: 'Bodyweight', flag: 1 },
    { value: 'Dumbbell', label: 'Dumbbell', flag: 2 },
    { value: 'Barbell', label: 'Barbell', flag: 4 },
    { value: 'Bench', label: 'Bench', flag: 8 },
    { value: 'Cable', label: 'Cable', flag: 16 },
    { value: 'Machine', label: 'Machine', flag: 32 },
  ]

  const muscleGroups = {
    1: 'Chest',
    2: 'Shoulders',
    3: 'Quads',
    4: 'Hamstrings',
    5: 'Glutes',
    6: 'Calves',
    7: 'Back',
    8: 'Biceps',
    9: 'Triceps',
    10: 'Core',
    11: 'Rear Delts'
  }

  const movementPatterns = {
    1: 'Push',
    2: 'Squat',
    3: 'Pull',
    4: 'Hinge',
    5: 'Carry'
  }

  const filteredMovements = movements.filter((movement: any) => {
    const matchesSearch = movement.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Equipment filter logic
    const matchesEquipment = selectedEquipment.length === 0 || 
      selectedEquipment.some(selectedEq => {
        const equipmentFlag = equipmentTypes.find(eq => eq.value === selectedEq)?.flag || 0
        return (movement.requires & equipmentFlag) === equipmentFlag
      })
    
    return matchesSearch && matchesEquipment
  })

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="pt-16 pb-12 px-8 border-b border-gray-100 animate-fade-in-up">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6 animate-scale-in">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Exercise Database
              </span>
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-4 animate-fade-in-up">
              Movements
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
              Explore our comprehensive exercise library with {filteredMovements.length} movements
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-12">
          {/* Search and Filters - Fixed Heights */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex gap-4 items-center">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 bg-white border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {equipmentTypes.map(equipment => (
                  <Button
                    key={equipment.value}
                    variant={selectedEquipment.includes(equipment.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleEquipment(equipment.value)}
                    className="h-10 rounded-xl px-4"
                  >
                    {equipment.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Exercise Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">Loading exercises...</div>
              </div>
            ) : filteredMovements.length > 0 ? (
              filteredMovements.map((movement: any) => (
                <div key={movement.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-200 animate-fade-in-up">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{movement.name}</h3>
                    <p className="text-gray-600 mb-3">
                      {muscleGroups[movement.muscleGroup as keyof typeof muscleGroups]} • {movementPatterns[movement.movementPattern as keyof typeof movementPatterns]}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Equipment:</span>
                      <span className="text-sm text-gray-600">
                        {equipmentTypes
                          .filter(eq => (movement.requires & eq.flag) === eq.flag)
                          .map(eq => eq.label)
                          .join(', ') || 'None'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Type:</span>
                      <span className="text-sm text-gray-600">
                        {movement.unilateral ? 'Unilateral' : 'Bilateral'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">
                  {selectedEquipment.length > 0 
                    ? `No exercises found for ${selectedEquipment.join(', ')} equipment${searchTerm ? ` matching "${searchTerm}"` : ''}`
                    : 'No exercises found matching your criteria'
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}