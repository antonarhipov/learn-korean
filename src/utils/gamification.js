/**
 * Gamification System for Korean Learning App
 * Manages points, achievements, streaks, and user engagement features
 */

// Point values for different activities
export const POINT_VALUES = {
  EXERCISE_COMPLETION: {
    EXCELLENT: 100,    // 90%+ score
    GOOD: 75,         // 75-89% score
    AVERAGE: 50,      // 60-74% score
    POOR: 25,         // 45-59% score
    MINIMAL: 10       // Below 45%
  },
  LESSON_COMPLETION: 200,
  MODULE_COMPLETION: 500,
  DAILY_GOAL: 100,
  WEEKLY_GOAL: 300,
  STREAK_BONUS: {
    3: 50,    // 3-day streak
    7: 150,   // 1-week streak
    14: 300,  // 2-week streak
    30: 750,  // 1-month streak
    100: 2000 // 100-day streak
  },
  SPEED_BONUS: {
    FAST: 25,     // Completed in less than expected time
    VERY_FAST: 50 // Completed in half the expected time
  },
  FIRST_TRY_BONUS: 30,
  PERFECT_SCORE_BONUS: 50
}

// Achievement definitions
export const ACHIEVEMENTS = {
  // Exercise-based achievements
  FIRST_EXERCISE: {
    id: 'first_exercise',
    name: 'First Steps',
    description: 'Complete your first exercise',
    icon: '🎯',
    points: 50,
    category: 'milestone'
  },
  EXERCISE_MASTER: {
    id: 'exercise_master',
    name: 'Exercise Master',
    description: 'Complete 50 exercises',
    icon: '🏆',
    points: 500,
    category: 'milestone',
    requirement: 50
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Get 100% on any exercise',
    icon: '⭐',
    points: 100,
    category: 'performance'
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 10 exercises in record time',
    icon: '⚡',
    points: 200,
    category: 'performance',
    requirement: 10
  },
  
  // Streak achievements
  STREAK_3: {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    points: 100,
    category: 'streak'
  },
  STREAK_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    points: 250,
    category: 'streak'
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day learning streak',
    icon: '🔥',
    points: 1000,
    category: 'streak'
  },
  
  // Learning achievements
  LESSON_COMPLETE: {
    id: 'lesson_complete',
    name: 'Lesson Learned',
    description: 'Complete your first lesson',
    icon: '📚',
    points: 100,
    category: 'milestone'
  },
  MODULE_MASTER: {
    id: 'module_master',
    name: 'Module Master',
    description: 'Complete an entire module',
    icon: '🎓',
    points: 300,
    category: 'milestone'
  },
  
  // Skill-specific achievements
  HANGUL_HERO: {
    id: 'hangul_hero',
    name: 'Hangul Hero',
    description: 'Master all Hangul lessons',
    icon: '한',
    points: 400,
    category: 'skill'
  },
  TYPING_MASTER: {
    id: 'typing_master',
    name: 'Typing Master',
    description: 'Complete 20 typing exercises',
    icon: '⌨️',
    points: 300,
    category: 'skill',
    requirement: 20
  },
  LISTENING_EXPERT: {
    id: 'listening_expert',
    name: 'Listening Expert',
    description: 'Complete 15 listening exercises',
    icon: '👂',
    points: 300,
    category: 'skill',
    requirement: 15
  }
}

/**
 * Calculate points earned for exercise completion
 * @param {Object} exerciseResult - Exercise completion data
 * @returns {Object} Points breakdown
 */
export function calculateExercisePoints(exerciseResult) {
  const { score, timeSpent, expectedTime, isFirstTry, exerciseType } = exerciseResult
  let totalPoints = 0
  const breakdown = []

  // Base points based on score
  let basePoints = 0
  if (score >= 90) {
    basePoints = POINT_VALUES.EXERCISE_COMPLETION.EXCELLENT
    breakdown.push({ reason: 'Excellent performance (90%+)', points: basePoints })
  } else if (score >= 75) {
    basePoints = POINT_VALUES.EXERCISE_COMPLETION.GOOD
    breakdown.push({ reason: 'Good performance (75-89%)', points: basePoints })
  } else if (score >= 60) {
    basePoints = POINT_VALUES.EXERCISE_COMPLETION.AVERAGE
    breakdown.push({ reason: 'Average performance (60-74%)', points: basePoints })
  } else if (score >= 45) {
    basePoints = POINT_VALUES.EXERCISE_COMPLETION.POOR
    breakdown.push({ reason: 'Needs improvement (45-59%)', points: basePoints })
  } else {
    basePoints = POINT_VALUES.EXERCISE_COMPLETION.MINIMAL
    breakdown.push({ reason: 'Keep practicing (<45%)', points: basePoints })
  }
  totalPoints += basePoints

  // Perfect score bonus
  if (score === 100) {
    totalPoints += POINT_VALUES.PERFECT_SCORE_BONUS
    breakdown.push({ reason: 'Perfect score bonus', points: POINT_VALUES.PERFECT_SCORE_BONUS })
  }

  // Speed bonus
  if (expectedTime && timeSpent) {
    const timeRatio = timeSpent / expectedTime
    if (timeRatio <= 0.5) {
      totalPoints += POINT_VALUES.SPEED_BONUS.VERY_FAST
      breakdown.push({ reason: 'Lightning fast completion', points: POINT_VALUES.SPEED_BONUS.VERY_FAST })
    } else if (timeRatio <= 0.75) {
      totalPoints += POINT_VALUES.SPEED_BONUS.FAST
      breakdown.push({ reason: 'Fast completion', points: POINT_VALUES.SPEED_BONUS.FAST })
    }
  }

  // First try bonus
  if (isFirstTry) {
    totalPoints += POINT_VALUES.FIRST_TRY_BONUS
    breakdown.push({ reason: 'First try success', points: POINT_VALUES.FIRST_TRY_BONUS })
  }

  return {
    totalPoints,
    breakdown,
    exerciseType
  }
}

/**
 * Calculate streak bonus points
 * @param {number} streakDays - Current streak length
 * @returns {Object} Streak bonus information
 */
export function calculateStreakBonus(streakDays) {
  const bonusPoints = POINT_VALUES.STREAK_BONUS[streakDays] || 0
  return {
    streakDays,
    bonusPoints,
    isBonus: bonusPoints > 0,
    nextMilestone: getNextStreakMilestone(streakDays)
  }
}

/**
 * Get the next streak milestone
 * @param {number} currentStreak - Current streak length
 * @returns {number} Next milestone or null
 */
function getNextStreakMilestone(currentStreak) {
  const milestones = Object.keys(POINT_VALUES.STREAK_BONUS).map(Number).sort((a, b) => a - b)
  return milestones.find(milestone => milestone > currentStreak) || null
}

/**
 * Check for newly earned achievements
 * @param {Object} userStats - User's current statistics
 * @param {Object} newActivity - New activity data
 * @returns {Array} Array of newly earned achievements
 */
export function checkAchievements(userStats, newActivity) {
  const newAchievements = []
  const earnedAchievements = userStats.achievements || []

  // Check each achievement
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    // Skip if already earned
    if (earnedAchievements.includes(achievement.id)) {
      return
    }

    let earned = false

    switch (achievement.id) {
      case 'first_exercise':
        earned = userStats.exercisesCompleted >= 1
        break
      case 'exercise_master':
        earned = userStats.exercisesCompleted >= achievement.requirement
        break
      case 'perfect_score':
        earned = newActivity.score === 100
        break
      case 'speed_demon':
        earned = userStats.fastCompletions >= achievement.requirement
        break
      case 'streak_3':
        earned = userStats.currentStreak >= 3
        break
      case 'streak_7':
        earned = userStats.currentStreak >= 7
        break
      case 'streak_30':
        earned = userStats.currentStreak >= 30
        break
      case 'lesson_complete':
        earned = userStats.lessonsCompleted >= 1
        break
      case 'module_master':
        earned = userStats.modulesCompleted >= 1
        break
      case 'typing_master':
        earned = userStats.exercisesByType?.typing >= achievement.requirement
        break
      case 'listening_expert':
        earned = userStats.exercisesByType?.listening >= achievement.requirement
        break
      case 'hangul_hero':
        earned = userStats.modulesCompleted >= 1 && userStats.hangulMastery === true
        break
    }

    if (earned) {
      newAchievements.push(achievement)
    }
  })

  return newAchievements
}

/**
 * Update user statistics after activity
 * @param {Object} currentStats - Current user statistics
 * @param {Object} activity - New activity data
 * @returns {Object} Updated statistics
 */
export function updateUserStats(currentStats, activity) {
  const stats = { ...currentStats }
  const today = new Date().toDateString()

  // Initialize stats if needed
  if (!stats.totalPoints) stats.totalPoints = 0
  if (!stats.exercisesCompleted) stats.exercisesCompleted = 0
  if (!stats.lessonsCompleted) stats.lessonsCompleted = 0
  if (!stats.modulesCompleted) stats.modulesCompleted = 0
  if (!stats.currentStreak) stats.currentStreak = 0
  if (!stats.longestStreak) stats.longestStreak = 0
  if (!stats.lastActivityDate) stats.lastActivityDate = null
  if (!stats.exercisesByType) stats.exercisesByType = {}
  if (!stats.achievements) stats.achievements = []
  if (!stats.fastCompletions) stats.fastCompletions = 0

  // Update activity date and streak
  const lastDate = stats.lastActivityDate
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayString = yesterday.toDateString()

  if (lastDate === today) {
    // Same day, no streak change
  } else if (lastDate === yesterdayString) {
    // Consecutive day, increment streak
    stats.currentStreak += 1
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak)
  } else if (lastDate) {
    // Streak broken, reset to 1
    stats.currentStreak = 1
  } else {
    // First activity ever
    stats.currentStreak = 1
  }

  stats.lastActivityDate = today

  // Update activity-specific stats
  if (activity.type === 'exercise') {
    stats.exercisesCompleted += 1
    stats.totalPoints += activity.points || 0

    // Track by exercise type
    if (activity.exerciseType) {
      if (!stats.exercisesByType[activity.exerciseType]) {
        stats.exercisesByType[activity.exerciseType] = 0
      }
      stats.exercisesByType[activity.exerciseType] += 1
    }

    // Track fast completions
    if (activity.isFast) {
      stats.fastCompletions += 1
    }
  } else if (activity.type === 'lesson') {
    stats.lessonsCompleted += 1
    stats.totalPoints += POINT_VALUES.LESSON_COMPLETION
  } else if (activity.type === 'module') {
    stats.modulesCompleted += 1
    stats.totalPoints += POINT_VALUES.MODULE_COMPLETION
  }

  // Add streak bonus if applicable
  const streakBonus = calculateStreakBonus(stats.currentStreak)
  if (streakBonus.isBonus) {
    stats.totalPoints += streakBonus.bonusPoints
  }

  return stats
}

/**
 * Get user's current level based on total points
 * @param {number} totalPoints - User's total points
 * @returns {Object} Level information
 */
export function getUserLevel(totalPoints) {
  const levels = [
    { level: 1, name: 'Beginner', minPoints: 0, maxPoints: 499, color: '#6c757d' },
    { level: 2, name: 'Student', minPoints: 500, maxPoints: 1499, color: '#28a745' },
    { level: 3, name: 'Learner', minPoints: 1500, maxPoints: 2999, color: '#17a2b8' },
    { level: 4, name: 'Scholar', minPoints: 3000, maxPoints: 4999, color: '#ffc107' },
    { level: 5, name: 'Expert', minPoints: 5000, maxPoints: 7999, color: '#fd7e14' },
    { level: 6, name: 'Master', minPoints: 8000, maxPoints: 11999, color: '#e83e8c' },
    { level: 7, name: 'Grandmaster', minPoints: 12000, maxPoints: 19999, color: '#6f42c1' },
    { level: 8, name: 'Legend', minPoints: 20000, maxPoints: Infinity, color: '#dc3545' }
  ]

  const currentLevel = levels.find(level => 
    totalPoints >= level.minPoints && totalPoints <= level.maxPoints
  ) || levels[0]

  const nextLevel = levels.find(level => level.level === currentLevel.level + 1)
  const progress = nextLevel ? 
    ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100 : 100

  return {
    ...currentLevel,
    progress: Math.min(100, Math.max(0, progress)),
    pointsToNext: nextLevel ? nextLevel.minPoints - totalPoints : 0,
    nextLevel
  }
}

/**
 * Format points with appropriate suffix
 * @param {number} points - Points to format
 * @returns {string} Formatted points string
 */
export function formatPoints(points) {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`
  } else if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`
  }
  return points.toString()
}

/**
 * Get motivational message based on performance
 * @param {Object} result - Exercise or activity result
 * @returns {string} Motivational message
 */
export function getMotivationalMessage(result) {
  const { score, points, isNewAchievement } = result

  if (isNewAchievement) {
    return "🎉 New achievement unlocked! You're making great progress!"
  }

  if (score >= 95) {
    return "🌟 Outstanding! You're mastering Korean!"
  } else if (score >= 85) {
    return "🎯 Excellent work! Keep up the momentum!"
  } else if (score >= 75) {
    return "👍 Good job! You're improving steadily!"
  } else if (score >= 60) {
    return "📚 Nice effort! Practice makes perfect!"
  } else {
    return "💪 Keep going! Every step counts in learning!"
  }
}