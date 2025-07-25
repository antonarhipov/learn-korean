/**
 * Enhanced Error Tracking and Reporting System
 * Provides comprehensive error tracking capabilities for the Korean Language Learning Application
 */

import { logError, logWarning, logInfo, globalErrorLogger } from './errorLogger'

/**
 * Global Error Tracker Class
 */
export class ErrorTracker {
  constructor() {
    this.isInitialized = false
    this.errorQueue = []
    this.networkErrors = new Map()
    this.jsErrors = new Map()
    this.promiseRejections = new Map()
    
    // Initialize tracking
    this.initialize()
  }

  /**
   * Initialize error tracking
   */
  initialize() {
    if (this.isInitialized) return
    
    // Track JavaScript errors
    this.setupJavaScriptErrorTracking()
    
    // Track unhandled promise rejections
    this.setupPromiseRejectionTracking()
    
    // Track network errors
    this.setupNetworkErrorTracking()
    
    // Track resource loading errors
    this.setupResourceErrorTracking()
    
    // Track console errors
    this.setupConsoleErrorTracking()
    
    this.isInitialized = true
    logInfo('system', 'Error tracking system initialized', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }

  /**
   * Setup JavaScript error tracking
   */
  setupJavaScriptErrorTracking() {
    window.addEventListener('error', (event) => {
      const errorInfo = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
      
      // Log the error
      const errorId = logError('system', `JavaScript Error: ${event.message}`, errorInfo)
      
      // Store in tracking map
      this.jsErrors.set(errorId, errorInfo)
      
      // Add to error queue for batch processing
      this.errorQueue.push({
        type: 'javascript',
        errorId,
        ...errorInfo
      })
      
      console.error('Global JavaScript Error:', errorInfo)
    })
  }

  /**
   * Setup unhandled promise rejection tracking
   */
  setupPromiseRejectionTracking() {
    window.addEventListener('unhandledrejection', (event) => {
      const errorInfo = {
        reason: event.reason,
        promise: event.promise,
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
      
      // Log the error
      const errorId = logError('system', `Unhandled Promise Rejection: ${errorInfo.message}`, errorInfo)
      
      // Store in tracking map
      this.promiseRejections.set(errorId, errorInfo)
      
      // Add to error queue
      this.errorQueue.push({
        type: 'promise_rejection',
        errorId,
        ...errorInfo
      })
      
      console.error('Unhandled Promise Rejection:', errorInfo)
      
      // Prevent the default browser behavior
      event.preventDefault()
    })
  }

  /**
   * Setup network error tracking
   */
  setupNetworkErrorTracking() {
    // Override fetch to track network errors
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      const url = args[0]
      
      try {
        const response = await originalFetch(...args)
        const duration = performance.now() - startTime
        
        // Log slow requests
        if (duration > 5000) {
          logWarning('network', `Slow network request: ${url}`, {
            url,
            duration,
            status: response.status,
            statusText: response.statusText
          })
        }
        
        // Log failed requests
        if (!response.ok) {
          const errorInfo = {
            url,
            status: response.status,
            statusText: response.statusText,
            duration,
            timestamp: new Date().toISOString()
          }
          
          const errorId = logError('network', `Network Error: ${response.status} ${response.statusText}`, errorInfo)
          this.networkErrors.set(errorId, errorInfo)
          
          this.errorQueue.push({
            type: 'network',
            errorId,
            ...errorInfo
          })
        }
        
        return response
      } catch (error) {
        const duration = performance.now() - startTime
        const errorInfo = {
          url,
          error: error.message,
          duration,
          timestamp: new Date().toISOString()
        }
        
        const errorId = logError('network', `Network Request Failed: ${url}`, errorInfo)
        this.networkErrors.set(errorId, errorInfo)
        
        this.errorQueue.push({
          type: 'network',
          errorId,
          ...errorInfo
        })
        
        throw error
      }
    }
  }

  /**
   * Setup resource loading error tracking
   */
  setupResourceErrorTracking() {
    // Track image loading errors
    document.addEventListener('error', (event) => {
      if (event.target.tagName === 'IMG') {
        const errorInfo = {
          type: 'image',
          src: event.target.src,
          alt: event.target.alt,
          timestamp: new Date().toISOString()
        }
        
        const errorId = logError('asset_loading', `Image failed to load: ${event.target.src}`, errorInfo)
        
        this.errorQueue.push({
          type: 'resource',
          errorId,
          ...errorInfo
        })
      }
      
      // Track audio loading errors
      if (event.target.tagName === 'AUDIO') {
        const errorInfo = {
          type: 'audio',
          src: event.target.src,
          timestamp: new Date().toISOString()
        }
        
        const errorId = logError('asset_loading', `Audio failed to load: ${event.target.src}`, errorInfo)
        
        this.errorQueue.push({
          type: 'resource',
          errorId,
          ...errorInfo
        })
      }
    }, true) // Use capture phase
  }

  /**
   * Setup console error tracking
   */
  setupConsoleErrorTracking() {
    const originalConsoleError = console.error
    console.error = (...args) => {
      // Call original console.error
      originalConsoleError.apply(console, args)
      
      // Track the console error
      const errorInfo = {
        arguments: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ),
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
      
      logWarning('system', 'Console Error', errorInfo)
      
      this.errorQueue.push({
        type: 'console',
        ...errorInfo
      })
    }
  }

  /**
   * Get error tracking statistics
   */
  getTrackingStatistics() {
    return {
      totalErrors: this.errorQueue.length,
      javascriptErrors: Array.from(this.jsErrors.values()).length,
      networkErrors: Array.from(this.networkErrors.values()).length,
      promiseRejections: Array.from(this.promiseRejections.values()).length,
      recentErrors: this.errorQueue.filter(error => 
        Date.now() - new Date(error.timestamp).getTime() < 24 * 60 * 60 * 1000
      ).length,
      errorsByType: this.getErrorsByType(),
      errorTrends: this.getErrorTrends()
    }
  }

  /**
   * Get errors grouped by type
   */
  getErrorsByType() {
    const types = {}
    this.errorQueue.forEach(error => {
      types[error.type] = (types[error.type] || 0) + 1
    })
    return types
  }

  /**
   * Get error trends over time
   */
  getErrorTrends() {
    const now = Date.now()
    const hourly = {}
    
    this.errorQueue.forEach(error => {
      const errorTime = new Date(error.timestamp).getTime()
      const hoursAgo = Math.floor((now - errorTime) / (60 * 60 * 1000))
      
      if (hoursAgo < 24) {
        hourly[hoursAgo] = (hourly[hoursAgo] || 0) + 1
      }
    })
    
    return hourly
  }

  /**
   * Get all tracked errors
   */
  getAllTrackedErrors() {
    return [...this.errorQueue]
  }

  /**
   * Clear error tracking data
   */
  clearTrackingData() {
    this.errorQueue = []
    this.networkErrors.clear()
    this.jsErrors.clear()
    this.promiseRejections.clear()
    
    logInfo('system', 'Error tracking data cleared', {
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Export error tracking data
   */
  exportTrackingData() {
    return {
      statistics: this.getTrackingStatistics(),
      errors: this.getAllTrackedErrors(),
      networkErrors: Object.fromEntries(this.networkErrors),
      jsErrors: Object.fromEntries(this.jsErrors),
      promiseRejections: Object.fromEntries(this.promiseRejections),
      exportTimestamp: new Date().toISOString()
    }
  }

  /**
   * Manual error reporting
   */
  reportError(error, context = {}) {
    const errorInfo = {
      message: error.message || 'Manual error report',
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }
    
    const errorId = logError('user_reported', errorInfo.message, errorInfo)
    
    this.errorQueue.push({
      type: 'manual',
      errorId,
      ...errorInfo
    })
    
    return errorId
  }

  /**
   * Check if error tracking is healthy
   */
  isHealthy() {
    const recentErrors = this.errorQueue.filter(error => 
      Date.now() - new Date(error.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
    )
    
    // Consider unhealthy if more than 10 errors in last 5 minutes
    return recentErrors.length < 10
  }
}

/**
 * Global error tracker instance
 */
export const globalErrorTracker = new ErrorTracker()

/**
 * Convenience functions
 */
export const getErrorTrackingStats = () => globalErrorTracker.getTrackingStatistics()
export const getAllTrackedErrors = () => globalErrorTracker.getAllTrackedErrors()
export const reportError = (error, context) => globalErrorTracker.reportError(error, context)
export const clearErrorTracking = () => globalErrorTracker.clearTrackingData()
export const exportErrorTracking = () => globalErrorTracker.exportTrackingData()
export const isErrorTrackingHealthy = () => globalErrorTracker.isHealthy()