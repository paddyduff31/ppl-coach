import React from 'react'
import { cn } from '../../utils/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circle' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'shimmer' | 'wave'
}

export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  animation = 'shimmer',
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]"

  const variantStyles = {
    default: 'rounded-xl',
    text: 'rounded-md h-4',
    circle: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  const animationStyles = {
    pulse: 'animate-pulse',
    shimmer: 'shimmer',
    wave: 'animate-pulse shimmer'
  }

  const computedStyle = {
    ...style,
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height })
  }

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={computedStyle}
      {...props}
    />
  )
}

// Pre-built skeleton components for common use cases
export function SkeletonText({
  lines = 1,
  className,
  ...props
}: { lines?: number } & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? "75%" : "100%"}
          {...props}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circle" width={40} height={40} {...props} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="60%" {...props} />
          <Skeleton variant="text" width="40%" {...props} />
        </div>
      </div>
      <SkeletonText lines={3} {...props} />
    </div>
  )
}

export function SkeletonWorkoutCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("bg-white rounded-3xl p-8 border border-gray-200/50 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" width={12} height={12} {...props} />
            <Skeleton variant="text" width={100} height={14} {...props} />
          </div>
          <Skeleton variant="text" width={200} height={24} {...props} />
          <Skeleton variant="text" width={150} height={16} {...props} />
        </div>
        <Skeleton variant="rectangular" width={120} height={40} {...props} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center space-y-3">
            <Skeleton variant="circle" width={40} height={40} className="mx-auto" {...props} />
            <Skeleton variant="text" width={40} height={20} className="mx-auto" {...props} />
            <Skeleton variant="text" width={60} height={14} className="mx-auto" {...props} />
          </div>
        ))}
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton variant="text" width={180} height={20} {...props} />
                <Skeleton variant="text" width={120} height={16} {...props} />
              </div>
              <Skeleton variant="rectangular" width={80} height={32} {...props} />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 2 }, (_, j) => (
                <div key={j} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <Skeleton variant="circle" width={32} height={32} {...props} />
                    <Skeleton variant="text" width={100} height={16} {...props} />
                  </div>
                  <Skeleton variant="rectangular" width={60} height={24} {...props} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonDashboard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("min-h-screen bg-white", className)}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="pt-16 pb-12 px-8 border-b border-gray-100">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Skeleton variant="circle" width={8} height={8} {...props} />
              <Skeleton variant="text" width={120} height={14} {...props} />
            </div>
            <Skeleton variant="text" width={300} height={40} className="mx-auto" {...props} />
            <Skeleton variant="text" width={400} height={20} className="mx-auto" {...props} />
          </div>
        </div>

        {/* Main Action */}
        <div className="px-8 py-12">
          <div className="bg-gray-50 rounded-3xl p-12 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton variant="rectangular" width={48} height={48} {...props} />
                  <div className="space-y-2">
                    <Skeleton variant="text" width={120} height={24} {...props} />
                    <Skeleton variant="text" width={180} height={16} {...props} />
                  </div>
                </div>
              </div>
              <Skeleton variant="rectangular" width={140} height={56} {...props} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-8 pb-12">
          <div className="grid md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-200/50 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton variant="circle" width={40} height={40} {...props} />
                  <Skeleton variant="text" width={80} height={14} {...props} />
                </div>
                <Skeleton variant="text" width={60} height={32} {...props} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-8 pb-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-200/50 space-y-6">
                <div className="flex items-center justify-between">
                  <Skeleton variant="rectangular" width={48} height={48} {...props} />
                  <Skeleton variant="circle" width={20} height={20} {...props} />
                </div>
                <div className="space-y-2">
                  <Skeleton variant="text" width={140} height={20} {...props} />
                  <Skeleton variant="text" width={100} height={16} {...props} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}