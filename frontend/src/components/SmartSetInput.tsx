import React, { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Plus, Minus, Lightning, TrendUp } from '@phosphor-icons/react'
import { cn } from '../utils/utils'
import { useHapticFeedback } from '../hooks/useHapticFeedback'

interface SmartSuggestion {
  weightKg: number
  reps: number
  rpe?: number
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

interface QuickAdjustment {
  weightKg: number
  reps: number
  label: string
}

interface SmartSetInputProps {
  weightKg: string
  reps: string
  rpe: string
  tempo: string
  notes: string
  onChange: (field: string, value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  suggestion?: SmartSuggestion | null
  quickAdjustments?: {
    increaseWeight: QuickAdjustment
    decreaseWeight: QuickAdjustment
    increaseReps: QuickAdjustment
    decreaseReps: QuickAdjustment
  }
  setNumber: number
}

export function SmartSetInput({
  weightKg,
  reps,
  rpe,
  tempo,
  notes,
  onChange,
  onSubmit,
  isSubmitting,
  suggestion,
  quickAdjustments,
  setNumber
}: SmartSetInputProps) {
  const [showSuggestion, setShowSuggestion] = useState(true)
  const { triggerHaptic, onButtonPress, onSuccess } = useHapticFeedback()

  // Auto-apply suggestion on first render if available
  useEffect(() => {
    if (suggestion && !weightKg && !reps && showSuggestion) {
      onChange('weightKg', suggestion.weightKg.toString())
      onChange('reps', suggestion.reps.toString())
      if (suggestion.rpe) {
        onChange('rpe', suggestion.rpe.toString())
      }
    }
  }, [suggestion, weightKg, reps, onChange, showSuggestion])

  const applySuggestion = () => {
    if (!suggestion) return
    onChange('weightKg', suggestion.weightKg.toString())
    onChange('reps', suggestion.reps.toString())
    if (suggestion.rpe) {
      onChange('rpe', suggestion.rpe.toString())
    }
    setShowSuggestion(false)
  }

  const applyQuickAdjustment = (adjustment: QuickAdjustment) => {
    onChange('weightKg', adjustment.weightKg.toString())
    onChange('reps', adjustment.reps.toString())
  }

  const adjustValue = (field: string, delta: number) => {
    const current = field === 'weightKg' ? parseFloat(weightKg) || 0 :
                    field === 'reps' ? parseInt(reps) || 0 :
                    parseFloat(rpe) || 0

    const increment = field === 'weightKg' ? 1.25 :
                     field === 'reps' ? 1 :
                     0.5

    const newValue = Math.max(0, current + (delta * increment))
    onChange(field, field === 'reps' ? Math.floor(newValue).toString() : newValue.toString())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && weightKg && reps) {
      onSubmit()
    }
  }

  const isReadyToSubmit = weightKg && reps && !isSubmitting

  return (
    <div className="space-y-6">
      {/* Suggestion Banner */}
      {suggestion && showSuggestion && (
        <div className={cn(
          "p-4 rounded-2xl border-2 border-dashed transition-all duration-300",
          suggestion.confidence === 'high' ? "border-green-300 bg-green-50" :
          suggestion.confidence === 'medium' ? "border-blue-300 bg-blue-50" :
          "border-yellow-300 bg-yellow-50"
        )}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center",
                suggestion.confidence === 'high' ? "bg-green-100" :
                suggestion.confidence === 'medium' ? "bg-blue-100" :
                "bg-yellow-100"
              )}>
                <Lightning className={cn(
                  "h-4 w-4",
                  suggestion.confidence === 'high' ? "text-green-600" :
                  suggestion.confidence === 'medium' ? "text-blue-600" :
                  "text-yellow-600"
                )} />
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">
                  Smart Suggestion for Set #{setNumber}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {suggestion.weightKg}kg × {suggestion.reps} reps
                  {suggestion.rpe && ` @ RPE ${suggestion.rpe}`}
                </div>
                <div className="text-xs text-gray-500">
                  {suggestion.reason}
                </div>
              </div>
            </div>
            <Button
              onClick={applySuggestion}
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
            >
              Apply
            </Button>
          </div>
        </div>
      )}

      {/* Smart Input Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Weight Input with Quick Adjustments */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Weight (kg)</Label>
          <div className="space-y-2">
            <div className="relative">
              <Input
                type="number"
                placeholder="80"
                value={weightKg}
                onChange={(e) => onChange('weightKg', e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 font-mono text-base bg-white border-gray-200 rounded-xl pr-16"
                step="1.25"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onButtonPress()
                    adjustValue('weightKg', -1)
                  }}
                  className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <Minus className="h-3 w-3 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onButtonPress()
                    adjustValue('weightKg', 1)
                  }}
                  className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <Plus className="h-3 w-3 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Quick Weight Adjustments */}
            {quickAdjustments && (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onButtonPress()
                    applyQuickAdjustment(quickAdjustments.decreaseWeight)
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {quickAdjustments.decreaseWeight.label}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onButtonPress()
                    applyQuickAdjustment(quickAdjustments.increaseWeight)
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {quickAdjustments.increaseWeight.label}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reps Input with Quick Adjustments */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Reps</Label>
          <div className="space-y-2">
            <div className="relative">
              <Input
                type="number"
                placeholder="8"
                value={reps}
                onChange={(e) => onChange('reps', e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 font-mono text-base bg-white border-gray-200 rounded-xl pr-16"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={() => adjustValue('reps', -1)}
                  className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Minus className="h-3 w-3 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue('reps', 1)}
                  className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Plus className="h-3 w-3 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Quick Rep Adjustments */}
            {quickAdjustments && (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => applyQuickAdjustment(quickAdjustments.decreaseReps)}
                  className="flex-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  {quickAdjustments.decreaseReps.label}
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickAdjustment(quickAdjustments.increaseReps)}
                  className="flex-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  {quickAdjustments.increaseReps.label}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RPE Input with Quick Adjustments */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">RPE (1-10)</Label>
          <div className="relative">
            <Input
              type="number"
              placeholder="8"
              min="1"
              max="10"
              step="0.5"
              value={rpe}
              onChange={(e) => onChange('rpe', e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12 font-mono text-base bg-white border-gray-200 rounded-xl pr-16"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <button
                type="button"
                onClick={() => adjustValue('rpe', -1)}
                className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Minus className="h-3 w-3 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => adjustValue('rpe', 1)}
                className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Plus className="h-3 w-3 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Tempo Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Tempo</Label>
          <Input
            placeholder="3-1-1"
            value={tempo}
            onChange={(e) => onChange('tempo', e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-12 font-mono text-base bg-white border-gray-200 rounded-xl"
          />
        </div>

        {/* Notes Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Notes</Label>
          <Input
            placeholder="Good form"
            value={notes}
            onChange={(e) => onChange('notes', e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-12 text-base bg-white border-gray-200 rounded-xl"
          />
        </div>
      </div>

      {/* Enhanced Submit Button */}
      <Button
        onClick={() => {
          if (isReadyToSubmit) {
            onSuccess()
            onSubmit()
          }
        }}
        disabled={!isReadyToSubmit}
        className={cn(
          "w-full h-14 font-medium text-base rounded-2xl transition-all duration-200 relative overflow-hidden",
          isReadyToSubmit
            ? "bg-gray-900 hover:bg-gray-800 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl btn-hover"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Logging Set #{setNumber}...
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <TrendUp className="h-5 w-5" />
            Log Set #{setNumber}
            {weightKg && reps && (
              <span className="text-sm opacity-75">
                ({weightKg}kg × {reps})
              </span>
            )}
          </div>
        )}
      </Button>
    </div>
  )
}