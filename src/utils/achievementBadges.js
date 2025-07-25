/**
 * Achievement Badge System for Korean Learning App
 * Manages badge designs, collections, and visual representations of achievements
 */

// Badge design templates
export const BADGE_DESIGNS = {
  // Basic badge shapes
  CIRCLE: {
    id: 'circle',
    name: 'Circle Badge',
    shape: 'circle',
    borderRadius: '50%',
    aspectRatio: '1:1'
  },
  SHIELD: {
    id: 'shield',
    name: 'Shield Badge',
    shape: 'shield',
    borderRadius: '20% 20% 50% 50%',
    aspectRatio: '4:5'
  },
  STAR: {
    id: 'star',
    name: 'Star Badge',
    shape: 'star',
    borderRadius: '0',
    aspectRatio: '1:1'
  },
  HEXAGON: {
    id: 'hexagon',
    name: 'Hexagon Badge',
    shape: 'hexagon',
    borderRadius: '0',
    aspectRatio: '1:1'
  },
  DIAMOND: {
    id: 'diamond',
    name: 'Diamond Badge',
    shape: 'diamond',
    borderRadius: '0',
    aspectRatio: '1:1'
  }
}

// Badge rarity levels with visual styling
export const BADGE_RARITIES = {
  COMMON: {
    id: 'common',
    name: 'Common',
    color: '#95a5a6',
    gradient: ['#bdc3c7', '#95a5a6'],
    glow: 'rgba(149, 165, 166, 0.3)',
    animation: 'none',
    border: '2px solid #7f8c8d'
  },
  UNCOMMON: {
    id: 'uncommon',
    name: 'Uncommon',
    color: '#27ae60',
    gradient: ['#2ecc71', '#27ae60'],
    glow: 'rgba(39, 174, 96, 0.4)',
    animation: 'pulse-soft',
    border: '2px solid #229954'
  },
  RARE: {
    id: 'rare',
    name: 'Rare',
    color: '#3498db',
    gradient: ['#5dade2', '#3498db'],
    glow: 'rgba(52, 152, 219, 0.5)',
    animation: 'pulse-medium',
    border: '3px solid #2980b9'
  },
  EPIC: {
    id: 'epic',
    name: 'Epic',
    color: '#9b59b6',
    gradient: ['#bb8fce', '#9b59b6'],
    glow: 'rgba(155, 89, 182, 0.6)',
    animation: 'pulse-strong',
    border: '3px solid #8e44ad'
  },
  LEGENDARY: {
    id: 'legendary',
    name: 'Legendary',
    color: '#f39c12',
    gradient: ['#f7dc6f', '#f39c12'],
    glow: 'rgba(243, 156, 18, 0.8)',
    animation: 'rainbow-glow',
    border: '4px solid #e67e22'
  },
  MYTHIC: {
    id: 'mythic',
    name: 'Mythic',
    color: '#e74c3c',
    gradient: ['#ec7063', '#e74c3c'],
    glow: 'rgba(231, 76, 60, 0.9)',
    animation: 'fire-glow',
    border: '4px solid #c0392b'
  }
}

// Badge categories with themes
export const BADGE_CATEGORIES = {
  MILESTONE: {
    id: 'milestone',
    name: 'Milestones',
    description: 'Achievement milestones and progress markers',
    icon: '🎯',
    color: '#3498db',
    defaultShape: 'circle'
  },
  PERFORMANCE: {
    id: 'performance',
    name: 'Performance',
    description: 'Exceptional performance and skill demonstrations',
    icon: '⭐',
    color: '#f39c12',
    defaultShape: 'star'
  },
  STREAK: {
    id: 'streak',
    name: 'Streaks',
    description: 'Consistency and dedication achievements',
    icon: '🔥',
    color: '#e74c3c',
    defaultShape: 'shield'
  },
  SKILL: {
    id: 'skill',
    name: 'Skills',
    description: 'Mastery of specific Korean language skills',
    icon: '🎓',
    color: '#9b59b6',
    defaultShape: 'hexagon'
  },
  SPECIAL: {
    id: 'special',
    name: 'Special',
    description: 'Unique and rare achievements',
    icon: '👑',
    color: '#e67e22',
    defaultShape: 'diamond'
  }
}

// Achievement badge definitions
export const ACHIEVEMENT_BADGES = {
  // Milestone badges
  FIRST_EXERCISE: {
    id: 'first_exercise',
    name: 'First Steps',
    description: 'Complete your first exercise',
    category: 'milestone',
    rarity: 'common',
    shape: 'circle',
    icon: '🎯',
    requirement: 1,
    points: 50,
    unlockMessage: 'Welcome to your Korean learning journey!'
  },
  EXERCISE_10: {
    id: 'exercise_10',
    name: 'Getting Started',
    description: 'Complete 10 exercises',
    category: 'milestone',
    rarity: 'common',
    shape: 'circle',
    icon: '📝',
    requirement: 10,
    points: 100,
    unlockMessage: 'You\'re building momentum!'
  },
  EXERCISE_50: {
    id: 'exercise_50',
    name: 'Exercise Enthusiast',
    description: 'Complete 50 exercises',
    category: 'milestone',
    rarity: 'uncommon',
    shape: 'shield',
    icon: '🏃',
    requirement: 50,
    points: 300,
    unlockMessage: 'Your dedication is showing!'
  },
  EXERCISE_100: {
    id: 'exercise_100',
    name: 'Century Achiever',
    description: 'Complete 100 exercises',
    category: 'milestone',
    rarity: 'rare',
    shape: 'star',
    icon: '💯',
    requirement: 100,
    points: 500,
    unlockMessage: 'A hundred exercises completed!'
  },
  EXERCISE_500: {
    id: 'exercise_500',
    name: 'Exercise Master',
    description: 'Complete 500 exercises',
    category: 'milestone',
    rarity: 'epic',
    shape: 'hexagon',
    icon: '🏆',
    requirement: 500,
    points: 1500,
    unlockMessage: 'You are truly dedicated to learning!'
  },

  // Performance badges
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfectionist',
    description: 'Get 100% on any exercise',
    category: 'performance',
    rarity: 'uncommon',
    shape: 'star',
    icon: '⭐',
    requirement: 1,
    points: 100,
    unlockMessage: 'Perfect execution!'
  },
  PERFECT_STREAK_5: {
    id: 'perfect_streak_5',
    name: 'Flawless Five',
    description: 'Get 100% on 5 exercises in a row',
    category: 'performance',
    rarity: 'rare',
    shape: 'star',
    icon: '🌟',
    requirement: 5,
    points: 300,
    unlockMessage: 'Five perfect scores in a row!'
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 10 exercises in record time',
    category: 'performance',
    rarity: 'rare',
    shape: 'diamond',
    icon: '⚡',
    requirement: 10,
    points: 250,
    unlockMessage: 'Lightning fast learning!'
  },
  HIGH_SCORER: {
    id: 'high_scorer',
    name: 'High Scorer',
    description: 'Maintain 90%+ average across 20 exercises',
    category: 'performance',
    rarity: 'epic',
    shape: 'star',
    icon: '🎖️',
    requirement: 20,
    points: 600,
    unlockMessage: 'Consistently excellent performance!'
  },

  // Streak badges
  STREAK_3: {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Maintain a 3-day learning streak',
    category: 'streak',
    rarity: 'common',
    shape: 'shield',
    icon: '🔥',
    requirement: 3,
    points: 100,
    unlockMessage: 'Your learning streak begins!'
  },
  STREAK_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    category: 'streak',
    rarity: 'uncommon',
    shape: 'shield',
    icon: '🔥',
    requirement: 7,
    points: 250,
    unlockMessage: 'A full week of dedication!'
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day learning streak',
    category: 'streak',
    rarity: 'rare',
    shape: 'shield',
    icon: '🔥',
    requirement: 30,
    points: 750,
    unlockMessage: 'A month of consistent learning!'
  },
  STREAK_100: {
    id: 'streak_100',
    name: 'Century Streak',
    description: 'Maintain a 100-day learning streak',
    category: 'streak',
    rarity: 'epic',
    shape: 'shield',
    icon: '🔥',
    requirement: 100,
    points: 2000,
    unlockMessage: 'One hundred days of dedication!'
  },
  STREAK_365: {
    id: 'streak_365',
    name: 'Year Master',
    description: 'Maintain a 365-day learning streak',
    category: 'streak',
    rarity: 'legendary',
    shape: 'shield',
    icon: '👑',
    requirement: 365,
    points: 5000,
    unlockMessage: 'A full year of learning! You are legendary!'
  },

  // Skill badges
  HANGUL_HERO: {
    id: 'hangul_hero',
    name: 'Hangul Hero',
    description: 'Master all Hangul lessons',
    category: 'skill',
    rarity: 'rare',
    shape: 'hexagon',
    icon: '한',
    requirement: 1,
    points: 400,
    unlockMessage: 'You\'ve mastered the Korean alphabet!'
  },
  TYPING_MASTER: {
    id: 'typing_master',
    name: 'Typing Master',
    description: 'Complete 20 typing exercises',
    category: 'skill',
    rarity: 'uncommon',
    shape: 'hexagon',
    icon: '⌨️',
    requirement: 20,
    points: 300,
    unlockMessage: 'Your Korean typing skills are excellent!'
  },
  LISTENING_EXPERT: {
    id: 'listening_expert',
    name: 'Listening Expert',
    description: 'Complete 15 listening exercises',
    category: 'skill',
    rarity: 'uncommon',
    shape: 'hexagon',
    icon: '👂',
    requirement: 15,
    points: 300,
    unlockMessage: 'Your Korean listening skills are sharp!'
  },
  GRAMMAR_GURU: {
    id: 'grammar_guru',
    name: 'Grammar Guru',
    description: 'Complete 25 fill-in-the-blank exercises',
    category: 'skill',
    rarity: 'rare',
    shape: 'hexagon',
    icon: '📖',
    requirement: 25,
    points: 400,
    unlockMessage: 'Korean grammar holds no secrets for you!'
  },

  // Special badges
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete exercises before 8 AM',
    category: 'special',
    rarity: 'uncommon',
    shape: 'diamond',
    icon: '🌅',
    requirement: 5,
    points: 200,
    unlockMessage: 'The early bird catches the Korean!'
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete exercises after 10 PM',
    category: 'special',
    rarity: 'uncommon',
    shape: 'diamond',
    icon: '🦉',
    requirement: 5,
    points: 200,
    unlockMessage: 'Learning Korean under the stars!'
  },
  WEEKEND_WARRIOR: {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete exercises on 10 weekends',
    category: 'special',
    rarity: 'rare',
    shape: 'diamond',
    icon: '🏖️',
    requirement: 10,
    points: 350,
    unlockMessage: 'Dedication even on weekends!'
  },
  COMEBACK_KID: {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Return after a 7+ day break',
    category: 'special',
    rarity: 'uncommon',
    shape: 'diamond',
    icon: '🔄',
    requirement: 1,
    points: 150,
    unlockMessage: 'Welcome back! Every return is a victory!'
  },
  SOCIAL_LEARNER: {
    id: 'social_learner',
    name: 'Social Learner',
    description: 'Share 5 achievements',
    category: 'special',
    rarity: 'uncommon',
    shape: 'diamond',
    icon: '📱',
    requirement: 5,
    points: 200,
    unlockMessage: 'Sharing your success inspires others!'
  }
}

/**
 * Generate badge visual data
 * @param {Object} badge - Badge definition
 * @param {boolean} isEarned - Whether the badge is earned
 * @returns {Object} Badge visual data
 */
export function generateBadgeVisual(badge, isEarned = false) {
  const rarity = BADGE_RARITIES[badge.rarity.toUpperCase()]
  const category = BADGE_CATEGORIES[badge.category.toUpperCase()]
  const shape = BADGE_DESIGNS[badge.shape.toUpperCase()]

  return {
    id: badge.id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    isEarned,
    visual: {
      shape: shape.shape,
      borderRadius: shape.borderRadius,
      aspectRatio: shape.aspectRatio,
      background: isEarned 
        ? `linear-gradient(135deg, ${rarity.gradient[0]}, ${rarity.gradient[1]})`
        : 'linear-gradient(135deg, #bdc3c7, #95a5a6)',
      border: isEarned ? rarity.border : '2px solid #7f8c8d',
      glow: isEarned ? rarity.glow : 'none',
      animation: isEarned ? rarity.animation : 'none',
      opacity: isEarned ? 1 : 0.3
    },
    rarity: {
      ...rarity,
      name: rarity.name
    },
    category: {
      ...category,
      name: category.name
    },
    points: badge.points,
    requirement: badge.requirement,
    unlockMessage: badge.unlockMessage
  }
}

/**
 * Check for newly earned badges
 * @param {Object} userStats - User statistics
 * @param {Array} earnedBadges - Currently earned badge IDs
 * @param {Object} activityData - Recent activity data
 * @returns {Array} Newly earned badges
 */
export function checkNewBadges(userStats, earnedBadges = [], activityData = {}) {
  const newBadges = []

  Object.values(ACHIEVEMENT_BADGES).forEach(badge => {
    // Skip if already earned
    if (earnedBadges.includes(badge.id)) {
      return
    }

    let earned = false

    switch (badge.id) {
      // Milestone badges
      case 'first_exercise':
        earned = userStats.exercisesCompleted >= 1
        break
      case 'exercise_10':
        earned = userStats.exercisesCompleted >= 10
        break
      case 'exercise_50':
        earned = userStats.exercisesCompleted >= 50
        break
      case 'exercise_100':
        earned = userStats.exercisesCompleted >= 100
        break
      case 'exercise_500':
        earned = userStats.exercisesCompleted >= 500
        break

      // Performance badges
      case 'perfect_score':
        earned = activityData.score === 100
        break
      case 'perfect_streak_5':
        earned = userStats.perfectScoreStreak >= 5
        break
      case 'speed_demon':
        earned = userStats.fastCompletions >= 10
        break
      case 'high_scorer':
        earned = userStats.exercisesCompleted >= 20 && userStats.averageScore >= 90
        break

      // Streak badges
      case 'streak_3':
        earned = userStats.currentStreak >= 3
        break
      case 'streak_7':
        earned = userStats.currentStreak >= 7
        break
      case 'streak_30':
        earned = userStats.currentStreak >= 30
        break
      case 'streak_100':
        earned = userStats.currentStreak >= 100
        break
      case 'streak_365':
        earned = userStats.currentStreak >= 365
        break

      // Skill badges
      case 'hangul_hero':
        earned = userStats.hangulMastery === true
        break
      case 'typing_master':
        earned = userStats.exercisesByType?.typing >= 20
        break
      case 'listening_expert':
        earned = userStats.exercisesByType?.listening >= 15
        break
      case 'grammar_guru':
        earned = userStats.exercisesByType?.['fill-in-the-blank'] >= 25
        break

      // Special badges
      case 'early_bird':
        earned = userStats.earlyMorningExercises >= 5
        break
      case 'night_owl':
        earned = userStats.lateNightExercises >= 5
        break
      case 'weekend_warrior':
        earned = userStats.weekendExercises >= 10
        break
      case 'comeback_kid':
        earned = activityData.isComeback === true
        break
      case 'social_learner':
        earned = userStats.achievementsShared >= 5
        break
    }

    if (earned) {
      newBadges.push({
        ...badge,
        earnedAt: new Date().toISOString(),
        visual: generateBadgeVisual(badge, true)
      })
    }
  })

  return newBadges
}

/**
 * Get badge collection organized by category
 * @param {Array} earnedBadgeIds - Array of earned badge IDs
 * @returns {Object} Badge collection organized by category
 */
export function getBadgeCollection(earnedBadgeIds = []) {
  const collection = {}

  // Initialize categories
  Object.values(BADGE_CATEGORIES).forEach(category => {
    collection[category.id] = {
      ...category,
      badges: [],
      earnedCount: 0,
      totalCount: 0
    }
  })

  // Organize badges by category
  Object.values(ACHIEVEMENT_BADGES).forEach(badge => {
    const isEarned = earnedBadgeIds.includes(badge.id)
    const visual = generateBadgeVisual(badge, isEarned)
    
    collection[badge.category].badges.push(visual)
    collection[badge.category].totalCount++
    
    if (isEarned) {
      collection[badge.category].earnedCount++
    }
  })

  // Sort badges within each category by rarity and earned status
  Object.keys(collection).forEach(categoryId => {
    collection[categoryId].badges.sort((a, b) => {
      // Earned badges first
      if (a.isEarned && !b.isEarned) return -1
      if (!a.isEarned && b.isEarned) return 1
      
      // Then by rarity (legendary first)
      const rarityOrder = ['legendary', 'mythic', 'epic', 'rare', 'uncommon', 'common']
      const aRarityIndex = rarityOrder.indexOf(a.rarity.id)
      const bRarityIndex = rarityOrder.indexOf(b.rarity.id)
      
      return aRarityIndex - bRarityIndex
    })
  })

  return collection
}

/**
 * Get badge progress statistics
 * @param {Array} earnedBadgeIds - Array of earned badge IDs
 * @returns {Object} Badge progress statistics
 */
export function getBadgeProgress(earnedBadgeIds = []) {
  const totalBadges = Object.keys(ACHIEVEMENT_BADGES).length
  const earnedBadges = earnedBadgeIds.length
  const progressPercentage = Math.round((earnedBadges / totalBadges) * 100)

  // Count by rarity
  const rarityCount = {}
  Object.values(BADGE_RARITIES).forEach(rarity => {
    rarityCount[rarity.id] = { earned: 0, total: 0 }
  })

  Object.values(ACHIEVEMENT_BADGES).forEach(badge => {
    const rarity = badge.rarity.toLowerCase()
    rarityCount[rarity].total++
    
    if (earnedBadgeIds.includes(badge.id)) {
      rarityCount[rarity].earned++
    }
  })

  // Count by category
  const categoryCount = {}
  Object.values(BADGE_CATEGORIES).forEach(category => {
    categoryCount[category.id] = { earned: 0, total: 0 }
  })

  Object.values(ACHIEVEMENT_BADGES).forEach(badge => {
    const category = badge.category.toLowerCase()
    categoryCount[category].total++
    
    if (earnedBadgeIds.includes(badge.id)) {
      categoryCount[category].earned++
    }
  })

  return {
    total: {
      earned: earnedBadges,
      total: totalBadges,
      percentage: progressPercentage
    },
    byRarity: rarityCount,
    byCategory: categoryCount,
    nextBadges: getNextBadgesToEarn(earnedBadgeIds)
  }
}

/**
 * Get next badges that are close to being earned
 * @param {Array} earnedBadgeIds - Array of earned badge IDs
 * @returns {Array} Next badges to earn
 */
function getNextBadgesToEarn(earnedBadgeIds) {
  const unearnedBadges = Object.values(ACHIEVEMENT_BADGES)
    .filter(badge => !earnedBadgeIds.includes(badge.id))
    .map(badge => ({
      ...badge,
      visual: generateBadgeVisual(badge, false)
    }))
    .sort((a, b) => {
      // Sort by rarity (common first for easier achievements)
      const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']
      const aRarityIndex = rarityOrder.indexOf(a.rarity)
      const bRarityIndex = rarityOrder.indexOf(b.rarity)
      
      return aRarityIndex - bRarityIndex
    })

  return unearnedBadges.slice(0, 5) // Return top 5 next badges
}

/**
 * Generate CSS for badge animations
 * @returns {string} CSS animation styles
 */
export function generateBadgeAnimationCSS() {
  return `
    @keyframes pulse-soft {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes pulse-medium {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes pulse-strong {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
    
    @keyframes rainbow-glow {
      0% { box-shadow: 0 0 20px rgba(243, 156, 18, 0.8); }
      25% { box-shadow: 0 0 20px rgba(231, 76, 60, 0.8); }
      50% { box-shadow: 0 0 20px rgba(155, 89, 182, 0.8); }
      75% { box-shadow: 0 0 20px rgba(52, 152, 219, 0.8); }
      100% { box-shadow: 0 0 20px rgba(243, 156, 18, 0.8); }
    }
    
    @keyframes fire-glow {
      0%, 100% { 
        box-shadow: 0 0 25px rgba(231, 76, 60, 0.9);
        filter: brightness(1);
      }
      50% { 
        box-shadow: 0 0 35px rgba(255, 107, 107, 1);
        filter: brightness(1.2);
      }
    }
    
    .badge-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
    .badge-pulse-medium { animation: pulse-medium 2s ease-in-out infinite; }
    .badge-pulse-strong { animation: pulse-strong 2s ease-in-out infinite; }
    .badge-rainbow-glow { animation: rainbow-glow 3s ease-in-out infinite; }
    .badge-fire-glow { animation: fire-glow 2s ease-in-out infinite; }
  `
}

/**
 * Get badge sharing data
 * @param {Object} badge - Badge data
 * @returns {Object} Sharing data
 */
export function getBadgeShareData(badge) {
  return {
    title: `I earned the "${badge.name}" badge!`,
    text: `I just earned the "${badge.name}" badge in Korean learning! ${badge.description} 🎉`,
    url: `#badge/${badge.id}`,
    hashtags: ['KoreanLearning', 'Achievement', 'Badge', badge.category]
  }
}