/**
 * Retry mechanism utility with exponential backoff and intelligent error handling
 * for failed asset loads in the Korean language learning application
 */

import { logAssetFailure, logRetryAttempt, logWarning, logError } from './errorLogger'

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  jitter: true, // Add randomness to prevent thundering herd
  retryableErrors: [
    'NetworkError',
    'TimeoutError',
    'AbortError',
    'NotSupportedError'
  ]
}

/**
 * Sleep utility for delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Calculate delay with exponential backoff and optional jitter
 */
const calculateDelay = (attempt, config) => {
  const { baseDelay, maxDelay, backoffMultiplier, jitter } = config
  
  // Exponential backoff: baseDelay * (backoffMultiplier ^ attempt)
  let delay = baseDelay * Math.pow(backoffMultiplier, attempt)
  
  // Cap at maxDelay
  delay = Math.min(delay, maxDelay)
  
  // Add jitter to prevent thundering herd problem
  if (jitter) {
    // Add random variance of ±25%
    const jitterAmount = delay * 0.25
    delay += (Math.random() - 0.5) * 2 * jitterAmount
  }
  
  return Math.max(delay, 0)
}

/**
 * Determine if an error is retryable
 */
const isRetryableError = (error, config) => {
  if (!error) return false
  
  // Check error name
  if (config.retryableErrors.includes(error.name)) {
    return true
  }
  
  // Check error message for common network issues
  const retryableMessages = [
    'network error',
    'timeout',
    'connection',
    'fetch',
    'load failed',
    'not found'
  ]
  
  const errorMessage = (error.message || '').toLowerCase()
  return retryableMessages.some(msg => errorMessage.includes(msg))
}

/**
 * Enhanced retry mechanism for asset loading
 */
export class AssetRetryManager {
  constructor(config = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config }
    this.retryHistory = new Map() // Track retry attempts per asset
    this.failedAssets = new Set() // Track permanently failed assets
  }

  /**
   * Get retry statistics for an asset
   */
  getRetryStats(assetUrl) {
    return this.retryHistory.get(assetUrl) || {
      attempts: 0,
      lastAttempt: null,
      errors: []
    }
  }

  /**
   * Check if asset has permanently failed
   */
  hasPermanentlyFailed(assetUrl) {
    return this.failedAssets.has(assetUrl)
  }

  /**
   * Reset retry history for an asset (useful for manual retries)
   */
  resetAsset(assetUrl) {
    this.retryHistory.delete(assetUrl)
    this.failedAssets.delete(assetUrl)
  }

  /**
   * Main retry function with exponential backoff
   */
  async retryAssetLoad(assetUrl, loadFunction, customConfig = {}) {
    const config = { ...this.config, ...customConfig }
    const stats = this.getRetryStats(assetUrl)
    
    // Check if asset has permanently failed
    if (this.hasPermanentlyFailed(assetUrl)) {
      throw new Error(`Asset permanently failed: ${assetUrl}`)
    }

    let lastError = null
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // Update retry statistics
        stats.attempts = attempt + 1
        stats.lastAttempt = new Date().toISOString()
        this.retryHistory.set(assetUrl, stats)

        // Attempt to load the asset
        const result = await loadFunction(assetUrl, attempt)
        
        // Success! Clear any previous failure records
        this.retryHistory.delete(assetUrl)
        this.failedAssets.delete(assetUrl)
        
        // Log successful retry if this wasn't the first attempt
        if (attempt > 0) {
          logRetryAttempt(assetUrl, attempt + 1, 0, true)
        }
        
        return result
        
      } catch (error) {
        lastError = error
        stats.errors.push({
          attempt: attempt + 1,
          error: error.message || error.toString(),
          timestamp: new Date().toISOString()
        })
        
        // Log the retry attempt
        logRetryAttempt(assetUrl, attempt + 1, 0, false)
        
        // Check if error is retryable
        if (!isRetryableError(error, config)) {
          logError('asset_loading', `Non-retryable error for ${assetUrl}`, {
            assetUrl,
            error: error.message || error.toString(),
            attempt: attempt + 1
          })
          this.failedAssets.add(assetUrl)
          break
        }
        
        // Don't delay after the last attempt
        if (attempt < config.maxRetries) {
          const delay = calculateDelay(attempt, config)
          logRetryAttempt(assetUrl, attempt + 2, delay, false)
          await sleep(delay)
        }
      }
    }
    
    // All retries exhausted - log permanent failure
    this.failedAssets.add(assetUrl)
    logAssetFailure(assetUrl, 'unknown', lastError || new Error(`Failed to load asset: ${assetUrl}`), config.maxRetries + 1)
    throw lastError || new Error(`Failed to load asset: ${assetUrl}`)
  }

  /**
   * Get overall retry statistics
   */
  getOverallStats() {
    const totalAssets = this.retryHistory.size + this.failedAssets.size
    const failedAssets = this.failedAssets.size
    const retriedAssets = this.retryHistory.size
    
    let totalAttempts = 0
    let totalErrors = 0
    
    for (const stats of this.retryHistory.values()) {
      totalAttempts += stats.attempts
      totalErrors += stats.errors.length
    }
    
    return {
      totalAssets,
      failedAssets,
      retriedAssets,
      totalAttempts,
      totalErrors,
      successRate: totalAssets > 0 ? ((totalAssets - failedAssets) / totalAssets) * 100 : 100
    }
  }

  /**
   * Clear all retry history (useful for testing or reset)
   */
  clearHistory() {
    this.retryHistory.clear()
    this.failedAssets.clear()
  }
}

/**
 * Global retry manager instance
 */
export const globalRetryManager = new AssetRetryManager()

/**
 * Convenience function for retrying asset loads
 */
export const retryAssetLoad = (assetUrl, loadFunction, config) => {
  return globalRetryManager.retryAssetLoad(assetUrl, loadFunction, config)
}

/**
 * Audio-specific retry function
 */
export const retryAudioLoad = (audioUrl, config = {}) => {
  const audioConfig = {
    maxRetries: 2, // Audio files typically fail quickly
    baseDelay: 500,
    maxDelay: 3000,
    ...config
  }
  
  return retryAssetLoad(audioUrl, (url) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      
      const handleLoad = () => {
        cleanup()
        resolve(audio)
      }
      
      const handleError = (e) => {
        cleanup()
        reject(new Error(`Audio load failed: ${e.type}`))
      }
      
      const cleanup = () => {
        audio.removeEventListener('canplaythrough', handleLoad)
        audio.removeEventListener('error', handleError)
        audio.removeEventListener('abort', handleError)
      }
      
      audio.addEventListener('canplaythrough', handleLoad)
      audio.addEventListener('error', handleError)
      audio.addEventListener('abort', handleError)
      
      audio.src = url
      audio.load()
    })
  }, audioConfig)
}

/**
 * Image-specific retry function
 */
export const retryImageLoad = (imageUrl, config = {}) => {
  const imageConfig = {
    maxRetries: 3, // Images can benefit from more retries
    baseDelay: 1000,
    maxDelay: 5000,
    ...config
  }
  
  return retryAssetLoad(imageUrl, (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      const handleLoad = () => {
        cleanup()
        resolve(img)
      }
      
      const handleError = (e) => {
        cleanup()
        reject(new Error(`Image load failed: ${e.type}`))
      }
      
      const cleanup = () => {
        img.removeEventListener('load', handleLoad)
        img.removeEventListener('error', handleError)
        img.removeEventListener('abort', handleError)
      }
      
      img.addEventListener('load', handleLoad)
      img.addEventListener('error', handleError)
      img.addEventListener('abort', handleError)
      
      img.src = url
    })
  }, imageConfig)
}