// Test script for DataManager functionality
import { dataManager } from '../data/dataManager.js'
import lessonsData from '../data/lessons.json' with { type: 'json' }

console.log('Testing DataManager functionality...\n')

async function runTests() {
  try {
    // Initialize the data manager
    console.log('=== INITIALIZING DATA MANAGER ===')
    await dataManager.initialize(lessonsData)
    console.log('✅ DataManager initialized successfully\n')

    // Test basic data access
    console.log('=== TESTING BASIC DATA ACCESS ===')
    
    // Test getting all modules
    const modules = dataManager.getAllModules()
    console.log(`Total modules: ${modules.length}`)
    modules.forEach(module => {
      console.log(`  - ${module.title}: ${module.totalLessons} lessons, ${module.progressPercentage}% complete`)
    })
    
    // Test getting all lessons
    const lessons = dataManager.getAllLessons()
    console.log(`\nTotal lessons: ${lessons.length}`)
    lessons.forEach(lesson => {
      console.log(`  - ${lesson.title} (${lesson.level}, ${lesson.category}) - ${lesson.estimatedTime}min`)
    })
    console.log('')

    // Test hierarchical access
    console.log('=== TESTING HIERARCHICAL ACCESS ===')
    
    // Test lessons by module
    console.log('Lessons by module:')
    modules.forEach(module => {
      const moduleLessons = dataManager.getLessonsByModule(module.id)
      console.log(`  ${module.title}: ${moduleLessons.map(l => l.title).join(', ')}`)
    })
    
    // Test lessons by level
    console.log('\nLessons by level:')
    const levels = ['beginner', 'intermediate', 'advanced']
    levels.forEach(level => {
      const levelLessons = dataManager.getLessonsByLevel(level)
      console.log(`  ${level}: ${levelLessons.length} lessons`)
    })
    
    // Test lessons by category
    console.log('\nLessons by category:')
    const categories = ['pronunciation', 'vocabulary', 'grammar', 'culture']
    categories.forEach(category => {
      const categoryLessons = dataManager.getLessonsByCategory(category)
      console.log(`  ${category}: ${categoryLessons.length} lessons`)
    })
    console.log('')

    // Test individual lesson access
    console.log('=== TESTING INDIVIDUAL LESSON ACCESS ===')
    const firstLesson = dataManager.getLesson('lesson-001')
    if (firstLesson) {
      console.log(`First lesson: ${firstLesson.title}`)
      console.log(`  - Level: ${firstLesson.level}`)
      console.log(`  - Category: ${firstLesson.category}`)
      console.log(`  - Difficulty score: ${firstLesson.difficulty}`)
      console.log(`  - Has audio: ${firstLesson.hasAudio}`)
      console.log(`  - Has media: ${firstLesson.hasMedia}`)
      console.log(`  - Total exercises: ${firstLesson.totalExercises}`)
      console.log(`  - Exercise types: ${firstLesson.availableExerciseTypes.join(', ')}`)
      console.log(`  - Is first lesson: ${firstLesson.isFirstLesson}`)
      console.log(`  - Is last lesson: ${firstLesson.isLastLesson}`)
    }
    console.log('')

    // Test prerequisite system
    console.log('=== TESTING PREREQUISITE SYSTEM ===')
    const lesson002 = dataManager.getLesson('lesson-002')
    if (lesson002) {
      const prereqInfo = dataManager.getPrerequisiteInfo('lesson-002')
      console.log(`Lesson 002 prerequisites: ${prereqInfo.prerequisites.map(l => l.title).join(', ')}`)
      console.log(`Lesson 002 dependents: ${prereqInfo.dependents.map(l => l.title).join(', ')}`)
      
      console.log(`Is lesson-001 available: ${dataManager.isLessonAvailable('lesson-001')}`)
      console.log(`Is lesson-002 available: ${dataManager.isLessonAvailable('lesson-002')}`)
    }
    console.log('')

    // Test next available lesson
    console.log('=== TESTING NEXT AVAILABLE LESSON ===')
    const nextLesson = dataManager.getNextAvailableLesson()
    if (nextLesson) {
      console.log(`Next available lesson: ${nextLesson.title}`)
    } else {
      console.log('No lessons available (all completed or prerequisites not met)')
    }
    console.log('')

    // Test statistics
    console.log('=== TESTING STATISTICS ===')
    const stats = dataManager.getStatistics()
    console.log('Learning statistics:')
    console.log(`  - Total lessons: ${stats.totalLessons}`)
    console.log(`  - Completed lessons: ${stats.completedLessons}`)
    console.log(`  - Total modules: ${stats.totalModules}`)
    console.log(`  - Completed modules: ${stats.completedModules}`)
    console.log(`  - Total estimated time: ${stats.totalEstimatedTime} minutes`)
    console.log(`  - Progress percentage: ${stats.progressPercentage}%`)
    console.log(`  - Available lessons: ${stats.availableLessons}`)
    console.log('')

    // Test search functionality
    console.log('=== TESTING SEARCH FUNCTIONALITY ===')
    const searchResults = dataManager.searchLessons('hangul')
    console.log(`Search results for "hangul": ${searchResults.length} lessons found`)
    searchResults.forEach(lesson => {
      console.log(`  - ${lesson.title}: ${lesson.description}`)
    })
    console.log('')

    // Test module details
    console.log('=== TESTING MODULE DETAILS ===')
    const module1 = dataManager.getModule('module-1')
    if (module1) {
      console.log(`Module 1 details:`)
      console.log(`  - Title: ${module1.title}`)
      console.log(`  - Total lessons: ${module1.totalLessons}`)
      console.log(`  - Completed lessons: ${module1.completedLessons}`)
      console.log(`  - Total exercises: ${module1.totalExercises}`)
      console.log(`  - Progress: ${module1.progressPercentage}%`)
      console.log(`  - Has audio: ${module1.hasAudio}`)
      console.log(`  - Has media: ${module1.hasMedia}`)
      console.log(`  - First lesson: ${module1.firstLessonId}`)
      console.log(`  - Last lesson: ${module1.lastLessonId}`)
    }
    console.log('')

    // Test enhanced lesson properties
    console.log('=== TESTING ENHANCED LESSON PROPERTIES ===')
    lessons.slice(0, 3).forEach(lesson => {
      console.log(`${lesson.title}:`)
      console.log(`  - Order: ${lesson.order}`)
      console.log(`  - Difficulty: ${lesson.difficulty}`)
      console.log(`  - Example count: ${lesson.exampleCount}`)
      console.log(`  - Completion status: ${JSON.stringify(lesson.completionStatus)}`)
    })

    console.log('\n✅ All DataManager tests completed successfully!')
    
  } catch (error) {
    console.error('❌ DataManager test failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

runTests()