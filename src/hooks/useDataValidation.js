/**
 * Runtime Data Validation Hook
 * Provides validation capabilities for React components with error prevention
 */

import { useState, useEffect, useCallback } from 'react'
import { validateLessonData, formatValidationErrors } from '../utils/dataValidator.js'

/**
 * Custom hook for runtime data validation
 * @param {Object} data - Data to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation state and methods
 */
export const useDataValidation = (data, options = {}) => {
  const {
    validateOnMount = true,
    validateOnChange = true,
    throwOnError = false,
    onValidationError = null,
    onValidationSuccess = null
  } = options

  const [validationState, setValidationState] = useState({
    isValid: null,
    isValidating: false,
    errors: [],
    warnings: [],
    lastValidated: null
  })

  /**
   * Perform validation on the provided data
   */
  const validate = useCallback(async (dataToValidate = data) => {
    if (!dataToValidate) {
      setValidationState(prev => ({
        ...prev,
        isValid: false,
        errors: [{ type: 'data', message: 'No data provided for validation' }],
        warnings: [],
        lastValidated: new Date().toISOString()
      }))
      return false
    }

    setValidationState(prev => ({ ...prev, isValidating: true }))

    try {
      const result = validateLessonData(dataToValidate)
      
      setValidationState({
        isValid: result.isValid,
        isValidating: false,
        errors: result.errors || [],
        warnings: result.warnings || [],
        lastValidated: new Date().toISOString()
      })

      // Call success/error callbacks
      if (result.isValid && onValidationSuccess) {
        onValidationSuccess(result)
      } else if (!result.isValid && onValidationError) {
        onValidationError(result)
      }

      // Throw error if configured to do so
      if (!result.isValid && throwOnError) {
        throw new Error(`Validation failed: ${formatValidationErrors(result.errors)}`)
      }

      return result.isValid
    } catch (error) {
      const errorState = {
        isValid: false,
        isValidating: false,
        errors: [{ 
          type: 'validation_error', 
          message: error.message,
          path: 'root'
        }],
        warnings: [],
        lastValidated: new Date().toISOString()
      }

      setValidationState(errorState)

      if (onValidationError) {
        onValidationError(errorState)
      }

      if (throwOnError) {
        throw error
      }

      console.error('Data validation failed:', error)
      return false
    }
  }, [data, throwOnError, onValidationError, onValidationSuccess])

  /**
   * Clear validation state
   */
  const clearValidation = useCallback(() => {
    setValidationState({
      isValid: null,
      isValidating: false,
      errors: [],
      warnings: [],
      lastValidated: null
    })
  }, [])

  /**
   * Get formatted error messages
   */
  const getErrorMessages = useCallback(() => {
    return validationState.errors.map(error => error.message).join('; ')
  }, [validationState.errors])

  /**
   * Check if specific error type exists
   */
  const hasErrorType = useCallback((errorType) => {
    return validationState.errors.some(error => error.type === errorType)
  }, [validationState.errors])

  // Validate on mount if enabled
  useEffect(() => {
    if (validateOnMount && data) {
      validate(data)
    }
  }, []) // Only run on mount

  // Validate on data change if enabled
  useEffect(() => {
    if (validateOnChange && data && validationState.lastValidated) {
      validate(data)
    }
  }, [data, validateOnChange]) // Run when data changes

  return {
    // Validation state
    isValid: validationState.isValid,
    isValidating: validationState.isValidating,
    errors: validationState.errors,
    warnings: validationState.warnings,
    lastValidated: validationState.lastValidated,
    
    // Validation methods
    validate,
    clearValidation,
    
    // Helper methods
    getErrorMessages,
    hasErrorType,
    
    // Computed properties
    hasErrors: validationState.errors.length > 0,
    hasWarnings: validationState.warnings.length > 0,
    errorCount: validationState.errors.length,
    warningCount: validationState.warnings.length
  }
}

/**
 * Hook for validating lesson data specifically
 * @param {Object} lessonData - Lesson data to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation state and methods
 */
export const useLessonValidation = (lessonData, options = {}) => {
  return useDataValidation(lessonData, {
    ...options,
    onValidationError: (result) => {
      console.warn('Lesson data validation failed:', result.errors)
      if (options.onValidationError) {
        options.onValidationError(result)
      }
    }
  })
}

/**
 * Hook for safe data access with validation
 * @param {Object} data - Data to access safely
 * @param {string} path - Path to access (e.g., 'lessons.0.title')
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} - Safe value or default
 */
export const useSafeDataAccess = (data, path, defaultValue = null) => {
  const [safeValue, setSafeValue] = useState(defaultValue)

  useEffect(() => {
    try {
      if (!data || !path) {
        setSafeValue(defaultValue)
        return
      }

      const pathParts = path.split('.')
      let current = data

      for (const part of pathParts) {
        if (current === null || current === undefined) {
          setSafeValue(defaultValue)
          return
        }

        // Handle array indices
        if (!isNaN(part) && Array.isArray(current)) {
          current = current[parseInt(part)]
        } else if (typeof current === 'object') {
          current = current[part]
        } else {
          setSafeValue(defaultValue)
          return
        }
      }

      setSafeValue(current !== undefined ? current : defaultValue)
    } catch (error) {
      console.warn(`Safe data access failed for path "${path}":`, error)
      setSafeValue(defaultValue)
    }
  }, [data, path, defaultValue])

  return safeValue
}