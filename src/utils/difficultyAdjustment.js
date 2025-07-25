/**
 * Difficulty Adjustment System for Korean Learning App
 * Analyzes user performance and adjusts exercise difficulty accordingly
 */

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  VERY_EASY: 'very_easy',
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  VERY_HARD: 'very_hard'
}

// Performance thresholds for difficulty adjustment
const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  AVERAGE: 60,
  POOR: 45,
  VERY_POOR: 30
}

// Time thresholds (in seconds) for different exercise types
const TIME_THRESHOLDS = {
  'fill-in-the-blank': { fast: 30, slow: 120 },
  'drag-drop': { fast: 45, slow: 180 },
  'listening': { fast: 60, slow: 240 },
  'typing': { fast: 60, slow: 300 },
  'quiz': { fast: 20, slow: 90 }
}

/**
 * Analyzes user performance data to determine current skill level
 * @param {Array} performanceHistory - Array of performance records
 * @returns {Object} Analysis results
 */
export function analyzePerformance(performanceHistory) {
  if (!performanceHistory || performanceHistory.length === 0) {
    return {
      averageScore: 0,
      averageTime: 0,
      consistency: 0,
      improvement: 0,
      weakAreas: [],
      strongAreas: []
    }
  }

  // Calculate average score
  const averageScore = performanceHistory.reduce((sum, record) => sum + record.score, 0) / performanceHistory.length

  // Calculate average time
  const averageTime = performanceHistory.reduce((sum, record) => sum + record.timeSpent, 0) / performanceHistory.length

  // Calculate consistency (standard deviation of scores)
  const scoreVariance = performanceHistory.reduce((sum, record) => {
    return sum + Math.pow(record.score - averageScore, 2)
  }, 0) / performanceHistory.length
  const consistency = Math.max(0, 100 - Math.sqrt(scoreVariance))

  // Calculate improvement trend (comparing first half vs second half)
  const midPoint = Math.floor(performanceHistory.length / 2)
  const firstHalfAvg = performanceHistory.slice(0, midPoint).reduce((sum, record) => sum + record.score, 0) / midPoint
  const secondHalfAvg = performanceHistory.slice(midPoint).reduce((sum, record) => sum + record.score, 0) / (performanceHistory.length - midPoint)
  const improvement = secondHalfAvg - firstHalfAvg

  // Identify weak and strong areas by exercise type
  const exerciseTypePerformance = {}
  performanceHistory.forEach(record => {
    if (!exerciseTypePerformance[record.exerciseType]) {
      exerciseTypePerformance[record.exerciseType] = []
    }
    exerciseTypePerformance[record.exerciseType].push(record.score)
  })

  const weakAreas = []
  const strongAreas = []
  
  Object.entries(exerciseTypePerformance).forEach(([type, scores]) => {
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    if (avgScore < PERFORMANCE_THRESHOLDS.AVERAGE) {
      weakAreas.push({ type, averageScore: avgScore })
    } else if (avgScore > PERFORMANCE_THRESHOLDS.GOOD) {
      strongAreas.push({ type, averageScore: avgScore })
    }
  })

  return {
    averageScore,
    averageTime,
    consistency,
    improvement,
    weakAreas,
    strongAreas,
    totalAttempts: performanceHistory.length
  }
}

/**
 * Determines the appropriate difficulty level based on performance analysis
 * @param {Object} analysis - Performance analysis results
 * @param {string} exerciseType - Type of exercise
 * @param {string} currentDifficulty - Current difficulty level
 * @returns {string} Recommended difficulty level
 */
export function recommendDifficulty(analysis, exerciseType, currentDifficulty = DIFFICULTY_LEVELS.MEDIUM) {
  const { averageScore, averageTime, consistency, improvement, totalAttempts } = analysis

  // Don't adjust difficulty for new users (less than 3 attempts)
  if (totalAttempts < 3) {
    return currentDifficulty
  }

  let difficultyScore = 0

  // Score based on average performance
  if (averageScore >= PERFORMANCE_THRESHOLDS.EXCELLENT) {
    difficultyScore += 2
  } else if (averageScore >= PERFORMANCE_THRESHOLDS.GOOD) {
    difficultyScore += 1
  } else if (averageScore < PERFORMANCE_THRESHOLDS.POOR) {
    difficultyScore -= 2
  } else if (averageScore < PERFORMANCE_THRESHOLDS.AVERAGE) {
    difficultyScore -= 1
  }

  // Score based on time performance
  const timeThreshold = TIME_THRESHOLDS[exerciseType]
  if (timeThreshold) {
    if (averageTime < timeThreshold.fast) {
      difficultyScore += 1
    } else if (averageTime > timeThreshold.slow) {
      difficultyScore -= 1
    }
  }

  // Score based on consistency
  if (consistency > 80) {
    difficultyScore += 1
  } else if (consistency < 50) {
    difficultyScore -= 1
  }

  // Score based on improvement trend
  if (improvement > 10) {
    difficultyScore += 1
  } else if (improvement < -10) {
    difficultyScore -= 1
  }

  // Convert current difficulty to numeric value
  const difficultyLevels = Object.values(DIFFICULTY_LEVELS)
  const currentIndex = difficultyLevels.indexOf(currentDifficulty)
  
  // Calculate new difficulty index
  let newIndex = currentIndex
  if (difficultyScore >= 3) {
    newIndex = Math.min(difficultyLevels.length - 1, currentIndex + 2)
  } else if (difficultyScore >= 2) {
    newIndex = Math.min(difficultyLevels.length - 1, currentIndex + 1)
  } else if (difficultyScore <= -3) {
    newIndex = Math.max(0, currentIndex - 2)
  } else if (difficultyScore <= -2) {
    newIndex = Math.max(0, currentIndex - 1)
  }

  return difficultyLevels[newIndex]
}

/**
 * Adjusts exercise parameters based on difficulty level
 * @param {Object} exercise - Original exercise data
 * @param {string} difficulty - Target difficulty level
 * @returns {Object} Modified exercise data
 */
export function adjustExerciseDifficulty(exercise, difficulty) {
  let adjustedExercise = { ...exercise }

  switch (difficulty) {
    case DIFFICULTY_LEVELS.VERY_EASY:
      adjustedExercise = applyVeryEasyAdjustments(adjustedExercise)
      break
    case DIFFICULTY_LEVELS.EASY:
      adjustedExercise = applyEasyAdjustments(adjustedExercise)
      break
    case DIFFICULTY_LEVELS.MEDIUM:
      // No adjustments needed for medium difficulty
      break
    case DIFFICULTY_LEVELS.HARD:
      adjustedExercise = applyHardAdjustments(adjustedExercise)
      break
    case DIFFICULTY_LEVELS.VERY_HARD:
      adjustedExercise = applyVeryHardAdjustments(adjustedExercise)
      break
  }

  adjustedExercise.currentDifficulty = difficulty
  return adjustedExercise
}

/**
 * Apply very easy difficulty adjustments
 */
function applyVeryEasyAdjustments(exercise) {
  const adjusted = { ...exercise }

  switch (exercise.type) {
    case 'fill-in-the-blank':
      // Add more hints, reduce number of questions
      if (adjusted.questions) {
        adjusted.questions = adjusted.questions.slice(0, Math.max(1, Math.floor(adjusted.questions.length * 0.6)))
        adjusted.questions.forEach(q => {
          if (!q.hint) {
            q.hint = `The answer starts with "${q.correctAnswer.charAt(0)}"`
          }
        })
      }
      break

    case 'drag-drop':
      // Reduce number of words, add visual hints
      if (adjusted.questions) {
        adjusted.questions = adjusted.questions.slice(0, Math.max(1, Math.floor(adjusted.questions.length * 0.7)))
        adjusted.questions.forEach(q => {
          if (q.words && q.words.length > 3) {
            q.words = q.words.slice(0, 3)
            q.correctOrder = q.correctOrder.slice(0, 3)
          }
        })
      }
      break

    case 'listening':
      // Slower default speed, fewer questions
      adjusted.defaultSpeed = 0.75
      if (adjusted.questions) {
        adjusted.questions = adjusted.questions.slice(0, Math.max(1, Math.floor(adjusted.questions.length * 0.6)))
      }
      break

    case 'typing':
      // Shorter texts, more time
      if (adjusted.texts) {
        adjusted.texts = adjusted.texts.map(text => ({
          ...text,
          korean: text.korean.length > 10 ? text.korean.substring(0, 10) : text.korean
        }))
      }
      break
  }

  return adjusted
}

/**
 * Apply easy difficulty adjustments
 */
function applyEasyAdjustments(exercise) {
  const adjusted = { ...exercise }

  switch (exercise.type) {
    case 'fill-in-the-blank':
      // Reduce number of questions slightly
      if (adjusted.questions) {
        adjusted.questions = adjusted.questions.slice(0, Math.max(2, Math.floor(adjusted.questions.length * 0.8)))
      }
      break

    case 'drag-drop':
      // Slightly reduce complexity
      if (adjusted.questions) {
        adjusted.questions = adjusted.questions.slice(0, Math.max(2, Math.floor(adjusted.questions.length * 0.8)))
      }
      break

    case 'listening':
      // Slightly slower default speed
      adjusted.defaultSpeed = 0.9
      break

    case 'typing':
      // Slightly shorter texts
      if (adjusted.texts) {
        adjusted.texts = adjusted.texts.map(text => ({
          ...text,
          korean: text.korean.length > 15 ? text.korean.substring(0, 15) : text.korean
        }))
      }
      break
  }

  return adjusted
}

/**
 * Apply hard difficulty adjustments
 */
function applyHardAdjustments(exercise) {
  const adjusted = { ...exercise }

  switch (exercise.type) {
    case 'fill-in-the-blank':
      // Remove hints, add more questions
      if (adjusted.questions) {
        adjusted.questions.forEach(q => {
          delete q.hint
        })
      }
      break

    case 'drag-drop':
      // Add more complex sentences
      if (adjusted.questions) {
        adjusted.questions.forEach(q => {
          if (q.words && q.words.length < 6) {
            // Add complexity by including more grammatical particles
            q.words.push('은', '를', '에서')
            q.correctOrder.push('은', '를', '에서')
          }
        })
      }
      break

    case 'listening':
      // Faster default speed, no transcript
      adjusted.defaultSpeed = 1.25
      delete adjusted.transcript
      break

    case 'typing':
      // Longer, more complex texts
      if (adjusted.texts) {
        adjusted.texts = adjusted.texts.map(text => ({
          ...text,
          korean: text.korean + text.korean // Double the length
        }))
      }
      break
  }

  return adjusted
}

/**
 * Apply very hard difficulty adjustments
 */
function applyVeryHardAdjustments(exercise) {
  const adjusted = { ...exercise }

  switch (exercise.type) {
    case 'fill-in-the-blank':
      // Remove all hints and translations
      if (adjusted.questions) {
        adjusted.questions.forEach(q => {
          delete q.hint
          delete q.translation
        })
      }
      break

    case 'drag-drop':
      // Maximum complexity
      if (adjusted.questions) {
        adjusted.questions.forEach(q => {
          delete q.translation
          delete q.context
        })
      }
      break

    case 'listening':
      // Fastest speed, no aids
      adjusted.defaultSpeed = 1.5
      delete adjusted.transcript
      if (adjusted.questions) {
        adjusted.questions.forEach(q => {
          delete q.hint
        })
      }
      break

    case 'typing':
      // Longest, most complex texts
      if (adjusted.texts) {
        adjusted.texts = adjusted.texts.map(text => ({
          ...text,
          korean: text.korean + text.korean + text.korean, // Triple the length
          romanization: undefined, // Remove romanization help
          translation: undefined // Remove translation help
        }))
      }
      break
  }

  return adjusted
}

/**
 * Gets difficulty adjustment recommendations for the user
 * @param {Array} performanceHistory - User's performance history
 * @param {string} exerciseType - Type of exercise
 * @returns {Object} Recommendations object
 */
export function getDifficultyRecommendations(performanceHistory, exerciseType) {
  const analysis = analyzePerformance(performanceHistory)
  const currentDifficulty = DIFFICULTY_LEVELS.MEDIUM // Default
  const recommendedDifficulty = recommendDifficulty(analysis, exerciseType, currentDifficulty)

  return {
    analysis,
    currentDifficulty,
    recommendedDifficulty,
    shouldAdjust: currentDifficulty !== recommendedDifficulty,
    adjustmentReason: getAdjustmentReason(analysis, currentDifficulty, recommendedDifficulty)
  }
}

/**
 * Provides human-readable explanation for difficulty adjustment
 */
function getAdjustmentReason(analysis, currentDifficulty, recommendedDifficulty) {
  const difficultyLevels = Object.values(DIFFICULTY_LEVELS)
  const currentIndex = difficultyLevels.indexOf(currentDifficulty)
  const recommendedIndex = difficultyLevels.indexOf(recommendedDifficulty)

  if (recommendedIndex > currentIndex) {
    return `Your performance has been excellent (${Math.round(analysis.averageScore)}% average). Let's increase the challenge!`
  } else if (recommendedIndex < currentIndex) {
    return `Let's adjust the difficulty to help you build confidence. Your current average is ${Math.round(analysis.averageScore)}%.`
  } else {
    return `Your current difficulty level seems just right for your skill level.`
  }
}