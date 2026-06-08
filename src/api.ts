import type { Brand, StockCheckResponse } from './types'

const NIKE_API = import.meta.env.VITE_NIKE_STOCK_API_URL
  ?? 'https://nike-stock-checker-railway-cloud-stock-checking-cloud.up.railway.app'

const ADIDAS_API = import.meta.env.VITE_ADIDAS_STOCK_API_URL
  ?? 'https://adidas-stock-checker-railway-cloud-stock-checking-cloud.up.railway.app'

export async function fetchStockCheck(
  brand: Brand,
  sku: string,
  zipcode: string,
): Promise<StockCheckResponse> {
  const base = brand === 'nike' ? NIKE_API : ADIDAS_API
  const path = brand === 'nike' ? '/nike-instore-stock' : '/adidas-instore-stock'

  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sku, zipcode }),
  })

  const data = await response.json() as StockCheckResponse
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`)
  }
  if (!data.ok) {
    throw new Error(data.error ?? 'Stock check failed')
  }
  return data
}
