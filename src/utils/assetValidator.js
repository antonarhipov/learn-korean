/**
 * Asset Validation Utilities
 * Validates existence and integrity of audio/image files referenced in lesson data
 */

import { validateLessonData } from './dataValidator.js'

/**
 * Asset validation result structure
 */
export class AssetValidationResult {
  constructor() {
    this.isValid = true
    this.totalAssets = 0
    this.validAssets = 0
    this.missingAssets = []
    this.invalidAssets = []
    this.warnings = []
    this.validatedAt = new Date().toISOString()
  }

  addMissingAsset(assetPath, context) {
    this.missingAssets.push({
      path: assetPath,
      context,
      type: this._getAssetType(assetPath),
      severity: 'error'
    })
    this.isValid = false
  }

  addInvalidAsset(assetPath, context, reason) {
    this.invalidAssets.push({
      path: assetPath,
      context,
      reason,
      type: this._getAssetType(assetPath),
      severity: 'error'
    })
    this.isValid = false
  }

  addWarning(assetPath, context, message) {
    this.warnings.push({
      path: assetPath,
      context,
      message,
      type: this._getAssetType(assetPath),
      severity: 'warning'
    })
  }

  _getAssetType(assetPath) {
    if (!assetPath) return 'unknown'
    const extension = assetPath.split('.').pop()?.toLowerCase()
    
    if (['mp3', 'ogg', 'wav', 'm4a'].includes(extension)) return 'audio'
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(extension)) return 'image'
    if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video'
    
    return 'unknown'
  }

  getSummary() {
    return {
      isValid: this.isValid,
      totalAssets: this.totalAssets,
      validAssets: this.validAssets,
      missingCount: this.missingAssets.length,
      invalidCount: this.invalidAssets.length,
      warningCount: this.warnings.length,
      validationRate: this.totalAssets > 0 ? (this.validAssets / this.totalAssets) * 100 : 100,
      validatedAt: this.validatedAt
    }
  }
}

/**
 * Asset Validator Class
 * Handles validation of assets referenced in lesson data
 */
export class AssetValidator {
  constructor(options = {}) {
    this.options = {
      checkFileExists: options.checkFileExists ?? true,
      validateFileSize: options.validateFileSize ?? true,
      validateFileType: options.validateFileType ?? true,
      maxFileSize: options.maxFileSize ?? 10 * 1024 * 1024, // 10MB default
      allowedAudioTypes: options.allowedAudioTypes ?? ['mp3', 'ogg', 'wav'],
      allowedImageTypes: options.allowedImageTypes ?? ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      allowedVideoTypes: options.allowedVideoTypes ?? ['mp4', 'webm', 'ogg'],
      baseAssetPath: options.baseAssetPath ?? '/public',
      ...options
    }
    
    this.cache = new Map()
    this.validationHistory = []
  }

  /**
   * Validate all assets in lesson data
   * @param {Object} lessonData - Lesson data to validate
   * @returns {Promise<AssetValidationResult>} - Validation result
   */
  async validateLessonAssets(lessonData) {
    const result = new AssetValidationResult()
    
    try {
      // First validate the lesson data structure
      const dataValidation = validateLessonData(lessonData)
      if (!dataValidation.isValid) {
        throw new Error(`Invalid lesson data structure: ${dataValidation.errors.map(e => e.message).join(', ')}`)
      }

      // Extract all asset references from lesson data
      const assetReferences = this._extractAssetReferences(lessonData)
      result.totalAssets = assetReferences.length

      // Validate each asset
      for (const assetRef of assetReferences) {
        try {
          const isValid = await this._validateSingleAsset(assetRef.path, assetRef.context)
          
          if (isValid) {
            result.validAssets++
          } else {
            result.addMissingAsset(assetRef.path, assetRef.context)
          }
        } catch (error) {
          result.addInvalidAsset(assetRef.path, assetRef.context, error.message)
        }
      }

      // Record validation in history
      this.validationHistory.push({
        timestamp: result.validatedAt,
        summary: result.getSummary(),
        lessonId: lessonData.lessons?.[0]?.id || 'unknown'
      })

      // Keep only last 10 validation records
      if (this.validationHistory.length > 10) {
        this.validationHistory = this.validationHistory.slice(-10)
      }

      return result

    } catch (error) {
      result.isValid = false
      result.addInvalidAsset('general', 'validation', error.message)
      return result
    }
  }

  /**
   * Validate a single asset file
   * @param {string} assetPath - Path to the asset
   * @param {string} context - Context where asset is referenced
   * @returns {Promise<boolean>} - True if asset is valid
   */
  async _validateSingleAsset(assetPath, context) {
    if (!assetPath) return false

    // Check cache first
    const cacheKey = `${assetPath}-${context}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      // Validate file path format
      if (!this._isValidAssetPath(assetPath)) {
        this.cache.set(cacheKey, false)
        return false
      }

      // Check file type
      if (this.options.validateFileType && !this._isAllowedFileType(assetPath)) {
        this.cache.set(cacheKey, false)
        return false
      }

      // Check file existence (simulated for client-side)
      if (this.options.checkFileExists) {
        const exists = await this._checkFileExists(assetPath)
        if (!exists) {
          this.cache.set(cacheKey, false)
          return false
        }
      }

      // Validate file size (if possible)
      if (this.options.validateFileSize) {
        const sizeValid = await this._validateFileSize(assetPath)
        if (!sizeValid) {
          this.cache.set(cacheKey, false)
          return false
        }
      }

      this.cache.set(cacheKey, true)
      return true

    } catch (error) {
      console.warn(`Asset validation failed for ${assetPath}:`, error.message)
      this.cache.set(cacheKey, false)
      return false
    }
  }

  /**
   * Extract all asset references from lesson data
   * @param {Object} lessonData - Lesson data
   * @returns {Array} - Array of asset references
   */
  _extractAssetReferences(lessonData) {
    const assets = []

    if (!lessonData.lessons) return assets

    lessonData.lessons.forEach(lesson => {
      const lessonContext = `lesson-${lesson.id}`

      // Extract audio from examples
      if (lesson.content?.examples) {
        lesson.content.examples.forEach((example, index) => {
          if (example.audio) {
            assets.push({
              path: example.audio,
              context: `${lessonContext}.content.examples[${index}].audio`,
              type: 'audio'
            })
          }
        })
      }

      // Extract media assets
      if (lesson.content?.media) {
        if (lesson.content.media.image) {
          assets.push({
            path: lesson.content.media.image,
            context: `${lessonContext}.content.media.image`,
            type: 'image'
          })
        }
        if (lesson.content.media.video) {
          assets.push({
            path: lesson.content.media.video,
            context: `${lessonContext}.content.media.video`,
            type: 'video'
          })
        }
      }

      // Extract audio from exercises
      if (lesson.exercises) {
        lesson.exercises.forEach((exercise, exerciseIndex) => {
          if (exercise.type === 'pronunciation' && exercise.audio) {
            assets.push({
              path: exercise.audio,
              context: `${lessonContext}.exercises[${exerciseIndex}].audio`,
              type: 'audio'
            })
          }
        })
      }
    })

    return assets
  }

  /**
   * Check if asset path is valid format
   * @param {string} assetPath - Asset path to validate
   * @returns {boolean} - True if path format is valid
   */
  _isValidAssetPath(assetPath) {
    if (!assetPath || typeof assetPath !== 'string') return false
    
    // Check if path starts with expected prefix
    if (!assetPath.startsWith('/assets/')) return false
    
    // Check for valid file extension
    const extension = assetPath.split('.').pop()?.toLowerCase()
    if (!extension) return false
    
    // Check path doesn't contain invalid characters
    const invalidChars = ['<', '>', ':', '"', '|', '?', '*']
    return !invalidChars.some(char => assetPath.includes(char))
  }

  /**
   * Check if file type is allowed
   * @param {string} assetPath - Asset path
   * @returns {boolean} - True if file type is allowed
   */
  _isAllowedFileType(assetPath) {
    const extension = assetPath.split('.').pop()?.toLowerCase()
    if (!extension) return false

    const allAllowedTypes = [
      ...this.options.allowedAudioTypes,
      ...this.options.allowedImageTypes,
      ...this.options.allowedVideoTypes
    ]

    return allAllowedTypes.includes(extension)
  }

  /**
   * Check if file exists (simulated for client-side)
   * @param {string} assetPath - Asset path
   * @returns {Promise<boolean>} - True if file exists
   */
  async _checkFileExists(assetPath) {
    try {
      // In a real implementation, this would make an HTTP HEAD request
      // For simulation, we'll check against known asset paths
      const knownAssets = [
        '/assets/audio/g.mp3',
        '/assets/audio/n.mp3',
        '/assets/audio/a.mp3',
        '/assets/audio/b.mp3',
        '/assets/audio/eo.mp3',
        '/assets/audio/o.mp3',
        '/assets/audio/ga.mp3',
        '/assets/audio/na.mp3',
        '/assets/audio/ba.mp3',
        '/assets/audio/annyeonghaseyo.mp3',
        '/assets/audio/annyeong.mp3',
        '/assets/audio/gamsahamnida.mp3',
        '/assets/audio/je-ireumeun.mp3',
        '/assets/audio/jeoneun.mp3',
        '/assets/audio/mannaseo-bangapseumnida.mp3',
        '/assets/audio/hangul-sounds.mp3',
        '/assets/images/hangul-chart.jpg',
        '/assets/images/vowels-consonants.jpg',
        '/assets/images/syllable-formation.jpg',
        '/assets/images/greetings.jpg',
        '/assets/images/introduction.jpg'
      ]

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 10))
      
      return knownAssets.includes(assetPath)
    } catch (error) {
      return false
    }
  }

  /**
   * Validate file size (simulated)
   * @param {string} assetPath - Asset path
   * @returns {Promise<boolean>} - True if file size is valid
   */
  async _validateFileSize(assetPath) {
    try {
      // Simulate file size check
      // In reality, this would require fetching the file or checking headers
      const simulatedSizes = {
        'audio': 500 * 1024,    // 500KB for audio
        'image': 200 * 1024,    // 200KB for images
        'video': 2 * 1024 * 1024 // 2MB for videos
      }

      const assetType = this._getAssetType(assetPath)
      const simulatedSize = simulatedSizes[assetType] || 100 * 1024

      return simulatedSize <= this.options.maxFileSize
    } catch (error) {
      return false
    }
  }

  /**
   * Get asset type from path
   * @param {string} assetPath - Asset path
   * @returns {string} - Asset type
   */
  _getAssetType(assetPath) {
    if (!assetPath) return 'unknown'
    const extension = assetPath.split('.').pop()?.toLowerCase()
    
    if (this.options.allowedAudioTypes.includes(extension)) return 'audio'
    if (this.options.allowedImageTypes.includes(extension)) return 'image'
    if (this.options.allowedVideoTypes.includes(extension)) return 'video'
    
    return 'unknown'
  }

  /**
   * Get validation statistics
   * @returns {Object} - Validation statistics
   */
  getValidationStats() {
    const history = this.validationHistory
    if (history.length === 0) {
      return {
        totalValidations: 0,
        averageValidationRate: 0,
        totalAssetsChecked: 0,
        cacheSize: this.cache.size
      }
    }

    const totalValidations = history.length
    const totalAssetsChecked = history.reduce((sum, record) => sum + record.summary.totalAssets, 0)
    const averageValidationRate = history.reduce((sum, record) => sum + record.summary.validationRate, 0) / totalValidations

    return {
      totalValidations,
      averageValidationRate: Math.round(averageValidationRate * 100) / 100,
      totalAssetsChecked,
      cacheSize: this.cache.size,
      lastValidation: history[history.length - 1]?.timestamp
    }
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Clear validation history
   */
  clearHistory() {
    this.validationHistory = []
  }
}

/**
 * Utility functions for asset validation
 */
export const assetValidationUtils = {
  /**
   * Check if asset path is audio file
   */
  isAudioAsset: (assetPath) => {
    const extension = assetPath?.split('.').pop()?.toLowerCase()
    return ['mp3', 'ogg', 'wav', 'm4a'].includes(extension)
  },

  /**
   * Check if asset path is image file
   */
  isImageAsset: (assetPath) => {
    const extension = assetPath?.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(extension)
  },

  /**
   * Check if asset path is video file
   */
  isVideoAsset: (assetPath) => {
    const extension = assetPath?.split('.').pop()?.toLowerCase()
    return ['mp4', 'webm', 'ogg'].includes(extension)
  },

  /**
   * Get asset file extension
   */
  getAssetExtension: (assetPath) => {
    return assetPath?.split('.').pop()?.toLowerCase() || ''
  },

  /**
   * Normalize asset path
   */
  normalizeAssetPath: (assetPath) => {
    if (!assetPath) return ''
    return assetPath.replace(/\\/g, '/').replace(/\/+/g, '/')
  },

  /**
   * Generate asset validation report
   */
  generateValidationReport: (validationResult) => {
    const summary = validationResult.getSummary()
    
    let report = `Asset Validation Report\n`
    report += `========================\n\n`
    report += `Validation Date: ${summary.validatedAt}\n`
    report += `Overall Status: ${summary.isValid ? 'PASS' : 'FAIL'}\n`
    report += `Total Assets: ${summary.totalAssets}\n`
    report += `Valid Assets: ${summary.validAssets}\n`
    report += `Validation Rate: ${summary.validationRate.toFixed(1)}%\n\n`

    if (validationResult.missingAssets.length > 0) {
      report += `Missing Assets (${validationResult.missingAssets.length}):\n`
      validationResult.missingAssets.forEach(asset => {
        report += `  - ${asset.path} (${asset.context})\n`
      })
      report += '\n'
    }

    if (validationResult.invalidAssets.length > 0) {
      report += `Invalid Assets (${validationResult.invalidAssets.length}):\n`
      validationResult.invalidAssets.forEach(asset => {
        report += `  - ${asset.path}: ${asset.reason} (${asset.context})\n`
      })
      report += '\n'
    }

    if (validationResult.warnings.length > 0) {
      report += `Warnings (${validationResult.warnings.length}):\n`
      validationResult.warnings.forEach(warning => {
        report += `  - ${warning.path}: ${warning.message} (${warning.context})\n`
      })
    }

    return report
  }
}

// Create default validator instance
export const assetValidator = new AssetValidator()