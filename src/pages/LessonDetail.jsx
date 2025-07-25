import React from 'react'
import { useParams, Link } from 'react-router-dom'

const LessonDetail = () => {
  const { lessonId } = useParams()

  // Placeholder lesson data - will be replaced with actual data loading in Phase 1
  const lesson = {
    id: lessonId,
    title: 'Introduction to Hangul',
    level: 'beginner',
    category: 'pronunciation',
    description: 'Learn the basics of the Korean alphabet.',
    prerequisites: [],
    nextLessons: ['lesson-002'],
    content: {
      text: `Hangul is the Korean alphabet, created by King Sejong in 1443. It is considered one of the most scientific writing systems in the world.

The Korean alphabet consists of 14 basic consonants and 10 basic vowels. These letters are combined to form syllable blocks, which make up Korean words.

In this lesson, we'll introduce you to the basic structure of Hangul and show you how Korean characters are formed.`,
      examples: [
        {
          korean: 'ㄱ',
          romanization: 'g/k',
          translation: 'Consonant G/K',
          audio: '/assets/audio/g.mp3'
        },
        {
          korean: 'ㄴ',
          romanization: 'n',
          translation: 'Consonant N',
          audio: '/assets/audio/n.mp3'
        },
        {
          korean: 'ㅏ',
          romanization: 'a',
          translation: 'Vowel A',
          audio: '/assets/audio/a.mp3'
        }
      ],
      media: {
        image: '/assets/images/hangul-chart.jpg',
        video: null
      }
    },
    exercises: [
      {
        type: 'quiz',
        title: 'Hangul Recognition Quiz'
      },
      {
        type: 'flashcard',
        title: 'Character Flashcards'
      },
      {
        type: 'pronunciation',
        title: 'Pronunciation Practice'
      }
    ]
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
                 exercise.type === 'flashcard' ? '🃏' : '🎤'}
              </div>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)'
              }}>
                {exercise.title}
              </h3>
              <button 
                className="btn btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                onClick={() => console.log(`Starting ${exercise.type} exercise`)}
              >
                Start Exercise
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
    </div>
  )
}

export default LessonDetail