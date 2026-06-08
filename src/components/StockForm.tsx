import type { ActiveField, Brand } from '../types'

type StockFormProps = {
  brand: Brand
  sku: string
  zipcode: string
  loading: boolean
  error: string
  activeField: ActiveField
  onSkuClick: () => void
  onZipcodeClick: () => void
  onSubmit: () => void
  onBack: () => void
}

export default function StockForm({
  brand,
  sku,
  zipcode,
  loading,
  error,
  activeField,
  onSkuClick,
  onZipcodeClick,
  onSubmit,
  onBack,
}: StockFormProps) {
  const brandLabel = brand === 'nike' ? 'Nike' : 'Adidas'
  const keyboardOpen = activeField !== null

  return (
    <section
      className={`form-screen${keyboardOpen ? ' form-screen-keyboard-open' : ''}`}
      aria-label={`${brandLabel} stock check`}
      {...(keyboardOpen ? { inert: true } : {})}
    >
      {!keyboardOpen && (
        <button type="button" className="back-button focusable" onClick={onBack}>
          ← Back
        </button>
      )}

      <p className="eyebrow">Bypass Stock Checker</p>
      <h1>{brandLabel} Instore Stock</h1>

      {keyboardOpen ? (
        <div className="active-field-preview" aria-live="polite">
          <span>{activeField === 'sku' ? 'SKU or UPC' : 'Zipcode'}</span>
          <strong>{activeField === 'sku' ? (sku || '—') : (zipcode || '—')}</strong>
        </div>
      ) : (
        <div className="input-stack">
          <label className="input-field">
            <span>SKU or UPC</span>
            <button type="button" className="input-display focusable" onClick={onSkuClick}>
              {sku || 'Tap to enter SKU'}
            </button>
          </label>

          <label className="input-field">
            <span>Zipcode</span>
            <button type="button" className="input-display focusable" onClick={onZipcodeClick}>
              {zipcode || 'Tap to enter zipcode'}
            </button>
          </label>
        </div>
      )}

      {error && !keyboardOpen && <p className="status-message error">{error}</p>}

      {!keyboardOpen && (
        <button
          type="button"
          className="primary-button focusable"
          disabled={loading || !sku.trim() || !zipcode.trim()}
          onClick={onSubmit}
        >
          {loading ? 'Checking...' : 'Check Stock'}
        </button>
      )}
    </section>
  )
}
