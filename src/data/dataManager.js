/**
 * Hierarchical Data Manager for Korean Learning App
 * Provides structured access to lessons and modules with improved organization
 */

import { validateLessonData } from '../utils/dataValidator.js'

// Mock localStorage for Node.js environments
const mockLocalStorage = {
  getItem: (key) => null,
  setItem: (key, value) => {},
  removeItem: (key) => {},
  clear: () => {}
}

// Get localStorage or mock for Node.js
const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  return mockLocalStorage
}

class DataManager {
  constructor() {
    this.rawData = null
    this.lessons = new Map()
    this.modules = new Map()
    this.lessonsByModule = new Map()
    this.lessonsByLevel = new Map()
    this.lessonsByCategory = new Map()
    this.prerequisiteGraph = new Map()
    this.isInitialized = false
  }

  /**
   * Initialize the data manager with lesson data
   * @param {Object} data - Raw lesson data from JSON
   * @returns {Promise<void>}
   */
  async initialize(data) {
    try {
      // Validate data first
      const validationResult = validateLessonData(data)
      if (!validationResult.isValid) {
        throw new Error(`Data validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`)
      }

      this.rawData = data
      this._buildHierarchicalStructure()
      this.isInitialized = true
      
      console.log('DataManager initialized successfully')
      console.log(`Loaded ${this.lessons.size} lessons across ${this.modules.size} modules`)
      
    } catch (error) {
      console.error('Failed to initialize DataManager:', error)
      throw error
    }
  }

  /**
   * Build hierarchical data structures from flat JSON
   * @private
   */
  _buildHierarchicalStructure() {
    // Clear existing data
    this.lessons.clear()
    this.modules.clear()
    this.lessonsByModule.clear()
    this.lessonsByLevel.clear()
    this.lessonsByCategory.clear()
    this.prerequisiteGraph.clear()

    // Process lessons
    this.rawData.lessons.forEach(lesson => {
      const enhancedLesson = this._enhanceLesson(lesson)
      this.lessons.set(lesson.id, enhancedLesson)
      
      // Group by level
      if (!this.lessonsByLevel.has(lesson.level)) {
        this.lessonsByLevel.set(lesson.level, [])
      }
      this.lessonsByLevel.get(lesson.level).push(enhancedLesson)
      
      // Group by category
      if (!this.lessonsByCategory.has(lesson.category)) {
        this.lessonsByCategory.set(lesson.category, [])
      }
      this.lessonsByCategory.get(lesson.category).push(enhancedLesson)
      
      // Build prerequisite graph
      this.prerequisiteGraph.set(lesson.id, {
        prerequisites: [...lesson.prerequisites],
        dependents: []
      })
    })

    // Build reverse prerequisite relationships
    this.rawData.lessons.forEach(lesson => {
      lesson.prerequisites.forEach(prereqId => {
        if (this.prerequisiteGraph.has(prereqId)) {
          this.prerequisiteGraph.get(prereqId).dependents.push(lesson.id)
        }
      })
    })

    // Process modules
    this.rawData.modules.forEach(module => {
      const enhancedModule = this._enhanceModule(module)
      this.modules.set(module.id, enhancedModule)
      
      // Group lessons by module
      const moduleLessons = module.lessons
        .map(lessonId => this.lessons.get(lessonId))
        .filter(lesson => lesson !== undefined)
        .sort((a, b) => a.order - b.order)
      
      this.lessonsByModule.set(module.id, moduleLessons)
    })
  }

  /**
   * Enhance lesson data with computed properties
   * @private
   */
  _enhanceLesson(lesson) {
    return {
      ...lesson,
      // Add computed properties
      order: this._calculateLessonOrder(lesson),
      difficulty: this._calculateDifficulty(lesson),
      completionStatus: this._getCompletionStatus(lesson.id),
      availableExerciseTypes: lesson.exercises.map(ex => ex.type),
      totalExercises: lesson.exercises.length,
      hasAudio: lesson.content.examples.some(ex => ex.audio),
      hasMedia: lesson.content.media.image !== null || lesson.content.media.video !== null,
      exampleCount: lesson.content.examples.length,
      // Navigation helpers
      isFirstLesson: lesson.prerequisites.length === 0,
      isLastLesson: lesson.nextLessons.length === 0,
      // Metadata
      createdAt: new Date().toISOString(), // Would be from actual data in production
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Enhance module data with computed properties
   * @private
   */
  _enhanceModule(module) {
    const moduleLessons = module.lessons.map(id => this.lessons.get(id)).filter(Boolean)
    
    return {
      ...module,
      // Add computed properties
      totalLessons: module.lessons.length,
      completedLessons: moduleLessons.filter(lesson => 
        this._getCompletionStatus(lesson.id).completed
      ).length,
      totalExercises: moduleLessons.reduce((sum, lesson) => sum + lesson.totalExercises, 0),
      hasAudio: moduleLessons.some(lesson => lesson.hasAudio),
      hasMedia: moduleLessons.some(lesson => lesson.hasMedia),
      // Progress calculation
      progressPercentage: this._calculateModuleProgress(module.id),
      // Navigation
      firstLessonId: module.lessons[0],
      lastLessonId: module.lessons[module.lessons.length - 1],
      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Calculate lesson order based on prerequisites
   * @private
   */
  _calculateLessonOrder(lesson) {
    // Simple ordering based on lesson ID for now
    // In a more complex system, this would use topological sorting
    const match = lesson.id.match(/lesson-(\d+)/)
    return match ? parseInt(match[1]) : 999
  }

  /**
   * Calculate lesson difficulty score
   * @private
   */
  _calculateDifficulty(lesson) {
    let score = 0
    
    // Base difficulty by level
    const levelScores = { beginner: 1, intermediate: 2, advanced: 3 }
    score += levelScores[lesson.level] || 1
    
    // Add complexity based on content
    score += lesson.prerequisites.length * 0.5
    score += lesson.content.examples.length * 0.1
    score += lesson.exercises.length * 0.2
    
    return Math.round(score * 10) / 10
  }

  /**
   * Get completion status for a lesson
   * @private
   */
  _getCompletionStatus(lessonId) {
    // This would integrate with localStorage in a real implementation
    const storage = getStorage()
    const completedLessons = JSON.parse(storage.getItem('completedLessons') || '[]')
    const exerciseScores = JSON.parse(storage.getItem('exerciseScores') || '{}')
    
    return {
      completed: completedLessons.includes(lessonId),
      score: exerciseScores[lessonId] || null,
      completedAt: null // Would be stored in localStorage
    }
  }

  /**
   * Calculate module progress percentage
   * @private
   */
  _calculateModuleProgress(moduleId) {
    const module = this.modules.get(moduleId)
    if (!module || module.totalLessons === 0) return 0
    
    return Math.round((module.completedLessons / module.totalLessons) * 100)
  }

  // Public API Methods

  /**
   * Get a lesson by ID
   * @param {string} lessonId - The lesson ID
   * @returns {Object|null} - The lesson object or null if not found
   */
  getLesson(lessonId) {
    this._ensureInitialized()
    return this.lessons.get(lessonId) || null
  }

  /**
   * Get a module by ID
   * @param {string} moduleId - The module ID
   * @returns {Object|null} - The module object or null if not found
   */
  getModule(moduleId) {
    this._ensureInitialized()
    return this.modules.get(moduleId) || null
  }

  /**
   * Get all lessons in a module
   * @param {string} moduleId - The module ID
   * @returns {Array} - Array of lesson objects
   */
  getLessonsByModule(moduleId) {
    this._ensureInitialized()
    return this.lessonsByModule.get(moduleId) || []
  }

  /**
   * Get lessons by level
   * @param {string} level - The difficulty level
   * @returns {Array} - Array of lesson objects
   */
  getLessonsByLevel(level) {
    this._ensureInitialized()
    return this.lessonsByLevel.get(level) || []
  }

  /**
   * Get lessons by category
   * @param {string} category - The lesson category
   * @returns {Array} - Array of lesson objects
   */
  getLessonsByCategory(category) {
    this._ensureInitialized()
    return this.lessonsByCategory.get(category) || []
  }

  /**
   * Get all modules
   * @returns {Array} - Array of module objects
   */
  getAllModules() {
    this._ensureInitialized()
    return Array.from(this.modules.values())
  }

  /**
   * Get all lessons
   * @returns {Array} - Array of lesson objects
   */
  getAllLessons() {
    this._ensureInitialized()
    return Array.from(this.lessons.values())
  }

  /**
   * Get prerequisite information for a lesson
   * @param {string} lessonId - The lesson ID
   * @returns {Object} - Prerequisite information
   */
  getPrerequisiteInfo(lessonId) {
    this._ensureInitialized()
    const info = this.prerequisiteGraph.get(lessonId)
    if (!info) return { prerequisites: [], dependents: [] }
    
    return {
      prerequisites: info.prerequisites.map(id => this.getLesson(id)).filter(Boolean),
      dependents: info.dependents.map(id => this.getLesson(id)).filter(Boolean)
    }
  }

  /**
   * Check if a lesson is available (prerequisites met)
   * @param {string} lessonId - The lesson ID
   * @returns {boolean} - True if lesson is available
   */
  isLessonAvailable(lessonId) {
    this._ensureInitialized()
    const lesson = this.getLesson(lessonId)
    if (!lesson) return false
    
    const storage = getStorage()
    const completedLessons = JSON.parse(storage.getItem('completedLessons') || '[]')
    return lesson.prerequisites.every(prereqId => completedLessons.includes(prereqId))
  }

  /**
   * Get next available lesson for user
   * @returns {Object|null} - Next lesson to take or null if none available
   */
  getNextAvailableLesson() {
    this._ensureInitialized()
    const storage = getStorage()
    const completedLessons = JSON.parse(storage.getItem('completedLessons') || '[]')
    
    // Find first incomplete lesson that has all prerequisites met
    for (const lesson of this.lessons.values()) {
      if (!completedLessons.includes(lesson.id) && this.isLessonAvailable(lesson.id)) {
        return lesson
      }
    }
    
    return null
  }

  /**
   * Get learning statistics
   * @returns {Object} - Learning statistics
   */
  getStatistics() {
    this._ensureInitialized()
    const storage = getStorage()
    const completedLessons = JSON.parse(storage.getItem('completedLessons') || '[]')
    
    return {
      totalLessons: this.lessons.size,
      completedLessons: completedLessons.length,
      totalModules: this.modules.size,
      completedModules: Array.from(this.modules.values()).filter(m => m.progressPercentage === 100).length,
      totalEstimatedTime: Array.from(this.lessons.values()).reduce((sum, l) => sum + l.estimatedTime, 0),
      progressPercentage: Math.round((completedLessons.length / this.lessons.size) * 100),
      availableLessons: Array.from(this.lessons.values()).filter(l => this.isLessonAvailable(l.id)).length
    }
  }

  /**
   * Search lessons by text
   * @param {string} query - Search query
   * @returns {Array} - Array of matching lessons
   */
  searchLessons(query) {
    this._ensureInitialized()
    const lowercaseQuery = query.toLowerCase()
    
    return Array.from(this.lessons.values()).filter(lesson => 
      lesson.title.toLowerCase().includes(lowercaseQuery) ||
      lesson.description.toLowerCase().includes(lowercaseQuery) ||
      lesson.category.toLowerCase().includes(lowercaseQuery) ||
      lesson.content.text.toLowerCase().includes(lowercaseQuery)
    )
  }

  /**
   * Ensure data manager is initialized
   * @private
   */
  _ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('DataManager not initialized. Call initialize() first.')
    }
  }
}

// Create singleton instance
export const dataManager = new DataManager()

// Export class for testing
export { DataManager }