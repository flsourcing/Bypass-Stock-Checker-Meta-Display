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

function focusElement(element: HTMLElement) {
  element.focus({ preventScroll: true })
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
    if (direction === 'left' || direction === 'right') {
      nextElement = moveFocusSpatial(direction, focusables, current)
    } else {
      return false
    }
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

function paginateResults(direction: 'up' | 'down') {
  const target = direction === 'down' ? 'next' : 'prev'
  const button = document.querySelector<HTMLButtonElement>(
    `.results-pager [data-pager="${target}"]:not([disabled])`,
  )
  if (!button) {
    return false
  }
  button.click()
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

      const firstResult = document.querySelector<HTMLElement>('.results-header .focusable')
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
          const onResults = Boolean(document.querySelector('.results-screen'))

          if (onResults) {
            paginateResults(direction)
            break
          }

          moveFocus(direction)
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
