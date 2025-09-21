import React, { useState, useRef, useEffect } from 'react'
import { Trash, X } from '@phosphor-icons/react'
import { cn } from '../utils/utils'
import { useHapticFeedback } from '../hooks/useHapticFeedback'

interface SwipeToDeleteProps {
  children: React.ReactNode
  onDelete: () => void
  threshold?: number
  disabled?: boolean
  className?: string
}

export function SwipeToDelete({
  children,
  onDelete,
  threshold = 80,
  disabled = false,
  className
}: SwipeToDeleteProps) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showDeleteZone, setShowDeleteZone] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const currentX = useRef(0)
  const { triggerHaptic } = useHapticFeedback()

  const handleStart = (clientX: number) => {
    if (disabled) return
    startX.current = clientX
    setIsDragging(true)
  }

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled) return

    const deltaX = clientX - startX.current
    const clampedDeltaX = Math.min(0, deltaX) // Only allow left swipe

    currentX.current = clampedDeltaX
    setDragX(clampedDeltaX)

    // Show delete zone when swiped far enough
    if (Math.abs(clampedDeltaX) > threshold * 0.5 && !showDeleteZone) {
      setShowDeleteZone(true)
      triggerHaptic('light')
    } else if (Math.abs(clampedDeltaX) <= threshold * 0.5 && showDeleteZone) {
      setShowDeleteZone(false)
    }
  }

  const handleEnd = () => {
    if (!isDragging || disabled) return

    setIsDragging(false)

    // If swiped past threshold, trigger delete
    if (Math.abs(dragX) > threshold) {
      setIsDeleting(true)
      triggerHaptic('heavy')

      // Add animation delay before calling onDelete
      setTimeout(() => {
        onDelete()
      }, 300)
    } else {
      // Snap back
      setDragX(0)
      setShowDeleteZone(false)
    }
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  // Add global mouse move and up listeners when dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX)
      }

      const handleGlobalMouseUp = () => {
        handleEnd()
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging])

  const deleteProgress = Math.min(Math.abs(dragX) / threshold, 1)

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden cursor-grab select-none",
        isDragging && "cursor-grabbing",
        isDeleting && "animate-subtle-shake",
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Delete action zone */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex items-center justify-center transition-all duration-200",
          "bg-gradient-to-l from-red-500 to-red-600 text-white",
          showDeleteZone ? "w-20" : "w-0"
        )}
        style={{
          opacity: deleteProgress,
          transform: `translateX(${Math.abs(dragX)}px)`
        }}
      >
        <div className={cn(
          "flex items-center justify-center transition-all duration-200",
          deleteProgress > 0.8 ? "scale-110" : "scale-100"
        )}>
          {deleteProgress > 0.8 ? (
            <Trash className="h-6 w-6 animate-bounce-gentle" weight="bold" />
          ) : (
            <Trash className="h-5 w-5" />
          )}
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "relative z-10 transition-transform",
          isDeleting && "animate-fade-out opacity-0 scale-95",
          isDragging ? "duration-0" : "duration-300 ease-out"
        )}
        style={{
          transform: `translateX(${dragX}px)`,
          filter: showDeleteZone ? 'brightness(0.9)' : 'brightness(1)'
        }}
      >
        {children}
      </div>

      {/* Drag indicator */}
      {showDeleteZone && (
        <div className="absolute top-2 right-2 z-20">
          <div className={cn(
            "w-2 h-2 rounded-full bg-red-500 animate-pulse",
            deleteProgress > 0.8 && "bg-red-400 scale-125"
          )} />
        </div>
      )}

      {/* Delete confirmation overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-red-500/90 animate-spring-in">
          <div className="text-white text-center">
            <Trash className="h-8 w-8 mx-auto mb-2 animate-bounce-gentle" weight="bold" />
            <div className="text-sm font-medium">Deleting...</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper hook for managing swipe-to-delete lists
export function useSwipeToDelete<T>(items: T[], onItemDelete: (item: T, index: number) => void) {
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)

  const handleDelete = (item: T, index: number) => {
    setDeletingIndex(index)

    // Add a small delay for animation
    setTimeout(() => {
      onItemDelete(item, index)
      setDeletingIndex(null)
    }, 300)
  }

  return {
    deletingIndex,
    handleDelete,
    isDeleting: (index: number) => deletingIndex === index
  }
}