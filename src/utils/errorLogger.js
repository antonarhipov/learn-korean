/**
 * Comprehensive Error Logging and Reporting System
 * for the Korean Language Learning Application
 */

/**
 * Error severity levels
 */
export const ERROR_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  CRITICAL: 'critical'
}

/**
 * Error categories for better organization
 */
export const ERROR_CATEGORIES = {
  COMPONENT: 'component',
  ASSET_LOADING: 'asset_loading',
  NETWORK: 'network',
  PERFORMANCE: 'performance',
  USER_INTERACTION: 'user_interaction',
  DATA_VALIDATION: 'data_validation',
  AUDIO_PLAYBACK: 'audio_playback',
  NAVIGATION: 'navigation',
  STORAGE: 'storage',
  SYSTEM: 'system'
}

/**
 * Configuration for error logging
 */
const DEFAULT_CONFIG = {
  maxLogEntries: 100,
  enableConsoleLogging: true,
  enableLocalStorage: true,
  enableRemoteLogging: false, // For future implementation
  logLevels: [ERROR_LEVELS.DEBUG, ERROR_LEVELS.INFO, ERROR_LEVELS.WARN, ERROR_LEVELS.ERROR, ERROR_LEVELS.CRITICAL],
  storageKey: 'korean_app_error_logs',
  analyticsKey: 'korean_app_analytics'
}

/**
 * Enhanced Error Logger Class
 */
export class ErrorLogger {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.errorCount = 0
    this.warningCount = 0
    this.infoCount = 0
    
    // Initialize analytics tracking
    this.analytics = {
      errors: new Map(),
      performance: [],
      userInteractions: [],
      assetFailures: new Map(),
      retryStatistics: new Map()
    }
    
    // Load existing logs
    this.loadExistingLogs()
    
    // Set up periodic analytics saving
    this.setupPeriodicSave()
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Main logging function
   */
  log(level, category, message, details = {}) {
    if (!this.config.logLevels.includes(level)) {
      return
    }

    const errorId = this.generateErrorId()
    const timestamp = new Date().toISOString()
    
    const logEntry = {
      id: errorId,
      timestamp,
      sessionId: this.sessionId,
      level,
      category,
      message,
      details: {
        ...details,
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        sessionDuration: Date.now() - this.startTime
      }
    }

    // Update counters
    this.updateCounters(level)
    
    // Store in analytics
    this.updateAnalytics(logEntry)
    
    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(logEntry)
    }
    
    // Local storage logging
    if (this.config.enableLocalStorage) {
      this.logToLocalStorage(logEntry)
    }
    
    // Future: Remote logging
    if (this.config.enableRemoteLogging) {
      this.logToRemote(logEntry)
    }
    
    return errorId
  }

  /**
   * Convenience methods for different log levels
   */
  debug(category, message, details) {
    return this.log(ERROR_LEVELS.DEBUG, category, message, details)
  }

  info(category, message, details) {
    return this.log(ERROR_LEVELS.INFO, category, message, details)
  }

  warn(category, message, details) {
    return this.log(ERROR_LEVELS.WARN, category, message, details)
  }

  error(category, message, details) {
    return this.log(ERROR_LEVELS.ERROR, category, message, details)
  }

  critical(category, message, details) {
    return this.log(ERROR_LEVELS.CRITICAL, category, message, details)
  }

  /**
   * Specialized logging methods for specific scenarios
   */
  logComponentError(componentName, error, errorInfo) {
    return this.error(ERROR_CATEGORIES.COMPONENT, `Component error in ${componentName}`, {
      componentName,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      componentStack: errorInfo?.componentStack
    })
  }

  logAssetFailure(assetUrl, assetType, error, retryAttempts = 0) {
    const errorId = this.error(ERROR_CATEGORIES.ASSET_LOADING, `Failed to load ${assetType}: ${assetUrl}`, {
      assetUrl,
      assetType,
      error: error.message || error.toString(),
      retryAttempts,
      isPermanentFailure: retryAttempts >= 3
    })
    
    // Update asset failure analytics
    const failures = this.analytics.assetFailures.get(assetUrl) || []
    failures.push({
      timestamp: new Date().toISOString(),
      error: error.message || error.toString(),
      retryAttempts
    })
    this.analytics.assetFailures.set(assetUrl, failures)
    
    return errorId
  }

  logRetryAttempt(assetUrl, attempt, delay, success = false) {
    const level = success ? ERROR_LEVELS.INFO : ERROR_LEVELS.WARN
    const message = success 
      ? `Retry successful for ${assetUrl} after ${attempt} attempts`
      : `Retry attempt ${attempt} for ${assetUrl} (delay: ${delay}ms)`
    
    const errorId = this.log(level, ERROR_CATEGORIES.ASSET_LOADING, message, {
      assetUrl,
      attempt,
      delay,
      success
    })
    
    // Update retry statistics
    const stats = this.analytics.retryStatistics.get(assetUrl) || {
      attempts: 0,
      successes: 0,
      failures: 0,
      totalDelay: 0
    }
    
    stats.attempts++
    stats.totalDelay += delay || 0
    
    if (success) {
      stats.successes++
    } else {
      stats.failures++
    }
    
    this.analytics.retryStatistics.set(assetUrl, stats)
    
    return errorId
  }

  logPerformanceIssue(metric, value, threshold, details = {}) {
    return this.warn(ERROR_CATEGORIES.PERFORMANCE, `Performance issue: ${metric} (${value}ms > ${threshold}ms)`, {
      metric,
      value,
      threshold,
      ...details
    })
  }

  logUserInteraction(action, element, details = {}) {
    const errorId = this.debug(ERROR_CATEGORIES.USER_INTERACTION, `User interaction: ${action}`, {
      action,
      element,
      ...details
    })
    
    // Store in analytics
    this.analytics.userInteractions.push({
      timestamp: new Date().toISOString(),
      action,
      element,
      details
    })
    
    return errorId
  }

  /**
   * Update error counters
   */
  updateCounters(level) {
    switch (level) {
      case ERROR_LEVELS.ERROR:
      case ERROR_LEVELS.CRITICAL:
        this.errorCount++
        break
      case ERROR_LEVELS.WARN:
        this.warningCount++
        break
      case ERROR_LEVELS.INFO:
      case ERROR_LEVELS.DEBUG:
        this.infoCount++
        break
    }
  }

  /**
   * Update analytics data
   */
  updateAnalytics(logEntry) {
    const key = `${logEntry.category}_${logEntry.level}`
    const existing = this.analytics.errors.get(key) || []
    existing.push({
      timestamp: logEntry.timestamp,
      message: logEntry.message,
      details: logEntry.details
    })
    this.analytics.errors.set(key, existing)
  }

  /**
   * Console logging with appropriate levels
   */
  logToConsole(logEntry) {
    const { level, category, message, details } = logEntry
    const prefix = `[${level.toUpperCase()}][${category}]`
    
    switch (level) {
      case ERROR_LEVELS.DEBUG:
        console.debug(prefix, message, details)
        break
      case ERROR_LEVELS.INFO:
        console.info(prefix, message, details)
        break
      case ERROR_LEVELS.WARN:
        console.warn(prefix, message, details)
        break
      case ERROR_LEVELS.ERROR:
      case ERROR_LEVELS.CRITICAL:
        console.error(prefix, message, details)
        break
      default:
        console.log(prefix, message, details)
    }
  }

  /**
   * Local storage logging
   */
  logToLocalStorage(logEntry) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem(this.config.storageKey) || '[]')
      existingLogs.push(logEntry)
      
      // Keep only the most recent entries
      const recentLogs = existingLogs.slice(-this.config.maxLogEntries)
      localStorage.setItem(this.config.storageKey, JSON.stringify(recentLogs))
    } catch (error) {
      console.warn('Failed to save error log to localStorage:', error)
    }
  }

  /**
   * Load existing logs from localStorage
   */
  loadExistingLogs() {
    try {
      const existingLogs = JSON.parse(localStorage.getItem(this.config.storageKey) || '[]')
      return existingLogs
    } catch (error) {
      console.warn('Failed to load existing logs:', error)
      return []
    }
  }

  /**
   * Get all logs
   */
  getAllLogs() {
    return this.loadExistingLogs()
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category) {
    const allLogs = this.getAllLogs()
    return allLogs.filter(log => log.category === category)
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level) {
    const allLogs = this.getAllLogs()
    return allLogs.filter(log => log.level === level)
  }

  /**
   * Get error statistics
   */
  getErrorStatistics() {
    const allLogs = this.getAllLogs()
    const stats = {
      total: allLogs.length,
      byLevel: {},
      byCategory: {},
      recentErrors: allLogs.filter(log => 
        Date.now() - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000
      ).length,
      sessionStats: {
        errors: this.errorCount,
        warnings: this.warningCount,
        info: this.infoCount,
        sessionDuration: Date.now() - this.startTime
      }
    }
    
    // Count by level
    Object.values(ERROR_LEVELS).forEach(level => {
      stats.byLevel[level] = allLogs.filter(log => log.level === level).length
    })
    
    // Count by category
    Object.values(ERROR_CATEGORIES).forEach(category => {
      stats.byCategory[category] = allLogs.filter(log => log.category === category).length
    })
    
    return stats
  }

  /**
   * Get analytics data
   */
  getAnalytics() {
    return {
      ...this.analytics,
      statistics: this.getErrorStatistics(),
      assetFailures: Object.fromEntries(this.analytics.assetFailures),
      retryStatistics: Object.fromEntries(this.analytics.retryStatistics)
    }
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    try {
      localStorage.removeItem(this.config.storageKey)
      localStorage.removeItem(this.config.analyticsKey)
      this.analytics = {
        errors: new Map(),
        performance: [],
        userInteractions: [],
        assetFailures: new Map(),
        retryStatistics: new Map()
      }
      this.errorCount = 0
      this.warningCount = 0
      this.infoCount = 0
      return true
    } catch (error) {
      console.warn('Failed to clear logs:', error)
      return false
    }
  }

  /**
   * Export logs for debugging
   */
  exportLogs() {
    const data = {
      logs: this.getAllLogs(),
      analytics: this.getAnalytics(),
      statistics: this.getErrorStatistics(),
      sessionInfo: {
        sessionId: this.sessionId,
        startTime: this.startTime,
        duration: Date.now() - this.startTime
      }
    }
    
    return JSON.stringify(data, null, 2)
  }

  /**
   * Setup periodic saving of analytics
   */
  setupPeriodicSave() {
    setInterval(() => {
      try {
        const analyticsData = this.getAnalytics()
        localStorage.setItem(this.config.analyticsKey, JSON.stringify(analyticsData))
      } catch (error) {
        console.warn('Failed to save analytics data:', error)
      }
    }, 30000) // Save every 30 seconds
  }

  /**
   * Future: Remote logging implementation
   */
  logToRemote(logEntry) {
    // This would send logs to a remote service
    // Implementation depends on the chosen logging service
    console.debug('Remote logging not implemented yet:', logEntry)
  }
}

/**
 * Global error logger instance
 */
export const globalErrorLogger = new ErrorLogger()

/**
 * Convenience functions for quick logging
 */
export const logError = (category, message, details) => 
  globalErrorLogger.error(category, message, details)

export const logWarning = (category, message, details) => 
  globalErrorLogger.warn(category, message, details)

export const logInfo = (category, message, details) => 
  globalErrorLogger.info(category, message, details)

export const logDebug = (category, message, details) => 
  globalErrorLogger.debug(category, message, details)

export const logComponentError = (componentName, error, errorInfo) =>
  globalErrorLogger.logComponentError(componentName, error, errorInfo)

export const logAssetFailure = (assetUrl, assetType, error, retryAttempts) =>
  globalErrorLogger.logAssetFailure(assetUrl, assetType, error, retryAttempts)

export const logRetryAttempt = (assetUrl, attempt, delay, success) =>
  globalErrorLogger.logRetryAttempt(assetUrl, attempt, delay, success)

export const logPerformanceIssue = (metric, value, threshold, details) =>
  globalErrorLogger.logPerformanceIssue(metric, value, threshold, details)

export const logUserInteraction = (action, element, details) =>
  globalErrorLogger.logUserInteraction(action, element, details)

/**
 * Error reporting utilities
 */
export const getErrorReport = () => globalErrorLogger.exportLogs()
export const getErrorStatistics = () => globalErrorLogger.getErrorStatistics()
export const getAnalytics = () => globalErrorLogger.getAnalytics()
export const clearAllLogs = () => globalErrorLogger.clearLogs()