import React from 'react'
import { Link } from 'react-router-dom'

const Progress = () => {
  // Placeholder progress data - will be replaced with localStorage data in Phase 1
  const progressData = {
    totalLessons: 5,
    completedLessons: 0,
    totalExercises: 15,
    completedExercises: 0,
    averageScore: 0,
    timeSpent: 0, // in minutes
    streak: 0,
    lastStudied: null
  }

  const completedLessons = [
    // Placeholder - will be populated from localStorage
  ]

  const recentActivity = [
    // Placeholder - will be populated from localStorage
  ]

  const getProgressPercentage = () => {
    return progressData.totalLessons > 0 
      ? Math.round((progressData.completedLessons / progressData.totalLessons) * 100)
      : 0
  }

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Learning Progress</h1>
        <p className="page-description">
          Track your Korean learning journey and see how far you've come.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Overall Progress</h2>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: 'var(--primary-color)',
              marginBottom: '0.5rem'
            }}>
              {getProgressPercentage()}%
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Course Completion
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: 'var(--success-color)',
              marginBottom: '0.5rem'
            }}>
              {progressData.completedLessons}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Lessons Completed
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: 'var(--warning-color)',
              marginBottom: '0.5rem'
            }}>
              {progressData.streak}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Day Streak
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: 'var(--secondary-color)',
              marginBottom: '0.5rem'
            }}>
              {formatTime(progressData.timeSpent)}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Time Studied
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}>
            Progress by Module
          </h3>
          <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)' 
          }}>
            {progressData.completedLessons} of {progressData.totalLessons} lessons completed
          </p>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Exercise Performance</h3>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Exercises Completed
            </span>
            <span style={{ 
              fontWeight: '600', 
              color: 'var(--text-primary)' 
            }}>
              {progressData.completedExercises}/{progressData.totalExercises}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Average Score
            </span>
            <span style={{ 
              fontWeight: '600', 
              color: progressData.averageScore >= 80 ? 'var(--success-color)' : 
                     progressData.averageScore >= 60 ? 'var(--warning-color)' : 'var(--error-color)'
            }}>
              {progressData.averageScore}%
            </span>
          </div>
          <Link to="/lessons" className="btn btn-outline" style={{ width: '100%' }}>
            Practice More
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Learning Streak</h3>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '0.5rem'
            }}>
              🔥
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              color: 'var(--warning-color)',
              marginBottom: '0.5rem'
            }}>
              {progressData.streak} Days
            </div>
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)' 
            }}>
              {progressData.streak === 0 
                ? 'Start your learning streak today!'
                : 'Keep it up! Study today to maintain your streak.'
              }
            </p>
          </div>
          <Link to="/lessons" className="btn btn-primary" style={{ width: '100%' }}>
            Study Today
          </Link>
        </div>
      </div>

      {/* Completed Lessons */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Completed Lessons</h3>
          <p className="card-subtitle">
            {completedLessons.length === 0 
              ? 'No lessons completed yet. Start your first lesson!'
              : `You've completed ${completedLessons.length} lesson${completedLessons.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        
        {completedLessons.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <p style={{ marginBottom: '1.5rem' }}>
              Complete your first lesson to see your progress here.
            </p>
            <Link to="/lessons" className="btn btn-primary">
              Start Learning
            </Link>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '1rem' 
          }}>
            {completedLessons.map((lesson) => (
              <div 
                key={lesson.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              >
                <h4 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  {lesson.title}
                </h4>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '0.875rem'
                }}>
                  <span className="badge badge-success">
                    ✓ Completed
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {lesson.completedDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
          <p className="card-subtitle">Your latest learning sessions</p>
        </div>
        
        {recentActivity.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem 1rem',
            color: 'var(--text-secondary)'
          }}>
            <p>No recent activity. Start studying to see your progress!</p>
          </div>
        ) : (
          <div>
            {recentActivity.map((activity, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 0',
                  borderBottom: index < recentActivity.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}
              >
                <div>
                  <div style={{ 
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '0.25rem'
                  }}>
                    {activity.action}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {activity.lesson}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)'
                }}>
                  {activity.date}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Progress