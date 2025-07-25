import React, { useState, useEffect } from 'react'

const Settings = () => {
  // Theme state - will be moved to context in Phase 1
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  // Audio settings
  const [audioEnabled, setAudioEnabled] = useState(() => {
    return localStorage.getItem('audioEnabled') !== 'false'
  })

  const [audioVolume, setAudioVolume] = useState(() => {
    return parseInt(localStorage.getItem('audioVolume') || '80')
  })

  // Learning preferences
  const [autoPlay, setAutoPlay] = useState(() => {
    return localStorage.getItem('autoPlay') !== 'false'
  })

  const [showRomanization, setShowRomanization] = useState(() => {
    return localStorage.getItem('showRomanization') !== 'false'
  })

  const [dailyGoal, setDailyGoal] = useState(() => {
    return parseInt(localStorage.getItem('dailyGoal') || '15')
  })

  // Apply theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('audioEnabled', audioEnabled.toString())
  }, [audioEnabled])

  useEffect(() => {
    localStorage.setItem('audioVolume', audioVolume.toString())
  }, [audioVolume])

  useEffect(() => {
    localStorage.setItem('autoPlay', autoPlay.toString())
  }, [autoPlay])

  useEffect(() => {
    localStorage.setItem('showRomanization', showRomanization.toString())
  }, [showRomanization])

  useEffect(() => {
    localStorage.setItem('dailyGoal', dailyGoal.toString())
  }, [dailyGoal])

  const handleClearProgress = () => {
    if (window.confirm('Are you sure you want to clear all your progress? This action cannot be undone.')) {
      // Clear progress data from localStorage
      const keysToRemove = [
        'completedLessons',
        'exerciseScores',
        'progressData',
        'recentActivity'
      ]
      keysToRemove.forEach(key => localStorage.removeItem(key))
      alert('Progress data has been cleared.')
    }
  }

  const handleExportData = () => {
    // Export user data
    const userData = {
      theme,
      audioEnabled,
      audioVolume,
      autoPlay,
      showRomanization,
      dailyGoal,
      completedLessons: JSON.parse(localStorage.getItem('completedLessons') || '[]'),
      exerciseScores: JSON.parse(localStorage.getItem('exerciseScores') || '{}'),
      progressData: JSON.parse(localStorage.getItem('progressData') || '{}')
    }

    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'korean-learning-data.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">
          Customize your learning experience and manage your preferences.
        </p>
      </div>

      {/* Appearance Settings */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Appearance</h2>
          <p className="card-subtitle">Customize the look and feel of the app</p>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
          }}>
            Theme
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTheme('light')}
            >
              ☀️ Light
            </button>
            <button
              className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTheme('dark')}
            >
              🌙 Dark
            </button>
          </div>
        </div>
      </div>

      {/* Audio Settings */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Audio Settings</h2>
          <p className="card-subtitle">Configure audio playback preferences</p>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={audioEnabled}
              onChange={(e) => setAudioEnabled(e.target.checked)}
              style={{ 
                width: '1.25rem', 
                height: '1.25rem',
                accentColor: 'var(--primary-color)'
              }}
            />
            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
              Enable Audio
            </span>
          </label>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)',
            marginTop: '0.25rem',
            marginLeft: '1.75rem'
          }}>
            Play audio examples and pronunciation guides
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
          }}>
            Audio Volume: {audioVolume}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={audioVolume}
            onChange={(e) => setAudioVolume(parseInt(e.target.value))}
            disabled={!audioEnabled}
            style={{ 
              width: '100%',
              accentColor: 'var(--primary-color)'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
              disabled={!audioEnabled}
              style={{ 
                width: '1.25rem', 
                height: '1.25rem',
                accentColor: 'var(--primary-color)'
              }}
            />
            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
              Auto-play Audio
            </span>
          </label>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)',
            marginTop: '0.25rem',
            marginLeft: '1.75rem'
          }}>
            Automatically play audio when examples are displayed
          </p>
        </div>
      </div>

      {/* Learning Preferences */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Learning Preferences</h2>
          <p className="card-subtitle">Customize your learning experience</p>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={showRomanization}
              onChange={(e) => setShowRomanization(e.target.checked)}
              style={{ 
                width: '1.25rem', 
                height: '1.25rem',
                accentColor: 'var(--primary-color)'
              }}
            />
            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
              Show Romanization
            </span>
          </label>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)',
            marginTop: '0.25rem',
            marginLeft: '1.75rem'
          }}>
            Display romanized pronunciation alongside Korean text
          </p>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
          }}>
            Daily Learning Goal: {dailyGoal} minutes
          </label>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(parseInt(e.target.value))}
            style={{ 
              width: '100%',
              accentColor: 'var(--primary-color)'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.25rem'
          }}>
            <span>5 min</span>
            <span>120 min</span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Data Management</h2>
          <p className="card-subtitle">Manage your learning data and privacy</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <button
            className="btn btn-outline"
            onClick={handleExportData}
            style={{ justifyContent: 'flex-start' }}
          >
            📥 Export Data
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleClearProgress}
            style={{ justifyContent: 'flex-start' }}
          >
            🗑️ Clear Progress
          </button>
        </div>
        
        <div style={{ 
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--border-radius)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          <strong>Privacy Note:</strong> All your data is stored locally on your device. 
          We don't collect or transmit any personal information or learning progress to external servers.
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">About</h2>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Version:</strong>
            <br />1.0.0 MVP
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Build:</strong>
            <br />Development
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Framework:</strong>
            <br />React + Vite
          </div>
        </div>
        
        <div style={{ 
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          <p>
            Korean Language Learning Web App - Designed for effective self-study
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings