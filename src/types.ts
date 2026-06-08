export type Brand = 'nike' | 'adidas'

export type LinkPair = {
  label: string
  url: string
}

export type StockDetail = {
  size: string
  level: string
  updated_at?: string
  updated_at_display?: string
  display: string
}

export type LastSale = {
  size: string
  level: string
  updated_at?: string
  updated_at_display?: string
  display: string
}

export type StoreResult = {
  store: string
  address: string
  stock_details: StockDetail[]
  last_sale?: LastSale | StockDetail | null
  estimated_total_stock: number
}

export type StockCheckResponse = {
  ok: boolean
  sku: string
  zipcode: string
  product_name: string
  product_image?: string
  product_link: string
  nike_links?: LinkPair[]
  adidas_links?: LinkPair[]
  resell_links: LinkPair[]
  stores: StoreResult[]
  error?: string
}

export type ActiveField = 'sku' | 'zipcode' | null

export type Screen = 'home' | 'form' | 'results'
