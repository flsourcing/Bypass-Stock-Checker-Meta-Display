import type { StockCheckResponse } from '../types'

type StockResultsProps = {
  result: StockCheckResponse
  onBack: () => void
  onNewSearch: () => void
}

export default function StockResults({ result, onBack, onNewSearch }: StockResultsProps) {
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

      <div className="results-scroll">
        <article className="product-card glass-card">
          {result.product_image && (
            <img
              className="product-image"
              src={result.product_image}
              alt={result.product_name}
            />
          )}
          <h1>{result.product_name}</h1>
          <p className="product-meta">{result.sku} · {result.zipcode}</p>
          <a
            className="product-link focusable"
            href={result.product_link}
            target="_blank"
            rel="noreferrer"
          >
            Product Link
          </a>
        </article>

        <div className="store-list">
          {result.stores.map((store, index) => (
            <article
              className="store-card glass-card focusable"
              key={`${store.store}-${store.address}`}
              tabIndex={-1}
              aria-label={`Store ${index + 1}: ${store.store}`}
            >
              <p className="store-index">Store {index + 1} of {result.stores.length}</p>
              <h2>{store.store}</h2>
              <p className="store-address">{store.address}</p>
              <p className="store-total">Est. Total: {store.estimated_total_stock}</p>

              {store.last_sale && (
                <p className="store-last-sale">
                  Last Sale: {'display' in store.last_sale ? store.last_sale.display : ''}
                </p>
              )}

              <div className="stock-grid">
                {store.stock_details.map((detail) => (
                  <div className="stock-line" key={`${store.store}-${detail.size}`}>
                    {detail.display}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <p className="results-scroll-hint">Swipe down or use ↓ to scroll through stores</p>
      </div>
    </section>
  )
}
