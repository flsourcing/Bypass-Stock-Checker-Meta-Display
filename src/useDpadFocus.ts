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

function scrollResults(direction: 'up' | 'down') {
  const container = document.querySelector<HTMLElement>('.results-scroll')
  if (!container) {
    return false
  }

  const maxScroll = container.scrollHeight - container.clientHeight
  if (maxScroll <= 0) {
    return false
  }

  const step = Math.max(96, Math.round(container.clientHeight * 0.45))
  const nextScroll =
    direction === 'down'
      ? Math.min(container.scrollTop + step, maxScroll)
      : Math.max(container.scrollTop - step, 0)

  if (nextScroll === container.scrollTop) {
    return false
  }

  container.scrollTop = nextScroll
  return true
}

function focusElement(element: HTMLElement) {
  element.focus({ preventScroll: true })
  element.scrollIntoView({ block: 'nearest', behavior: 'auto' })

  const scrollContainer = element.closest<HTMLElement>('.results-scroll')
  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()

    if (elementRect.bottom > containerRect.bottom - 8) {
      scrollContainer.scrollTop += elementRect.bottom - containerRect.bottom + 16
    } else if (elementRect.top < containerRect.top + 8) {
      scrollContainer.scrollTop -= containerRect.top - elementRect.top + 16
    }
  }
}

function moveFocusLinear(
  direction: Direction,
  focusables: HTMLElement[],
  currentIndex: number,
): HTMLElement | null {
  const nextIndex =
    direction === 'up' || direction === 'left'
      ? currentIndex > 0
        ? currentIndex - 1
        : focusables.length - 1
      : currentIndex < focusables.length - 1
        ? currentIndex + 1
        : 0

  return focusables[nextIndex] ?? null
}

function moveFocusSpatial(
  direction: Direction,
  focusables: HTMLElement[],
  current: HTMLElement,
): HTMLElement | null {
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
    return bestElement
  }

  const currentIndex = focusables.indexOf(current)
  if (currentIndex !== -1) {
    return moveFocusLinear(direction, focusables, currentIndex)
  }

  return null
}

function moveFocus(direction: Direction): boolean {
  const focusables = getFocusables()
  if (focusables.length === 0) {
    return false
  }

  const current = document.activeElement as HTMLElement
  const currentIndex = focusables.indexOf(current)
  if (currentIndex === -1) {
    focusElement(focusables[0])
    return true
  }

  const onResults = Boolean(document.querySelector('.results-screen'))
  let nextElement: HTMLElement | null = null

  if (current.closest('.keyboard-overlay')) {
    nextElement = moveFocusSpatial(direction, focusables, current)
  } else if (onResults) {
    nextElement = moveFocusSpatial(direction, focusables, current)
  } else {
    nextElement =
      moveFocusSpatial(direction, focusables, current) ??
      moveFocusLinear(direction, focusables, currentIndex)
  }

  if (!nextElement || nextElement === current) {
    return false
  }

  focusElement(nextElement)
  return true
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
        focusElement(firstKeyboardKey)
        return
      }

      const firstResult = document.querySelector<HTMLElement>('.results-scroll .focusable')
      if (firstResult) {
        focusElement(firstResult)
        return
      }

      const first = getFocusables()[0]
      if (first) {
        focusElement(first)
      }
    }, 150)

    return () => window.clearTimeout(timer)
  }, [refocusKey])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case DPAD.UP:
        case DPAD.DOWN: {
          event.preventDefault()
          const direction = event.key === DPAD.UP ? 'up' : 'down'
          const focusMoved = moveFocus(direction)
          if (!focusMoved && document.querySelector('.results-screen')) {
            scrollResults(direction)
          }
          break
        }
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
