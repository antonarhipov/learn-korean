import React from 'react'
import { Link } from 'react-router-dom'

const LessonsList = () => {
  // Placeholder data - will be replaced with actual lesson data in Phase 1
  const modules = [
    {
      id: 'module-1',
      title: 'Hangul Basics',
      description: 'Learn the Korean alphabet and basic reading skills',
      lessons: [
        { id: 'lesson-001', title: 'Introduction to Hangul', level: 'beginner', completed: false },
        { id: 'lesson-002', title: 'Vowels and Consonants', level: 'beginner', completed: false },
        { id: 'lesson-003', title: 'Reading Practice', level: 'beginner', completed: false }
      ]
    },
    {
      id: 'module-2',
      title: 'Greetings',
      description: 'Essential greetings and introductions',
      lessons: [
        { id: 'lesson-004', title: 'Basic Greetings', level: 'beginner', completed: false },
        { id: 'lesson-005', title: 'Introducing Yourself', level: 'beginner', completed: false }
      ]
    }
  ]

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'beginner': return 'badge-success'
      case 'intermediate': return 'badge-warning'
      case 'advanced': return 'badge-error'
      default: return 'badge-success'
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Korean Lessons</h1>
        <p className="page-description">
          Choose a lesson to start learning. Complete lessons in order to unlock new content.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Learning Progress</h2>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: '0%' }}
            ></div>
          </div>
          <p style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)' 
          }}>
            0 of 5 lessons completed (0%)
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {modules.map((module) => (
          <div key={module.id} className="card">
            <div className="card-header">
              <h2 className="card-title">{module.title}</h2>
              <p className="card-subtitle">{module.description}</p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1rem' 
            }}>
              {module.lessons.map((lesson) => (
                <div 
                  key={lesson.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius)',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      margin: 0
                    }}>
                      {lesson.title}
                    </h3>
                    <span className={`badge ${getLevelBadgeClass(lesson.level)}`}>
                      {lesson.level}
                    </span>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: lesson.completed ? 'var(--success-color)' : 'var(--text-secondary)' 
                    }}>
                      {lesson.completed ? '✓ Completed' : 'Not started'}
                    </span>
                    <Link 
                      to={`/lessons/${lesson.id}`} 
                      className="btn btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                    >
                      {lesson.completed ? 'Review' : 'Start'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Coming Soon</h2>
          <p className="card-subtitle">More lessons and modules will be added regularly</p>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          We're continuously expanding our curriculum. Check back regularly for new lessons
          covering intermediate and advanced Korean topics.
        </p>
      </div>
    </div>
  )
}

export default LessonsList