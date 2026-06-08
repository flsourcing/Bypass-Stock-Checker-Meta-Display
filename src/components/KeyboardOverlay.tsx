type KeyboardOverlayProps = {
  value: string
  label: string
  onChange: (next: string) => void
  onClose: () => void
}

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '-', '.'],
]

export default function KeyboardOverlay({
  value,
  label,
  onChange,
  onClose,
}: KeyboardOverlayProps) {
  function appendKey(key: string) {
    onChange(value + key)
  }

  function backspace() {
    onChange(value.slice(0, -1))
  }

  function clearValue() {
    onChange('')
  }

  return (
    <div
      className="keyboard-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Keyboard for ${label}`}
    >
      <div className="keyboard-header">
        <span className="keyboard-label">{label}</span>
        <div className="keyboard-preview" aria-label={label}>
          {value || ' '}
        </div>
        <button type="button" className="keyboard-done focusable" onClick={onClose}>
          Done
        </button>
      </div>

      <div className="keyboard-rows">
        {ROWS.map((row) => (
          <div className="keyboard-row" key={row.join('-')}>
            {row.map((key) => (
              <button
                key={key}
                type="button"
                className="keyboard-key focusable"
                onClick={() => appendKey(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}

        <div className="keyboard-row keyboard-actions">
          <button
            type="button"
            className="keyboard-key keyboard-key-wide focusable"
            onClick={() => appendKey(' ')}
          >
            Space
          </button>
          <button type="button" className="keyboard-key focusable" onClick={backspace}>
            ⌫
          </button>
          <button
            type="button"
            className="keyboard-key keyboard-clear focusable"
            onClick={clearValue}
            aria-label="Clear input"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
