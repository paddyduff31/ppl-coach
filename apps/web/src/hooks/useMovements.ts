import { useGetAllMovements, useGetMovement, useGetMovementsByEquipment, useShuffleMovementsMutation } from '@ppl-coach/api-client'

export function useMovements() {
  return useGetAllMovements()
}

export function useMovement(id: string | undefined) {
  return useGetMovement(id!, {
    query: {
      enabled: !!id,
    }
  })
}

export function useMovementsByEquipment(equipmentTypes: number[]) {
  const joinedTypes = equipmentTypes.join(',')
  return useGetMovementsByEquipment({ equipmentTypes: joinedTypes }, {
    query: {
      enabled: equipmentTypes.length > 0,
    }
  })
}

export function useShuffleMovements() {
  return useShuffleMovementsMutation()
}
