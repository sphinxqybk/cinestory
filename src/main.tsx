import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.tsx'
import '../styles/globals.css'

// Error boundary for production
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CineStory AI Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #050508 50%, #000000 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: 'Sukhumvit Set, system-ui, sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff5cc7' }}>
              🎬 CineStory AI
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '2rem' }}>
              Something went wrong. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #1a1a24 0%, #12121a 100%)',
                border: '1px solid #6bc7ff',
                color: '#6bc7ff',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Performance monitoring
const startTime = performance.now()

// Initialize app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

// Log performance metrics
window.addEventListener('load', () => {
  const loadTime = performance.now() - startTime
  console.log(`🎬 CineStory AI loaded in ${Math.round(loadTime)}ms`)
  
  // Web Vitals tracking
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log(`LCP: ${entry.startTime}ms`)
        }
        if (entry.entryType === 'first-input') {
          console.log(`FID: ${entry.processingStart - entry.startTime}ms`)
        }
      })
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] })
  }
})