import React, { useState, useEffect } from 'react'
import { 
  globalErrorLogger, 
  getErrorStatistics, 
  getAnalytics, 
  getErrorReport,
  clearAllLogs,
  ERROR_LEVELS,
  ERROR_CATEGORIES 
} from '../utils/errorLogger'
import { getPerformanceMetrics, getPerformanceSummary } from '../utils/performanceMonitor'
import { 
  getErrorTrackingStats, 
  getAllTrackedErrors, 
  clearErrorTracking, 
  exportErrorTracking,
  isErrorTrackingHealthy 
} from '../utils/errorTracker'

const ErrorReportingDashboard = ({ isVisible, onClose }) => {
  const [statistics, setStatistics] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [logs, setLogs] = useState([])
  const [performanceMetrics, setPerformanceMetrics] = useState(null)
  const [performanceSummary, setPerformanceSummary] = useState(null)
  const [errorTrackingStats, setErrorTrackingStats] = useState(null)
  const [trackedErrors, setTrackedErrors] = useState([])
  const [trackingHealthy, setTrackingHealthy] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (isVisible) {
      refreshData()
    }
  }, [isVisible, refreshKey])

  const refreshData = () => {
    setStatistics(getErrorStatistics())
    setAnalytics(getAnalytics())
    setLogs(globalErrorLogger.getAllLogs())
    setPerformanceMetrics(getPerformanceMetrics())
    setPerformanceSummary(getPerformanceSummary())
    setErrorTrackingStats(getErrorTrackingStats())
    setTrackedErrors(getAllTrackedErrors())
    setTrackingHealthy(isErrorTrackingHealthy())
  }

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all error logs? This action cannot be undone.')) {
      clearAllLogs()
      setRefreshKey(prev => prev + 1)
    }
  }

  const handleExportLogs = () => {
    const report = getErrorReport()
    const blob = new Blob([report], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredLogs = logs.filter(log => {
    const categoryMatch = selectedCategory === 'all' || log.category === selectedCategory
    const levelMatch = selectedLevel === 'all' || log.level === selectedLevel
    return categoryMatch && levelMatch
  })

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getLevelColor = (level) => {
    switch (level) {
      case ERROR_LEVELS.CRITICAL: return '#dc2626'
      case ERROR_LEVELS.ERROR: return '#ea580c'
      case ERROR_LEVELS.WARN: return '#d97706'
      case ERROR_LEVELS.INFO: return '#2563eb'
      case ERROR_LEVELS.DEBUG: return '#059669'
      default: return '#6b7280'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case ERROR_CATEGORIES.COMPONENT: return '⚛️'
      case ERROR_CATEGORIES.ASSET_LOADING: return '📁'
      case ERROR_CATEGORIES.NETWORK: return '🌐'
      case ERROR_CATEGORIES.PERFORMANCE: return '⚡'
      case ERROR_CATEGORIES.USER_INTERACTION: return '👆'
      case ERROR_CATEGORIES.DATA_VALIDATION: return '✅'
      case ERROR_CATEGORIES.AUDIO_PLAYBACK: return '🔊'
      case ERROR_CATEGORIES.NAVIGATION: return '🧭'
      case ERROR_CATEGORIES.STORAGE: return '💾'
      case ERROR_CATEGORIES.SYSTEM: return '⚙️'
      default: return '❓'
    }
  }

  if (!isVisible) return null

  return (
    <div className="error-dashboard-overlay">
      <div className="error-dashboard">
        <div className="error-dashboard-header">
          <h2>Error Reporting Dashboard</h2>
          <div className="error-dashboard-actions">
            <button onClick={refreshData} className="btn btn-secondary">
              🔄 Refresh
            </button>
            <button onClick={handleExportLogs} className="btn btn-secondary">
              📥 Export
            </button>
            <button onClick={handleClearLogs} className="btn btn-outline">
              🗑️ Clear Logs
            </button>
            <button onClick={onClose} className="btn btn-primary">
              ✕ Close
            </button>
          </div>
        </div>

        <div className="error-dashboard-content">
          {/* Statistics Overview */}
          {statistics && (
            <div className="error-stats-section">
              <h3>📊 Statistics Overview</h3>
              <div className="error-stats-grid">
                <div className="error-stat-card">
                  <div className="error-stat-value">{statistics.total}</div>
                  <div className="error-stat-label">Total Logs</div>
                </div>
                <div className="error-stat-card">
                  <div className="error-stat-value">{statistics.recentErrors}</div>
                  <div className="error-stat-label">Last 24h</div>
                </div>
                <div className="error-stat-card">
                  <div className="error-stat-value">{statistics.sessionStats.errors}</div>
                  <div className="error-stat-label">Session Errors</div>
                </div>
                <div className="error-stat-card">
                  <div className="error-stat-value">{Math.round(statistics.sessionStats.sessionDuration / 1000)}s</div>
                  <div className="error-stat-label">Session Duration</div>
                </div>
              </div>

              <div className="error-level-breakdown">
                <h4>By Error Level</h4>
                <div className="error-level-bars">
                  {Object.entries(statistics.byLevel).map(([level, count]) => (
                    <div key={level} className="error-level-bar">
                      <span className="error-level-name" style={{ color: getLevelColor(level) }}>
                        {level.toUpperCase()}
                      </span>
                      <div className="error-level-progress">
                        <div 
                          className="error-level-fill"
                          style={{ 
                            width: `${statistics.total > 0 ? (count / statistics.total) * 100 : 0}%`,
                            backgroundColor: getLevelColor(level)
                          }}
                        />
                      </div>
                      <span className="error-level-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Metrics Section */}
          {performanceSummary && (
            <div className="error-stats-section">
              <h3>⚡ Performance Metrics</h3>
              <div className="error-stats-grid">
                <div className="error-stat-card">
                  <div className="error-stat-value">{performanceSummary.performanceScore}%</div>
                  <div className="error-stat-label">Performance Score</div>
                </div>
                <div className="error-stat-card">
                  <div className="error-stat-value">
                    {performanceSummary.averagePageLoadTime ? Math.round(performanceSummary.averagePageLoadTime) : 'N/A'}ms
                  </div>
                  <div className="error-stat-label">Page Load Time</div>
                </div>
                <div className="error-stat-card">
                  <div className="error-stat-value">{performanceSummary.totalMetrics}</div>
                  <div className="error-stat-label">Total Metrics</div>
                </div>
                <div className="error-stat-card">
                  <div className="error-stat-value">{performanceSummary.performanceIssues}</div>
                  <div className="error-stat-label">Performance Issues</div>
                </div>
              </div>
              {performanceSummary.memoryUsage && (
                <div className="error-level-breakdown">
                  <h4>Memory Usage</h4>
                  <div className="error-level-bars">
                    <div className="error-level-bar">
                      <span className="error-level-name">Used Memory</span>
                      <div className="error-level-progress">
                        <div 
                          className="error-level-fill"
                          style={{ 
                            width: `${performanceSummary.memoryUsage.usagePercentage}%`,
                            backgroundColor: performanceSummary.memoryUsage.usagePercentage > 80 ? '#dc2626' : '#059669'
                          }}
                        />
                      </div>
                      <span className="error-level-count">{performanceSummary.memoryUsage.usedMB}MB</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Tracking Section */}
          {errorTrackingStats && (
            <div className="error-stats-section">
              <h3>🔍 Error Tracking {!trackingHealthy && <span style={{color: '#dc2626'}}>⚠️ Unhealthy</span>}</h3>
              <div className="error-stats-grid">
                <div className="error-stat-card">
                  <div className="error-stat-value">{errorTrackingStats.totalErrors}</div>
                  <div className="error-stat-label">Total Tracked</div>
                </div>
                <div className="error-stat-card">
                  <div className="error-stat-value">{errorTrackingStats.javascriptErrors}</div>
                  <div className="error-stat-label">JS Errors</div>
                </div>
                <div className="error-stat-card">
                  <div className="error-stat-value">{errorTrackingStats.networkErrors}</div>
                  <div className="error-stat-label">Network Errors</div>
                </div>
                <div className="error-stat-card">
                  <div className="error-stat-value">{errorTrackingStats.promiseRejections}</div>
                  <div className="error-stat-label">Promise Rejections</div>
                </div>
              </div>
              
              {errorTrackingStats.errorsByType && Object.keys(errorTrackingStats.errorsByType).length > 0 && (
                <div className="error-level-breakdown">
                  <h4>Errors by Type</h4>
                  <div className="error-level-bars">
                    {Object.entries(errorTrackingStats.errorsByType).map(([type, count]) => (
                      <div key={type} className="error-level-bar">
                        <span className="error-level-name">{type.toUpperCase()}</span>
                        <div className="error-level-progress">
                          <div 
                            className="error-level-fill"
                            style={{ 
                              width: `${errorTrackingStats.totalErrors > 0 ? (count / errorTrackingStats.totalErrors) * 100 : 0}%`,
                              backgroundColor: '#2563eb'
                            }}
                          />
                        </div>
                        <span className="error-level-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Section */}
          {analytics && (
            <div className="error-analytics-section">
              <h3>📈 Analytics</h3>
              <div className="error-analytics-grid">
                <div className="error-analytics-card">
                  <h4>Asset Failures</h4>
                  <div className="error-analytics-list">
                    {Object.entries(analytics.assetFailures).slice(0, 5).map(([asset, failures]) => (
                      <div key={asset} className="error-analytics-item">
                        <span className="error-analytics-asset">{asset.split('/').pop()}</span>
                        <span className="error-analytics-count">{failures.length} failures</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="error-analytics-card">
                  <h4>Retry Statistics</h4>
                  <div className="error-analytics-list">
                    {Object.entries(analytics.retryStatistics).slice(0, 5).map(([asset, stats]) => (
                      <div key={asset} className="error-analytics-item">
                        <span className="error-analytics-asset">{asset.split('/').pop()}</span>
                        <span className="error-analytics-count">{stats.attempts} attempts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="error-filters-section">
            <h3>🔍 Error Logs</h3>
            <div className="error-filters">
              <div className="error-filter-group">
                <label>Category:</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="error-filter-select"
                >
                  <option value="all">All Categories</option>
                  {Object.values(ERROR_CATEGORIES).map(category => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {category.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="error-filter-group">
                <label>Level:</label>
                <select 
                  value={selectedLevel} 
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="error-filter-select"
                >
                  <option value="all">All Levels</option>
                  {Object.values(ERROR_LEVELS).map(level => (
                    <option key={level} value={level}>
                      {level.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="error-filter-info">
                Showing {filteredLogs.length} of {logs.length} logs
              </div>
            </div>
          </div>

          {/* Error Logs */}
          <div className="error-logs-section">
            <div className="error-logs-container">
              {filteredLogs.length === 0 ? (
                <div className="error-logs-empty">
                  <p>No error logs found matching the current filters.</p>
                </div>
              ) : (
                filteredLogs.slice(0, 50).map((log, index) => (
                  <div key={log.id || index} className="error-log-entry">
                    <div className="error-log-header">
                      <div className="error-log-meta">
                        <span 
                          className="error-log-level"
                          style={{ color: getLevelColor(log.level) }}
                        >
                          {log.level.toUpperCase()}
                        </span>
                        <span className="error-log-category">
                          {getCategoryIcon(log.category)} {log.category}
                        </span>
                        <span className="error-log-timestamp">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="error-log-message">
                      {log.message}
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <details className="error-log-details">
                        <summary>Details</summary>
                        <pre className="error-log-details-content">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
              {filteredLogs.length > 50 && (
                <div className="error-logs-truncated">
                  Showing first 50 entries. Use filters to narrow down results.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorReportingDashboard