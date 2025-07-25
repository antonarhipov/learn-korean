import Ajv from 'ajv'
import { lessonSchema, customValidations } from '../data/schemas/lessonSchema.js'

// Initialize AJV with options
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false
})

// Compile the schema
const validateSchema = ajv.compile(lessonSchema)

/**
 * Validates lesson data against the JSON schema and custom validation rules
 * @param {Object} data - The lesson data to validate
 * @returns {Object} - Validation result with isValid flag and errors array
 */
export const validateLessonData = (data) => {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  }

  try {
    // First, validate against JSON schema
    const schemaValid = validateSchema(data)
    
    if (!schemaValid) {
      result.isValid = false
      result.errors = validateSchema.errors.map(error => ({
        type: 'schema',
        path: error.instancePath || error.schemaPath,
        message: error.message,
        data: error.data,
        allowedValues: error.schema?.enum || null
      }))
    }

    // If schema validation passes, run custom validations
    if (schemaValid) {
      // Validate prerequisites
      const prereqErrors = customValidations.validatePrerequisites(data)
      if (prereqErrors.length > 0) {
        result.isValid = false
        result.errors.push(...prereqErrors.map(err => ({
          type: 'prerequisite',
          ...err
        })))
      }

      // Validate next lessons
      const nextLessonErrors = customValidations.validateNextLessons(data)
      if (nextLessonErrors.length > 0) {
        result.isValid = false
        result.errors.push(...nextLessonErrors.map(err => ({
          type: 'nextLesson',
          ...err
        })))
      }

      // Validate module lessons
      const moduleLessonErrors = customValidations.validateModuleLessons(data)
      if (moduleLessonErrors.length > 0) {
        result.isValid = false
        result.errors.push(...moduleLessonErrors.map(err => ({
          type: 'moduleLesson',
          ...err
        })))
      }

      // Validate quiz answers
      const quizErrors = customValidations.validateQuizAnswers(data)
      if (quizErrors.length > 0) {
        result.isValid = false
        result.errors.push(...quizErrors.map(err => ({
          type: 'quizAnswer',
          ...err
        })))
      }

      // Additional data quality checks (warnings)
      const qualityWarnings = performQualityChecks(data)
      result.warnings.push(...qualityWarnings)
    }

  } catch (error) {
    result.isValid = false
    result.errors.push({
      type: 'validation_error',
      path: 'root',
      message: `Validation failed: ${error.message}`,
      data: null
    })
  }

  return result
}

/**
 * Performs additional data quality checks that generate warnings
 * @param {Object} data - The lesson data to check
 * @returns {Array} - Array of warning objects
 */
const performQualityChecks = (data) => {
  const warnings = []

  // Check for lessons without prerequisites (except first lessons)
  data.lessons.forEach(lesson => {
    if (lesson.prerequisites.length === 0 && !lesson.id.endsWith('001')) {
      warnings.push({
        type: 'quality',
        path: `lessons[${lesson.id}].prerequisites`,
        message: `Lesson '${lesson.id}' has no prerequisites but is not a first lesson`,
        severity: 'low'
      })
    }
  })

  // Check for lessons without next lessons (except final lessons)
  data.lessons.forEach(lesson => {
    if (lesson.nextLessons.length === 0) {
      warnings.push({
        type: 'quality',
        path: `lessons[${lesson.id}].nextLessons`,
        message: `Lesson '${lesson.id}' has no next lessons - ensure this is intentional`,
        severity: 'low'
      })
    }
  })

  // Check for very short or very long lessons
  data.lessons.forEach(lesson => {
    if (lesson.estimatedTime < 5) {
      warnings.push({
        type: 'quality',
        path: `lessons[${lesson.id}].estimatedTime`,
        message: `Lesson '${lesson.id}' has very short estimated time (${lesson.estimatedTime} minutes)`,
        severity: 'medium'
      })
    } else if (lesson.estimatedTime > 60) {
      warnings.push({
        type: 'quality',
        path: `lessons[${lesson.id}].estimatedTime`,
        message: `Lesson '${lesson.id}' has very long estimated time (${lesson.estimatedTime} minutes)`,
        severity: 'medium'
      })
    }
  })

  // Check for lessons with few examples
  data.lessons.forEach(lesson => {
    if (lesson.content.examples.length < 2) {
      warnings.push({
        type: 'quality',
        path: `lessons[${lesson.id}].content.examples`,
        message: `Lesson '${lesson.id}' has only ${lesson.content.examples.length} example(s) - consider adding more`,
        severity: 'medium'
      })
    }
  })

  // Check for exercises with few questions/cards
  data.lessons.forEach(lesson => {
    lesson.exercises.forEach((exercise, index) => {
      if (exercise.type === 'quiz' && exercise.questions.length < 3) {
        warnings.push({
          type: 'quality',
          path: `lessons[${lesson.id}].exercises[${index}].questions`,
          message: `Quiz in lesson '${lesson.id}' has only ${exercise.questions.length} question(s)`,
          severity: 'low'
        })
      }
      if (exercise.type === 'flashcard' && exercise.cards.length < 3) {
        warnings.push({
          type: 'quality',
          path: `lessons[${lesson.id}].exercises[${index}].cards`,
          message: `Flashcard exercise in lesson '${lesson.id}' has only ${exercise.cards.length} card(s)`,
          severity: 'low'
        })
      }
    })
  })

  return warnings
}

/**
 * Validates lesson data and throws an error if validation fails
 * @param {Object} data - The lesson data to validate
 * @throws {Error} - Throws detailed validation error if data is invalid
 */
export const validateLessonDataStrict = (data) => {
  const result = validateLessonData(data)
  
  if (!result.isValid) {
    const errorMessages = result.errors.map(error => 
      `${error.type}: ${error.path} - ${error.message}`
    ).join('\n')
    
    throw new Error(`Lesson data validation failed:\n${errorMessages}`)
  }
  
  return result
}

/**
 * Formats validation errors for display
 * @param {Array} errors - Array of validation errors
 * @returns {String} - Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors || errors.length === 0) {
    return 'No validation errors'
  }

  const groupedErrors = errors.reduce((groups, error) => {
    const type = error.type || 'unknown'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(error)
    return groups
  }, {})

  let formatted = 'Validation Errors:\n\n'
  
  Object.entries(groupedErrors).forEach(([type, typeErrors]) => {
    formatted += `${type.toUpperCase()} ERRORS:\n`
    typeErrors.forEach(error => {
      formatted += `  • ${error.path}: ${error.message}\n`
      if (error.allowedValues) {
        formatted += `    Allowed values: ${error.allowedValues.join(', ')}\n`
      }
    })
    formatted += '\n'
  })

  return formatted
}

/**
 * Formats validation warnings for display
 * @param {Array} warnings - Array of validation warnings
 * @returns {String} - Formatted warning message
 */
export const formatValidationWarnings = (warnings) => {
  if (!warnings || warnings.length === 0) {
    return 'No validation warnings'
  }

  const groupedWarnings = warnings.reduce((groups, warning) => {
    const severity = warning.severity || 'medium'
    if (!groups[severity]) {
      groups[severity] = []
    }
    groups[severity].push(warning)
    return groups
  }, {})

  let formatted = 'Validation Warnings:\n\n'
  
  // Sort by severity: high, medium, low
  const severityOrder = ['high', 'medium', 'low']
  severityOrder.forEach(severity => {
    if (groupedWarnings[severity]) {
      formatted += `${severity.toUpperCase()} PRIORITY:\n`
      groupedWarnings[severity].forEach(warning => {
        formatted += `  • ${warning.path}: ${warning.message}\n`
      })
      formatted += '\n'
    }
  })

  return formatted
}