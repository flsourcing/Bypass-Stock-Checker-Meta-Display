import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  error: string
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: '' }

  static getDerivedStateFromError(error: Error) {
    return { error: error.message || 'Unknown error' }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App render failed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <main className="error-screen">
          <h1>Bypass Stock Checker</h1>
          <p>Something went wrong loading the app.</p>
          <pre>{this.state.error}</pre>
        </main>
      )
    }

    return this.props.children
  }
}
