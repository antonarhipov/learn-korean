import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { globalPerformanceMonitor } from './utils/performanceMonitor.js'
import { globalErrorTracker } from './utils/errorTracker.js'
import './styles/index.css'

// Initialize performance monitoring and error tracking
globalPerformanceMonitor
globalErrorTracker

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary
      componentName="Application Root"
      title="Application Error"
      message="The Korean learning application encountered a critical error. Please refresh the page to continue."
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)