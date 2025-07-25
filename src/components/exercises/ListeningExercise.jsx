import React, { useState, useEffect, useRef } from 'react'

const ListeningExercise = ({ exercise, onComplete, onProgress }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [startTime] = useState(Date.now())
  const audioRef = useRef(null)

  useEffect(() => {
    // Initialize answers object
    const initialAnswers = {}
    exercise.questions.forEach((question, index) => {
      initialAnswers[index] = ''
    })
    setAnswers(initialAnswers)
  }, [exercise])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime)
      const updateDuration = () => setDuration(audio.duration)
      const handleEnded = () => setIsPlaying(false)

      audio.addEventListener('timeupdate', updateTime)
      audio.addEventListener('loadedmetadata', updateDuration)
      audio.addEventListener('ended', handleEnded)

      return () => {
        audio.removeEventListener('timeupdate', updateTime)
        audio.removeEventListener('loadedmetadata', updateDuration)
        audio.removeEventListener('ended', handleEnded)
      }
    }
  }, [])

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }))
  }

  const playAudio = () => {
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = playbackSpeed
      audio.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed)
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = speed
    }
  }

  const seekAudio = (time) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const checkAnswers = () => {
    let correctCount = 0
    exercise.questions.forEach((question, index) => {
      const userAnswer = answers[index].trim().toLowerCase()
      const correctAnswer = question.correctAnswer.toLowerCase()
      if (userAnswer === correctAnswer) {
        correctCount++
      }
    })
    
    const finalScore = Math.round((correctCount / exercise.questions.length) * 100)
    setScore(finalScore)
    setShowResults(true)

    // Report progress
    const timeSpent = Date.now() - startTime
    if (onProgress) {
      onProgress({
        exerciseType: 'listening',
        score: finalScore,
        timeSpent,
        correctAnswers: correctCount,
        totalQuestions: exercise.questions.length,
        speedUsed: playbackSpeed
      })
    }

    // Report completion if score is good enough
    if (finalScore >= 70 && onComplete) {
      onComplete({
        exerciseType: 'listening',
        score: finalScore,
        timeSpent,
        speedUsed: playbackSpeed
      })
    }
  }

  const resetExercise = () => {
    const initialAnswers = {}
    exercise.questions.forEach((question, index) => {
      initialAnswers[index] = ''
    })
    setAnswers(initialAnswers)
    setShowResults(false)
    setScore(0)
    setCurrentQuestionIndex(0)
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const currentQuestion = exercise.questions[currentQuestionIndex]
  const userAnswer = answers[currentQuestionIndex] || ''
  const isCorrect = showResults && userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
  const isIncorrect = showResults && userAnswer.trim().toLowerCase() !== currentQuestion.correctAnswer.toLowerCase()

  return (
    <div className="exercise-container">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{exercise.title}</h3>
          <p className="card-subtitle">Listen to Korean audio and answer comprehension questions</p>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {exercise.instructions && (
            <div style={{ 
              marginBottom: '2rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)'
            }}>
              <strong>Instructions:</strong> {exercise.instructions}
            </div>
          )}

          {/* Audio Player */}
          <div style={{ 
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ marginBottom: '1rem' }}>Audio Player</h4>
            
            <audio
              ref={audioRef}
              src={exercise.audioUrl}
              preload="metadata"
              style={{ display: 'none' }}
            />

            {/* Playback Controls */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <button
                className="btn btn-primary"
                onClick={isPlaying ? pauseAudio : playAudio}
                style={{ minWidth: '80px' }}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>

              <div style={{ flex: 1 }}>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => seekAudio(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem'
                }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Speed Controls */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                Playback Speed:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[0.5, 0.75, 1.0, 1.25, 1.5].map(speed => (
                  <button
                    key={speed}
                    className={`btn ${playbackSpeed === speed ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => changeSpeed(speed)}
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {exercise.transcript && (
              <details style={{ marginTop: '1rem' }}>
                <summary style={{ 
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: 'var(--primary-color)'
                }}>
                  Show Transcript (Korean)
                </summary>
                <div style={{ 
                  marginTop: '0.5rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--border-radius)',
                  fontFamily: 'serif',
                  fontSize: '1.1rem',
                  lineHeight: '1.6'
                }}>
                  {exercise.transcript}
                </div>
              </details>
            )}
          </div>

          {/* Question Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <button
              className="btn btn-secondary"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>
            <span style={{ fontWeight: '600' }}>
              Question {currentQuestionIndex + 1} of {exercise.questions.length}
            </span>
            <button
              className="btn btn-secondary"
              onClick={nextQuestion}
              disabled={currentQuestionIndex === exercise.questions.length - 1}
            >
              Next →
            </button>
          </div>

          {/* Current Question */}
          <div className="question-container" style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Question {currentQuestionIndex + 1}:</strong> {currentQuestion.question}
            </div>

            {currentQuestion.type === 'multiple-choice' ? (
              <div style={{ marginBottom: '1rem' }}>
                {currentQuestion.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      padding: '0.75rem',
                      border: `2px solid ${
                        showResults && option === currentQuestion.correctAnswer
                          ? '#28a745'
                          : showResults && option === userAnswer && option !== currentQuestion.correctAnswer
                          ? '#dc3545'
                          : 'var(--border-color)'
                      }`,
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: showResults && option === currentQuestion.correctAnswer
                        ? '#d4edda'
                        : showResults && option === userAnswer && option !== currentQuestion.correctAnswer
                        ? '#f8d7da'
                        : 'var(--bg-secondary)',
                      cursor: showResults ? 'default' : 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={option}
                      checked={userAnswer === option}
                      onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                      disabled={showResults}
                      style={{ marginRight: '0.5rem' }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                disabled={showResults}
                placeholder="Type your answer here..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${isCorrect ? '#28a745' : isIncorrect ? '#dc3545' : 'var(--border-color)'}`,
                  borderRadius: 'var(--border-radius)',
                  fontSize: '1rem',
                  backgroundColor: isCorrect ? '#d4edda' : isIncorrect ? '#f8d7da' : 'white',
                  marginBottom: '1rem'
                }}
              />
            )}

            {currentQuestion.hint && (
              <div style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                marginBottom: '0.5rem'
              }}>
                💡 Hint: {currentQuestion.hint}
              </div>
            )}

            {showResults && (
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.5rem',
                borderRadius: 'var(--border-radius)',
                backgroundColor: isCorrect ? '#d4edda' : '#f8d7da',
                border: `1px solid ${isCorrect ? '#28a745' : '#dc3545'}`
              }}>
                {isCorrect ? (
                  <span style={{ color: '#155724' }}>✓ Correct!</span>
                ) : (
                  <span style={{ color: '#721c24' }}>
                    ✗ Incorrect. The correct answer is: <strong>{currentQuestion.correctAnswer}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            marginTop: '2rem'
          }}>
            {!showResults ? (
              <button 
                className="btn btn-primary"
                onClick={checkAnswers}
                disabled={Object.values(answers).some(answer => !answer.trim())}
              >
                Check All Answers
              </button>
            ) : (
              <>
                <div style={{ 
                  padding: '1rem',
                  textAlign: 'center',
                  backgroundColor: score >= 70 ? '#d4edda' : '#f8d7da',
                  borderRadius: 'var(--border-radius)',
                  border: `1px solid ${score >= 70 ? '#28a745' : '#dc3545'}`,
                  marginRight: '1rem'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Score: {score}%
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>
                    {score >= 70 ? '🎉 Great listening skills!' : '👂 Keep practicing!'}
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    Speed used: {playbackSpeed}x
                  </div>
                </div>
                <button 
                  className="btn btn-secondary"
                  onClick={resetExercise}
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListeningExercise