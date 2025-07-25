/**
 * Performance Tracking System for Korean Learning App
 * Tracks individual exercise performance to identify weak areas and learning patterns
 */

// Performance categories for analysis
export const PERFORMANCE_CATEGORIES = {
  EXERCISE_TYPE: {
    id: 'exercise_type',
    name: 'Exercise Types',
    description: 'Performance across different exercise formats',
    metrics: ['accuracy', 'speed', 'consistency']
  },
  SKILL_AREA: {
    id: 'skill_area',
    name: 'Skill Areas',
    description: 'Performance in different Korean language skills',
    metrics: ['accuracy', 'improvement', 'retention']
  },
  DIFFICULTY_LEVEL: {
    id: 'difficulty_level',
    name: 'Difficulty Levels',
    description: 'Performance across different difficulty settings',
    metrics: ['success_rate', 'time_to_complete', 'help_usage']
  },
  TOPIC: {
    id: 'topic',
    name: 'Topics',
    description: 'Performance in specific learning topics',
    metrics: ['mastery_level', 'retention_rate', 'error_patterns']
  },
  TIME_PATTERNS: {
    id: 'time_patterns',
    name: 'Time Patterns',
    description: 'Performance variations by time of day/week',
    metrics: ['peak_performance', 'consistency', 'fatigue_patterns']
  }
}

// Skill areas mapping
export const SKILL_AREAS = {
  READING: {
    id: 'reading',
    name: 'Reading',
    description: 'Korean text comprehension and recognition',
    exercises: ['quiz', 'flashcard', 'fill-in-the-blank'],
    weight: 1.0
  },
  WRITING: {
    id: 'writing',
    name: 'Writing',
    description: 'Korean text production and composition',
    exercises: ['typing', 'fill-in-the-blank', 'drag-drop'],
    weight: 1.2
  },
  LISTENING: {
    id: 'listening',
    name: 'Listening',
    description: 'Korean audio comprehension',
    exercises: ['listening'],
    weight: 1.3
  },
  SPEAKING: {
    id: 'speaking',
    name: 'Speaking',
    description: 'Korean pronunciation and oral production',
    exercises: ['pronunciation'],
    weight: 1.5
  },
  GRAMMAR: {
    id: 'grammar',
    name: 'Grammar',
    description: 'Korean grammatical structures and rules',
    exercises: ['fill-in-the-blank', 'drag-drop'],
    weight: 1.1
  },
  VOCABULARY: {
    id: 'vocabulary',
    name: 'Vocabulary',
    description: 'Korean word knowledge and usage',
    exercises: ['flashcard', 'quiz', 'typing'],
    weight: 1.0
  }
}

// Performance thresholds for weakness identification
export const WEAKNESS_THRESHOLDS = {
  CRITICAL: {
    accuracy: 40,
    consistency: 30,
    improvement: -10,
    label: 'Critical',
    color: '#e74c3c',
    priority: 1
  },
  WEAK: {
    accuracy: 60,
    consistency: 50,
    improvement: 0,
    label: 'Needs Attention',
    color: '#f39c12',
    priority: 2
  },
  AVERAGE: {
    accuracy: 75,
    consistency: 70,
    improvement: 5,
    label: 'Average',
    color: '#f1c40f',
    priority: 3
  },
  STRONG: {
    accuracy: 85,
    consistency: 80,
    improvement: 10,
    label: 'Strong',
    color: '#27ae60',
    priority: 4
  },
  EXCELLENT: {
    accuracy: 95,
    consistency: 90,
    improvement: 15,
    label: 'Excellent',
    color: '#2ecc71',
    priority: 5
  }
}

/**
 * Track exercise performance data
 * @param {Object} exerciseResult - Exercise completion data
 * @param {Object} existingData - Existing performance data
 * @returns {Object} Updated performance data
 */
export function trackExercisePerformance(exerciseResult, existingData = {}) {
  const {
    exerciseType,
    lessonId,
    score,
    timeSpent,
    difficulty,
    errors = [],
    hintsUsed = 0,
    attempts = 1,
    completedAt
  } = exerciseResult

  const timestamp = new Date(completedAt || Date.now())
  const performanceEntry = {
    id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    exerciseType,
    lessonId,
    score,
    timeSpent,
    difficulty,
    errors,
    hintsUsed,
    attempts,
    timestamp: timestamp.toISOString(),
    dayOfWeek: timestamp.getDay(),
    hourOfDay: timestamp.getHours(),
    skillAreas: identifySkillAreas(exerciseType),
    topics: extractTopics(lessonId, errors)
  }

  // Initialize performance data structure if needed
  const updatedData = {
    entries: [...(existingData.entries || []), performanceEntry],
    summary: existingData.summary || {},
    weakAreas: existingData.weakAreas || {},
    lastUpdated: timestamp.toISOString()
  }

  // Update summary statistics
  updatedData.summary = calculateSummaryStatistics(updatedData.entries)
  
  // Identify weak areas
  updatedData.weakAreas = identifyWeakAreas(updatedData.entries, updatedData.summary)

  return updatedData
}

/**
 * Calculate summary statistics from performance entries
 * @param {Array} entries - Performance entries
 * @returns {Object} Summary statistics
 */
function calculateSummaryStatistics(entries) {
  if (entries.length === 0) {
    return {
      overall: { accuracy: 0, averageTime: 0, totalExercises: 0 },
      byExerciseType: {},
      bySkillArea: {},
      byDifficulty: {},
      trends: {}
    }
  }

  const summary = {
    overall: calculateOverallStats(entries),
    byExerciseType: calculateStatsByCategory(entries, 'exerciseType'),
    bySkillArea: calculateStatsBySkillArea(entries),
    byDifficulty: calculateStatsByCategory(entries, 'difficulty'),
    trends: calculateTrends(entries)
  }

  return summary
}

/**
 * Calculate overall performance statistics
 * @param {Array} entries - Performance entries
 * @returns {Object} Overall statistics
 */
function calculateOverallStats(entries) {
  const totalExercises = entries.length
  const totalScore = entries.reduce((sum, entry) => sum + entry.score, 0)
  const totalTime = entries.reduce((sum, entry) => sum + entry.timeSpent, 0)
  const totalErrors = entries.reduce((sum, entry) => sum + entry.errors.length, 0)
  const totalHints = entries.reduce((sum, entry) => sum + entry.hintsUsed, 0)

  return {
    accuracy: Math.round(totalScore / totalExercises),
    averageTime: Math.round(totalTime / totalExercises),
    totalExercises,
    errorRate: Math.round((totalErrors / totalExercises) * 100) / 100,
    hintUsage: Math.round((totalHints / totalExercises) * 100) / 100,
    consistency: calculateConsistency(entries.map(e => e.score))
  }
}

/**
 * Calculate statistics by category
 * @param {Array} entries - Performance entries
 * @param {string} category - Category field name
 * @returns {Object} Statistics by category
 */
function calculateStatsByCategory(entries, category) {
  const grouped = entries.reduce((acc, entry) => {
    const key = entry[category]
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})

  const stats = {}
  Object.keys(grouped).forEach(key => {
    const categoryEntries = grouped[key]
    stats[key] = {
      accuracy: Math.round(categoryEntries.reduce((sum, e) => sum + e.score, 0) / categoryEntries.length),
      averageTime: Math.round(categoryEntries.reduce((sum, e) => sum + e.timeSpent, 0) / categoryEntries.length),
      totalExercises: categoryEntries.length,
      consistency: calculateConsistency(categoryEntries.map(e => e.score)),
      improvement: calculateImprovement(categoryEntries)
    }
  })

  return stats
}

/**
 * Calculate statistics by skill area
 * @param {Array} entries - Performance entries
 * @returns {Object} Statistics by skill area
 */
function calculateStatsBySkillArea(entries) {
  const skillAreaStats = {}

  // Initialize skill areas
  Object.keys(SKILL_AREAS).forEach(skillId => {
    skillAreaStats[skillId] = {
      accuracy: 0,
      averageTime: 0,
      totalExercises: 0,
      consistency: 0,
      improvement: 0,
      weight: SKILL_AREAS[skillId].weight
    }
  })

  // Group entries by skill areas
  entries.forEach(entry => {
    entry.skillAreas.forEach(skillId => {
      if (skillAreaStats[skillId]) {
        skillAreaStats[skillId].totalExercises++
      }
    })
  })

  // Calculate stats for each skill area
  Object.keys(skillAreaStats).forEach(skillId => {
    const skillEntries = entries.filter(entry => entry.skillAreas.includes(skillId))
    
    if (skillEntries.length > 0) {
      skillAreaStats[skillId] = {
        ...skillAreaStats[skillId],
        accuracy: Math.round(skillEntries.reduce((sum, e) => sum + e.score, 0) / skillEntries.length),
        averageTime: Math.round(skillEntries.reduce((sum, e) => sum + e.timeSpent, 0) / skillEntries.length),
        totalExercises: skillEntries.length,
        consistency: calculateConsistency(skillEntries.map(e => e.score)),
        improvement: calculateImprovement(skillEntries)
      }
    }
  })

  return skillAreaStats
}

/**
 * Calculate performance trends over time
 * @param {Array} entries - Performance entries
 * @returns {Object} Trend analysis
 */
function calculateTrends(entries) {
  if (entries.length < 5) {
    return { overall: 'insufficient_data', recent: 'insufficient_data' }
  }

  const sortedEntries = entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  const recentEntries = sortedEntries.slice(-10) // Last 10 exercises
  const olderEntries = sortedEntries.slice(0, -10)

  const recentAvg = recentEntries.reduce((sum, e) => sum + e.score, 0) / recentEntries.length
  const olderAvg = olderEntries.length > 0 ? 
    olderEntries.reduce((sum, e) => sum + e.score, 0) / olderEntries.length : recentAvg

  const overallTrend = recentAvg > olderAvg + 5 ? 'improving' : 
                      recentAvg < olderAvg - 5 ? 'declining' : 'stable'

  return {
    overall: overallTrend,
    recent: recentAvg,
    improvement: Math.round(recentAvg - olderAvg),
    timePatterns: analyzeTimePatterns(entries)
  }
}

/**
 * Analyze performance patterns by time
 * @param {Array} entries - Performance entries
 * @returns {Object} Time pattern analysis
 */
function analyzeTimePatterns(entries) {
  const hourlyPerformance = {}
  const dailyPerformance = {}

  entries.forEach(entry => {
    const hour = entry.hourOfDay
    const day = entry.dayOfWeek

    if (!hourlyPerformance[hour]) hourlyPerformance[hour] = []
    if (!dailyPerformance[day]) dailyPerformance[day] = []

    hourlyPerformance[hour].push(entry.score)
    dailyPerformance[day].push(entry.score)
  })

  // Find best performing hours and days
  const bestHour = Object.keys(hourlyPerformance).reduce((best, hour) => {
    const avg = hourlyPerformance[hour].reduce((sum, score) => sum + score, 0) / hourlyPerformance[hour].length
    return avg > (hourlyPerformance[best] ? 
      hourlyPerformance[best].reduce((sum, score) => sum + score, 0) / hourlyPerformance[best].length : 0) ? 
      hour : best
  }, '0')

  const bestDay = Object.keys(dailyPerformance).reduce((best, day) => {
    const avg = dailyPerformance[day].reduce((sum, score) => sum + score, 0) / dailyPerformance[day].length
    return avg > (dailyPerformance[best] ? 
      dailyPerformance[best].reduce((sum, score) => sum + score, 0) / dailyPerformance[best].length : 0) ? 
      day : best
  }, '0')

  return {
    bestHour: parseInt(bestHour),
    bestDay: parseInt(bestDay),
    hourlyVariation: calculateVariation(Object.values(hourlyPerformance).map(scores => 
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    )),
    dailyVariation: calculateVariation(Object.values(dailyPerformance).map(scores => 
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    ))
  }
}

/**
 * Identify weak areas based on performance data
 * @param {Array} entries - Performance entries
 * @param {Object} summary - Summary statistics
 * @returns {Object} Identified weak areas
 */
function identifyWeakAreas(entries, summary) {
  const weakAreas = {
    critical: [],
    weak: [],
    recommendations: []
  }

  // Check exercise types
  Object.keys(summary.byExerciseType).forEach(exerciseType => {
    const stats = summary.byExerciseType[exerciseType]
    const weakness = assessWeakness(stats)
    
    if (weakness.level === 'CRITICAL' || weakness.level === 'WEAK') {
      const area = {
        type: 'exercise_type',
        name: exerciseType,
        level: weakness.level,
        stats,
        priority: weakness.priority,
        recommendations: generateExerciseTypeRecommendations(exerciseType, stats)
      }
      
      if (weakness.level === 'CRITICAL') {
        weakAreas.critical.push(area)
      } else {
        weakAreas.weak.push(area)
      }
    }
  })

  // Check skill areas
  Object.keys(summary.bySkillArea).forEach(skillArea => {
    const stats = summary.bySkillArea[skillArea]
    const weakness = assessWeakness(stats)
    
    if (weakness.level === 'CRITICAL' || weakness.level === 'WEAK') {
      const area = {
        type: 'skill_area',
        name: skillArea,
        level: weakness.level,
        stats,
        priority: weakness.priority * stats.weight, // Weight by skill importance
        recommendations: generateSkillAreaRecommendations(skillArea, stats)
      }
      
      if (weakness.level === 'CRITICAL') {
        weakAreas.critical.push(area)
      } else {
        weakAreas.weak.push(area)
      }
    }
  })

  // Generate overall recommendations
  weakAreas.recommendations = generateOverallRecommendations(weakAreas, summary)

  // Sort by priority
  weakAreas.critical.sort((a, b) => a.priority - b.priority)
  weakAreas.weak.sort((a, b) => a.priority - b.priority)

  return weakAreas
}

/**
 * Assess weakness level based on statistics
 * @param {Object} stats - Performance statistics
 * @returns {Object} Weakness assessment
 */
function assessWeakness(stats) {
  const { accuracy, consistency, improvement } = stats

  if (accuracy <= WEAKNESS_THRESHOLDS.CRITICAL.accuracy || 
      consistency <= WEAKNESS_THRESHOLDS.CRITICAL.consistency ||
      improvement <= WEAKNESS_THRESHOLDS.CRITICAL.improvement) {
    return { level: 'CRITICAL', priority: WEAKNESS_THRESHOLDS.CRITICAL.priority }
  }

  if (accuracy <= WEAKNESS_THRESHOLDS.WEAK.accuracy || 
      consistency <= WEAKNESS_THRESHOLDS.WEAK.consistency ||
      improvement <= WEAKNESS_THRESHOLDS.WEAK.improvement) {
    return { level: 'WEAK', priority: WEAKNESS_THRESHOLDS.WEAK.priority }
  }

  if (accuracy <= WEAKNESS_THRESHOLDS.AVERAGE.accuracy) {
    return { level: 'AVERAGE', priority: WEAKNESS_THRESHOLDS.AVERAGE.priority }
  }

  if (accuracy <= WEAKNESS_THRESHOLDS.STRONG.accuracy) {
    return { level: 'STRONG', priority: WEAKNESS_THRESHOLDS.STRONG.priority }
  }

  return { level: 'EXCELLENT', priority: WEAKNESS_THRESHOLDS.EXCELLENT.priority }
}

/**
 * Generate recommendations for exercise type weaknesses
 * @param {string} exerciseType - Exercise type
 * @param {Object} stats - Performance statistics
 * @returns {Array} Recommendations
 */
function generateExerciseTypeRecommendations(exerciseType, stats) {
  const recommendations = []

  switch (exerciseType) {
    case 'fill-in-the-blank':
      if (stats.accuracy < 60) {
        recommendations.push('Review grammar patterns and common Korean sentence structures')
        recommendations.push('Practice with easier fill-in-the-blank exercises first')
      }
      if (stats.averageTime > 120000) { // 2 minutes
        recommendations.push('Work on recognizing Korean grammar patterns more quickly')
      }
      break

    case 'drag-drop':
      if (stats.accuracy < 60) {
        recommendations.push('Study Korean sentence structure and word order')
        recommendations.push('Practice with shorter sentences first')
      }
      break

    case 'listening':
      if (stats.accuracy < 60) {
        recommendations.push('Start with slower audio speeds')
        recommendations.push('Focus on individual word recognition before full sentences')
      }
      break

    case 'typing':
      if (stats.accuracy < 60) {
        recommendations.push('Practice Korean keyboard layout')
        recommendations.push('Start with individual characters before full words')
      }
      break

    default:
      recommendations.push(`Focus on more ${exerciseType} practice`)
  }

  return recommendations
}

/**
 * Generate recommendations for skill area weaknesses
 * @param {string} skillArea - Skill area
 * @param {Object} stats - Performance statistics
 * @returns {Array} Recommendations
 */
function generateSkillAreaRecommendations(skillArea, stats) {
  const recommendations = []
  const skillInfo = SKILL_AREAS[skillArea.toUpperCase()]

  if (skillInfo) {
    recommendations.push(`Focus on ${skillInfo.description.toLowerCase()}`)
    recommendations.push(`Practice more ${skillInfo.exercises.join(', ')} exercises`)
  }

  if (stats.consistency < 50) {
    recommendations.push('Practice regularly to improve consistency')
  }

  if (stats.improvement < 0) {
    recommendations.push('Review fundamentals before advancing to harder content')
  }

  return recommendations
}

/**
 * Generate overall recommendations based on weak areas
 * @param {Object} weakAreas - Identified weak areas
 * @param {Object} summary - Performance summary
 * @returns {Array} Overall recommendations
 */
function generateOverallRecommendations(weakAreas, summary) {
  const recommendations = []

  if (weakAreas.critical.length > 0) {
    recommendations.push({
      priority: 'high',
      message: `Focus on critical areas: ${weakAreas.critical.map(area => area.name).join(', ')}`,
      action: 'review_fundamentals'
    })
  }

  if (summary.overall.consistency < 60) {
    recommendations.push({
      priority: 'medium',
      message: 'Your performance varies significantly. Try to practice at consistent times.',
      action: 'establish_routine'
    })
  }

  if (summary.trends.overall === 'declining') {
    recommendations.push({
      priority: 'high',
      message: 'Your recent performance is declining. Consider taking a break or reviewing basics.',
      action: 'review_or_rest'
    })
  }

  return recommendations
}

/**
 * Helper functions
 */

function calculateConsistency(scores) {
  if (scores.length < 2) return 100
  
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const standardDeviation = Math.sqrt(variance)
  
  // Convert to consistency percentage (lower deviation = higher consistency)
  return Math.max(0, Math.round(100 - (standardDeviation / mean) * 100))
}

function calculateImprovement(entries) {
  if (entries.length < 3) return 0
  
  const sortedEntries = entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  const firstHalf = sortedEntries.slice(0, Math.floor(sortedEntries.length / 2))
  const secondHalf = sortedEntries.slice(Math.floor(sortedEntries.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, e) => sum + e.score, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, e) => sum + e.score, 0) / secondHalf.length
  
  return Math.round(secondAvg - firstAvg)
}

function calculateVariation(values) {
  if (values.length < 2) return 0
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  
  return Math.round(Math.sqrt(variance))
}

function identifySkillAreas(exerciseType) {
  const skillAreas = []
  
  Object.keys(SKILL_AREAS).forEach(skillId => {
    if (SKILL_AREAS[skillId].exercises.includes(exerciseType)) {
      skillAreas.push(skillId.toLowerCase())
    }
  })
  
  return skillAreas
}

function extractTopics(lessonId, errors) {
  // This would be enhanced with actual lesson content analysis
  // For now, return basic topic extraction based on lesson ID
  const topics = []
  
  if (lessonId) {
    if (lessonId.includes('hangul') || lessonId.includes('001') || lessonId.includes('002')) {
      topics.push('hangul', 'alphabet')
    }
    if (lessonId.includes('greeting') || lessonId.includes('004') || lessonId.includes('005')) {
      topics.push('greetings', 'basic_conversation')
    }
  }
  
  return topics
}

/**
 * Get performance insights for display
 * @param {Object} performanceData - Performance tracking data
 * @returns {Object} Formatted insights
 */
export function getPerformanceInsights(performanceData) {
  if (!performanceData || !performanceData.entries || performanceData.entries.length === 0) {
    return {
      hasData: false,
      message: 'Complete more exercises to see performance insights'
    }
  }

  const { summary, weakAreas } = performanceData

  return {
    hasData: true,
    overall: summary.overall,
    strengths: identifyStrengths(summary),
    weaknesses: weakAreas,
    trends: summary.trends,
    recommendations: weakAreas.recommendations || [],
    nextSteps: generateNextSteps(weakAreas, summary)
  }
}

/**
 * Identify user's strengths based on performance
 * @param {Object} summary - Performance summary
 * @returns {Array} Identified strengths
 */
function identifyStrengths(summary) {
  const strengths = []

  // Check exercise types
  Object.keys(summary.byExerciseType).forEach(exerciseType => {
    const stats = summary.byExerciseType[exerciseType]
    if (stats.accuracy >= 85 && stats.consistency >= 80) {
      strengths.push({
        type: 'exercise_type',
        name: exerciseType,
        accuracy: stats.accuracy,
        message: `You excel at ${exerciseType} exercises`
      })
    }
  })

  // Check skill areas
  Object.keys(summary.bySkillArea).forEach(skillArea => {
    const stats = summary.bySkillArea[skillArea]
    if (stats.accuracy >= 85 && stats.consistency >= 80) {
      strengths.push({
        type: 'skill_area',
        name: skillArea,
        accuracy: stats.accuracy,
        message: `Your ${skillArea} skills are strong`
      })
    }
  })

  return strengths
}

/**
 * Generate next steps based on performance analysis
 * @param {Object} weakAreas - Identified weak areas
 * @param {Object} summary - Performance summary
 * @returns {Array} Next steps
 */
function generateNextSteps(weakAreas, summary) {
  const nextSteps = []

  if (weakAreas.critical.length > 0) {
    nextSteps.push({
      priority: 1,
      title: 'Address Critical Areas',
      description: `Focus on improving ${weakAreas.critical[0].name}`,
      action: 'practice_weak_areas',
      estimatedTime: '15-20 minutes daily'
    })
  }

  if (summary.overall.consistency < 70) {
    nextSteps.push({
      priority: 2,
      title: 'Improve Consistency',
      description: 'Practice at the same time each day to build routine',
      action: 'establish_routine',
      estimatedTime: '10-15 minutes daily'
    })
  }

  if (summary.trends.overall === 'stable' && summary.overall.accuracy > 80) {
    nextSteps.push({
      priority: 3,
      title: 'Challenge Yourself',
      description: 'Try harder exercises or new topics',
      action: 'increase_difficulty',
      estimatedTime: '20-30 minutes'
    })
  }

  return nextSteps
}