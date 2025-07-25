/**
 * Learning Goals System for Korean Learning App
 * Manages daily and weekly learning goals, progress tracking, and goal achievements
 */

// Default goal configurations
export const DEFAULT_GOALS = {
  DAILY: {
    EXERCISES: {
      id: 'daily_exercises',
      name: 'Daily Exercises',
      description: 'Complete exercises each day',
      type: 'daily',
      category: 'exercises',
      defaultTarget: 3,
      minTarget: 1,
      maxTarget: 20,
      unit: 'exercises',
      icon: '🎯',
      points: 50
    },
    MINUTES: {
      id: 'daily_minutes',
      name: 'Study Time',
      description: 'Study for a set amount of time each day',
      type: 'daily',
      category: 'time',
      defaultTarget: 15,
      minTarget: 5,
      maxTarget: 120,
      unit: 'minutes',
      icon: '⏰',
      points: 30
    },
    POINTS: {
      id: 'daily_points',
      name: 'Daily Points',
      description: 'Earn points through learning activities',
      type: 'daily',
      category: 'points',
      defaultTarget: 100,
      minTarget: 50,
      maxTarget: 1000,
      unit: 'points',
      icon: '⭐',
      points: 40
    }
  },
  WEEKLY: {
    EXERCISES: {
      id: 'weekly_exercises',
      name: 'Weekly Exercises',
      description: 'Complete exercises throughout the week',
      type: 'weekly',
      category: 'exercises',
      defaultTarget: 20,
      minTarget: 5,
      maxTarget: 100,
      unit: 'exercises',
      icon: '🏆',
      points: 200
    },
    LESSONS: {
      id: 'weekly_lessons',
      name: 'Weekly Lessons',
      description: 'Complete lessons each week',
      type: 'weekly',
      category: 'lessons',
      defaultTarget: 2,
      minTarget: 1,
      maxTarget: 10,
      unit: 'lessons',
      icon: '📚',
      points: 300
    },
    STREAK: {
      id: 'weekly_streak',
      name: 'Weekly Streak',
      description: 'Maintain learning streak for the week',
      type: 'weekly',
      category: 'streak',
      defaultTarget: 7,
      minTarget: 3,
      maxTarget: 7,
      unit: 'days',
      icon: '🔥',
      points: 250
    }
  }
}

// Goal difficulty levels
export const GOAL_DIFFICULTIES = {
  EASY: {
    name: 'Easy',
    multiplier: 0.7,
    pointsMultiplier: 1.0,
    color: '#28a745'
  },
  MEDIUM: {
    name: 'Medium',
    multiplier: 1.0,
    pointsMultiplier: 1.2,
    color: '#ffc107'
  },
  HARD: {
    name: 'Hard',
    multiplier: 1.5,
    pointsMultiplier: 1.5,
    color: '#dc3545'
  }
}

/**
 * Create a new goal instance
 * @param {Object} goalTemplate - Goal template from DEFAULT_GOALS
 * @param {number} target - Custom target value
 * @param {string} difficulty - Goal difficulty level
 * @returns {Object} Goal instance
 */
export function createGoal(goalTemplate, target = null, difficulty = 'MEDIUM') {
  const difficultyConfig = GOAL_DIFFICULTIES[difficulty]
  const finalTarget = target || Math.round(goalTemplate.defaultTarget * difficultyConfig.multiplier)
  
  return {
    ...goalTemplate,
    target: finalTarget,
    difficulty,
    difficultyConfig,
    progress: 0,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    streak: 0,
    bestStreak: 0,
    totalCompletions: 0
  }
}

/**
 * Get current active goals for a user
 * @param {Object} userGoals - User's goal configuration
 * @returns {Object} Active daily and weekly goals
 */
export function getActiveGoals(userGoals = {}) {
  const today = new Date()
  const currentWeek = getWeekKey(today)
  const currentDay = today.toDateString()

  // Initialize default goals if none exist
  const activeGoals = {
    daily: {},
    weekly: {}
  }

  // Set up daily goals
  Object.values(DEFAULT_GOALS.DAILY).forEach(template => {
    const userGoal = userGoals.daily?.[template.id]
    if (userGoal && userGoal.date === currentDay) {
      activeGoals.daily[template.id] = userGoal
    } else {
      // Create new daily goal
      activeGoals.daily[template.id] = {
        ...createGoal(template, userGoal?.customTarget, userGoal?.difficulty),
        date: currentDay
      }
    }
  })

  // Set up weekly goals
  Object.values(DEFAULT_GOALS.WEEKLY).forEach(template => {
    const userGoal = userGoals.weekly?.[template.id]
    if (userGoal && userGoal.week === currentWeek) {
      activeGoals.weekly[template.id] = userGoal
    } else {
      // Create new weekly goal
      activeGoals.weekly[template.id] = {
        ...createGoal(template, userGoal?.customTarget, userGoal?.difficulty),
        week: currentWeek,
        weekStart: getWeekStart(today).toISOString(),
        weekEnd: getWeekEnd(today).toISOString()
      }
    }
  })

  return activeGoals
}

/**
 * Update goal progress based on user activity
 * @param {Object} goals - Current active goals
 * @param {Object} activity - User activity data
 * @returns {Object} Updated goals and achievements
 */
export function updateGoalProgress(goals, activity) {
  const updatedGoals = { ...goals }
  const achievements = []

  // Update daily goals
  Object.keys(updatedGoals.daily).forEach(goalId => {
    const goal = updatedGoals.daily[goalId]
    const oldProgress = goal.progress

    switch (goal.category) {
      case 'exercises':
        if (activity.type === 'exercise') {
          goal.progress += 1
        }
        break
      case 'time':
        if (activity.timeSpent) {
          goal.progress += Math.round(activity.timeSpent / 60000) // Convert ms to minutes
        }
        break
      case 'points':
        if (activity.points) {
          goal.progress += activity.points
        }
        break
    }

    // Check if goal was just completed
    if (!goal.completed && goal.progress >= goal.target) {
      goal.completed = true
      goal.completedAt = new Date().toISOString()
      goal.totalCompletions += 1
      
      achievements.push({
        type: 'goal_completed',
        goalType: 'daily',
        goalId: goalId,
        goalName: goal.name,
        points: Math.round(goal.points * goal.difficultyConfig.pointsMultiplier),
        message: `🎉 Daily goal completed: ${goal.name}!`
      })
    }

    updatedGoals.daily[goalId] = goal
  })

  // Update weekly goals
  Object.keys(updatedGoals.weekly).forEach(goalId => {
    const goal = updatedGoals.weekly[goalId]
    const oldProgress = goal.progress

    switch (goal.category) {
      case 'exercises':
        if (activity.type === 'exercise') {
          goal.progress += 1
        }
        break
      case 'lessons':
        if (activity.type === 'lesson') {
          goal.progress += 1
        }
        break
      case 'streak':
        if (activity.streakDays) {
          goal.progress = Math.min(activity.streakDays, goal.target)
        }
        break
    }

    // Check if goal was just completed
    if (!goal.completed && goal.progress >= goal.target) {
      goal.completed = true
      goal.completedAt = new Date().toISOString()
      goal.totalCompletions += 1
      
      achievements.push({
        type: 'goal_completed',
        goalType: 'weekly',
        goalId: goalId,
        goalName: goal.name,
        points: Math.round(goal.points * goal.difficultyConfig.pointsMultiplier),
        message: `🏆 Weekly goal completed: ${goal.name}!`
      })
    }

    updatedGoals.weekly[goalId] = goal
  })

  return {
    goals: updatedGoals,
    achievements
  }
}

/**
 * Get goal statistics and insights
 * @param {Object} goalHistory - Historical goal data
 * @returns {Object} Goal statistics
 */
export function getGoalStatistics(goalHistory) {
  const stats = {
    daily: {
      totalGoals: 0,
      completedGoals: 0,
      completionRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalPoints: 0
    },
    weekly: {
      totalGoals: 0,
      completedGoals: 0,
      completionRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalPoints: 0
    },
    overall: {
      totalPoints: 0,
      favoriteGoalType: null,
      mostCompletedGoal: null
    }
  }

  if (!goalHistory || Object.keys(goalHistory).length === 0) {
    return stats
  }

  // Analyze daily goals
  const dailyGoals = goalHistory.daily || {}
  Object.values(dailyGoals).forEach(goal => {
    stats.daily.totalGoals += 1
    if (goal.completed) {
      stats.daily.completedGoals += 1
      stats.daily.totalPoints += goal.points || 0
    }
  })

  // Analyze weekly goals
  const weeklyGoals = goalHistory.weekly || {}
  Object.values(weeklyGoals).forEach(goal => {
    stats.weekly.totalGoals += 1
    if (goal.completed) {
      stats.weekly.completedGoals += 1
      stats.weekly.totalPoints += goal.points || 0
    }
  })

  // Calculate completion rates
  stats.daily.completionRate = stats.daily.totalGoals > 0 ? 
    Math.round((stats.daily.completedGoals / stats.daily.totalGoals) * 100) : 0
  stats.weekly.completionRate = stats.weekly.totalGoals > 0 ? 
    Math.round((stats.weekly.completedGoals / stats.weekly.totalGoals) * 100) : 0

  // Calculate overall stats
  stats.overall.totalPoints = stats.daily.totalPoints + stats.weekly.totalPoints

  return stats
}

/**
 * Get personalized goal recommendations
 * @param {Object} userStats - User's learning statistics
 * @param {Object} goalHistory - User's goal history
 * @returns {Array} Recommended goals
 */
export function getGoalRecommendations(userStats, goalHistory) {
  const recommendations = []
  const stats = getGoalStatistics(goalHistory)

  // Recommend based on completion rates
  if (stats.daily.completionRate > 80) {
    recommendations.push({
      type: 'increase_difficulty',
      message: "You're crushing your daily goals! Consider increasing the difficulty for more points.",
      action: 'increase_daily_difficulty'
    })
  } else if (stats.daily.completionRate < 30) {
    recommendations.push({
      type: 'decrease_difficulty',
      message: "Let's adjust your daily goals to be more achievable and build momentum.",
      action: 'decrease_daily_difficulty'
    })
  }

  // Recommend based on user activity patterns
  if (userStats.exercisesCompleted > 50 && !goalHistory.weekly?.weekly_exercises) {
    recommendations.push({
      type: 'new_goal',
      message: "You're doing great with exercises! Try setting a weekly exercise goal.",
      action: 'add_weekly_exercises_goal'
    })
  }

  if (userStats.currentStreak > 7 && !goalHistory.weekly?.weekly_streak) {
    recommendations.push({
      type: 'new_goal',
      message: "Your learning streak is impressive! Set a weekly streak goal to earn more points.",
      action: 'add_weekly_streak_goal'
    })
  }

  return recommendations
}

/**
 * Adjust goal difficulty based on performance
 * @param {Object} goal - Goal to adjust
 * @param {string} direction - 'increase' or 'decrease'
 * @returns {Object} Adjusted goal
 */
export function adjustGoalDifficulty(goal, direction) {
  const currentDifficulty = goal.difficulty
  const difficulties = Object.keys(GOAL_DIFFICULTIES)
  const currentIndex = difficulties.indexOf(currentDifficulty)

  let newDifficulty = currentDifficulty
  if (direction === 'increase' && currentIndex < difficulties.length - 1) {
    newDifficulty = difficulties[currentIndex + 1]
  } else if (direction === 'decrease' && currentIndex > 0) {
    newDifficulty = difficulties[currentIndex - 1]
  }

  if (newDifficulty !== currentDifficulty) {
    const template = Object.values(DEFAULT_GOALS.DAILY)
      .concat(Object.values(DEFAULT_GOALS.WEEKLY))
      .find(t => t.id === goal.id)
    
    if (template) {
      return createGoal(template, null, newDifficulty)
    }
  }

  return goal
}

/**
 * Get week key for grouping weekly goals
 * @param {Date} date - Date to get week for
 * @returns {string} Week key (YYYY-WW format)
 */
function getWeekKey(date) {
  const year = date.getFullYear()
  const week = getWeekNumber(date)
  return `${year}-${week.toString().padStart(2, '0')}`
}

/**
 * Get week number for a date
 * @param {Date} date - Date to get week number for
 * @returns {number} Week number
 */
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

/**
 * Get start of week (Monday)
 * @param {Date} date - Date to get week start for
 * @returns {Date} Start of week
 */
function getWeekStart(date) {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(date.setDate(diff))
}

/**
 * Get end of week (Sunday)
 * @param {Date} date - Date to get week end for
 * @returns {Date} End of week
 */
function getWeekEnd(date) {
  const weekStart = getWeekStart(new Date(date))
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
}

/**
 * Format goal progress for display
 * @param {Object} goal - Goal to format
 * @returns {Object} Formatted goal data
 */
export function formatGoalProgress(goal) {
  const progressPercentage = Math.min(100, Math.round((goal.progress / goal.target) * 100))
  const isCompleted = goal.completed
  const remaining = Math.max(0, goal.target - goal.progress)

  return {
    ...goal,
    progressPercentage,
    isCompleted,
    remaining,
    displayProgress: `${goal.progress}/${goal.target} ${goal.unit}`,
    statusMessage: isCompleted ? 
      '✅ Completed!' : 
      `${remaining} ${goal.unit} remaining`
  }
}