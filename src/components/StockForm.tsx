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

  return (
    <section className="form-screen" aria-label={`${brandLabel} stock check`}>
      <button type="button" className="back-button" data-focusable onClick={onBack}>
        ← Back
      </button>

      <p className="eyebrow">Bypass Stock Checker</p>
      <h1>{brandLabel} Instore Stock</h1>

      <div className="input-stack">
        <label className={`input-field ${activeField === 'sku' ? 'active' : ''}`}>
          <span>SKU or UPC</span>
          <button
            type="button"
            className="input-display"
            data-focusable
            onClick={onSkuClick}
          >
            {sku || 'Tap to enter SKU'}
          </button>
        </label>

        <label className={`input-field ${activeField === 'zipcode' ? 'active' : ''}`}>
          <span>Zipcode</span>
          <button
            type="button"
            className="input-display"
            data-focusable
            onClick={onZipcodeClick}
          >
            {zipcode || 'Tap to enter zipcode'}
          </button>
        </label>
      </div>

      {error && <p className="status-message error">{error}</p>}

      <button
        type="button"
        className="primary-button"
        data-focusable
        disabled={loading || !sku.trim() || !zipcode.trim()}
        onClick={onSubmit}
      >
        {loading ? 'Checking...' : 'Check Stock'}
      </button>
    </section>
  )
}
