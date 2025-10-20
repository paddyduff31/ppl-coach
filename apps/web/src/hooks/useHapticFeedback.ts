import { useCallback, createElement } from 'react'
import type { MouseEvent } from 'react'

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: HapticType) => {
    // Visual feedback through DOM manipulation
    const createVisualFeedback = (element: HTMLElement, feedbackType: HapticType) => {
      switch (feedbackType) {
        case 'light':
          element.style.transform = 'scale(1.02)'
          element.style.transition = 'transform 100ms ease-out'
          setTimeout(() => {
            element.style.transform = 'scale(1)'
          }, 100)
          break

        case 'medium':
          element.style.transform = 'scale(1.05)'
          element.style.transition = 'transform 150ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          setTimeout(() => {
            element.style.transform = 'scale(1)'
          }, 150)
          break

        case 'heavy':
          element.classList.add('animate-bounce-gentle')
          setTimeout(() => {
            element.classList.remove('animate-bounce-gentle')
          }, 300)
          break

        case 'success':
          element.classList.add('animate-success-pulse')
          element.classList.add('success-glow')
          setTimeout(() => {
            element.classList.remove('animate-success-pulse')
            element.classList.remove('success-glow')
          }, 600)
          break

        case 'warning':
          element.classList.add('animate-subtle-shake')
          element.style.borderColor = 'rgb(245, 158, 11)'
          setTimeout(() => {
            element.classList.remove('animate-subtle-shake')
            element.style.borderColor = ''
          }, 400)
          break

        case 'error':
          element.classList.add('animate-subtle-shake')
          element.classList.add('error-glow')
          setTimeout(() => {
            element.classList.remove('animate-subtle-shake')
            element.classList.remove('error-glow')
          }, 400)
          break
      }
    }

    // Try to use native haptic feedback if available (iOS Safari)
    if ('vibrate' in navigator) {
      let pattern: number[] = []

      switch (type) {
        case 'light':
          pattern = [50]
          break
        case 'medium':
          pattern = [100]
          break
        case 'heavy':
          pattern = [200]
          break
        case 'success':
          pattern = [100, 50, 100]
          break
        case 'warning':
          pattern = [50, 50, 50]
          break
        case 'error':
          pattern = [200, 100, 200]
          break
      }

      navigator.vibrate(pattern)
    }

    // Apply visual feedback to the currently focused or active element
    const activeElement = document.activeElement as HTMLElement
    if (activeElement && activeElement !== document.body) {
      createVisualFeedback(activeElement, type)
    }

    return Promise.resolve()
  }, [])

  // Haptic feedback for specific UI interactions
  const onButtonPress = useCallback(() => triggerHaptic('light'), [triggerHaptic])
  const onSuccess = useCallback(() => triggerHaptic('success'), [triggerHaptic])
  const onError = useCallback(() => triggerHaptic('error'), [triggerHaptic])
  const onWarning = useCallback(() => triggerHaptic('warning'), [triggerHaptic])
  const onToggle = useCallback(() => triggerHaptic('medium'), [triggerHaptic])
  const onSwipe = useCallback(() => triggerHaptic('light'), [triggerHaptic])

  return {
    triggerHaptic,
    onButtonPress,
    onSuccess,
    onError,
    onWarning,
    onToggle,
    onSwipe
  }
}

// Higher-order component to add haptic feedback to any element
export function withHapticFeedback(
  Component: React.ComponentType<any>,
  hapticType: HapticType = 'light'
) {
  return function HapticComponent(props: any) {
    const { triggerHaptic } = useHapticFeedback()

    const handleInteraction = useCallback((event: MouseEvent<HTMLElement>) => {
      triggerHaptic(hapticType)
      if (props.onClick) {
        props.onClick(event)
      }
    }, [triggerHaptic, props.onClick])

    return createElement(Component, { ...props, onClick: handleInteraction })
  }
}
