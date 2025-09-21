import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { TrendUp } from '@phosphor-icons/react'
import { cn } from '../utils/utils'
import { useHapticFeedback } from '../hooks/useHapticFeedback'

interface SmartSetInputProps {
  weightKg: string
  reps: string
  onChange: (field: string, value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  setNumber: number
}

export function SmartSetInput({
  weightKg,
  reps,
  onChange,
  onSubmit,
  isSubmitting,
  setNumber
}: SmartSetInputProps) {
  const { onSuccess } = useHapticFeedback()

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && weightKg && reps) {
      onSubmit()
    }
  }

  const isReadyToSubmit = weightKg && reps && !isSubmitting

  return (
    <div className="flex items-center gap-4">
      {/* Weight Input */}
      <div className="flex-1">
        <Input
          type="number"
          placeholder="Weight (kg)"
          value={weightKg}
          onChange={(e) => onChange('weightKg', e.target.value)}
          onKeyPress={handleKeyPress}
          className="h-12 font-mono text-base bg-white border-gray-200 rounded-xl"
          step="1.25"
          autoFocus
        />
      </div>

      {/* Reps Input */}
      <div className="flex-1">
        <Input
          type="number"
          placeholder="Reps"
          value={reps}
          onChange={(e) => onChange('reps', e.target.value)}
          onKeyPress={handleKeyPress}
          className="h-12 font-mono text-base bg-white border-gray-200 rounded-xl"
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={() => {
          if (isReadyToSubmit) {
            onSuccess()
            onSubmit()
          }
        }}
        disabled={!isReadyToSubmit}
        className={cn(
          "h-12 px-6 font-medium rounded-xl transition-all duration-200",
          isReadyToSubmit
            ? "bg-gray-900 hover:bg-gray-800 text-white hover:scale-[1.02] active:scale-[0.98]"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Logging...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <TrendUp className="h-4 w-4" />
            Set {setNumber}
          </div>
        )}
      </Button>
    </div>
  )
}