/**
 * Content Effectiveness Metrics System for Korean Learning App
 * Measures and analyzes the effectiveness of different content types, lessons, and exercises
 */

// Content effectiveness metrics
export const EFFECTIVENESS_METRICS = {
  LEARNING_EFFICIENCY: {
    id: 'learning_efficiency',
    name: 'Learning Efficiency',
    description: 'How quickly users learn from this content',
    weight: 0.25,
    calculation: 'improvement_rate / time_spent'
  },
  RETENTION_RATE: {
    id: 'retention_rate',
    name: 'Retention Rate',
    description: 'How well users remember content over time',
    weight: 0.3,
    calculation: 'long_term_performance / initial_performance'
  },
  ENGAGEMENT_LEVEL: {
    id: 'engagement_level',
    name: 'Engagement Level',
    description: 'How engaged users are with this content',
    weight: 0.2,
    calculation: 'completion_rate * time_on_task * return_rate'
  },
  DIFFICULTY_APPROPRIATENESS: {
    id: 'difficulty_appropriateness',
    name: 'Difficulty Appropriateness',
    description: 'How well the difficulty matches user skill level',
    weight: 0.15,
    calculation: 'optimal_challenge_score'
  },
  USER_SATISFACTION: {
    id: 'user_satisfaction',
    name: 'User Satisfaction',
    description: 'How satisfied users are with this content',
    weight: 0.1,
    calculation: 'average_rating * completion_without_frustration'
  }
}

// Content effectiveness thresholds
export const EFFECTIVENESS_THRESHOLDS = {
  EXCELLENT: {
    score: 85,
    label: 'Excellent',
    color: '#27ae60',
    description: 'Highly effective content that should be promoted'
  },
  GOOD: {
    score: 70,
    label: 'Good',
    color: '#2ecc71',
    description: 'Effective content with minor room for improvement'
  },
  AVERAGE: {
    score: 55,
    label: 'Average',
    color: '#f39c12',
    description: 'Moderately effective content that needs optimization'
  },
  POOR: {
    score: 40,
    label: 'Poor',
    color: '#e67e22',
    description: 'Ineffective content that requires significant improvement'
  },
  CRITICAL: {
    score: 0,
    label: 'Critical',
    color: '#e74c3c',
    description: 'Content that may be hindering learning progress'
  }
}

// Content types for effectiveness analysis
export const CONTENT_TYPES = {
  LESSON: {
    id: 'lesson',
    name: 'Lesson',
    metrics: ['learning_efficiency', 'retention_rate', 'engagement_level']
  },
  EXERCISE: {
    id: 'exercise',
    name: 'Exercise',
    metrics: ['learning_efficiency', 'difficulty_appropriateness', 'user_satisfaction']
  },
  MODULE: {
    id: 'module',
    name: 'Module',
    metrics: ['retention_rate', 'engagement_level', 'user_satisfaction']
  },
  CONCEPT: {
    id: 'concept',
    name: 'Concept',
    metrics: ['learning_efficiency', 'retention_rate', 'difficulty_appropriateness']
  }
}

/**
 * Track content effectiveness data
 * @param {Object} contentInteraction - User interaction with content
 * @param {Object} existingData - Existing effectiveness data
 * @returns {Object} Updated effectiveness data
 */
export function trackContentEffectiveness(contentInteraction, existingData = {}) {
  const {
    contentId,
    contentType,
    userId,
    sessionData,
    performanceData,
    engagementData,
    timestamp
  } = contentInteraction

  // Initialize content data if it doesn't exist
  if (!existingData[contentId]) {
    existingData[contentId] = {
      contentId,
      contentType,
      interactions: [],
      metrics: {},
      lastUpdated: timestamp,
      totalUsers: 0,
      uniqueUsers: new Set()
    }
  }

  const contentData = existingData[contentId]

  // Add new interaction
  contentData.interactions.push({
    userId,
    timestamp,
    sessionData,
    performanceData,
    engagementData
  })

  // Update unique users
  contentData.uniqueUsers.add(userId)
  contentData.totalUsers = contentData.uniqueUsers.size

  // Recalculate metrics
  contentData.metrics = calculateContentMetrics(contentData)
  contentData.lastUpdated = timestamp

  return existingData
}

/**
 * Calculate effectiveness metrics for content
 * @param {Object} contentData - Content interaction data
 * @returns {Object} Calculated metrics
 */
function calculateContentMetrics(contentData) {
  const { interactions, contentType } = contentData
  
  if (interactions.length === 0) {
    return {}
  }

  const metrics = {}
  const contentTypeConfig = CONTENT_TYPES[contentType.toUpperCase()]
  
  if (!contentTypeConfig) {
    return {}
  }

  // Calculate each relevant metric for this content type
  contentTypeConfig.metrics.forEach(metricId => {
    switch (metricId) {
      case 'learning_efficiency':
        metrics.learning_efficiency = calculateLearningEfficiency(interactions)
        break
      case 'retention_rate':
        metrics.retention_rate = calculateRetentionRate(interactions)
        break
      case 'engagement_level':
        metrics.engagement_level = calculateEngagementLevel(interactions)
        break
      case 'difficulty_appropriateness':
        metrics.difficulty_appropriateness = calculateDifficultyAppropriateness(interactions)
        break
      case 'user_satisfaction':
        metrics.user_satisfaction = calculateUserSatisfaction(interactions)
        break
    }
  })

  // Calculate overall effectiveness score
  metrics.overall_effectiveness = calculateOverallEffectiveness(metrics, contentTypeConfig.metrics)

  return metrics
}

/**
 * Calculate learning efficiency metric
 * @param {Array} interactions - User interactions
 * @returns {number} Learning efficiency score (0-100)
 */
function calculateLearningEfficiency(interactions) {
  if (interactions.length === 0) return 0

  let totalEfficiency = 0
  let validInteractions = 0

  interactions.forEach(interaction => {
    const { performanceData, sessionData } = interaction
    
    if (performanceData && sessionData) {
      const improvementRate = calculateImprovementRate(performanceData)
      const timeSpent = sessionData.timeSpent || 0
      
      if (timeSpent > 0) {
        // Efficiency = improvement per minute spent
        const efficiency = (improvementRate / (timeSpent / 60000)) * 100
        totalEfficiency += Math.min(100, Math.max(0, efficiency))
        validInteractions++
      }
    }
  })

  return validInteractions > 0 ? Math.round(totalEfficiency / validInteractions) : 0
}

/**
 * Calculate retention rate metric
 * @param {Array} interactions - User interactions
 * @returns {number} Retention rate score (0-100)
 */
function calculateRetentionRate(interactions) {
  if (interactions.length < 2) return 0

  // Group interactions by user
  const userInteractions = {}
  interactions.forEach(interaction => {
    if (!userInteractions[interaction.userId]) {
      userInteractions[interaction.userId] = []
    }
    userInteractions[interaction.userId].push(interaction)
  })

  let totalRetention = 0
  let validUsers = 0

  Object.keys(userInteractions).forEach(userId => {
    const userSessions = userInteractions[userId].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    )

    if (userSessions.length >= 2) {
      const initialPerformance = getAveragePerformance(userSessions.slice(0, 2))
      const laterPerformance = getAveragePerformance(userSessions.slice(-2))
      
      if (initialPerformance > 0) {
        const retention = (laterPerformance / initialPerformance) * 100
        totalRetention += Math.min(150, Math.max(0, retention)) // Cap at 150% for improvement
        validUsers++
      }
    }
  })

  return validUsers > 0 ? Math.round(totalRetention / validUsers) : 0
}

/**
 * Calculate engagement level metric
 * @param {Array} interactions - User interactions
 * @returns {number} Engagement level score (0-100)
 */
function calculateEngagementLevel(interactions) {
  if (interactions.length === 0) return 0

  let totalEngagement = 0
  let validInteractions = 0

  interactions.forEach(interaction => {
    const { engagementData, sessionData } = interaction
    
    if (engagementData && sessionData) {
      let engagementScore = 0
      
      // Completion rate factor (0-30 points)
      const completionRate = engagementData.completionRate || 0
      engagementScore += completionRate * 0.3
      
      // Time on task factor (0-25 points)
      const expectedTime = sessionData.expectedTime || 600000 // 10 minutes default
      const actualTime = sessionData.timeSpent || 0
      const timeRatio = Math.min(2, actualTime / expectedTime)
      engagementScore += Math.min(25, timeRatio * 12.5)
      
      // Interaction frequency factor (0-20 points)
      const interactions = engagementData.interactions || 0
      const interactionScore = Math.min(20, interactions * 2)
      engagementScore += interactionScore
      
      // Return rate factor (0-25 points)
      const returnRate = engagementData.returnRate || 0
      engagementScore += returnRate * 0.25
      
      totalEngagement += Math.min(100, engagementScore)
      validInteractions++
    }
  })

  return validInteractions > 0 ? Math.round(totalEngagement / validInteractions) : 0
}

/**
 * Calculate difficulty appropriateness metric
 * @param {Array} interactions - User interactions
 * @returns {number} Difficulty appropriateness score (0-100)
 */
function calculateDifficultyAppropriateness(interactions) {
  if (interactions.length === 0) return 0

  let totalAppropriateness = 0
  let validInteractions = 0

  interactions.forEach(interaction => {
    const { performanceData, engagementData } = interaction
    
    if (performanceData) {
      const score = performanceData.score || 0
      const attempts = performanceData.attempts || 1
      const hintsUsed = performanceData.hintsUsed || 0
      
      let appropriateness = 0
      
      // Optimal score range is 70-85% (indicates good challenge level)
      if (score >= 70 && score <= 85) {
        appropriateness += 40
      } else if (score >= 60 && score < 70) {
        appropriateness += 30
      } else if (score >= 85 && score <= 95) {
        appropriateness += 35
      } else if (score > 95) {
        appropriateness += 20 // Too easy
      } else {
        appropriateness += 10 // Too hard
      }
      
      // Attempts factor (1-2 attempts is optimal)
      if (attempts === 1) {
        appropriateness += 25
      } else if (attempts === 2) {
        appropriateness += 20
      } else if (attempts <= 4) {
        appropriateness += 15
      } else {
        appropriateness += 5
      }
      
      // Hints factor (minimal hint usage is optimal)
      if (hintsUsed === 0) {
        appropriateness += 20
      } else if (hintsUsed === 1) {
        appropriateness += 15
      } else if (hintsUsed <= 3) {
        appropriateness += 10
      } else {
        appropriateness += 5
      }
      
      // Engagement factor
      if (engagementData && engagementData.completionRate > 0.8) {
        appropriateness += 15
      }
      
      totalAppropriateness += Math.min(100, appropriateness)
      validInteractions++
    }
  })

  return validInteractions > 0 ? Math.round(totalAppropriateness / validInteractions) : 0
}

/**
 * Calculate user satisfaction metric
 * @param {Array} interactions - User interactions
 * @returns {number} User satisfaction score (0-100)
 */
function calculateUserSatisfaction(interactions) {
  if (interactions.length === 0) return 0

  let totalSatisfaction = 0
  let validInteractions = 0

  interactions.forEach(interaction => {
    const { engagementData, performanceData } = interaction
    
    let satisfaction = 0
    
    // Explicit rating if available
    if (engagementData && engagementData.rating) {
      satisfaction += (engagementData.rating / 5) * 40 // Convert 5-star to 40 points
    }
    
    // Completion without frustration
    if (engagementData && engagementData.completionRate > 0.8) {
      satisfaction += 30
    }
    
    // Performance satisfaction (feeling of progress)
    if (performanceData && performanceData.score >= 70) {
      satisfaction += 20
    }
    
    // Time satisfaction (not too rushed, not too slow)
    if (engagementData && engagementData.timeRatio) {
      const timeRatio = engagementData.timeRatio
      if (timeRatio >= 0.8 && timeRatio <= 1.5) {
        satisfaction += 10
      }
    }
    
    totalSatisfaction += Math.min(100, satisfaction)
    validInteractions++
  })

  return validInteractions > 0 ? Math.round(totalSatisfaction / validInteractions) : 0
}

/**
 * Calculate overall effectiveness score
 * @param {Object} metrics - Individual metrics
 * @param {Array} relevantMetrics - Metrics relevant to this content type
 * @returns {number} Overall effectiveness score (0-100)
 */
function calculateOverallEffectiveness(metrics, relevantMetrics) {
  let weightedScore = 0
  let totalWeight = 0

  relevantMetrics.forEach(metricId => {
    const metricConfig = EFFECTIVENESS_METRICS[metricId.toUpperCase()]
    const metricValue = metrics[metricId] || 0
    
    if (metricConfig) {
      weightedScore += metricValue * metricConfig.weight
      totalWeight += metricConfig.weight
    }
  })

  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0
}

/**
 * Get content effectiveness insights
 * @param {Object} effectivenessData - Content effectiveness data
 * @param {Object} options - Analysis options
 * @returns {Object} Effectiveness insights
 */
export function getContentEffectivenessInsights(effectivenessData, options = {}) {
  const {
    contentType = null,
    minInteractions = 5,
    sortBy = 'overall_effectiveness',
    limit = 20
  } = options

  const insights = {
    topPerforming: [],
    needsImprovement: [],
    recommendations: [],
    summary: {
      totalContent: 0,
      averageEffectiveness: 0,
      contentByThreshold: {}
    }
  }

  // Filter content by type and minimum interactions
  const filteredContent = Object.values(effectivenessData).filter(content => {
    const typeMatch = !contentType || content.contentType === contentType
    const hasEnoughData = content.interactions.length >= minInteractions
    return typeMatch && hasEnoughData
  })

  if (filteredContent.length === 0) {
    return {
      ...insights,
      hasData: false,
      message: 'Not enough data to provide effectiveness insights'
    }
  }

  // Sort content by specified metric
  const sortedContent = filteredContent.sort((a, b) => {
    const aScore = a.metrics[sortBy] || 0
    const bScore = b.metrics[sortBy] || 0
    return bScore - aScore
  })

  // Categorize content by effectiveness
  const categorized = categorizeContentByEffectiveness(sortedContent)
  
  insights.topPerforming = categorized.excellent.concat(categorized.good).slice(0, limit)
  insights.needsImprovement = categorized.poor.concat(categorized.critical).slice(0, limit)

  // Generate recommendations
  insights.recommendations = generateEffectivenessRecommendations(categorized)

  // Calculate summary statistics
  insights.summary = calculateEffectivenessSummary(filteredContent)
  insights.hasData = true

  return insights
}

/**
 * Categorize content by effectiveness thresholds
 * @param {Array} content - Content data
 * @returns {Object} Categorized content
 */
function categorizeContentByEffectiveness(content) {
  const categorized = {
    excellent: [],
    good: [],
    average: [],
    poor: [],
    critical: []
  }

  content.forEach(item => {
    const score = item.metrics.overall_effectiveness || 0
    
    if (score >= EFFECTIVENESS_THRESHOLDS.EXCELLENT.score) {
      categorized.excellent.push(item)
    } else if (score >= EFFECTIVENESS_THRESHOLDS.GOOD.score) {
      categorized.good.push(item)
    } else if (score >= EFFECTIVENESS_THRESHOLDS.AVERAGE.score) {
      categorized.average.push(item)
    } else if (score >= EFFECTIVENESS_THRESHOLDS.POOR.score) {
      categorized.poor.push(item)
    } else {
      categorized.critical.push(item)
    }
  })

  return categorized
}

/**
 * Generate recommendations based on effectiveness analysis
 * @param {Object} categorized - Categorized content
 * @returns {Array} Recommendations
 */
function generateEffectivenessRecommendations(categorized) {
  const recommendations = []

  // Recommendations for excellent content
  if (categorized.excellent.length > 0) {
    recommendations.push({
      type: 'promote',
      priority: 'high',
      message: `Promote ${categorized.excellent.length} excellent content items to more users`,
      action: 'increase_visibility',
      contentIds: categorized.excellent.map(c => c.contentId)
    })
  }

  // Recommendations for poor content
  if (categorized.poor.length > 0) {
    recommendations.push({
      type: 'improve',
      priority: 'medium',
      message: `${categorized.poor.length} content items need improvement`,
      action: 'content_optimization',
      contentIds: categorized.poor.map(c => c.contentId)
    })
  }

  // Recommendations for critical content
  if (categorized.critical.length > 0) {
    recommendations.push({
      type: 'urgent',
      priority: 'critical',
      message: `${categorized.critical.length} content items are hindering learning`,
      action: 'immediate_review',
      contentIds: categorized.critical.map(c => c.contentId)
    })
  }

  // Recommendations for average content
  if (categorized.average.length > categorized.good.length + categorized.excellent.length) {
    recommendations.push({
      type: 'optimize',
      priority: 'low',
      message: 'Most content is average - consider systematic improvements',
      action: 'content_audit',
      contentIds: categorized.average.slice(0, 10).map(c => c.contentId)
    })
  }

  return recommendations
}

/**
 * Calculate effectiveness summary statistics
 * @param {Array} content - Content data
 * @returns {Object} Summary statistics
 */
function calculateEffectivenessSummary(content) {
  const summary = {
    totalContent: content.length,
    averageEffectiveness: 0,
    contentByThreshold: {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
      critical: 0
    },
    metricAverages: {}
  }

  if (content.length === 0) return summary

  // Calculate average effectiveness
  const totalEffectiveness = content.reduce((sum, item) => 
    sum + (item.metrics.overall_effectiveness || 0), 0
  )
  summary.averageEffectiveness = Math.round(totalEffectiveness / content.length)

  // Count content by threshold
  content.forEach(item => {
    const score = item.metrics.overall_effectiveness || 0
    
    if (score >= EFFECTIVENESS_THRESHOLDS.EXCELLENT.score) {
      summary.contentByThreshold.excellent++
    } else if (score >= EFFECTIVENESS_THRESHOLDS.GOOD.score) {
      summary.contentByThreshold.good++
    } else if (score >= EFFECTIVENESS_THRESHOLDS.AVERAGE.score) {
      summary.contentByThreshold.average++
    } else if (score >= EFFECTIVENESS_THRESHOLDS.POOR.score) {
      summary.contentByThreshold.poor++
    } else {
      summary.contentByThreshold.critical++
    }
  })

  // Calculate metric averages
  const metricTotals = {}
  const metricCounts = {}

  content.forEach(item => {
    Object.keys(item.metrics).forEach(metric => {
      if (metric !== 'overall_effectiveness') {
        if (!metricTotals[metric]) {
          metricTotals[metric] = 0
          metricCounts[metric] = 0
        }
        metricTotals[metric] += item.metrics[metric] || 0
        metricCounts[metric]++
      }
    })
  })

  Object.keys(metricTotals).forEach(metric => {
    summary.metricAverages[metric] = Math.round(metricTotals[metric] / metricCounts[metric])
  })

  return summary
}

/**
 * Helper functions
 */

function calculateImprovementRate(performanceData) {
  if (!performanceData.previousScore || !performanceData.score) {
    return 0
  }
  
  return Math.max(0, performanceData.score - performanceData.previousScore)
}

function getAveragePerformance(interactions) {
  if (interactions.length === 0) return 0
  
  const totalScore = interactions.reduce((sum, interaction) => 
    sum + (interaction.performanceData?.score || 0), 0
  )
  
  return totalScore / interactions.length
}

/**
 * Get content optimization suggestions
 * @param {Object} contentData - Content effectiveness data
 * @returns {Array} Optimization suggestions
 */
export function getContentOptimizationSuggestions(contentData) {
  const suggestions = []
  const metrics = contentData.metrics

  if (!metrics) return suggestions

  // Learning efficiency suggestions
  if (metrics.learning_efficiency < 50) {
    suggestions.push({
      metric: 'learning_efficiency',
      issue: 'Low learning efficiency',
      suggestion: 'Consider breaking content into smaller chunks or adding more interactive elements',
      priority: 'high'
    })
  }

  // Retention rate suggestions
  if (metrics.retention_rate < 60) {
    suggestions.push({
      metric: 'retention_rate',
      issue: 'Poor retention rate',
      suggestion: 'Add spaced repetition elements or review activities',
      priority: 'high'
    })
  }

  // Engagement level suggestions
  if (metrics.engagement_level < 55) {
    suggestions.push({
      metric: 'engagement_level',
      issue: 'Low engagement',
      suggestion: 'Add more interactive elements, gamification, or multimedia content',
      priority: 'medium'
    })
  }

  // Difficulty appropriateness suggestions
  if (metrics.difficulty_appropriateness < 60) {
    suggestions.push({
      metric: 'difficulty_appropriateness',
      issue: 'Inappropriate difficulty level',
      suggestion: 'Adjust content difficulty or add adaptive difficulty features',
      priority: 'medium'
    })
  }

  // User satisfaction suggestions
  if (metrics.user_satisfaction < 65) {
    suggestions.push({
      metric: 'user_satisfaction',
      issue: 'Low user satisfaction',
      suggestion: 'Gather user feedback and improve content based on common complaints',
      priority: 'medium'
    })
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}