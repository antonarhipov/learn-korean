/**
 * Streaks and Milestones System for Korean Learning App
 * Manages learning streaks, milestone tracking, and celebration animations
 */

// Streak milestone definitions
export const STREAK_MILESTONES = {
  3: {
    id: 'streak_3',
    name: 'Getting Started',
    description: '3-day learning streak',
    icon: '🔥',
    color: '#ff6b35',
    points: 50,
    celebration: 'fire',
    message: "You're on fire! 3 days in a row!"
  },
  7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '1-week learning streak',
    icon: '🔥',
    color: '#ff4757',
    points: 150,
    celebration: 'fireworks',
    message: "Amazing! A full week of learning!"
  },
  14: {
    id: 'streak_14',
    name: 'Two Week Champion',
    description: '2-week learning streak',
    icon: '🔥',
    color: '#ff3742',
    points: 300,
    celebration: 'confetti',
    message: "Incredible dedication! Two weeks strong!"
  },
  30: {
    id: 'streak_30',
    name: 'Monthly Master',
    description: '30-day learning streak',
    icon: '🔥',
    color: '#ff1744',
    points: 750,
    celebration: 'rainbow',
    message: "Outstanding! A full month of consistent learning!"
  },
  50: {
    id: 'streak_50',
    name: 'Streak Legend',
    description: '50-day learning streak',
    icon: '🔥',
    color: '#d50000',
    points: 1250,
    celebration: 'explosion',
    message: "You're a legend! 50 days of dedication!"
  },
  100: {
    id: 'streak_100',
    name: 'Century Club',
    description: '100-day learning streak',
    icon: '🔥',
    color: '#b71c1c',
    points: 2500,
    celebration: 'ultimate',
    message: "INCREDIBLE! 100 days of unstoppable learning!"
  },
  365: {
    id: 'streak_365',
    name: 'Year Master',
    description: '1-year learning streak',
    icon: '👑',
    color: '#ffd700',
    points: 10000,
    celebration: 'crown',
    message: "LEGENDARY! A full year of daily learning! You are a true Korean learning master!"
  }
}

// General milestone definitions
export const GENERAL_MILESTONES = {
  EXERCISES: {
    10: {
      id: 'exercises_10',
      name: 'First Steps',
      description: 'Complete 10 exercises',
      icon: '🎯',
      points: 100,
      celebration: 'sparkles'
    },
    50: {
      id: 'exercises_50',
      name: 'Exercise Enthusiast',
      description: 'Complete 50 exercises',
      icon: '🏃',
      points: 300,
      celebration: 'confetti'
    },
    100: {
      id: 'exercises_100',
      name: 'Century Achiever',
      description: 'Complete 100 exercises',
      icon: '💯',
      points: 500,
      celebration: 'fireworks'
    },
    250: {
      id: 'exercises_250',
      name: 'Exercise Master',
      description: 'Complete 250 exercises',
      icon: '🏆',
      points: 1000,
      celebration: 'rainbow'
    },
    500: {
      id: 'exercises_500',
      name: 'Exercise Legend',
      description: 'Complete 500 exercises',
      icon: '⭐',
      points: 2000,
      celebration: 'explosion'
    }
  },
  LESSONS: {
    5: {
      id: 'lessons_5',
      name: 'Learning Begins',
      description: 'Complete 5 lessons',
      icon: '📚',
      points: 200,
      celebration: 'sparkles'
    },
    10: {
      id: 'lessons_10',
      name: 'Knowledge Seeker',
      description: 'Complete 10 lessons',
      icon: '🎓',
      points: 400,
      celebration: 'confetti'
    },
    25: {
      id: 'lessons_25',
      name: 'Lesson Master',
      description: 'Complete 25 lessons',
      icon: '🏅',
      points: 800,
      celebration: 'fireworks'
    }
  },
  POINTS: {
    1000: {
      id: 'points_1000',
      name: 'Point Collector',
      description: 'Earn 1,000 points',
      icon: '💎',
      points: 100,
      celebration: 'sparkles'
    },
    5000: {
      id: 'points_5000',
      name: 'Point Master',
      description: 'Earn 5,000 points',
      icon: '💰',
      points: 300,
      celebration: 'confetti'
    },
    10000: {
      id: 'points_10000',
      name: 'Point Legend',
      description: 'Earn 10,000 points',
      icon: '👑',
      points: 500,
      celebration: 'crown'
    }
  }
}

// Celebration animation types
export const CELEBRATION_TYPES = {
  sparkles: {
    name: 'Sparkles',
    duration: 2000,
    particles: '✨',
    colors: ['#ffd700', '#ffed4e', '#fff59d']
  },
  confetti: {
    name: 'Confetti',
    duration: 3000,
    particles: ['🎉', '🎊', '✨'],
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
  },
  fireworks: {
    name: 'Fireworks',
    duration: 4000,
    particles: '🎆',
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3']
  },
  fire: {
    name: 'Fire',
    duration: 2500,
    particles: '🔥',
    colors: ['#ff6b35', '#ff4757', '#ff3742']
  },
  rainbow: {
    name: 'Rainbow',
    duration: 3500,
    particles: '🌈',
    colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff']
  },
  explosion: {
    name: 'Explosion',
    duration: 3000,
    particles: '💥',
    colors: ['#ff4757', '#ff6348', '#ff7675']
  },
  crown: {
    name: 'Crown',
    duration: 4000,
    particles: '👑',
    colors: ['#ffd700', '#ffed4e', '#fff59d']
  },
  ultimate: {
    name: 'Ultimate',
    duration: 5000,
    particles: ['🎉', '🎊', '✨', '🌟', '💫', '⭐'],
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
  }
}

/**
 * Calculate current streak based on activity history
 * @param {Array} activityHistory - Array of activity dates
 * @returns {Object} Streak information
 */
export function calculateStreak(activityHistory) {
  if (!activityHistory || activityHistory.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      isActive: false
    }
  }

  // Sort dates in descending order
  const sortedDates = activityHistory
    .map(date => new Date(date).toDateString())
    .sort((a, b) => new Date(b) - new Date(a))

  // Remove duplicates
  const uniqueDates = [...new Set(sortedDates)]

  const today = new Date().toDateString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayString = yesterday.toDateString()

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let isActive = false

  // Check if streak is still active
  if (uniqueDates[0] === today) {
    isActive = true
    currentStreak = 1
  } else if (uniqueDates[0] === yesterdayString) {
    isActive = true
    currentStreak = 1
  }

  // Calculate current streak
  if (isActive) {
    let checkDate = new Date(uniqueDates[0])
    for (let i = 0; i < uniqueDates.length; i++) {
      const activityDate = new Date(uniqueDates[i])
      if (activityDate.toDateString() === checkDate.toDateString()) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    currentStreak-- // Subtract 1 because we started with 1
  }

  // Calculate longest streak
  tempStreak = 1
  let previousDate = new Date(uniqueDates[0])
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i])
    const expectedDate = new Date(previousDate)
    expectedDate.setDate(expectedDate.getDate() - 1)
    
    if (currentDate.toDateString() === expectedDate.toDateString()) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
    previousDate = currentDate
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return {
    currentStreak,
    longestStreak,
    lastActivityDate: uniqueDates[0],
    isActive,
    daysUntilBreak: isActive ? (uniqueDates[0] === today ? 0 : 1) : null
  }
}

/**
 * Check for streak milestones and celebrations
 * @param {number} currentStreak - Current streak length
 * @param {number} previousStreak - Previous streak length
 * @returns {Object} Milestone information and celebrations
 */
export function checkStreakMilestones(currentStreak, previousStreak = 0) {
  const milestones = []
  const celebrations = []

  // Check if we've hit any new streak milestones
  Object.keys(STREAK_MILESTONES).forEach(streakLength => {
    const milestone = STREAK_MILESTONES[streakLength]
    const streakNum = parseInt(streakLength)
    
    if (currentStreak >= streakNum && previousStreak < streakNum) {
      milestones.push({
        ...milestone,
        streakLength: streakNum,
        type: 'streak'
      })
      
      celebrations.push({
        type: milestone.celebration,
        message: milestone.message,
        milestone: milestone,
        duration: CELEBRATION_TYPES[milestone.celebration]?.duration || 3000
      })
    }
  })

  return {
    milestones,
    celebrations,
    nextMilestone: getNextStreakMilestone(currentStreak)
  }
}

/**
 * Check for general milestones (exercises, lessons, points)
 * @param {Object} userStats - Current user statistics
 * @param {Object} previousStats - Previous user statistics
 * @returns {Object} Milestone information and celebrations
 */
export function checkGeneralMilestones(userStats, previousStats = {}) {
  const milestones = []
  const celebrations = []

  // Check exercise milestones
  const exerciseCount = userStats.exercisesCompleted || 0
  const prevExerciseCount = previousStats.exercisesCompleted || 0
  
  Object.keys(GENERAL_MILESTONES.EXERCISES).forEach(count => {
    const milestone = GENERAL_MILESTONES.EXERCISES[count]
    const countNum = parseInt(count)
    
    if (exerciseCount >= countNum && prevExerciseCount < countNum) {
      milestones.push({
        ...milestone,
        count: countNum,
        type: 'exercises'
      })
      
      celebrations.push({
        type: milestone.celebration,
        message: `🎉 ${milestone.name}! You've completed ${countNum} exercises!`,
        milestone: milestone,
        duration: CELEBRATION_TYPES[milestone.celebration]?.duration || 3000
      })
    }
  })

  // Check lesson milestones
  const lessonCount = userStats.lessonsCompleted || 0
  const prevLessonCount = previousStats.lessonsCompleted || 0
  
  Object.keys(GENERAL_MILESTONES.LESSONS).forEach(count => {
    const milestone = GENERAL_MILESTONES.LESSONS[count]
    const countNum = parseInt(count)
    
    if (lessonCount >= countNum && prevLessonCount < countNum) {
      milestones.push({
        ...milestone,
        count: countNum,
        type: 'lessons'
      })
      
      celebrations.push({
        type: milestone.celebration,
        message: `📚 ${milestone.name}! You've completed ${countNum} lessons!`,
        milestone: milestone,
        duration: CELEBRATION_TYPES[milestone.celebration]?.duration || 3000
      })
    }
  })

  // Check point milestones
  const pointCount = userStats.totalPoints || 0
  const prevPointCount = previousStats.totalPoints || 0
  
  Object.keys(GENERAL_MILESTONES.POINTS).forEach(count => {
    const milestone = GENERAL_MILESTONES.POINTS[count]
    const countNum = parseInt(count)
    
    if (pointCount >= countNum && prevPointCount < countNum) {
      milestones.push({
        ...milestone,
        count: countNum,
        type: 'points'
      })
      
      celebrations.push({
        type: milestone.celebration,
        message: `💎 ${milestone.name}! You've earned ${countNum.toLocaleString()} points!`,
        milestone: milestone,
        duration: CELEBRATION_TYPES[milestone.celebration]?.duration || 3000
      })
    }
  })

  return {
    milestones,
    celebrations
  }
}

/**
 * Get the next streak milestone
 * @param {number} currentStreak - Current streak length
 * @returns {Object|null} Next milestone information
 */
function getNextStreakMilestone(currentStreak) {
  const milestones = Object.keys(STREAK_MILESTONES)
    .map(Number)
    .sort((a, b) => a - b)
  
  const nextMilestoneLength = milestones.find(length => length > currentStreak)
  
  if (nextMilestoneLength) {
    return {
      ...STREAK_MILESTONES[nextMilestoneLength],
      streakLength: nextMilestoneLength,
      daysRemaining: nextMilestoneLength - currentStreak
    }
  }
  
  return null
}

/**
 * Get streak motivation message
 * @param {Object} streakInfo - Streak information
 * @returns {string} Motivational message
 */
export function getStreakMotivation(streakInfo) {
  const { currentStreak, isActive, daysUntilBreak } = streakInfo

  if (!isActive) {
    return "🌟 Start your learning streak today! Every journey begins with a single step."
  }

  if (currentStreak === 0) {
    return "🚀 Ready to begin? Start your first day of learning!"
  }

  if (currentStreak === 1) {
    return "🎯 Great start! Come back tomorrow to build your streak!"
  }

  if (currentStreak < 7) {
    return `🔥 ${currentStreak} days strong! Keep the momentum going!`
  }

  if (currentStreak < 30) {
    return `🌟 Amazing ${currentStreak}-day streak! You're building an incredible habit!`
  }

  if (currentStreak < 100) {
    return `🏆 Outstanding ${currentStreak}-day streak! You're a true learning champion!`
  }

  return `👑 LEGENDARY ${currentStreak}-day streak! You're an inspiration to all learners!`
}

/**
 * Format streak display information
 * @param {Object} streakInfo - Streak information
 * @returns {Object} Formatted streak display data
 */
export function formatStreakDisplay(streakInfo) {
  const { currentStreak, longestStreak, isActive } = streakInfo
  
  return {
    current: {
      days: currentStreak,
      display: `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`,
      isActive,
      color: isActive ? '#ff4757' : '#6c757d'
    },
    longest: {
      days: longestStreak,
      display: `${longestStreak} day${longestStreak !== 1 ? 's' : ''}`,
      isRecord: currentStreak === longestStreak && currentStreak > 0
    },
    motivation: getStreakMotivation(streakInfo),
    nextMilestone: getNextStreakMilestone(currentStreak)
  }
}

/**
 * Generate celebration animation data
 * @param {string} celebrationType - Type of celebration
 * @param {Object} options - Animation options
 * @returns {Object} Animation configuration
 */
export function generateCelebrationAnimation(celebrationType, options = {}) {
  const celebration = CELEBRATION_TYPES[celebrationType]
  if (!celebration) {
    return null
  }

  const particleCount = options.particleCount || 50
  const particles = []

  for (let i = 0; i < particleCount; i++) {
    const particle = Array.isArray(celebration.particles) 
      ? celebration.particles[Math.floor(Math.random() * celebration.particles.length)]
      : celebration.particles

    particles.push({
      id: i,
      particle,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      color: celebration.colors[Math.floor(Math.random() * celebration.colors.length)],
      size: Math.random() * 20 + 10,
      rotation: Math.random() * 360,
      life: 1.0
    })
  }

  return {
    type: celebrationType,
    name: celebration.name,
    duration: celebration.duration,
    particles,
    colors: celebration.colors,
    startTime: Date.now()
  }
}

/**
 * Get streak recovery suggestions
 * @param {Object} streakInfo - Streak information
 * @returns {Array} Recovery suggestions
 */
export function getStreakRecoverySuggestions(streakInfo) {
  const { currentStreak, isActive, longestStreak } = streakInfo
  const suggestions = []

  if (!isActive && longestStreak > 0) {
    suggestions.push({
      type: 'comeback',
      title: 'Make a Comeback!',
      message: `You had a ${longestStreak}-day streak before. You can do it again!`,
      action: 'Start a quick exercise to begin your new streak',
      icon: '💪'
    })
  }

  if (!isActive) {
    suggestions.push({
      type: 'easy_start',
      title: 'Easy Start',
      message: 'Begin with just 5 minutes of study today',
      action: 'Try a simple flashcard exercise',
      icon: '🎯'
    })
  }

  if (currentStreak > 0 && !isActive) {
    suggestions.push({
      type: 'dont_break',
      title: "Don't Break the Chain!",
      message: `You're ${currentStreak} days in. Keep it going!`,
      action: 'Complete one exercise to maintain your streak',
      icon: '⛓️'
    })
  }

  return suggestions
}