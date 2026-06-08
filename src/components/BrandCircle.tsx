import { useState } from 'react'
import type { Brand } from '../types'

type BrandCircleProps = {
  brand: Brand
  label: string
  onSelect: () => void
}

export default function BrandCircle({ brand, label, onSelect }: BrandCircleProps) {
  const [focused, setFocused] = useState(false)

  return (
    <button
      type="button"
      className={`brand-circle brand-circle-${brand} focusable${focused ? ' focused' : ''}`}
      onClick={onSelect}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      aria-label={`Check ${label} stock`}
    >
      <span className="brand-circle-inner">
        <span className="brand-circle-text">{label}</span>
      </span>
    </button>
  )
}
