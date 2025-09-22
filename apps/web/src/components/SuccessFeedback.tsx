import React, { useState, useEffect } from 'react'
import { CheckCircle, TrendUp, Target, Lightning } from '@phosphor-icons/react'
import { cn } from '../utils/utils'
import { useHapticFeedback } from '../hooks/useHapticFeedback'

interface SuccessFeedbackProps {
  show: boolean
  onComplete: () => void
  type?: 'set_logged' | 'workout_complete' | 'pr_achieved' | 'streak_milestone'
  message?: string
  details?: string
}

const feedbackConfig = {
  set_logged: {
    icon: CheckCircle,
    title: 'Set Logged!',
    color: 'green',
    bgGradient: 'from-green-400 to-green-600',
    animation: 'spring-scale',
    haptic: 'success' as const,
    duration: 1500
  },
  workout_complete: {
    icon: Target,
    title: 'Workout Complete!',
    color: 'blue',
    bgGradient: 'from-blue-400 to-blue-600',
    animation: 'spring-in',
    haptic: 'heavy' as const,
    duration: 2500
  },
  pr_achieved: {
    icon: TrendUp,
    title: 'New PR! 🎉',
    color: 'purple',
    bgGradient: 'from-purple-400 via-pink-500 to-red-500',
    animation: 'spring-scale',
    haptic: 'heavy' as const,
    duration: 3000
  },
  streak_milestone: {
    icon: Lightning,
    title: 'Streak Milestone!',
    color: 'orange',
    bgGradient: 'from-orange-400 to-red-500',
    animation: 'spring-in',
    haptic: 'success' as const,
    duration: 2000
  }
}

export function SuccessFeedback({
  show,
  onComplete,
  type = 'set_logged',
  message,
  details
}: SuccessFeedbackProps) {
  const [visible, setVisible] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const { triggerHaptic } = useHapticFeedback()

  const config = feedbackConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (show) {
      // Trigger haptic feedback
      triggerHaptic(config.haptic)

      setVisible(true)
      setIsExiting(false)

      // Trigger entrance animation
      setTimeout(() => setAnimate(true), 50)

      // Start exit animation
      const exitTimer = setTimeout(() => {
        setIsExiting(true)
        setAnimate(false)
      }, config.duration - 400)

      // Complete hide
      const hideTimer = setTimeout(() => {
        setVisible(false)
        onComplete()
      }, config.duration)

      return () => {
        clearTimeout(exitTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [show, onComplete, config.duration, config.haptic, triggerHaptic])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div
        className={cn(
          "relative overflow-hidden bg-white rounded-3xl shadow-2xl border p-8 text-center pointer-events-auto backdrop-blur-xl",
          "transition-all duration-500 ease-out",
          animate && !isExiting && `animate-${config.animation}`,
          isExiting && "opacity-0 scale-90 transform translate-y-4",
          !animate && !isExiting && "scale-90 opacity-0"
        )}
      >
        {/* Enhanced background for PR achievements */}
        {type === 'pr_achieved' && animate && (
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-10 animate-pulse",
            config.bgGradient
          )} />
        )}

        {/* Icon with enhanced styling */}
        <div className={cn(
          "relative w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6",
          "backdrop-blur-sm border border-white/20 shadow-lg",
          `bg-gradient-to-br ${config.bgGradient}`,
          type === 'pr_achieved' && animate && "animate-success-pulse"
        )}>
          <Icon className="h-10 w-10 text-white" weight="bold" />

          {/* Success ring for important achievements */}
          {(type === 'pr_achieved' || type === 'workout_complete') && animate && (
            <div className="absolute inset-0 w-20 h-20 border-4 border-white/30 rounded-3xl animate-success-pulse" />
          )}
        </div>

        <h3 className={cn(
          "font-bold text-gray-900 mb-3 tracking-tight",
          type === 'pr_achieved' ? "text-3xl" : "text-2xl"
        )}>
          {message || config.title}
        </h3>

        {details && (
          <p className="text-gray-600 text-lg font-medium">
            {details}
          </p>
        )}

        {/* Enhanced celebration effect for PR */}
        {type === 'pr_achieved' && animate && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-2 h-2 rounded-full animate-ping",
                  i % 4 === 0 ? "bg-purple-400" :
                  i % 4 === 1 ? "bg-pink-400" :
                  i % 4 === 2 ? "bg-red-400" : "bg-orange-400"
                )}
                style={{
                  left: `${15 + (i * 7)}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        )}

        {/* Shimmer effect for special achievements */}
        {(type === 'pr_achieved' || type === 'streak_milestone') && animate && (
          <div className="absolute inset-0 shimmer opacity-20 rounded-3xl" />
        )}
      </div>

      {/* Enhanced backdrop with blur */}
      <div className={cn(
        "absolute inset-0 backdrop-blur-md transition-all duration-500",
        animate ? "bg-black/30" : "bg-black/0"
      )} />
    </div>
  )
}

// Hook for easy success feedback management
export function useSuccessFeedback() {
  const [feedback, setFeedback] = useState<{
    show: boolean
    type: SuccessFeedbackProps['type']
    message?: string
    details?: string
  }>({
    show: false,
    type: 'set_logged'
  })

  const showSuccess = (
    type: SuccessFeedbackProps['type'],
    message?: string,
    details?: string
  ) => {
    setFeedback({ show: true, type, message, details })
  }

  const hideSuccess = () => {
    setFeedback(prev => ({ ...prev, show: false }))
  }

  return {
    feedback,
    showSuccess,
    hideSuccess
  }
}