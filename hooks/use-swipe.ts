import { useEffect, useRef, useState } from 'react'

interface SwipeConfig {
  minSwipeDistance?: number
  maxSwipeTime?: number
}

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export function useSwipe(
  elementRef: React.RefObject<HTMLElement>,
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) {
  const { minSwipeDistance = 50, maxSwipeTime = 500 } = config
  const [isSwiping, setIsSwiping] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const isHorizontalSwipeRef = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }
      isHorizontalSwipeRef.current = false
      setIsSwiping(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)

      // Only prevent default for horizontal swipes
      if (deltaX > deltaY && deltaX > 10) {
        isHorizontalSwipeRef.current = true
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      if (deltaTime < maxSwipeTime) {
        const absDeltaX = Math.abs(deltaX)
        const absDeltaY = Math.abs(deltaY)

        if (absDeltaX > minSwipeDistance && absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && handlers.onSwipeRight) {
            handlers.onSwipeRight()
          } else if (deltaX < 0 && handlers.onSwipeLeft) {
            handlers.onSwipeLeft()
          }
        } else if (absDeltaY > minSwipeDistance && absDeltaY > absDeltaX) {
          // Vertical swipe
          if (deltaY > 0 && handlers.onSwipeDown) {
            handlers.onSwipeDown()
          } else if (deltaY < 0 && handlers.onSwipeUp) {
            handlers.onSwipeUp()
          }
        }
      }

      touchStartRef.current = null
      isHorizontalSwipeRef.current = false
      setIsSwiping(false)
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, [elementRef, handlers, minSwipeDistance, maxSwipeTime])

  return { isSwiping }
} 