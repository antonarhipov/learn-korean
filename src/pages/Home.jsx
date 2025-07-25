import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePerformanceMonitor } from '../utils/performanceMonitor'

const Home = () => {
  const { measureAsync } = usePerformanceMonitor('Home')

  // Monitor component mount performance
  useEffect(() => {
    measureAsync('page_load', async () => {
      // Simulate page content loading
      await new Promise(resolve => setTimeout(resolve, 0))
      return 'Home page loaded'
    })
  }, [measureAsync])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Welcome to Learn Korean</h1>
        <p className="page-description">
          Start your journey to learn Korean through interactive lessons, exercises, and multimedia content.
          Master Hangul, vocabulary, grammar, and pronunciation at your own pace.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Ready to Begin?</h2>
          <p className="card-subtitle">
            Our structured learning path will guide you from basic Hangul to conversational Korean.
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>What you'll learn:</h3>
          <ul style={{ 
            listStyle: 'disc', 
            paddingLeft: '1.5rem', 
            color: 'var(--text-secondary)',
            lineHeight: '1.8'
          }}>
            <li>Korean alphabet (Hangul) - reading and writing</li>
            <li>Essential vocabulary for daily conversations</li>
            <li>Basic grammar structures and sentence patterns</li>
            <li>Proper pronunciation with audio examples</li>
            <li>Cultural context and etiquette</li>
          </ul>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Link to="/lessons" className="btn btn-primary">
            Start Learning
          </Link>
          <Link to="/progress" className="btn btn-outline">
            View Progress
          </Link>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📚 Structured Lessons</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Follow our carefully designed curriculum that builds knowledge progressively,
            from basic characters to complex conversations.
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Interactive Exercises</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Practice with quizzes, flashcards, and pronunciation exercises that
            reinforce your learning and track your progress.
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔊 Audio Support</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Learn proper pronunciation with native speaker audio examples
            for every lesson and vocabulary item.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home