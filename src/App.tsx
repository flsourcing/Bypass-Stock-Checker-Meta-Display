import { useEffect, useState } from 'react'
import './App.css'
import { fetchStockCheck } from './api'
import BrandCircle from './components/BrandCircle'
import KeyboardOverlay from './components/KeyboardOverlay'
import StockForm from './components/StockForm'
import StockResults from './components/StockResults'
import type { ActiveField, Brand, Screen, StockCheckResponse } from './types'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [brand, setBrand] = useState<Brand>('nike')
  const [sku, setSku] = useState('')
  const [zipcode, setZipcode] = useState('')
  const [activeField, setActiveField] = useState<ActiveField>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<StockCheckResponse | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const firstFocusable = document.querySelector<HTMLElement>('[data-focusable]')
      firstFocusable?.focus()
    }, 150)

    return () => window.clearTimeout(timer)
  }, [screen, activeField])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const focusableElements = Array.from(
        document.querySelectorAll<HTMLElement>('[data-focusable]'),
      )
      const currentIndex = focusableElements.findIndex((element) => element === document.activeElement)

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault()
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % focusableElements.length
        focusableElements[nextIndex]?.focus()
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault()
        const nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
        focusableElements[nextIndex]?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function openBrand(nextBrand: Brand) {
    setBrand(nextBrand)
    setSku('')
    setZipcode('')
    setError('')
    setResult(null)
    setActiveField(null)
    setScreen('form')
  }

  function goHome() {
    setScreen('home')
    setActiveField(null)
    setError('')
    setLoading(false)
  }

  function resetSearch() {
    setSku('')
    setZipcode('')
    setResult(null)
    setError('')
    setActiveField(null)
    setScreen('form')
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    setActiveField(null)

    try {
      const data = await fetchStockCheck(brand, sku.trim(), zipcode.trim())
      setResult(data)
      setScreen('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stock check failed')
    } finally {
      setLoading(false)
    }
  }

  function keyboardValue() {
    if (activeField === 'sku') return sku
    if (activeField === 'zipcode') return zipcode
    return ''
  }

  function keyboardLabel() {
    if (activeField === 'sku') return 'SKU or UPC'
    if (activeField === 'zipcode') return 'Zipcode'
    return ''
  }

  function updateKeyboardValue(next: string) {
    if (activeField === 'sku') {
      setSku(next.toUpperCase())
      return
    }
    if (activeField === 'zipcode') {
      setZipcode(next.replace(/\D/g, '').slice(0, 5))
    }
  }

  return (
    <main className={`app-shell ${activeField ? 'keyboard-open' : ''}`}>
      {screen === 'home' && (
        <section className="home-screen" aria-label="Choose brand">
          <p className="eyebrow">Bypass Stock Checker</p>
          <h1>Instore Stock</h1>
          <div className="brand-row">
            <BrandCircle brand="nike" label="Nike" onSelect={() => openBrand('nike')} />
            <BrandCircle brand="adidas" label="Adidas" onSelect={() => openBrand('adidas')} />
          </div>
        </section>
      )}

      {screen === 'form' && (
        <StockForm
          brand={brand}
          sku={sku}
          zipcode={zipcode}
          loading={loading}
          error={error}
          activeField={activeField}
          onSkuClick={() => setActiveField('sku')}
          onZipcodeClick={() => setActiveField('zipcode')}
          onSubmit={() => void handleSubmit()}
          onBack={goHome}
        />
      )}

      {screen === 'results' && result && (
        <StockResults
          result={result}
          onBack={goHome}
          onNewSearch={resetSearch}
        />
      )}

      {activeField && (
        <KeyboardOverlay
          value={keyboardValue()}
          label={keyboardLabel()}
          onChange={updateKeyboardValue}
          onClose={() => setActiveField(null)}
        />
      )}
    </main>
  )
}

export default App
