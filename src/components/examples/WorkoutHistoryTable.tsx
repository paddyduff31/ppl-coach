import React from 'react'
import { VirtualTable, Column } from '../ui/table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { format } from 'date-fns'
import { useUserSessions } from '../../hooks/useSessions'
import { useUser } from '../../hooks/useUser'

interface WorkoutSession {
  id: string
  date: string
  dayType: number
  notes: string
  setLogs: Array<{
    id: string
    movementName: string
    weightKg: number
    reps: number
    rpe: number
  }>
  createdAt: string
}

/**
 * Example of using the VirtualTable with workout history data
 */
export function WorkoutHistoryTable() {
  const { user } = useUser()
  const { data: sessions = [], isLoading } = useUserSessions()

  const columns: Column<WorkoutSession>[] = [
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      sortable: true,
      width: 120,
      cell: (session) => (
        <span className="font-medium">
          {format(new Date(session.date), 'MMM dd, yyyy')}
        </span>
      )
    },
    {
      id: 'dayType',
      header: 'Day',
      accessorKey: 'dayType',
      sortable: true,
      width: 100,
      cell: (session) => (
        <Badge variant="outline">
          {session.dayType === 1 ? 'Push' : session.dayType === 2 ? 'Pull' : 'Legs'}
        </Badge>
      )
    },
    {
      id: 'exercises',
      header: 'Exercises',
      width: 200,
      cell: (session) => (
        <div className="text-sm text-muted-foreground">
          {session.setLogs.length > 0 ? (
            <>
              {Array.from(new Set(session.setLogs.map(set => set.movementName))).slice(0, 2).join(', ')}
              {session.setLogs.length > 2 && ` +${session.setLogs.length - 2} more`}
            </>
          ) : (
            'No exercises logged'
          )}
        </div>
      )
    },
    {
      id: 'volume',
      header: 'Volume',
      sortable: false,
      width: 100,
      cell: (session) => {
        const totalVolume = session.setLogs.reduce((total, set) => total + (set.weightKg * set.reps), 0)
        return (
          <span className="font-mono text-sm">
            {totalVolume.toLocaleString()} kg
          </span>
        )
      }
    },
    {
      id: 'sets',
      header: 'Sets',
      width: 80,
      cell: (session) => (
        <Badge variant="secondary">
          {session.setLogs.length}
        </Badge>
      )
    },
    {
      id: 'avgRpe',
      header: 'Avg RPE',
      width: 100,
      cell: (session) => {
        const validRpes = session.setLogs.filter(set => set.rpe > 0)
        const avgRpe = validRpes.length > 0
          ? validRpes.reduce((sum, set) => sum + set.rpe, 0) / validRpes.length
          : 0

        return avgRpe > 0 ? (
          <span className="font-mono text-sm">
            {avgRpe.toFixed(1)}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      }
    },
    {
      id: 'actions',
      header: '',
      width: 100,
      cell: (session) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = `/log/${session.id}`}
          >
            View
          </Button>
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Workout History</h2>
        <Badge variant="outline">
          {sessions.length} sessions
        </Badge>
      </div>

      <VirtualTable
        data={sessions}
        columns={columns}
        height={600}
        rowHeight={72}
        searchable={true}
        sortable={true}
        onRowClick={(session) => {
          window.location.href = `/log/${session.id}`
        }}
        emptyMessage="No workout sessions found. Start by logging your first workout!"
        className="border rounded-lg"
      />
    </div>
  )
}