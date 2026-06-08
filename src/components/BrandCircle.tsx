import type { Brand } from '../types'

type BrandCircleProps = {
  brand: Brand
  label: string
  onSelect: () => void
}

export default function BrandCircle({ brand, label, onSelect }: BrandCircleProps) {
  return (
    <button
      type="button"
      className={`brand-circle brand-circle-${brand}`}
      data-focusable
      onClick={onSelect}
      aria-label={`Check ${label} stock`}
    >
      <span className="brand-circle-inner">
        <span className="brand-circle-text">{label}</span>
      </span>
    </button>
  )
}
