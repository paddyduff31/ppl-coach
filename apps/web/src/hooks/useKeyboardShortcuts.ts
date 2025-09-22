import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.metaKey === event.metaKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.shiftKey === event.shiftKey
        )
      })

      if (matchingShortcut) {
        event.preventDefault()
        matchingShortcut.action()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])

  // Helper to format shortcut display
  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const parts = []
    if (shortcut.metaKey) parts.push('⌘')
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.shiftKey) parts.push('⇧')
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
  }

  return { formatShortcut }
}

// Global shortcuts that work across the app
export function useGlobalShortcuts() {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      metaKey: true,
      action: () => {
        // Quick search/command palette
        console.log('Quick search triggered')
      },
      description: 'Quick search'
    },
    {
      key: 'n',
      metaKey: true,
      action: () => {
        // New workout
        window.location.href = '/'
      },
      description: 'Start new workout'
    },
    {
      key: 'h',
      metaKey: true,
      action: () => {
        // Go to history
        window.location.href = '/history'
      },
      description: 'View workout history'
    },
    {
      key: 'p',
      metaKey: true,
      action: () => {
        // Go to progress
        window.location.href = '/progress'
      },
      description: 'View progress'
    }
  ]

  useKeyboardShortcuts(shortcuts)

  return shortcuts
}