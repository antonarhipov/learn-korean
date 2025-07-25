import React from 'react'
import { logComponentError, globalErrorLogger } from '../utils/errorLogger'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Use comprehensive error logging system
    const errorId = logComponentError(
      this.props.componentName || 'Unknown Component',
      error,
      errorInfo
    )
    
    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId)
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">⚠️</div>
            <h2 className="error-boundary-title">
              {this.props.title || 'Something went wrong'}
            </h2>
            <p className="error-boundary-message">
              {this.props.message || 
                'We encountered an unexpected error. Please try again or reload the page.'}
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="error-boundary-details">
                <summary>Error Details (Development Mode)</summary>
                <div className="error-boundary-error-info">
                  <p><strong>Error ID:</strong> {this.state.errorId}</p>
                  <p><strong>Component:</strong> {this.props.componentName || 'Unknown'}</p>
                  <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="error-boundary-actions">
              <button 
                onClick={this.handleRetry}
                className="btn btn-primary"
              >
                Try Again
              </button>
              <button 
                onClick={this.handleReload}
                className="btn btn-outline"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary