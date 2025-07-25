import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import FillInTheBlankExercise from '../components/exercises/FillInTheBlankExercise'
import DragDropExercise from '../components/exercises/DragDropExercise'
import ListeningExercise from '../components/exercises/ListeningExercise'
import TypingExercise from '../components/exercises/TypingExercise'
import QuizExercise from '../components/exercises/QuizExercise'
import FlashcardExercise from '../components/exercises/FlashcardExercise'
import lessonsData from '../data/lessons.json'

const LessonDetail = () => {
  const { lessonId } = useParams()
  const [lesson, setLesson] = useState(null)
  const [activeExercise, setActiveExercise] = useState(null)
  const [exerciseProgress, setExerciseProgress] = useState({})

  useEffect(() => {
    // Load lesson data from JSON
    const foundLesson = lessonsData.lessons.find(l => l.id === lessonId)
    if (foundLesson) {
      setLesson(foundLesson)
    }
  }, [lessonId])

  const handleExerciseComplete = (exerciseData) => {
    console.log('Exercise completed:', exerciseData)
    // Store completion data for gamification features
    setExerciseProgress(prev => ({
      ...prev,
      [activeExercise.type]: {
        ...exerciseData,
        completedAt: new Date().toISOString()
      }
    }))
  }

  const handleExerciseProgress = (progressData) => {
    console.log('Exercise progress:', progressData)
    // Track progress for adaptive learning features
  }

  const startExercise = (exercise) => {
    setActiveExercise(exercise)
  }

  const closeExercise = () => {
    setActiveExercise(null)
  }

  if (!lesson) {
    return (
      <div className="page-container">
        <div className="card">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Lesson not found</h2>
            <p>The requested lesson could not be found.</p>
            <Link to="/lessons" className="btn btn-primary">
              Back to Lessons
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleAudioPlay = (audioPath) => {
    // Placeholder for audio playback - will be implemented in Phase 1
    console.log('Playing audio:', audioPath)
  }

  return (
    <div className="page-container">
      {/* Lesson Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Link to="/lessons" className="btn btn-secondary">
            ← Back to Lessons
          </Link>
          <span className={`badge badge-success`}>
            {lesson.level}
          </span>
          <span className="badge badge-warning">
            {lesson.category}
          </span>
        </div>
        <h1 className="page-title">{lesson.title}</h1>
        <p className="page-description">{lesson.description}</p>
      </div>

      {/* Lesson Content */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Lesson Content</h2>
        </div>
        
        <div style={{ 
          whiteSpace: 'pre-line', 
          lineHeight: '1.8',
          color: 'var(--text-primary)',
          marginBottom: '2rem'
        }}>
          {lesson.content.text}
        </div>

        {lesson.content.media.image && (
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src={lesson.content.media.image} 
              alt="Lesson illustration"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)'
              }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* Examples Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Examples</h2>
          <p className="card-subtitle">Click the audio button to hear pronunciation</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem' 
        }}>
          {lesson.content.examples.map((example, index) => (
            <div 
              key={index}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                padding: '1.5rem',
                backgroundColor: 'var(--bg-secondary)',
                textAlign: 'center'
              }}
            >
              <div 
                className="korean-text"
                style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  color: 'var(--primary-color)'
                }}
              >
                {example.korean}
              </div>
              <div style={{ 
                fontSize: '1rem', 
                color: 'var(--text-secondary)',
                marginBottom: '0.25rem'
              }}>
                {example.romanization}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-muted)',
                marginBottom: '1rem'
              }}>
                {example.translation}
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => handleAudioPlay(example.audio)}
                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
              >
                🔊 Play Audio
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Exercises Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Practice Exercises</h2>
          <p className="card-subtitle">Test your understanding with these interactive exercises</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          {lesson.exercises.map((exercise, index) => (
            <div 
              key={index}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                padding: '1.5rem',
                backgroundColor: 'var(--bg-secondary)',
                textAlign: 'center'
              }}
            >
              <div style={{ 
                fontSize: '2rem', 
                marginBottom: '0.5rem'
              }}>
                {exercise.type === 'quiz' ? '📝' : 
                 exercise.type === 'flashcard' ? '🃏' : 
                 exercise.type === 'fill-in-the-blank' ? '✏️' : 
                 exercise.type === 'drag-drop' ? '🧩' : 
                 exercise.type === 'listening' ? '🎧' : 
                 exercise.type === 'typing' ? '⌨️' : '🎤'}
              </div>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)'
              }}>
                {exercise.title}
              </h3>
              {exerciseProgress[exercise.type] && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--success-color)',
                  marginBottom: '0.5rem'
                }}>
                  ✓ Completed ({exerciseProgress[exercise.type].score}%)
                </div>
              )}
              <button 
                className="btn btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                onClick={() => startExercise(exercise)}
              >
                {exerciseProgress[exercise.type] ? 'Practice Again' : 'Start Exercise'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <button className="btn btn-secondary" disabled>
            ← Previous Lesson
          </button>
          <div style={{ textAlign: 'center' }}>
            <button className="btn btn-primary">
              Mark as Complete
            </button>
          </div>
          <Link to="/lessons/lesson-002" className="btn btn-secondary">
            Next Lesson →
          </Link>
        </div>
      </div>

      {/* Exercise Modal */}
      {activeExercise && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--border-radius)',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={closeExercise}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                zIndex: 1001,
                color: 'var(--text-primary)'
              }}
            >
              ✕
            </button>
            
            {activeExercise.type === 'fill-in-the-blank' && (
              <FillInTheBlankExercise
                exercise={activeExercise}
                onComplete={handleExerciseComplete}
                onProgress={handleExerciseProgress}
              />
            )}
            
            {activeExercise.type === 'drag-drop' && (
              <DragDropExercise
                exercise={activeExercise}
                onComplete={handleExerciseComplete}
                onProgress={handleExerciseProgress}
              />
            )}
            
            {activeExercise.type === 'listening' && (
              <ListeningExercise
                exercise={activeExercise}
                onComplete={handleExerciseComplete}
                onProgress={handleExerciseProgress}
              />
            )}
            
            {activeExercise.type === 'typing' && (
              <TypingExercise
                exercise={activeExercise}
                onComplete={handleExerciseComplete}
                onProgress={handleExerciseProgress}
              />
            )}
            
            {activeExercise.type === 'quiz' && (
              <QuizExercise
                exercise={activeExercise}
                onComplete={handleExerciseComplete}
                onProgress={handleExerciseProgress}
              />
            )}
            
            {activeExercise.type === 'flashcard' && (
              <FlashcardExercise
                exercise={activeExercise}
                onComplete={handleExerciseComplete}
                onProgress={handleExerciseProgress}
              />
            )}
            
            {activeExercise.type === 'pronunciation' && (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h3>Pronunciation Exercise</h3>
                <p>Pronunciation functionality will be implemented in a future update.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LessonDetail