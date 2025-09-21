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
    return matchesSearch
  })

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Exercise Database</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredMovements.length} exercises available
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex gap-2 flex-wrap">
          {equipmentTypes.map(equipment => (
            <Button
              key={equipment.value}
              variant={selectedEquipment.includes(equipment.value) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleEquipment(equipment.value)}
            >
              {equipment.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center text-muted-foreground">
            Loading exercises...
          </div>
        ) : filteredMovements.length > 0 ? (
          filteredMovements.map((movement: any) => (
            <Card key={movement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{movement.name}</CardTitle>
                <CardDescription>
                  {muscleGroups[movement.muscleGroup as keyof typeof muscleGroups]} • {movementPatterns[movement.movementPattern as keyof typeof movementPatterns]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Equipment:</span>
                    <span className="text-sm text-muted-foreground">
                      {equipmentTypes
                        .filter(eq => (movement.requires & eq.flag) === eq.flag)
                        .map(eq => eq.label)
                        .join(', ') || 'None'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Type:</span>
                    <span className="text-sm text-muted-foreground">
                      {movement.unilateral ? 'Unilateral' : 'Bilateral'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground">
            No exercises found matching your criteria
          </div>
        )}
      </div>
    </div>
  )
}