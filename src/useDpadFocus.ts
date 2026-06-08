import { useEffect } from 'react'

const DPAD = {
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  SELECT: 'Enter',
  BACK: 'Escape',
} as const

type Direction = 'up' | 'down' | 'left' | 'right'

function getFocusables() {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      '.focusable:not([disabled]):not([aria-disabled="true"])',
    ),
  ).filter((element) => !element.closest('[inert]') && element.getClientRects().length > 0)
}

function getCenter(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

function moveFocusLinear(direction: Direction, focusables: HTMLElement[], currentIndex: number) {
  const nextIndex =
    direction === 'up' || direction === 'left'
      ? currentIndex > 0
        ? currentIndex - 1
        : focusables.length - 1
      : currentIndex < focusables.length - 1
        ? currentIndex + 1
        : 0

  focusables[nextIndex]?.focus()
}

function moveFocusSpatial(direction: Direction, focusables: HTMLElement[], current: HTMLElement) {
  const currentCenter = getCenter(current)
  let bestElement: HTMLElement | null = null
  let bestScore = Infinity

  for (const candidate of focusables) {
    if (candidate === current) {
      continue
    }

    const candidateCenter = getCenter(candidate)
    const deltaX = candidateCenter.x - currentCenter.x
    const deltaY = candidateCenter.y - currentCenter.y
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    let primary = 0
    let secondary = 0

    if (direction === 'right') {
      if (deltaX <= 4) continue
      primary = deltaX
      secondary = absDeltaY
    } else if (direction === 'left') {
      if (deltaX >= -4) continue
      primary = -deltaX
      secondary = absDeltaY
    } else if (direction === 'down') {
      if (deltaY <= 4) continue
      primary = deltaY
      secondary = absDeltaX
    } else {
      if (deltaY >= -4) continue
      primary = -deltaY
      secondary = absDeltaX
    }

    const score = primary + secondary * 2.5
    if (score < bestScore) {
      bestScore = score
      bestElement = candidate
    }
  }

  if (bestElement) {
    bestElement.focus()
    return
  }

  const currentIndex = focusables.indexOf(current)
  if (currentIndex !== -1) {
    moveFocusLinear(direction, focusables, currentIndex)
  }
}

function moveFocus(direction: Direction) {
  const focusables = getFocusables()
  if (focusables.length === 0) {
    return
  }

  const current = document.activeElement as HTMLElement
  const currentIndex = focusables.indexOf(current)
  if (currentIndex === -1) {
    focusables[0].focus()
    return
  }

  if (current.closest('.keyboard-overlay')) {
    moveFocusSpatial(direction, focusables, current)
    return
  }

  moveFocusLinear(direction, focusables, currentIndex)
}

type UseDpadFocusOptions = {
  refocusKey?: string | number | boolean | null
  onBack?: () => void
}

export function useDpadFocus({ refocusKey, onBack }: UseDpadFocusOptions = {}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const firstKeyboardKey = document.querySelector<HTMLElement>(
        '.keyboard-overlay .keyboard-key.focusable',
      )
      if (firstKeyboardKey) {
        firstKeyboardKey.focus()
        return
      }
      getFocusables()[0]?.focus()
    }, 150)

    return () => window.clearTimeout(timer)
  }, [refocusKey])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case DPAD.UP:
          event.preventDefault()
          moveFocus('up')
          break
        case DPAD.DOWN:
          event.preventDefault()
          moveFocus('down')
          break
        case DPAD.LEFT:
          event.preventDefault()
          moveFocus('left')
          break
        case DPAD.RIGHT:
          event.preventDefault()
          moveFocus('right')
          break
        case DPAD.SELECT:
          if ((document.activeElement as HTMLElement | null)?.classList.contains('focusable')) {
            event.preventDefault()
            ;(document.activeElement as HTMLElement).click()
          }
          break
        case DPAD.BACK:
          if (onBack) {
            event.preventDefault()
            onBack()
          }
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onBack])
}
