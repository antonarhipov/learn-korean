// Test script for lesson data validation
import { validateLessonData, formatValidationErrors, formatValidationWarnings } from './dataValidator.js'
import lessonsData from '../data/lessons.json' with { type: 'json' }

console.log('Testing lesson data validation...\n')

try {
  const validationResult = validateLessonData(lessonsData)
  
  console.log('=== VALIDATION RESULTS ===')
  console.log(`Valid: ${validationResult.isValid}`)
  console.log(`Errors: ${validationResult.errors.length}`)
  console.log(`Warnings: ${validationResult.warnings.length}`)
  console.log('')
  
  if (validationResult.errors.length > 0) {
    console.log(formatValidationErrors(validationResult.errors))
  } else {
    console.log('✅ No validation errors found!')
  }
  
  if (validationResult.warnings.length > 0) {
    console.log(formatValidationWarnings(validationResult.warnings))
  } else {
    console.log('✅ No validation warnings!')
  }
  
  // Summary statistics
  console.log('=== DATA SUMMARY ===')
  console.log(`Total lessons: ${lessonsData.lessons.length}`)
  console.log(`Total modules: ${lessonsData.modules.length}`)
  
  const totalExercises = lessonsData.lessons.reduce((total, lesson) => 
    total + lesson.exercises.length, 0
  )
  console.log(`Total exercises: ${totalExercises}`)
  
  const totalEstimatedTime = lessonsData.lessons.reduce((total, lesson) => 
    total + lesson.estimatedTime, 0
  )
  console.log(`Total estimated time: ${totalEstimatedTime} minutes`)
  
  console.log('\n✅ Validation test completed successfully!')
  
} catch (error) {
  console.error('❌ Validation test failed:', error.message)
  process.exit(1)
}