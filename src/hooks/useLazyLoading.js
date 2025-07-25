/**
 * Lazy Loading Hooks
 * Provides progressive loading capabilities for lesson content optimization
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { dataManager } from '../data/dataManager.js'

/**
 * Hook for lazy loading lesson data
 * @param {string} lessonId - ID of the lesson to load
 * @param {Object} options - Loading options
 * @returns {Object} - Loading state and data
 */
export const useLazyLesson = (lessonId, options = {}) => {
  const {
    loadImmediately = false,
    preloadExercises = false,
    preloadMedia = false,
    cacheData = true,
    onLoadStart = null,
    onLoadComplete = null,
    onLoadError = null
  } = options

  const [state, setState] = useState({
    data: null,
    isLoading: false,
    isLoaded: false,
    error: null,
    progress: 0
  })

  const cacheRef = useRef(new Map())
  const abortControllerRef = useRef(null)

  /**
   * Load lesson data progressively
   */
  const loadLesson = useCallback(async (forceReload = false) => {
    if (!lessonId) return

    // Check cache first
    if (cacheData && !forceReload && cacheRef.current.has(lessonId)) {
      const cachedData = cacheRef.current.get(lessonId)
      setState({
        data: cachedData,
        isLoading: false,
        isLoaded: true,
        error: null,
        progress: 100
      })
      return cachedData
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0
    }))

    if (onLoadStart) {
      onLoadStart(lessonId)
    }

    try {
      // Simulate progressive loading steps
      const loadingSteps = [
        { step: 'basic', progress: 20 },
        { step: 'content', progress: 50 },
        { step: 'exercises', progress: 80 },
        { step: 'media', progress: 100 }
      ]

      let lessonData = null

      for (const { step, progress } of loadingSteps) {
        if (signal.aborted) throw new Error('Loading cancelled')

        setState(prev => ({ ...prev, progress }))

        switch (step) {
          case 'basic':
            // Load basic lesson metadata
            lessonData = dataManager.getLesson(lessonId)
            if (!lessonData) {
              throw new Error(`Lesson ${lessonId} not found`)
            }
            // Create a minimal version first
            lessonData = {
              id: lessonData.id,
              title: lessonData.title,
              level: lessonData.level,
              category: lessonData.category,
              description: lessonData.description,
              estimatedTime: lessonData.estimatedTime,
              isLoading: true
            }
            break

          case 'content':
            // Load lesson content
            const fullLesson = dataManager.getLesson(lessonId)
            lessonData = {
              ...lessonData,
              content: {
                text: fullLesson.content.text,
                examples: preloadExercises ? fullLesson.content.examples : [],
                media: preloadMedia ? fullLesson.content.media : { image: null, video: null }
              },
              prerequisites: fullLesson.prerequisites,
              nextLessons: fullLesson.nextLessons
            }
            break

          case 'exercises':
            // Load exercises if requested
            if (preloadExercises) {
              const fullLesson = dataManager.getLesson(lessonId)
              lessonData = {
                ...lessonData,
                exercises: fullLesson.exercises || []
              }
            }
            break

          case 'media':
            // Load media if requested
            if (preloadMedia) {
              const fullLesson = dataManager.getLesson(lessonId)
              lessonData = {
                ...lessonData,
                content: {
                  ...lessonData.content,
                  examples: fullLesson.content.examples,
                  media: fullLesson.content.media
                }
              }
            }
            break
        }

        // Add small delay to simulate network loading
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Mark as fully loaded
      lessonData.isLoading = false

      // Cache the data
      if (cacheData) {
        cacheRef.current.set(lessonId, lessonData)
      }

      setState({
        data: lessonData,
        isLoading: false,
        isLoaded: true,
        error: null,
        progress: 100
      })

      if (onLoadComplete) {
        onLoadComplete(lessonData)
      }

      return lessonData

    } catch (error) {
      if (error.name === 'AbortError' || error.message === 'Loading cancelled') {
        return // Don't update state for cancelled requests
      }

      setState({
        data: null,
        isLoading: false,
        isLoaded: false,
        error: error.message,
        progress: 0
      })

      if (onLoadError) {
        onLoadError(error)
      }

      throw error
    }
  }, [lessonId, preloadExercises, preloadMedia, cacheData, onLoadStart, onLoadComplete, onLoadError])

  /**
   * Load additional content for already loaded lesson
   */
  const loadAdditionalContent = useCallback(async (contentType) => {
    if (!state.data || !state.isLoaded) return

    try {
      const fullLesson = dataManager.getLesson(lessonId)
      if (!fullLesson) return

      let updatedData = { ...state.data }

      switch (contentType) {
        case 'exercises':
          updatedData.exercises = fullLesson.exercises || []
          break
        case 'examples':
          updatedData.content = {
            ...updatedData.content,
            examples: fullLesson.content.examples
          }
          break
        case 'media':
          updatedData.content = {
            ...updatedData.content,
            media: fullLesson.content.media
          }
          break
      }

      // Update cache
      if (cacheData) {
        cacheRef.current.set(lessonId, updatedData)
      }

      setState(prev => ({
        ...prev,
        data: updatedData
      }))

      return updatedData
    } catch (error) {
      console.error(`Failed to load additional content (${contentType}):`, error)
    }
  }, [lessonId, state.data, state.isLoaded, cacheData])

  /**
   * Clear cache for specific lesson or all lessons
   */
  const clearCache = useCallback((specificLessonId = null) => {
    if (specificLessonId) {
      cacheRef.current.delete(specificLessonId)
    } else {
      cacheRef.current.clear()
    }
  }, [])

  // Load immediately if requested
  useEffect(() => {
    if (loadImmediately && lessonId) {
      loadLesson()
    }
  }, [loadImmediately, lessonId, loadLesson])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    // State
    data: state.data,
    isLoading: state.isLoading,
    isLoaded: state.isLoaded,
    error: state.error,
    progress: state.progress,
    
    // Methods
    loadLesson,
    loadAdditionalContent,
    clearCache,
    
    // Computed properties
    hasBasicData: state.data && !state.data.isLoading,
    hasFullContent: state.data && state.data.content && !state.data.isLoading,
    hasExercises: state.data && state.data.exercises && state.data.exercises.length > 0,
    hasMedia: state.data && state.data.content && state.data.content.media && 
             (state.data.content.media.image || state.data.content.media.video)
  }
}

/**
 * Hook for lazy loading multiple lessons
 * @param {Array} lessonIds - Array of lesson IDs to load
 * @param {Object} options - Loading options
 * @returns {Object} - Loading state and data for multiple lessons
 */
export const useLazyLessons = (lessonIds = [], options = {}) => {
  const {
    loadConcurrently = false,
    maxConcurrent = 3,
    priorityOrder = [],
    ...lessonOptions
  } = options

  const [state, setState] = useState({
    lessons: new Map(),
    isLoading: false,
    loadedCount: 0,
    totalCount: lessonIds.length,
    errors: []
  })

  const loadingQueueRef = useRef([])
  const activeLoadsRef = useRef(new Set())

  /**
   * Load lessons based on configuration
   */
  const loadLessons = useCallback(async () => {
    if (lessonIds.length === 0) return

    setState(prev => ({
      ...prev,
      isLoading: true,
      totalCount: lessonIds.length,
      errors: []
    }))

    try {
      // Sort lessons by priority if specified
      const sortedIds = priorityOrder.length > 0
        ? [...lessonIds].sort((a, b) => {
            const aIndex = priorityOrder.indexOf(a)
            const bIndex = priorityOrder.indexOf(b)
            if (aIndex === -1 && bIndex === -1) return 0
            if (aIndex === -1) return 1
            if (bIndex === -1) return -1
            return aIndex - bIndex
          })
        : lessonIds

      if (loadConcurrently) {
        // Load lessons concurrently with limit
        const chunks = []
        for (let i = 0; i < sortedIds.length; i += maxConcurrent) {
          chunks.push(sortedIds.slice(i, i + maxConcurrent))
        }

        for (const chunk of chunks) {
          const promises = chunk.map(async (lessonId) => {
            try {
              const lessonData = dataManager.getLesson(lessonId)
              return { id: lessonId, data: lessonData, error: null }
            } catch (error) {
              return { id: lessonId, data: null, error: error.message }
            }
          })

          const results = await Promise.all(promises)
          
          setState(prev => {
            const newLessons = new Map(prev.lessons)
            const newErrors = [...prev.errors]
            let newLoadedCount = prev.loadedCount

            results.forEach(({ id, data, error }) => {
              if (data) {
                newLessons.set(id, data)
                newLoadedCount++
              } else if (error) {
                newErrors.push({ lessonId: id, error })
              }
            })

            return {
              ...prev,
              lessons: newLessons,
              loadedCount: newLoadedCount,
              errors: newErrors
            }
          })
        }
      } else {
        // Load lessons sequentially
        for (const lessonId of sortedIds) {
          try {
            const lessonData = dataManager.getLesson(lessonId)
            
            setState(prev => {
              const newLessons = new Map(prev.lessons)
              newLessons.set(lessonId, lessonData)
              
              return {
                ...prev,
                lessons: newLessons,
                loadedCount: prev.loadedCount + 1
              }
            })
          } catch (error) {
            setState(prev => ({
              ...prev,
              errors: [...prev.errors, { lessonId, error: error.message }]
            }))
          }
        }
      }

      setState(prev => ({ ...prev, isLoading: false }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        errors: [...prev.errors, { lessonId: 'general', error: error.message }]
      }))
    }
  }, [lessonIds, loadConcurrently, maxConcurrent, priorityOrder])

  /**
   * Get lesson by ID from loaded lessons
   */
  const getLesson = useCallback((lessonId) => {
    return state.lessons.get(lessonId) || null
  }, [state.lessons])

  /**
   * Check if specific lesson is loaded
   */
  const isLessonLoaded = useCallback((lessonId) => {
    return state.lessons.has(lessonId)
  }, [state.lessons])

  // Load lessons when IDs change
  useEffect(() => {
    if (lessonIds.length > 0) {
      loadLessons()
    }
  }, [lessonIds, loadLessons])

  return {
    // State
    lessons: state.lessons,
    isLoading: state.isLoading,
    loadedCount: state.loadedCount,
    totalCount: state.totalCount,
    errors: state.errors,
    
    // Methods
    loadLessons,
    getLesson,
    isLessonLoaded,
    
    // Computed properties
    isComplete: state.loadedCount === state.totalCount && !state.isLoading,
    hasErrors: state.errors.length > 0,
    progress: state.totalCount > 0 ? (state.loadedCount / state.totalCount) * 100 : 0,
    loadedLessons: Array.from(state.lessons.values())
  }
}

/**
 * Hook for intersection observer-based lazy loading
 * @param {Object} options - Observer options
 * @returns {Object} - Ref and loading state
 */
export const useIntersectionLazyLoad = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    onIntersect = null
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const elementRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting
        setIsIntersecting(isVisible)

        if (isVisible && (!triggerOnce || !hasTriggered)) {
          setHasTriggered(true)
          if (onIntersect) {
            onIntersect(entry)
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered, onIntersect])

  return {
    ref: elementRef,
    isIntersecting,
    hasTriggered,
    shouldLoad: triggerOnce ? hasTriggered : isIntersecting
  }
}