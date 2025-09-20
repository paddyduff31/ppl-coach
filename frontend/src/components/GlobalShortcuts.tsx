import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CommandPalette } from './CommandPalette'

export function GlobalShortcuts() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }

      // Quick actions
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        navigate({ to: '/plan' })
      }

      // Navigation shortcuts (only when command palette is closed)
      if (!isCommandPaletteOpen && (e.metaKey || e.ctrlKey)) {
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault()
            navigate({ to: '/' })
            break
          case 'p':
            e.preventDefault()
            navigate({ to: '/progress' })
            break
          case 'y':
            e.preventDefault()
            navigate({ to: '/history' })
            break
          case 'e':
            e.preventDefault()
            navigate({ to: '/movements' })
            break
          case ',':
            e.preventDefault()
            navigate({ to: '/settings' })
            break
        }
      }

      // Close command palette on escape
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, isCommandPaletteOpen])

  return (
    <CommandPalette
      isOpen={isCommandPaletteOpen}
      onClose={() => setIsCommandPaletteOpen(false)}
    />
  )
}