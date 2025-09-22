import * as React from "react"
import { cn } from '../../utils/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'apple' | 'floating'
  label?: string
  error?: string
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', label, error, success, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value.length > 0)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    if (variant === 'floating') {
      return (
        <div className="relative group">
          <input
            type={type}
            className={cn(
              "peer h-12 w-full rounded-xl border border-gray-200 bg-white px-4 pt-5 pb-2 text-base",
              "transition-all duration-200 ease-out",
              "focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none",
              "placeholder-transparent",
              error && "border-red-300 focus:border-red-500 focus:ring-red-100",
              success && "border-green-300 focus:border-green-500 focus:ring-green-100",
              className
            )}
            placeholder={label || props.placeholder}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          {label && (
            <label className={cn(
              "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 transition-all duration-200 pointer-events-none",
              "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400",
              "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
              (isFocused || hasValue) && "top-2 text-xs text-blue-600",
              error && "peer-focus:text-red-600"
            )}>
              {label}
            </label>
          )}
          {error && (
            <div className="mt-1 text-sm text-red-600 animate-spring-in">
              {error}
            </div>
          )}
        </div>
      )
    }

    if (variant === 'apple') {
      return (
        <div className="relative">
          <input
            type={type}
            className={cn(
              "h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base",
              "transition-all duration-200 ease-out input-focus",
              "focus:border-blue-300 focus:ring-4 focus:ring-blue-50 focus:outline-none",
              "hover:border-gray-300",
              "placeholder:text-gray-400",
              error && "border-red-300 focus:border-red-400 focus:ring-red-50 animate-subtle-shake",
              success && "border-green-300 focus:border-green-400 focus:ring-green-50",
              isFocused && "transform scale-[1.01]",
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Focus glow effect */}
          {isFocused && (
            <div className="absolute inset-0 rounded-xl pointer-events-none">
              <div className="absolute inset-0 rounded-xl bg-blue-500/10 animate-pulse" />
            </div>
          )}

          {error && (
            <div className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-spring-in">
              <div className="w-1 h-1 bg-red-500 rounded-full" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-2 text-sm text-green-600 flex items-center gap-2 animate-spring-in">
              <div className="w-1 h-1 bg-green-500 rounded-full" />
              Looking good!
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }