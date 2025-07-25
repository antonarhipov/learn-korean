/**
 * Review Recommendations System for Korean Learning App
 * Generates personalized review recommendations based on performance analysis
 */

import { SKILL_AREAS, WEAKNESS_THRESHOLDS } from './performanceTracking.js'

// Review recommendation types
export const REVIEW_TYPES = {
  IMMEDIATE: {
    id: 'immediate',
    name: 'Immediate Review',
    description: 'Review content right after learning',
    timing: 'within_1_hour',
    priority: 1,
    effectiveness: 0.9
  },
  SPACED: {
    id: 'spaced',
    name: 'Spaced Review',
    description: 'Review content at increasing intervals',
    timing: 'scheduled',
    priority: 2,
    effectiveness: 0.95
  },
  TARGETED: {
    id: 'targeted',
    name: 'Targeted Review',
    description: 'Focus on specific weak areas',
    timing: 'as_needed',
    priority: 3,
    effectiveness: 0.85
  },
  COMPREHENSIVE: {
    id: 'comprehensive',
    name: 'Comprehensive Review',
    description: 'Review entire topics or modules',
    timing: 'weekly',
    priority: 4,
    effectiveness: 0.8
  },
  MAINTENANCE: {
    id: 'maintenance',
    name: 'Maintenance Review',
    description: 'Keep strong areas fresh',
    timing: 'monthly',
    priority: 5,
    effectiveness: 0.7
  }
}

// Spaced repetition intervals (in days)
export const SPACED_INTERVALS = {
  NEW: [1, 3, 7, 14, 30, 90],
  STRUGGLING: [0.5, 1, 2, 4, 8, 16],
  MASTERED: [7, 21, 60, 180, 365]
}

// Review content types
export const REVIEW_CONTENT_TYPES = {
  EXERCISE: {
    id: 'exercise',
    name: 'Exercise Practice',
    description: 'Repeat specific exercises',
    timeEstimate: '5-10 minutes'
  },
  LESSON: {
    id: 'lesson',
    name: 'Lesson Review',
    description: 'Review lesson content',
    timeEstimate: '10-15 minutes'
  },
  CONCEPT: {
    id: 'concept',
    name: 'Concept Reinforcement',
    description: 'Focus on specific concepts',
    timeEstimate: '5-8 minutes'
  },
  SKILL_DRILL: {
    id: 'skill_drill',
    name: 'Skill Drill',
    description: 'Targeted skill practice',
    timeEstimate: '8-12 minutes'
  },
  MIXED_PRACTICE: {
    id: 'mixed_practice',
    name: 'Mixed Practice',
    description: 'Combine multiple skills',
    timeEstimate: '15-20 minutes'
  }
}

/**
 * Generate review recommendations based on performance data
 * @param {Object} performanceData - User's performance tracking data
 * @param {Object} userPreferences - User's learning preferences
 * @param {Object} availableContent - Available lessons and exercises
 * @returns {Object} Review recommendations
 */
export function generateReviewRecommendations(performanceData, userPreferences = {}, availableContent = {}) {
  if (!performanceData || !performanceData.entries || performanceData.entries.length === 0) {
    return {
      hasRecommendations: false,
      message: 'Complete more exercises to receive personalized review recommendations'
    }
  }

  const { summary, weakAreas, entries } = performanceData
  const recommendations = {
    immediate: [],
    scheduled: [],
    priority: [],
    maintenance: [],
    studyPlan: null
  }

  // Generate immediate review recommendations
  recommendations.immediate = generateImmediateReviews(entries, availableContent)

  // Generate spaced repetition schedule
  recommendations.scheduled = generateSpacedReviews(entries, summary, availableContent)

  // Generate priority recommendations for weak areas
  recommendations.priority = generatePriorityReviews(weakAreas, summary, availableContent)

  // Generate maintenance reviews for strong areas
  recommendations.maintenance = generateMaintenanceReviews(summary, availableContent)

  // Create personalized study plan
  recommendations.studyPlan = createStudyPlan(recommendations, userPreferences)

  return {
    hasRecommendations: true,
    ...recommendations,
    totalRecommendations: getTotalRecommendationCount(recommendations),
    estimatedTime: calculateTotalTime(recommendations),
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Generate immediate review recommendations
 * @param {Array} entries - Performance entries
 * @param {Object} availableContent - Available content
 * @returns {Array} Immediate review recommendations
 */
function generateImmediateReviews(entries, availableContent) {
  const recentEntries = entries
    .filter(entry => {
      const entryTime = new Date(entry.timestamp)
      const now = new Date()
      const hoursDiff = (now - entryTime) / (1000 * 60 * 60)
      return hoursDiff <= 24 // Last 24 hours
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const immediateReviews = []

  recentEntries.forEach(entry => {
    if (entry.score < 70 || entry.errors.length > 2) {
      immediateReviews.push({
        type: REVIEW_TYPES.IMMEDIATE,
        contentType: REVIEW_CONTENT_TYPES.EXERCISE,
        lessonId: entry.lessonId,
        exerciseType: entry.exerciseType,
        reason: 'Low performance on recent exercise',
        priority: calculatePriority(entry.score, entry.errors.length),
        estimatedTime: 8,
        specificFocus: identifySpecificFocus(entry.errors),
        recommendation: `Review ${entry.exerciseType} exercises from this lesson to reinforce weak areas`
      })
    }
  })

  // Remove duplicates and limit to top 5
  const uniqueReviews = removeDuplicateReviews(immediateReviews)
  return uniqueReviews.slice(0, 5)
}

/**
 * Generate spaced repetition review schedule
 * @param {Array} entries - Performance entries
 * @param {Object} summary - Performance summary
 * @param {Object} availableContent - Available content
 * @returns {Array} Scheduled review recommendations
 */
function generateSpacedReviews(entries, summary, availableContent) {
  const spacedReviews = []
  const contentMastery = calculateContentMastery(entries)

  Object.keys(contentMastery).forEach(lessonId => {
    const mastery = contentMastery[lessonId]
    const intervals = getSpacedIntervals(mastery.level)
    const daysSinceLastReview = getDaysSinceLastReview(lessonId, entries)

    intervals.forEach((interval, index) => {
      if (daysSinceLastReview >= interval) {
        spacedReviews.push({
          type: REVIEW_TYPES.SPACED,
          contentType: REVIEW_CONTENT_TYPES.LESSON,
          lessonId: lessonId,
          scheduledFor: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
          interval: interval,
          repetitionNumber: index + 1,
          masteryLevel: mastery.level,
          priority: calculateSpacedPriority(mastery.level, daysSinceLastReview),
          estimatedTime: 12,
          recommendation: `Spaced review of ${lessonId} to strengthen long-term retention`
        })
      }
    })
  })

  return spacedReviews
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 10)
}

/**
 * Generate priority reviews for weak areas
 * @param {Object} weakAreas - Identified weak areas
 * @param {Object} summary - Performance summary
 * @param {Object} availableContent - Available content
 * @returns {Array} Priority review recommendations
 */
function generatePriorityReviews(weakAreas, summary, availableContent) {
  const priorityReviews = []

  // Handle critical weak areas
  weakAreas.critical.forEach(area => {
    priorityReviews.push({
      type: REVIEW_TYPES.TARGETED,
      contentType: getContentTypeForArea(area),
      area: area.name,
      areaType: area.type,
      level: 'critical',
      priority: 1,
      estimatedTime: 20,
      recommendations: area.recommendations,
      specificActions: generateSpecificActions(area),
      recommendation: `Critical focus needed on ${area.name}. ${area.recommendations[0] || 'Practice more exercises in this area.'}`
    })
  })

  // Handle weak areas
  weakAreas.weak.forEach(area => {
    priorityReviews.push({
      type: REVIEW_TYPES.TARGETED,
      contentType: getContentTypeForArea(area),
      area: area.name,
      areaType: area.type,
      level: 'weak',
      priority: 2,
      estimatedTime: 15,
      recommendations: area.recommendations,
      specificActions: generateSpecificActions(area),
      recommendation: `Focus on improving ${area.name}. ${area.recommendations[0] || 'Regular practice will help strengthen this area.'}`
    })
  })

  return priorityReviews.sort((a, b) => a.priority - b.priority)
}

/**
 * Generate maintenance reviews for strong areas
 * @param {Object} summary - Performance summary
 * @param {Object} availableContent - Available content
 * @returns {Array} Maintenance review recommendations
 */
function generateMaintenanceReviews(summary, availableContent) {
  const maintenanceReviews = []

  // Check exercise types with good performance
  Object.keys(summary.byExerciseType).forEach(exerciseType => {
    const stats = summary.byExerciseType[exerciseType]
    if (stats.accuracy >= 85 && stats.consistency >= 80) {
      maintenanceReviews.push({
        type: REVIEW_TYPES.MAINTENANCE,
        contentType: REVIEW_CONTENT_TYPES.EXERCISE,
        exerciseType: exerciseType,
        priority: 5,
        estimatedTime: 10,
        frequency: 'weekly',
        recommendation: `Maintain your strong ${exerciseType} skills with occasional practice`
      })
    }
  })

  // Check skill areas with good performance
  Object.keys(summary.bySkillArea).forEach(skillArea => {
    const stats = summary.bySkillArea[skillArea]
    if (stats.accuracy >= 85 && stats.consistency >= 80 && stats.totalExercises >= 5) {
      maintenanceReviews.push({
        type: REVIEW_TYPES.MAINTENANCE,
        contentType: REVIEW_CONTENT_TYPES.SKILL_DRILL,
        skillArea: skillArea,
        priority: 5,
        estimatedTime: 8,
        frequency: 'bi-weekly',
        recommendation: `Keep your ${skillArea} skills sharp with light practice`
      })
    }
  })

  return maintenanceReviews.slice(0, 5)
}

/**
 * Create personalized study plan
 * @param {Object} recommendations - All recommendations
 * @param {Object} userPreferences - User preferences
 * @returns {Object} Study plan
 */
function createStudyPlan(recommendations, userPreferences) {
  const dailyTimeAvailable = userPreferences.dailyStudyTime || 20 // minutes
  const preferredTimes = userPreferences.preferredStudyTimes || ['morning']
  const studyDays = userPreferences.studyDaysPerWeek || 5

  const plan = {
    daily: [],
    weekly: [],
    monthly: [],
    totalTimePerDay: 0,
    totalTimePerWeek: 0
  }

  // Allocate daily time
  let remainingDailyTime = dailyTimeAvailable

  // Priority reviews first
  recommendations.priority.forEach(review => {
    if (remainingDailyTime >= review.estimatedTime) {
      plan.daily.push({
        ...review,
        scheduledTime: preferredTimes[0] || 'morning',
        frequency: 'daily'
      })
      remainingDailyTime -= review.estimatedTime
    }
  })

  // Add immediate reviews if time allows
  recommendations.immediate.forEach(review => {
    if (remainingDailyTime >= review.estimatedTime) {
      plan.daily.push({
        ...review,
        scheduledTime: preferredTimes[0] || 'morning',
        frequency: 'as_needed'
      })
      remainingDailyTime -= review.estimatedTime
    }
  })

  // Schedule weekly reviews
  recommendations.scheduled.forEach(review => {
    plan.weekly.push({
      ...review,
      frequency: 'weekly'
    })
  })

  // Schedule maintenance reviews
  recommendations.maintenance.forEach(review => {
    plan.monthly.push({
      ...review,
      frequency: review.frequency || 'monthly'
    })
  })

  plan.totalTimePerDay = dailyTimeAvailable - remainingDailyTime
  plan.totalTimePerWeek = plan.totalTimePerDay * studyDays

  return plan
}

/**
 * Helper functions
 */

function calculatePriority(score, errorCount) {
  if (score < 50 || errorCount > 3) return 1
  if (score < 70 || errorCount > 2) return 2
  if (score < 85 || errorCount > 1) return 3
  return 4
}

function identifySpecificFocus(errors) {
  if (!errors || errors.length === 0) return []
  
  // Analyze error patterns
  const focus = []
  errors.forEach(error => {
    if (error.type === 'grammar') focus.push('Korean grammar patterns')
    if (error.type === 'vocabulary') focus.push('Vocabulary recognition')
    if (error.type === 'pronunciation') focus.push('Pronunciation accuracy')
    if (error.type === 'spelling') focus.push('Korean spelling')
  })
  
  return [...new Set(focus)]
}

function removeDuplicateReviews(reviews) {
  const seen = new Set()
  return reviews.filter(review => {
    const key = `${review.lessonId}-${review.exerciseType}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function calculateContentMastery(entries) {
  const mastery = {}
  
  entries.forEach(entry => {
    if (!mastery[entry.lessonId]) {
      mastery[entry.lessonId] = {
        scores: [],
        attempts: 0,
        lastAttempt: entry.timestamp
      }
    }
    
    mastery[entry.lessonId].scores.push(entry.score)
    mastery[entry.lessonId].attempts++
    mastery[entry.lessonId].lastAttempt = entry.timestamp
  })
  
  Object.keys(mastery).forEach(lessonId => {
    const data = mastery[lessonId]
    const avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
    const consistency = calculateConsistency(data.scores)
    
    if (avgScore >= 90 && consistency >= 85) {
      data.level = 'mastered'
    } else if (avgScore >= 70 && consistency >= 70) {
      data.level = 'learning'
    } else {
      data.level = 'struggling'
    }
  })
  
  return mastery
}

function calculateConsistency(scores) {
  if (scores.length < 2) return 100
  
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const standardDeviation = Math.sqrt(variance)
  
  return Math.max(0, Math.round(100 - (standardDeviation / mean) * 100))
}

function getSpacedIntervals(masteryLevel) {
  switch (masteryLevel) {
    case 'struggling':
      return SPACED_INTERVALS.STRUGGLING
    case 'mastered':
      return SPACED_INTERVALS.MASTERED
    default:
      return SPACED_INTERVALS.NEW
  }
}

function getDaysSinceLastReview(lessonId, entries) {
  const lessonEntries = entries.filter(entry => entry.lessonId === lessonId)
  if (lessonEntries.length === 0) return 0
  
  const lastEntry = lessonEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
  const daysDiff = (Date.now() - new Date(lastEntry.timestamp)) / (1000 * 60 * 60 * 24)
  
  return Math.floor(daysDiff)
}

function calculateSpacedPriority(masteryLevel, daysSinceLastReview) {
  const baseScore = masteryLevel === 'struggling' ? 1 : 
                   masteryLevel === 'learning' ? 2 : 3
  
  // Higher priority for overdue reviews
  const overdueMultiplier = daysSinceLastReview > 7 ? 0.5 : 1
  
  return baseScore * overdueMultiplier
}

function getContentTypeForArea(area) {
  if (area.type === 'exercise_type') {
    return REVIEW_CONTENT_TYPES.EXERCISE
  } else if (area.type === 'skill_area') {
    return REVIEW_CONTENT_TYPES.SKILL_DRILL
  }
  return REVIEW_CONTENT_TYPES.CONCEPT
}

function generateSpecificActions(area) {
  const actions = []
  
  if (area.type === 'exercise_type') {
    actions.push(`Complete 5 additional ${area.name} exercises`)
    actions.push(`Review ${area.name} exercise instructions`)
    actions.push(`Practice ${area.name} exercises at slower pace`)
  } else if (area.type === 'skill_area') {
    const skillInfo = SKILL_AREAS[area.name.toUpperCase()]
    if (skillInfo) {
      actions.push(`Focus on ${skillInfo.description.toLowerCase()}`)
      actions.push(`Practice ${skillInfo.exercises.join(' and ')} exercises`)
    }
  }
  
  return actions
}

function getTotalRecommendationCount(recommendations) {
  return recommendations.immediate.length + 
         recommendations.scheduled.length + 
         recommendations.priority.length + 
         recommendations.maintenance.length
}

function calculateTotalTime(recommendations) {
  let totalTime = 0
  
  recommendations.immediate.forEach(r => totalTime += r.estimatedTime || 0)
  recommendations.scheduled.forEach(r => totalTime += r.estimatedTime || 0)
  recommendations.priority.forEach(r => totalTime += r.estimatedTime || 0)
  recommendations.maintenance.forEach(r => totalTime += r.estimatedTime || 0)
  
  return totalTime
}

/**
 * Get review recommendations for display
 * @param {Object} recommendations - Generated recommendations
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Object} Formatted recommendations for display
 */
export function getDisplayRecommendations(recommendations, limit = 10) {
  if (!recommendations.hasRecommendations) {
    return {
      hasRecommendations: false,
      message: recommendations.message
    }
  }

  const allRecommendations = [
    ...recommendations.priority,
    ...recommendations.immediate,
    ...recommendations.scheduled.slice(0, 3),
    ...recommendations.maintenance.slice(0, 2)
  ]

  const sortedRecommendations = allRecommendations
    .sort((a, b) => (a.priority || 5) - (b.priority || 5))
    .slice(0, limit)

  return {
    hasRecommendations: true,
    recommendations: sortedRecommendations,
    studyPlan: recommendations.studyPlan,
    summary: {
      totalRecommendations: recommendations.totalRecommendations,
      estimatedTime: recommendations.estimatedTime,
      priorityCount: recommendations.priority.length,
      immediateCount: recommendations.immediate.length
    }
  }
}

/**
 * Mark recommendation as completed
 * @param {string} recommendationId - ID of completed recommendation
 * @param {Object} completionData - Completion details
 * @returns {Object} Updated recommendation status
 */
export function markRecommendationCompleted(recommendationId, completionData) {
  return {
    id: recommendationId,
    completedAt: new Date().toISOString(),
    completionData,
    status: 'completed',
    effectiveness: calculateRecommendationEffectiveness(completionData)
  }
}

/**
 * Calculate recommendation effectiveness
 * @param {Object} completionData - How the recommendation was completed
 * @returns {number} Effectiveness score (0-1)
 */
function calculateRecommendationEffectiveness(completionData) {
  const { score, timeSpent, followedExactly } = completionData
  
  let effectiveness = 0.5 // Base effectiveness
  
  if (score >= 80) effectiveness += 0.3
  if (score >= 90) effectiveness += 0.1
  
  if (followedExactly) effectiveness += 0.1
  
  return Math.min(1, effectiveness)
}