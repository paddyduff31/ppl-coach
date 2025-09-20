import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../../../api/endpoints'

export function useMovements() {
  return useQuery({
    queryKey: ['movements'],
    queryFn: () => api.getMovements(),
  })
}

export function useMovement(id: string | undefined) {
  return useQuery({
    queryKey: ['movements', id],
    queryFn: () => api.getMovement(id!),
    enabled: !!id,
  })
}

export function useMovementsByEquipment(equipmentTypes: number[]) {
  return useQuery({
    queryKey: ['movements', 'equipment', equipmentTypes],
    queryFn: () => api.getMovementsByEquipment(equipmentTypes),
    enabled: equipmentTypes.length > 0,
  })
}

export function useShuffleMovements() {
  return useMutation({
    mutationFn: (data: { dayType: number; userId: string; availableEquipment: number[] }) =>
      api.shuffleMovements(data),
  })
}