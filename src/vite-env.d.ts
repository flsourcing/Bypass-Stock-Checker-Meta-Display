/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NIKE_STOCK_API_URL?: string
  readonly VITE_ADIDAS_STOCK_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
