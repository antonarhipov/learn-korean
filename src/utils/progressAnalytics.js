/**
 * Progress Analytics System for Korean Learning App
 * Handles detailed progress tracking, analytics, and local storage
 * Privacy-compliant - all data stored locally
 */

class ProgressAnalytics {
  constructor() {
    this.storageKey = 'korean-learning-progress'
    this.sessionStartTime = Date.now()
    this.currentSessionData = {
      startTime: this.sessionStartTime,
      lessonsAttempted: [],
      exercisesCompleted: [],
      timeSpent: 0,
      accuracyScores: []
    }
  }

  /**
   * Initialize progress analytics system
   */
  initialize() {
    this._loadProgressData()
    this._startSessionTracking()
    this._setupBeforeUnloadHandler()
  }

  /**
   * Get comprehensive progress data
   * @returns {Object} Complete progress analytics
   */
  getProgressData() {
    const data = this._getStoredData()
    const today = new Date().toDateString()
    
    return {
      // Overall statistics
      totalLessons: data.completedLessons?.length || 0,
      totalExercises: data.completedExercises?.length || 0,
      totalTimeSpent: data.totalTimeSpent || 0,
      averageAccuracy: this._calculateAverageAccuracy(data.accuracyHistory || []),
      
      // Streak tracking
      currentStreak: this._calculateCurrentStreak(data.studyDates || []),
      longestStreak: data.longestStreak || 0,
      lastStudyDate: data.lastStudyDate || null,
      
      // Recent activity
      recentActivity: data.recentActivity || [],
      todayProgress: data.dailyProgress?.[today] || {
        timeSpent: 0,
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        averageAccuracy: 0
      },
      
      // Learning metrics
      learningMetrics: {
        averageTimePerLesson: this._calculateAverageTimePerLesson(data),
        retryRates: data.retryRates || {},
        commonMistakes: data.commonMistakes || {},
        difficultyProgression: data.difficultyProgression || [],
        weeklyProgress: this._getWeeklyProgress(data)
      },
      
      // Achievement data
      achievements: data.achievements || [],
      badges: data.badges || []
    }
  }

  /**
   * Track lesson start
   * @param {string} lessonId - Lesson identifier
   * @param {Object} lessonData - Lesson metadata
   */
  trackLessonStart(lessonId, lessonData = {}) {
    const timestamp = Date.now()
    const data = this._getStoredData()
    
    // Add to current session
    this.currentSessionData.lessonsAttempted.push({
      lessonId,
      startTime: timestamp,
      difficulty: lessonData.difficulty || 'unknown',
      category: lessonData.category || 'unknown'
    })
    
    // Track in persistent storage
    if (!data.lessonAttempts) data.lessonAttempts = []
    data.lessonAttempts.push({
      lessonId,
      timestamp,
      type: 'start',
      sessionId: this.sessionStartTime
    })
    
    this._saveData(data)
  }

  /**
   * Track lesson completion
   * @param {string} lessonId - Lesson identifier
   * @param {Object} results - Lesson completion results
   */
  trackLessonCompletion(lessonId, results = {}) {
    const timestamp = Date.now()
    const data = this._getStoredData()
    const today = new Date().toDateString()
    
    // Find lesson start time
    const lessonAttempt = this.currentSessionData.lessonsAttempted
      .find(attempt => attempt.lessonId === lessonId)
    const timeSpent = lessonAttempt ? timestamp - lessonAttempt.startTime : 0
    
    // Update completed lessons
    if (!data.completedLessons) data.completedLessons = []
    if (!data.completedLessons.includes(lessonId)) {
      data.completedLessons.push(lessonId)
    }
    
    // Track completion details
    if (!data.lessonCompletions) data.lessonCompletions = []
    data.lessonCompletions.push({
      lessonId,
      timestamp,
      timeSpent,
      accuracy: results.accuracy || 0,
      score: results.score || 0,
      attempts: results.attempts || 1,
      difficulty: results.difficulty || 'unknown'
    })
    
    // Update daily progress
    if (!data.dailyProgress) data.dailyProgress = {}
    if (!data.dailyProgress[today]) {
      data.dailyProgress[today] = {
        timeSpent: 0,
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        accuracyScores: []
      }
    }
    
    data.dailyProgress[today].lessonsCompleted++
    data.dailyProgress[today].timeSpent += timeSpent
    if (results.accuracy) {
      data.dailyProgress[today].accuracyScores.push(results.accuracy)
    }
    
    // Update study dates for streak tracking
    if (!data.studyDates) data.studyDates = []
    if (!data.studyDates.includes(today)) {
      data.studyDates.push(today)
      data.studyDates.sort()
    }
    
    // Update total time spent
    data.totalTimeSpent = (data.totalTimeSpent || 0) + timeSpent
    data.lastStudyDate = today
    
    // Track accuracy history
    if (!data.accuracyHistory) data.accuracyHistory = []
    if (results.accuracy) {
      data.accuracyHistory.push({
        timestamp,
        lessonId,
        accuracy: results.accuracy
      })
    }
    
    // Add to recent activity
    if (!data.recentActivity) data.recentActivity = []
    data.recentActivity.unshift({
      type: 'lesson_completed',
      lessonId,
      timestamp,
      timeSpent,
      accuracy: results.accuracy || 0
    })
    
    // Keep only last 50 activities
    data.recentActivity = data.recentActivity.slice(0, 50)
    
    // Check for achievements
    this._checkAchievements(data)
    
    this._saveData(data)
  }

  /**
   * Track exercise completion
   * @param {string} exerciseId - Exercise identifier
   * @param {Object} results - Exercise results
   */
  trackExerciseCompletion(exerciseId, results = {}) {
    const timestamp = Date.now()
    const data = this._getStoredData()
    const today = new Date().toDateString()
    
    // Update completed exercises
    if (!data.completedExercises) data.completedExercises = []
    data.completedExercises.push({
      exerciseId,
      timestamp,
      accuracy: results.accuracy || 0,
      timeSpent: results.timeSpent || 0,
      attempts: results.attempts || 1,
      lessonId: results.lessonId || null
    })
    
    // Update daily progress
    if (!data.dailyProgress) data.dailyProgress = {}
    if (!data.dailyProgress[today]) {
      data.dailyProgress[today] = {
        timeSpent: 0,
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        accuracyScores: []
      }
    }
    
    data.dailyProgress[today].exercisesCompleted++
    data.dailyProgress[today].timeSpent += results.timeSpent || 0
    if (results.accuracy) {
      data.dailyProgress[today].accuracyScores.push(results.accuracy)
    }
    
    // Track retry rates if this is a retry
    if (results.attempts > 1) {
      if (!data.retryRates) data.retryRates = {}
      if (!data.retryRates[exerciseId]) data.retryRates[exerciseId] = 0
      data.retryRates[exerciseId]++
    }
    
    // Track common mistakes
    if (results.mistakes && results.mistakes.length > 0) {
      if (!data.commonMistakes) data.commonMistakes = {}
      results.mistakes.forEach(mistake => {
        if (!data.commonMistakes[mistake]) data.commonMistakes[mistake] = 0
        data.commonMistakes[mistake]++
      })
    }
    
    this._saveData(data)
  }

  /**
   * Get estimated completion time for a lesson
   * @param {string} lessonId - Lesson identifier
   * @param {Object} lessonData - Lesson metadata
   * @returns {number} Estimated time in minutes
   */
  getEstimatedCompletionTime(lessonId, lessonData = {}) {
    const data = this._getStoredData()
    
    // Check if we have historical data for this lesson
    const completions = data.lessonCompletions?.filter(c => c.lessonId === lessonId) || []
    if (completions.length > 0) {
      const avgTime = completions.reduce((sum, c) => sum + c.timeSpent, 0) / completions.length
      return Math.round(avgTime / 60000) // Convert to minutes
    }
    
    // Use category-based estimation
    const categoryCompletions = data.lessonCompletions?.filter(c => 
      c.difficulty === lessonData.difficulty
    ) || []
    
    if (categoryCompletions.length > 0) {
      const avgTime = categoryCompletions.reduce((sum, c) => sum + c.timeSpent, 0) / categoryCompletions.length
      return Math.round(avgTime / 60000)
    }
    
    // Default estimates based on difficulty
    const defaultTimes = {
      'beginner': 10,
      'intermediate': 15,
      'advanced': 20
    }
    
    return defaultTimes[lessonData.difficulty] || 12
  }

  /**
   * Get learning progress report
   * @param {string} period - 'week', 'month', or 'all'
   * @returns {Object} Detailed progress report
   */
  getProgressReport(period = 'week') {
    const data = this._getStoredData()
    const now = new Date()
    let startDate
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(0) // All time
    }
    
    const filteredCompletions = data.lessonCompletions?.filter(c => 
      new Date(c.timestamp) >= startDate
    ) || []
    
    const filteredExercises = data.completedExercises?.filter(e => 
      new Date(e.timestamp) >= startDate
    ) || []
    
    return {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      
      summary: {
        lessonsCompleted: filteredCompletions.length,
        exercisesCompleted: filteredExercises.length,
        totalTimeSpent: filteredCompletions.reduce((sum, c) => sum + c.timeSpent, 0),
        averageAccuracy: this._calculateAverageAccuracy(filteredCompletions.map(c => ({
          accuracy: c.accuracy
        })))
      },
      
      dailyBreakdown: this._getDailyBreakdown(data, startDate),
      topCategories: this._getTopCategories(filteredCompletions),
      improvementAreas: this._getImprovementAreas(data),
      achievements: data.achievements?.filter(a => 
        new Date(a.timestamp) >= startDate
      ) || []
    }
  }

  /**
   * Private helper methods
   */
  _getStoredData() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading progress data:', error)
      return {}
    }
  }

  _saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving progress data:', error)
    }
  }

  _loadProgressData() {
    // Initialize with existing data
    const data = this._getStoredData()
    console.log('Progress analytics initialized with data:', {
      lessons: data.completedLessons?.length || 0,
      exercises: data.completedExercises?.length || 0,
      totalTime: data.totalTimeSpent || 0
    })
  }

  _startSessionTracking() {
    // Track session time
    this.sessionInterval = setInterval(() => {
      this.currentSessionData.timeSpent += 1000 // Add 1 second
    }, 1000)
  }

  _setupBeforeUnloadHandler() {
    window.addEventListener('beforeunload', () => {
      this._saveSessionData()
    })
  }

  _saveSessionData() {
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval)
    }
    
    const data = this._getStoredData()
    if (!data.sessions) data.sessions = []
    
    data.sessions.push({
      startTime: this.sessionStartTime,
      endTime: Date.now(),
      timeSpent: this.currentSessionData.timeSpent,
      lessonsAttempted: this.currentSessionData.lessonsAttempted.length,
      exercisesCompleted: this.currentSessionData.exercisesCompleted.length
    })
    
    this._saveData(data)
  }

  _calculateCurrentStreak(studyDates) {
    if (!studyDates || studyDates.length === 0) return 0
    
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
    
    // Sort dates in descending order
    const sortedDates = [...studyDates].sort((a, b) => new Date(b) - new Date(a))
    
    let streak = 0
    let currentDate = new Date()
    
    for (const dateStr of sortedDates) {
      const studyDate = new Date(dateStr)
      const daysDiff = Math.floor((currentDate - studyDate) / (24 * 60 * 60 * 1000))
      
      if (daysDiff === streak) {
        streak++
      } else if (daysDiff === streak + 1 && streak === 0) {
        // Allow for today not being studied yet
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  _calculateAverageAccuracy(accuracyData) {
    if (!accuracyData || accuracyData.length === 0) return 0
    
    const validAccuracies = accuracyData
      .map(item => item.accuracy)
      .filter(acc => acc != null && acc >= 0)
    
    if (validAccuracies.length === 0) return 0
    
    const sum = validAccuracies.reduce((total, acc) => total + acc, 0)
    return Math.round(sum / validAccuracies.length)
  }

  _calculateAverageTimePerLesson(data) {
    const completions = data.lessonCompletions || []
    if (completions.length === 0) return 0
    
    const totalTime = completions.reduce((sum, c) => sum + c.timeSpent, 0)
    return Math.round(totalTime / completions.length / 60000) // Convert to minutes
  }

  _getWeeklyProgress(data) {
    const weeklyData = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toDateString()
      const dayData = data.dailyProgress?.[dateStr] || {
        timeSpent: 0,
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        accuracyScores: []
      }
      
      weeklyData.push({
        date: dateStr,
        timeSpent: dayData.timeSpent,
        lessonsCompleted: dayData.lessonsCompleted,
        exercisesCompleted: dayData.exercisesCompleted,
        averageAccuracy: dayData.accuracyScores.length > 0 
          ? Math.round(dayData.accuracyScores.reduce((a, b) => a + b, 0) / dayData.accuracyScores.length)
          : 0
      })
    }
    
    return weeklyData
  }

  _getDailyBreakdown(data, startDate) {
    const breakdown = []
    const now = new Date()
    const current = new Date(startDate)
    
    while (current <= now) {
      const dateStr = current.toDateString()
      const dayData = data.dailyProgress?.[dateStr] || {
        timeSpent: 0,
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        accuracyScores: []
      }
      
      breakdown.push({
        date: dateStr,
        ...dayData,
        averageAccuracy: dayData.accuracyScores.length > 0 
          ? Math.round(dayData.accuracyScores.reduce((a, b) => a + b, 0) / dayData.accuracyScores.length)
          : 0
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return breakdown
  }

  _getTopCategories(completions) {
    const categories = {}
    completions.forEach(c => {
      if (c.difficulty) {
        if (!categories[c.difficulty]) categories[c.difficulty] = 0
        categories[c.difficulty]++
      }
    })
    
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }))
  }

  _getImprovementAreas(data) {
    const areas = []
    
    // Check retry rates
    const retryRates = data.retryRates || {}
    const highRetryExercises = Object.entries(retryRates)
      .filter(([, rate]) => rate > 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
    
    if (highRetryExercises.length > 0) {
      areas.push({
        type: 'high_retry_rate',
        description: 'Exercises with high retry rates',
        exercises: highRetryExercises.map(([id, rate]) => ({ id, retries: rate }))
      })
    }
    
    // Check common mistakes
    const mistakes = data.commonMistakes || {}
    const topMistakes = Object.entries(mistakes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
    
    if (topMistakes.length > 0) {
      areas.push({
        type: 'common_mistakes',
        description: 'Most common mistakes',
        mistakes: topMistakes.map(([mistake, count]) => ({ mistake, count }))
      })
    }
    
    return areas
  }

  _checkAchievements(data) {
    if (!data.achievements) data.achievements = []
    if (!data.badges) data.badges = []
    
    const completedLessons = data.completedLessons?.length || 0
    const currentStreak = this._calculateCurrentStreak(data.studyDates || [])
    
    // Achievement definitions
    const achievements = [
      {
        id: 'first_lesson',
        name: 'First Steps',
        description: 'Complete your first lesson',
        condition: () => completedLessons >= 1,
        badge: 'beginner'
      },
      {
        id: 'five_lessons',
        name: 'Getting Started',
        description: 'Complete 5 lessons',
        condition: () => completedLessons >= 5,
        badge: 'learner'
      },
      {
        id: 'ten_lessons',
        name: 'Dedicated Student',
        description: 'Complete 10 lessons',
        condition: () => completedLessons >= 10,
        badge: 'dedicated'
      },
      {
        id: 'streak_3',
        name: '3-Day Streak',
        description: 'Study for 3 consecutive days',
        condition: () => currentStreak >= 3,
        badge: 'consistent'
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Study for 7 consecutive days',
        condition: () => currentStreak >= 7,
        badge: 'warrior'
      },
      {
        id: 'streak_30',
        name: 'Monthly Master',
        description: 'Study for 30 consecutive days',
        condition: () => currentStreak >= 30,
        badge: 'master'
      }
    ]
    
    // Check for new achievements
    achievements.forEach(achievement => {
      const alreadyEarned = data.achievements.some(a => a.id === achievement.id)
      if (!alreadyEarned && achievement.condition()) {
        data.achievements.push({
          ...achievement,
          timestamp: Date.now(),
          earnedAt: new Date().toISOString()
        })
        
        // Add badge if not already present
        if (!data.badges.includes(achievement.badge)) {
          data.badges.push(achievement.badge)
        }
      }
    })
  }
}

// Create singleton instance
const progressAnalytics = new ProgressAnalytics()

export default progressAnalytics