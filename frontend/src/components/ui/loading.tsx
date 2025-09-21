import { cn } from '../../utils/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'default' | 'apple' | 'dots'
}

export function LoadingSpinner({
  size = 'md',
  className,
  variant = 'apple'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full bg-primary animate-bounce',
              size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : 'h-3 w-3'
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'apple') {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        {/* Main ring */}
        <div
          className={cn(
            'absolute inset-0 rounded-full border-2 border-gray-100 border-t-primary',
            sizeClasses[size]
          )}
          style={{
            animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite'
          }}
        />

        {/* Secondary ring for depth */}
        <div
          className={cn(
            'absolute inset-0 rounded-full border-2 border-transparent border-r-primary/30',
            sizeClasses[size]
          )}
          style={{
            animation: 'spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse'
          }}
        />

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'bg-primary rounded-full animate-pulse',
            size === 'sm' ? 'h-0.5 w-0.5' :
            size === 'md' ? 'h-1 w-1' : 'h-1.5 w-1.5'
          )} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-muted border-t-primary',
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
  variant?: 'default' | 'skeleton' | 'apple'
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({
  message = 'Loading...',
  className,
  variant = 'apple',
  size = 'lg'
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12'
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4 animate-pulse', sizeClasses[size], className)}>
        <div className="shimmer h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="shimmer h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="shimmer h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    )
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizeClasses[size],
      className
    )}>
      <LoadingSpinner
        size={size}
        variant={variant === 'apple' ? 'apple' : 'default'}
        className="mb-6"
      />
      <p className="text-muted-foreground font-medium animate-pulse transition-opacity duration-300">
        {message}
      </p>
    </div>
  )
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted/50',
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function SkeletonWorkoutCard() {
  return (
    <div className="glass rounded-2xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-12 w-32 rounded-lg" />
      </div>
    </div>
  )
}