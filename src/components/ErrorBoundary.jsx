import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[FarenZone ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <main className="page" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Algo salió mal</h1>
          <p style={{ marginBottom: '1rem', opacity: 0.7 }}>
            La página se encontró un error. Intenta recargar.
          </p>
          <pre style={{ textAlign: 'left', background: '#111', color: '#f55', padding: '1rem', borderRadius: 8, overflow: 'auto', maxWidth: 600, margin: '0 auto 1.5rem' }}>
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
            style={{ padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none', background: '#e60012', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}
          >
            Volver al inicio
          </button>
        </main>
      )
    }
    return this.props.children
  }
}
