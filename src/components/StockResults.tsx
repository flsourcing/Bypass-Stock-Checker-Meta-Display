import { useEffect, useState } from 'react'
import type { StockCheckResponse } from '../types'

type StockResultsProps = {
  result: StockCheckResponse
  onBack: () => void
  onNewSearch: () => void
}

export default function StockResults({ result, onBack, onNewSearch }: StockResultsProps) {
  const [activeStore, setActiveStore] = useState(0)
  const storeCount = result.stores.length
  const store = result.stores[activeStore]

  useEffect(() => {
    setActiveStore(0)
  }, [result.sku, result.zipcode])

  useEffect(() => {
    const grid = document.querySelector<HTMLElement>('.results-store-panel .stock-grid')
    if (grid) {
      grid.scrollTop = 0
    }
  }, [activeStore])

  function showPreviousStore() {
    setActiveStore((index) => Math.max(0, index - 1))
  }

  function showNextStore() {
    setActiveStore((index) => Math.min(storeCount - 1, index + 1))
  }

  return (
    <section className="results-screen" aria-label="Stock results">
      <div className="results-header">
        <button type="button" className="back-button focusable" onClick={onBack}>
          ← Home
        </button>
        <button type="button" className="text-button focusable" onClick={onNewSearch}>
          New Search
        </button>
      </div>

      {store && (
        <article className="store-card glass-card results-store-panel" aria-live="polite">
          <div className="store-card-top">
            <div className="store-product-head">
              <p className="store-product-title">
                {result.product_name} - {result.sku}
              </p>
              <p className="store-index">
                Store {activeStore + 1} of {storeCount}
              </p>
            </div>
            {result.product_image && (
              <img
                className="store-product-thumb"
                src={result.product_image}
                alt={result.product_name}
              />
            )}
          </div>

          <h2 className="store-name">{store.store}</h2>
          <p className="store-address">{store.address}</p>

          <div className="store-stats">
            <p className="store-total">Est. Total: {store.estimated_total_stock}</p>
            {store.last_sale && (
              <p className="store-last-sale">
                Last Sale: {'display' in store.last_sale ? store.last_sale.display : ''}
              </p>
            )}
          </div>

          <div className="stock-grid">
            {store.stock_details.map((detail) => (
              <div className="stock-line" key={`${store.store}-${detail.size}`}>
                {detail.display}
              </div>
            ))}
          </div>
        </article>
      )}

      <div className="results-pager">
        <button
          type="button"
          className="pager-button focusable"
          data-pager="prev"
          disabled={activeStore === 0}
          onClick={showPreviousStore}
        >
          ↑ Prev
        </button>
        <span className="pager-label">
          {activeStore + 1} / {storeCount}
        </span>
        <button
          type="button"
          className="pager-button focusable"
          data-pager="next"
          disabled={activeStore >= storeCount - 1}
          onClick={showNextStore}
        >
          ↓ Next
        </button>
      </div>
    </section>
  )
}
