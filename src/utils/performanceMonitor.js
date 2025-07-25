/**
 * Performance Monitoring Utility
 * Tracks and logs performance metrics for the Korean Language Learning Application
 */

import { logPerformanceIssue, logInfo, globalErrorLogger } from './errorLogger'

/**
 * Performance thresholds (in milliseconds)
 */
const PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD: 3000,        // Page should load within 3 seconds
  COMPONENT_RENDER: 100,   // Component should render within 100ms
  AUDIO_LOAD: 2000,       // Audio should load within 2 seconds
  IMAGE_LOAD: 1500,       // Images should load within 1.5 seconds
  USER_INTERACTION: 50,   // UI should respond within 50ms
  BUNDLE_SIZE: 1048576,   // Bundle should be under 1MB (1048576 bytes)
}

/**
 * Performance Monitor Class
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = new Map()
    this.startTime = performance.now()
    this.pageLoadTime = null
    
    // Initialize performance monitoring
    this.initializeMonitoring()
  }

  /**
   * Initialize performance monitoring
   */
  initializeMonitoring() {
    // Monitor page load performance
    this.monitorPageLoad()
    
    // Monitor resource loading
    this.monitorResourceLoading()
    
    // Monitor user interactions
    this.monitorUserInteractions()
    
    // Monitor memory usage
    this.monitorMemoryUsage()
  }

  /**
   * Monitor page load performance
   */
  monitorPageLoad() {
    if (document.readyState === 'complete') {
      this.recordPageLoadTime()
    } else {
      window.addEventListener('load', () => {
        this.recordPageLoadTime()
      })
    }
  }

  /**
   * Record page load time
   */
  recordPageLoadTime() {
    const loadTime = performance.now() - this.startTime
    this.pageLoadTime = loadTime
    
    // Log performance info
    logInfo('performance', `Page loaded in ${Math.round(loadTime)}ms`, {
      loadTime,
      threshold: PERFORMANCE_THRESHOLDS.PAGE_LOAD,
      isWithinThreshold: loadTime <= PERFORMANCE_THRESHOLDS.PAGE_LOAD
    })
    
    // Log performance issue if threshold exceeded
    if (loadTime > PERFORMANCE_THRESHOLDS.PAGE_LOAD) {
      logPerformanceIssue('page_load', loadTime, PERFORMANCE_THRESHOLDS.PAGE_LOAD, {
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    }
    
    // Store in metrics
    this.metrics.set('page_load', {
      value: loadTime,
      timestamp: new Date().toISOString(),
      threshold: PERFORMANCE_THRESHOLDS.PAGE_LOAD,
      withinThreshold: loadTime <= PERFORMANCE_THRESHOLDS.PAGE_LOAD
    })
  }

  /**
   * Monitor resource loading (images, audio, etc.)
   */
  monitorResourceLoading() {
    // Use Performance Observer API if available
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.processResourceEntry(entry)
        })
      })
      
      observer.observe({ entryTypes: ['resource'] })
      this.observers.set('resource', observer)
    }
  }

  /**
   * Process resource loading entry
   */
  processResourceEntry(entry) {
    const { name, duration, transferSize } = entry
    const resourceType = this.getResourceType(name)
    const threshold = this.getResourceThreshold(resourceType)
    
    // Log if resource loading is slow
    if (duration > threshold) {
      logPerformanceIssue(`${resourceType}_load`, duration, threshold, {
        resourceUrl: name,
        transferSize,
        resourceType
      })
    }
    
    // Store in metrics
    const metricKey = `${resourceType}_load_${Date.now()}`
    this.metrics.set(metricKey, {
      resourceUrl: name,
      resourceType,
      duration,
      transferSize,
      threshold,
      withinThreshold: duration <= threshold,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    if (url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg')) {
      return 'audio'
    }
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp')) {
      return 'image'
    }
    if (url.includes('.js')) {
      return 'script'
    }
    if (url.includes('.css')) {
      return 'stylesheet'
    }
    return 'other'
  }

  /**
   * Get performance threshold for resource type
   */
  getResourceThreshold(resourceType) {
    switch (resourceType) {
      case 'audio': return PERFORMANCE_THRESHOLDS.AUDIO_LOAD
      case 'image': return PERFORMANCE_THRESHOLDS.IMAGE_LOAD
      default: return 1000 // 1 second for other resources
    }
  }

  /**
   * Monitor user interactions
   */
  monitorUserInteractions() {
    const interactionEvents = ['click', 'keydown', 'touchstart']
    
    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.recordUserInteraction(eventType, event)
      }, { passive: true })
    })
  }

  /**
   * Record user interaction performance
   */
  recordUserInteraction(eventType, event) {
    const startTime = performance.now()
    
    // Use requestAnimationFrame to measure response time
    requestAnimationFrame(() => {
      const responseTime = performance.now() - startTime
      
      // Log slow interactions
      if (responseTime > PERFORMANCE_THRESHOLDS.USER_INTERACTION) {
        logPerformanceIssue('user_interaction', responseTime, PERFORMANCE_THRESHOLDS.USER_INTERACTION, {
          eventType,
          targetElement: event.target.tagName,
          targetClass: event.target.className,
          targetId: event.target.id
        })
      }
      
      // Store in metrics
      const metricKey = `interaction_${eventType}_${Date.now()}`
      this.metrics.set(metricKey, {
        eventType,
        responseTime,
        threshold: PERFORMANCE_THRESHOLDS.USER_INTERACTION,
        withinThreshold: responseTime <= PERFORMANCE_THRESHOLDS.USER_INTERACTION,
        targetElement: event.target.tagName,
        timestamp: new Date().toISOString()
      })
    })
  }

  /**
   * Monitor memory usage
   */
  monitorMemoryUsage() {
    // Check memory usage periodically if API is available
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = performance.memory
        const usedMB = Math.round(memInfo.usedJSHeapSize / 1048576)
        const totalMB = Math.round(memInfo.totalJSHeapSize / 1048576)
        const limitMB = Math.round(memInfo.jsHeapSizeLimit / 1048576)
        
        // Log memory usage info
        logInfo('performance', `Memory usage: ${usedMB}MB / ${totalMB}MB (limit: ${limitMB}MB)`, {
          usedMB,
          totalMB,
          limitMB,
          usagePercentage: Math.round((usedMB / limitMB) * 100)
        })
        
        // Log warning if memory usage is high
        if (usedMB / limitMB > 0.8) {
          logPerformanceIssue('memory_usage', usedMB, limitMB * 0.8, {
            usedMB,
            totalMB,
            limitMB,
            usagePercentage: Math.round((usedMB / limitMB) * 100)
          })
        }
        
        // Store in metrics
        this.metrics.set('memory_usage', {
          usedMB,
          totalMB,
          limitMB,
          usagePercentage: Math.round((usedMB / limitMB) * 100),
          timestamp: new Date().toISOString()
        })
      }, 30000) // Check every 30 seconds
    }
  }

  /**
   * Measure component render time
   */
  measureComponentRender(componentName, renderFunction) {
    const startTime = performance.now()
    
    try {
      const result = renderFunction()
      
      // If it's a Promise, handle async rendering
      if (result && typeof result.then === 'function') {
        return result.then((asyncResult) => {
          const renderTime = performance.now() - startTime
          this.recordComponentRenderTime(componentName, renderTime)
          return asyncResult
        })
      } else {
        const renderTime = performance.now() - startTime
        this.recordComponentRenderTime(componentName, renderTime)
        return result
      }
    } catch (error) {
      const renderTime = performance.now() - startTime
      this.recordComponentRenderTime(componentName, renderTime, error)
      throw error
    }
  }

  /**
   * Record component render time
   */
  recordComponentRenderTime(componentName, renderTime, error = null) {
    // Log slow component renders
    if (renderTime > PERFORMANCE_THRESHOLDS.COMPONENT_RENDER) {
      logPerformanceIssue('component_render', renderTime, PERFORMANCE_THRESHOLDS.COMPONENT_RENDER, {
        componentName,
        error: error ? error.message : null
      })
    }
    
    // Store in metrics
    const metricKey = `component_render_${componentName}_${Date.now()}`
    this.metrics.set(metricKey, {
      componentName,
      renderTime,
      threshold: PERFORMANCE_THRESHOLDS.COMPONENT_RENDER,
      withinThreshold: renderTime <= PERFORMANCE_THRESHOLDS.COMPONENT_RENDER,
      hasError: !!error,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Measure async operation performance
   */
  async measureAsyncOperation(operationName, asyncFunction) {
    const startTime = performance.now()
    
    try {
      const result = await asyncFunction()
      const duration = performance.now() - startTime
      
      logInfo('performance', `${operationName} completed in ${Math.round(duration)}ms`, {
        operationName,
        duration,
        success: true
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      logPerformanceIssue('async_operation', duration, 5000, {
        operationName,
        error: error.message,
        success: false
      })
      
      throw error
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      pageLoadTime: this.pageLoadTime,
      metrics: Object.fromEntries(this.metrics),
      summary: this.getMetricsSummary()
    }
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary() {
    const allMetrics = Array.from(this.metrics.values())
    const performanceIssues = allMetrics.filter(metric => !metric.withinThreshold)
    
    return {
      totalMetrics: allMetrics.length,
      performanceIssues: performanceIssues.length,
      performanceScore: allMetrics.length > 0 ? 
        Math.round(((allMetrics.length - performanceIssues.length) / allMetrics.length) * 100) : 100,
      averagePageLoadTime: this.pageLoadTime,
      memoryUsage: this.metrics.get('memory_usage')
    }
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics.clear()
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => {
      observer.disconnect()
    })
    this.observers.clear()
  }
}

/**
 * Global performance monitor instance
 */
export const globalPerformanceMonitor = new PerformanceMonitor()

/**
 * Convenience functions
 */
export const measureComponentRender = (componentName, renderFunction) =>
  globalPerformanceMonitor.measureComponentRender(componentName, renderFunction)

export const measureAsyncOperation = (operationName, asyncFunction) =>
  globalPerformanceMonitor.measureAsyncOperation(operationName, asyncFunction)

export const getPerformanceMetrics = () => globalPerformanceMonitor.getMetrics()

export const getPerformanceSummary = () => globalPerformanceMonitor.getMetricsSummary()

/**
 * React Hook for performance monitoring
 */
export const usePerformanceMonitor = (componentName) => {
  const measureRender = (renderFunction) => 
    measureComponentRender(componentName, renderFunction)
  
  const measureAsync = (operationName, asyncFunction) =>
    measureAsyncOperation(`${componentName}_${operationName}`, asyncFunction)
  
  return { measureRender, measureAsync }
}