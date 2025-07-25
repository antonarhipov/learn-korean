/**
 * Data Migration Utilities
 * Handles schema changes and data evolution for lesson data
 */

import { validateLessonData } from './dataValidator.js'

// Current schema version
export const CURRENT_SCHEMA_VERSION = '1.0.0'

// Schema version history
export const SCHEMA_VERSIONS = {
  '1.0.0': {
    description: 'Initial schema with lessons and modules',
    releaseDate: '2025-07-25',
    breaking: false
  }
}

/**
 * Migration registry to store all migration functions
 */
const migrationRegistry = new Map()

/**
 * Register a migration function
 * @param {string} fromVersion - Source version
 * @param {string} toVersion - Target version
 * @param {Function} migrationFn - Migration function
 */
export const registerMigration = (fromVersion, toVersion, migrationFn) => {
  const key = `${fromVersion}->${toVersion}`
  migrationRegistry.set(key, {
    fromVersion,
    toVersion,
    migrate: migrationFn,
    registeredAt: new Date().toISOString()
  })
}

/**
 * Data Migration Manager
 * Handles schema versioning and data transformation
 */
export class DataMigrationManager {
  constructor() {
    this.currentVersion = CURRENT_SCHEMA_VERSION
    this.migrationHistory = []
    this.backupData = new Map()
  }

  /**
   * Detect the version of data
   * @param {Object} data - Data to analyze
   * @returns {string} - Detected version
   */
  detectDataVersion(data) {
    // Check for version field in data
    if (data.version) {
      return data.version
    }

    // Heuristic detection based on data structure
    if (data.lessons && data.modules) {
      // Check for estimatedTime field (added in v1.0.0)
      if (data.lessons.length > 0 && data.lessons[0].estimatedTime !== undefined) {
        return '1.0.0'
      }
      
      // Fallback to earliest version
      return '0.9.0'
    }

    // Unknown structure
    return 'unknown'
  }

  /**
   * Check if migration is needed
   * @param {Object} data - Data to check
   * @returns {boolean} - True if migration is needed
   */
  needsMigration(data) {
    const dataVersion = this.detectDataVersion(data)
    return dataVersion !== this.currentVersion && dataVersion !== 'unknown'
  }

  /**
   * Get migration path from one version to another
   * @param {string} fromVersion - Source version
   * @param {string} toVersion - Target version
   * @returns {Array} - Array of migration steps
   */
  getMigrationPath(fromVersion, toVersion) {
    // For now, direct migration paths only
    // In a more complex system, this would use graph traversal
    const directKey = `${fromVersion}->${toVersion}`
    
    if (migrationRegistry.has(directKey)) {
      return [migrationRegistry.get(directKey)]
    }

    // Check for intermediate migrations (simplified)
    const availableMigrations = Array.from(migrationRegistry.values())
    const path = []

    // Find migration from source version
    const fromMigration = availableMigrations.find(m => m.fromVersion === fromVersion)
    if (fromMigration) {
      path.push(fromMigration)
      
      // If it doesn't go directly to target, look for next step
      if (fromMigration.toVersion !== toVersion) {
        const nextMigration = availableMigrations.find(m => m.fromVersion === fromMigration.toVersion && m.toVersion === toVersion)
        if (nextMigration) {
          path.push(nextMigration)
        }
      }
    }

    return path
  }

  /**
   * Create backup of data before migration
   * @param {Object} data - Data to backup
   * @param {string} version - Version of the data
   */
  createBackup(data, version) {
    const backupKey = `${version}-${Date.now()}`
    this.backupData.set(backupKey, {
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      version,
      timestamp: new Date().toISOString()
    })
    
    // Keep only last 5 backups to prevent memory issues
    if (this.backupData.size > 5) {
      const oldestKey = Array.from(this.backupData.keys())[0]
      this.backupData.delete(oldestKey)
    }
    
    return backupKey
  }

  /**
   * Restore data from backup
   * @param {string} backupKey - Backup key
   * @returns {Object|null} - Restored data or null if not found
   */
  restoreFromBackup(backupKey) {
    const backup = this.backupData.get(backupKey)
    return backup ? backup.data : null
  }

  /**
   * Migrate data to current version
   * @param {Object} data - Data to migrate
   * @param {Object} options - Migration options
   * @returns {Promise<Object>} - Migrated data
   */
  async migrateData(data, options = {}) {
    const {
      createBackup = true,
      validateAfterMigration = true,
      throwOnValidationError = false
    } = options

    try {
      const fromVersion = this.detectDataVersion(data)
      
      if (fromVersion === 'unknown') {
        throw new Error('Cannot migrate data with unknown schema version')
      }

      if (fromVersion === this.currentVersion) {
        return data // No migration needed
      }

      // Create backup if requested
      let backupKey = null
      if (createBackup) {
        backupKey = this.createBackup(data, fromVersion)
      }

      // Get migration path
      const migrationPath = this.getMigrationPath(fromVersion, this.currentVersion)
      
      if (migrationPath.length === 0) {
        throw new Error(`No migration path found from version ${fromVersion} to ${this.currentVersion}`)
      }

      // Apply migrations in sequence
      let migratedData = JSON.parse(JSON.stringify(data)) // Deep clone
      
      for (const migration of migrationPath) {
        console.log(`Applying migration: ${migration.fromVersion} -> ${migration.toVersion}`)
        
        try {
          migratedData = await migration.migrate(migratedData)
          
          // Record migration step
          this.migrationHistory.push({
            fromVersion: migration.fromVersion,
            toVersion: migration.toVersion,
            timestamp: new Date().toISOString(),
            backupKey
          })
          
        } catch (migrationError) {
          console.error(`Migration failed: ${migration.fromVersion} -> ${migration.toVersion}`, migrationError)
          
          // Restore from backup if available
          if (backupKey) {
            const restoredData = this.restoreFromBackup(backupKey)
            if (restoredData) {
              console.log('Restored data from backup due to migration failure')
              return restoredData
            }
          }
          
          throw new Error(`Migration failed: ${migrationError.message}`)
        }
      }

      // Add version field to migrated data
      migratedData.version = this.currentVersion
      migratedData.migratedAt = new Date().toISOString()

      // Validate migrated data if requested
      if (validateAfterMigration) {
        const validationResult = validateLessonData(migratedData)
        
        if (!validationResult.isValid) {
          const errorMessage = `Migrated data failed validation: ${validationResult.errors.map(e => e.message).join(', ')}`
          
          if (throwOnValidationError) {
            throw new Error(errorMessage)
          } else {
            console.warn(errorMessage)
          }
        }
      }

      return migratedData

    } catch (error) {
      console.error('Data migration failed:', error)
      throw error
    }
  }

  /**
   * Get migration history
   * @returns {Array} - Migration history
   */
  getMigrationHistory() {
    return [...this.migrationHistory]
  }

  /**
   * Get available backups
   * @returns {Array} - Available backups
   */
  getAvailableBackups() {
    return Array.from(this.backupData.entries()).map(([key, backup]) => ({
      key,
      version: backup.version,
      timestamp: backup.timestamp
    }))
  }

  /**
   * Clear migration history and backups
   */
  clearHistory() {
    this.migrationHistory = []
    this.backupData.clear()
  }
}

// Create singleton instance
export const migrationManager = new DataMigrationManager()

/**
 * Example migration functions
 */

// Migration from hypothetical v0.9.0 to v1.0.0
registerMigration('0.9.0', '1.0.0', async (data) => {
  console.log('Migrating from v0.9.0 to v1.0.0: Adding estimatedTime field')
  
  // Add estimatedTime field to lessons if missing
  if (data.lessons) {
    data.lessons = data.lessons.map(lesson => ({
      ...lesson,
      estimatedTime: lesson.estimatedTime || 15 // Default 15 minutes
    }))
  }

  // Add estimatedTime field to modules if missing
  if (data.modules) {
    data.modules = data.modules.map(module => ({
      ...module,
      estimatedTime: module.estimatedTime || (module.lessons ? module.lessons.length * 15 : 30)
    }))
  }

  return data
})

// Future migration example: v1.0.0 to v1.1.0
registerMigration('1.0.0', '1.1.0', async (data) => {
  console.log('Migrating from v1.0.0 to v1.1.0: Adding difficulty ratings')
  
  // Add difficulty field to lessons
  if (data.lessons) {
    data.lessons = data.lessons.map(lesson => ({
      ...lesson,
      difficulty: lesson.difficulty || calculateDifficulty(lesson)
    }))
  }

  return data
})

/**
 * Helper function to calculate difficulty (example)
 */
function calculateDifficulty(lesson) {
  let score = 1 // Base difficulty
  
  if (lesson.level === 'intermediate') score += 1
  if (lesson.level === 'advanced') score += 2
  
  if (lesson.prerequisites && lesson.prerequisites.length > 0) {
    score += lesson.prerequisites.length * 0.5
  }
  
  if (lesson.exercises && lesson.exercises.length > 3) {
    score += 0.5
  }
  
  return Math.min(Math.max(score, 1), 5) // Clamp between 1-5
}

/**
 * Utility functions for common migration tasks
 */
export const migrationUtils = {
  /**
   * Add field to all items in array
   */
  addFieldToArray: (array, fieldName, defaultValue) => {
    return array.map(item => ({
      ...item,
      [fieldName]: item[fieldName] !== undefined ? item[fieldName] : defaultValue
    }))
  },

  /**
   * Rename field in all items in array
   */
  renameFieldInArray: (array, oldFieldName, newFieldName) => {
    return array.map(item => {
      const newItem = { ...item }
      if (newItem[oldFieldName] !== undefined) {
        newItem[newFieldName] = newItem[oldFieldName]
        delete newItem[oldFieldName]
      }
      return newItem
    })
  },

  /**
   * Remove field from all items in array
   */
  removeFieldFromArray: (array, fieldName) => {
    return array.map(item => {
      const newItem = { ...item }
      delete newItem[fieldName]
      return newItem
    })
  },

  /**
   * Transform field values in array
   */
  transformFieldInArray: (array, fieldName, transformFn) => {
    return array.map(item => ({
      ...item,
      [fieldName]: item[fieldName] !== undefined ? transformFn(item[fieldName]) : item[fieldName]
    }))
  }
}