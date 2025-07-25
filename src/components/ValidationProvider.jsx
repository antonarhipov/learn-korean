/**
 * Validation Provider Component
 * Provides runtime validation context and middleware for the application
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { validateLessonData } from '../utils/dataValidator.js'
import { dataManager } from '../data/dataManager.js'

// Create validation context
const ValidationContext = createContext(null)

/**
 * Validation Provider Component
 * Wraps the application with validation capabilities
 */
export const ValidationProvider = ({ children, options = {} }) => {
  const {
    enableGlobalValidation = true,
    validateOnDataLoad = true,
    logValidationErrors = true,
    throwOnCriticalErrors = false
  } = options

  const [validationState, setValidationState] = useState({
    isGloballyValid: null,
    globalErrors: [],
    globalWarnings: [],
    componentValidations: new Map(),
    lastGlobalValidation: null
  })

  /**
   * Register a component for validation tracking
   */
  const registerComponent = useCallback((componentId, validationResult) => {
    setValidationState(prev => {
      const newComponentValidations = new Map(prev.componentValidations)
      newComponentValidations.set(componentId, {
        ...validationResult,
        timestamp: new Date().toISOString()
      })

      return {
        ...prev,
        componentValidations: newComponentValidations
      }
    })
  }, [])

  /**
   * Unregister a component from validation tracking
   */
  const unregisterComponent = useCallback((componentId) => {
    setValidationState(prev => {
      const newComponentValidations = new Map(prev.componentValidations)
      newComponentValidations.delete(componentId)

      return {
        ...prev,
        componentValidations: newComponentValidations
      }
    })
  }, [])

  /**
   * Perform global validation
   */
  const validateGlobally = useCallback(async () => {
    if (!enableGlobalValidation) return true

    try {
      // Validate the main lesson data if available
      const rawData = dataManager.rawData
      if (rawData) {
        const result = validateLessonData(rawData)
        
        setValidationState(prev => ({
          ...prev,
          isGloballyValid: result.isValid,
          globalErrors: result.errors || [],
          globalWarnings: result.warnings || [],
          lastGlobalValidation: new Date().toISOString()
        }))

        if (logValidationErrors && !result.isValid) {
          console.error('Global validation failed:', result.errors)
        }

        if (!result.isValid && throwOnCriticalErrors) {
          throw new Error(`Critical validation errors detected: ${result.errors.map(e => e.message).join(', ')}`)
        }

        return result.isValid
      }

      return true
    } catch (error) {
      const errorState = {
        isGloballyValid: false,
        globalErrors: [{ 
          type: 'global_validation_error', 
          message: error.message,
          path: 'global'
        }],
        globalWarnings: [],
        lastGlobalValidation: new Date().toISOString()
      }

      setValidationState(prev => ({ ...prev, ...errorState }))

      if (logValidationErrors) {
        console.error('Global validation error:', error)
      }

      if (throwOnCriticalErrors) {
        throw error
      }

      return false
    }
  }, [enableGlobalValidation, logValidationErrors, throwOnCriticalErrors])

  /**
   * Get validation summary
   */
  const getValidationSummary = useCallback(() => {
    const componentValidations = Array.from(validationState.componentValidations.values())
    const totalComponents = componentValidations.length
    const validComponents = componentValidations.filter(v => v.isValid).length
    const componentsWithErrors = componentValidations.filter(v => v.errors?.length > 0).length
    const componentsWithWarnings = componentValidations.filter(v => v.warnings?.length > 0).length

    return {
      global: {
        isValid: validationState.isGloballyValid,
        errorCount: validationState.globalErrors.length,
        warningCount: validationState.globalWarnings.length,
        lastValidated: validationState.lastGlobalValidation
      },
      components: {
        total: totalComponents,
        valid: validComponents,
        withErrors: componentsWithErrors,
        withWarnings: componentsWithWarnings,
        validationRate: totalComponents > 0 ? (validComponents / totalComponents) * 100 : 100
      },
      overall: {
        isHealthy: validationState.isGloballyValid && componentsWithErrors === 0,
        totalErrors: validationState.globalErrors.length + componentValidations.reduce((sum, v) => sum + (v.errors?.length || 0), 0),
        totalWarnings: validationState.globalWarnings.length + componentValidations.reduce((sum, v) => sum + (v.warnings?.length || 0), 0)
      }
    }
  }, [validationState])

  /**
   * Clear all validation state
   */
  const clearValidationState = useCallback(() => {
    setValidationState({
      isGloballyValid: null,
      globalErrors: [],
      globalWarnings: [],
      componentValidations: new Map(),
      lastGlobalValidation: null
    })
  }, [])

  // Perform global validation on mount and when data manager is initialized
  useEffect(() => {
    if (validateOnDataLoad && dataManager.isInitialized) {
      validateGlobally()
    }
  }, [validateOnDataLoad, validateGlobally])

  const contextValue = {
    // State
    validationState,
    
    // Methods
    registerComponent,
    unregisterComponent,
    validateGlobally,
    getValidationSummary,
    clearValidationState,
    
    // Configuration
    options: {
      enableGlobalValidation,
      validateOnDataLoad,
      logValidationErrors,
      throwOnCriticalErrors
    }
  }

  return (
    <ValidationContext.Provider value={contextValue}>
      {children}
    </ValidationContext.Provider>
  )
}

/**
 * Hook to use validation context
 */
export const useValidationContext = () => {
  const context = useContext(ValidationContext)
  if (!context) {
    throw new Error('useValidationContext must be used within a ValidationProvider')
  }
  return context
}

/**
 * Higher-Order Component for validation middleware
 */
export const withValidation = (WrappedComponent, validationOptions = {}) => {
  const ValidatedComponent = (props) => {
    const { registerComponent, unregisterComponent } = useValidationContext()
    const componentId = validationOptions.componentId || WrappedComponent.name || 'UnknownComponent'
    
    const [componentValidation, setComponentValidation] = useState({
      isValid: null,
      errors: [],
      warnings: [],
      isValidating: false
    })

    // Register component validation on mount
    useEffect(() => {
      registerComponent(componentId, componentValidation)
      
      return () => {
        unregisterComponent(componentId)
      }
    }, [componentId, componentValidation, registerComponent, unregisterComponent])

    // Validation method for the component
    const validateComponent = useCallback(async (data) => {
      if (!data) return true

      setComponentValidation(prev => ({ ...prev, isValidating: true }))

      try {
        const result = validateLessonData(data)
        const newValidation = {
          isValid: result.isValid,
          errors: result.errors || [],
          warnings: result.warnings || [],
          isValidating: false
        }

        setComponentValidation(newValidation)
        registerComponent(componentId, newValidation)

        return result.isValid
      } catch (error) {
        const errorValidation = {
          isValid: false,
          errors: [{ type: 'component_validation_error', message: error.message }],
          warnings: [],
          isValidating: false
        }

        setComponentValidation(errorValidation)
        registerComponent(componentId, errorValidation)

        console.error(`Validation error in component ${componentId}:`, error)
        return false
      }
    }, [componentId, registerComponent])

    return (
      <WrappedComponent
        {...props}
        validation={{
          ...componentValidation,
          validate: validateComponent,
          componentId
        }}
      />
    )
  }

  ValidatedComponent.displayName = `withValidation(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return ValidatedComponent
}

/**
 * Validation Status Component
 * Displays current validation status for debugging
 */
export const ValidationStatus = ({ showDetails = false }) => {
  const { getValidationSummary, validationState } = useValidationContext()
  const summary = getValidationSummary()

  if (!showDetails) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        padding: '8px 12px',
        backgroundColor: summary.overall.isHealthy ? '#10b981' : '#ef4444',
        color: 'white',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        {summary.overall.isHealthy ? '✓ Valid' : '✗ Invalid'} 
        ({summary.overall.totalErrors} errors, {summary.overall.totalWarnings} warnings)
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '300px',
      maxHeight: '400px',
      overflow: 'auto',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h3>Validation Status</h3>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>Global:</strong> {summary.global.isValid ? '✓ Valid' : '✗ Invalid'}
        <br />
        Errors: {summary.global.errorCount}, Warnings: {summary.global.warningCount}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Components:</strong> {summary.components.valid}/{summary.components.total} valid
        <br />
        Validation Rate: {summary.components.validationRate.toFixed(1)}%
      </div>

      <div>
        <strong>Overall Health:</strong> {summary.overall.isHealthy ? '✓ Healthy' : '✗ Issues Detected'}
      </div>
    </div>
  )
}