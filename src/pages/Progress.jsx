import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import progressAnalytics from '../utils/progressAnalytics'

const Progress = () => {
  const [progressData, setProgressData] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [progressReport, setProgressReport] = useState(null)

  useEffect(() => {
    // Initialize progress analytics
    progressAnalytics.initialize()
    
    // Load progress data
    const data = progressAnalytics.getProgressData()
    setProgressData(data)
    
    // Load progress report
    const report = progressAnalytics.getProgressReport(selectedPeriod)
    setProgressReport(report)
  }, [selectedPeriod])

  if (!progressData) {
    return (
      <div className="page-container">
        <div className="loading-spinner"></div>
        <p>Loading progress data...</p>
      </div>
    )
  }

  const getProgressPercentage = () => {
    // For now, we'll calculate based on completed lessons vs a target
    // This could be enhanced to use actual course structure data
    const targetLessons = 20 // This could come from course data
    return progressData.totalLessons > 0 
      ? Math.round((progressData.totalLessons / targetLessons) * 100)
      : 0
  }

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatAccuracy = (accuracy) => {
    return accuracy ? `${Math.round(accuracy)}%` : '0%'
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
              {progressData.totalLessons}
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
              {progressData.currentStreak}
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
              {formatTime(progressData.totalTimeSpent)}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Time Studied
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: 'var(--primary-color)',
              marginBottom: '0.5rem'
            }}>
              {formatAccuracy(progressData.averageAccuracy)}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Average Accuracy
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: 'var(--success-color)',
              marginBottom: '0.5rem'
            }}>
              {progressData.totalExercises}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Exercises Completed
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
            {progressData.totalLessons} lessons completed
          </p>
        </div>
      </div>

      {/* Achievement Badges */}
      {progressData.achievements && progressData.achievements.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Achievements</h2>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {progressData.achievements.slice(0, 6).map((achievement, index) => (
              <div key={achievement.id} style={{
                padding: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                backgroundColor: 'var(--bg-secondary)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '2rem', 
                  marginBottom: '0.5rem' 
                }}>
                  {achievement.badge === 'beginner' && '🌱'}
                  {achievement.badge === 'learner' && '📚'}
                  {achievement.badge === 'dedicated' && '🎯'}
                  {achievement.badge === 'consistent' && '⭐'}
                  {achievement.badge === 'warrior' && '⚔️'}
                  {achievement.badge === 'master' && '👑'}
                </div>
                <h4 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  color: 'var(--text-primary)'
                }}>
                  {achievement.name}
                </h4>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem'
                }}>
                  {achievement.description}
                </p>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)' 
                }}>
                  Earned {new Date(achievement.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
          {progressData.achievements.length > 6 && (
            <p style={{ 
              textAlign: 'center', 
              color: 'var(--text-secondary)',
              fontSize: '0.875rem'
            }}>
              And {progressData.achievements.length - 6} more achievements...
            </p>
          )}
        </div>
      )}

      {/* Weekly Progress Chart */}
      {progressData.learningMetrics && progressData.learningMetrics.weeklyProgress && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Weekly Progress</h2>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'end',
            height: '200px',
            padding: '1rem 0',
            borderBottom: '1px solid var(--border-color)'
          }}>
            {progressData.learningMetrics.weeklyProgress.map((day, index) => {
              const maxTime = Math.max(...progressData.learningMetrics.weeklyProgress.map(d => d.timeSpent))
              const height = maxTime > 0 ? (day.timeSpent / maxTime) * 150 : 0
              
              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  flex: 1
                }}>
                  <div style={{
                    width: '30px',
                    height: `${height}px`,
                    backgroundColor: day.timeSpent > 0 ? 'var(--primary-color)' : 'var(--border-color)',
                    borderRadius: '4px 4px 0 0',
                    marginBottom: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}></div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-secondary)',
                    textAlign: 'center'
                  }}>
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div style={{ 
                    fontSize: '0.625rem', 
                    color: 'var(--text-muted)',
                    textAlign: 'center'
                  }}>
                    {formatTime(day.timeSpent)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
              {progressData.totalExercises}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Average Accuracy
            </span>
            <span style={{ 
              fontWeight: '600', 
              color: progressData.averageAccuracy >= 80 ? 'var(--success-color)' : 
                     progressData.averageAccuracy >= 60 ? 'var(--warning-color)' : 'var(--error-color)'
            }}>
              {formatAccuracy(progressData.averageAccuracy)}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Average Time per Lesson
            </span>
            <span style={{ 
              fontWeight: '600', 
              color: 'var(--text-primary)' 
            }}>
              {progressData.learningMetrics?.averageTimePerLesson || 0} min
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
              {progressData.currentStreak} Days
            </div>
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem'
            }}>
              {progressData.currentStreak === 0 
                ? 'Start your learning streak today!'
                : 'Keep it up! Study today to maintain your streak.'
              }
            </p>
            {progressData.longestStreak > 0 && (
              <p style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)' 
              }}>
                Longest streak: {progressData.longestStreak} days
              </p>
            )}
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
            {progressData.totalLessons === 0 
              ? 'No lessons completed yet. Start your first lesson!'
              : `You've completed ${progressData.totalLessons} lesson${progressData.totalLessons !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        
        {progressData.totalLessons === 0 ? (
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
            {progressData.recentActivity
              ?.filter(activity => activity.type === 'lesson_completed')
              .slice(0, 6)
              .map((activity, index) => (
              <div 
                key={index}
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
                  Lesson {activity.lessonId}
                </h4>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem'
                }}>
                  Accuracy: {formatAccuracy(activity.accuracy)}
                </div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem'
                }}>
                  Time: {formatTime(activity.timeSpent)}
                </div>
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
                    {new Date(activity.timestamp).toLocaleDateString()}
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
        
        {!progressData.recentActivity || progressData.recentActivity.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem 1rem',
            color: 'var(--text-secondary)'
          }}>
            <p>No recent activity. Start studying to see your progress!</p>
          </div>
        ) : (
          <div>
            {progressData.recentActivity.slice(0, 10).map((activity, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 0',
                  borderBottom: index < Math.min(progressData.recentActivity.length, 10) - 1 ? '1px solid var(--border-color)' : 'none'
                }}
              >
                <div>
                  <div style={{ 
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '0.25rem'
                  }}>
                    {activity.type === 'lesson_completed' ? '✅ Completed Lesson' : '📝 Activity'}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Lesson ID: {activity.lessonId}
                    {activity.accuracy > 0 && (
                      <span style={{ marginLeft: '0.5rem', color: 'var(--success-color)' }}>
                        • {formatAccuracy(activity.accuracy)} accuracy
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    Time spent: {formatTime(activity.timeSpent)}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)'
                }}>
                  {new Date(activity.timestamp).toLocaleDateString()}
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