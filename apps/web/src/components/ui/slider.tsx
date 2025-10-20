import * as React from 'react'
import { cn } from '../../utils/utils'

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  max?: number
  min?: number
  step?: number
  className?: string
}

export function Slider({ value, onValueChange, max = 100, min = 0, step = 1, className }: SliderProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([Number(event.target.value)])
  }

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 slider"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(value[0] / max) * 100}%, #e5e7eb ${(value[0] / max) * 100}%, #e5e7eb 100%)`
        }}
      />
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  )
}
