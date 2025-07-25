import React, { useState, useEffect, useRef } from 'react'

const TypingExercise = ({ exercise, onComplete, onProgress }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [errors, setErrors] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [exerciseStartTime] = useState(Date.now())
  const inputRef = useRef(null)

  const currentText = exercise.texts[currentTextIndex]

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentTextIndex])

  useEffect(() => {
    if (userInput.length === 1 && !startTime) {
      setStartTime(Date.now())
    }
  }, [userInput, startTime])

  useEffect(() => {
    if (userInput === currentText.korean && !isCompleted) {
      setEndTime(Date.now())
      setIsCompleted(true)
      calculateResults()
    }
  }, [userInput, currentText.korean, isCompleted])

  const calculateResults = () => {
    if (!startTime) return

    const timeElapsed = (Date.now() - startTime) / 1000 / 60 // in minutes
    const charactersTyped = currentText.korean.length
    const wordsTyped = charactersTyped / 5 // Standard: 5 characters = 1 word
    const calculatedWpm = Math.round(wordsTyped / timeElapsed)
    
    // Calculate accuracy
    const totalErrors = errors.length
    const totalCharacters = currentText.korean.length
    const calculatedAccuracy = Math.round(((totalCharacters - totalErrors) / totalCharacters) * 100)

    setWpm(calculatedWpm)
    setAccuracy(calculatedAccuracy)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    const targetText = currentText.korean

    // Prevent typing beyond the target text length
    if (value.length > targetText.length) {
      return
    }

    setUserInput(value)

    // Track errors
    const newErrors = []
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== targetText[i]) {
        newErrors.push(i)
      }
    }
    setErrors(newErrors)
  }

  const handleKeyDown = (e) => {
    // Prevent backspace if it would delete correct characters
    if (e.key === 'Backspace') {
      const cursorPosition = e.target.selectionStart
      if (cursorPosition > 0) {
        const charToDelete = userInput[cursorPosition - 1]
        const targetChar = currentText.korean[cursorPosition - 1]
        if (charToDelete === targetChar) {
          // Allow backspace for correct characters
          return
        }
      }
    }
  }

  const nextText = () => {
    if (currentTextIndex < exercise.texts.length - 1) {
      setCurrentTextIndex(currentTextIndex + 1)
      resetCurrentText()
    } else {
      // All texts completed
      setShowResults(true)
      reportCompletion()
    }
  }

  const resetCurrentText = () => {
    setUserInput('')
    setStartTime(null)
    setEndTime(null)
    setIsCompleted(false)
    setErrors([])
    setWpm(0)
    setAccuracy(100)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const resetExercise = () => {
    setCurrentTextIndex(0)
    resetCurrentText()
    setShowResults(false)
  }

  const reportCompletion = () => {
    const totalTime = Date.now() - exerciseStartTime
    const averageAccuracy = accuracy // For simplicity, using last text's accuracy
    const score = Math.round((averageAccuracy + Math.min(wpm * 2, 100)) / 2) // Combine accuracy and speed

    if (onProgress) {
      onProgress({
        exerciseType: 'typing',
        score,
        timeSpent: totalTime,
        wpm,
        accuracy: averageAccuracy,
        textsCompleted: exercise.texts.length
      })
    }

    if (score >= 70 && onComplete) {
      onComplete({
        exerciseType: 'typing',
        score,
        timeSpent: totalTime,
        wpm,
        accuracy: averageAccuracy
      })
    }
  }

  const getCharacterStyle = (index) => {
    const char = currentText.korean[index]
    const userChar = userInput[index]
    
    if (index >= userInput.length) {
      // Not yet typed
      return {
        backgroundColor: 'transparent',
        color: 'var(--text-primary)'
      }
    } else if (userChar === char) {
      // Correct
      return {
        backgroundColor: '#d4edda',
        color: '#155724'
      }
    } else {
      // Incorrect
      return {
        backgroundColor: '#f8d7da',
        color: '#721c24'
      }
    }
  }

  const renderText = () => {
    return currentText.korean.split('').map((char, index) => (
      <span
        key={index}
        style={{
          ...getCharacterStyle(index),
          padding: '2px 1px',
          borderRadius: '2px',
          fontSize: '1.5rem',
          fontFamily: 'serif'
        }}
      >
        {char}
      </span>
    ))
  }

  return (
    <div className="exercise-container">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{exercise.title}</h3>
          <p className="card-subtitle">Practice typing Korean characters and improve your speed and accuracy</p>
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

          {!showResults ? (
            <>
              {/* Progress Indicator */}
              <div style={{ 
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Text {currentTextIndex + 1} of {exercise.texts.length}
                </div>
                <div style={{ 
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--border-color)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${((currentTextIndex + (isCompleted ? 1 : userInput.length / currentText.korean.length)) / exercise.texts.length) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary-color)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Current Text Display */}
              <div style={{ 
                marginBottom: '2rem',
                padding: '2rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius)',
                border: '2px solid var(--border-color)',
                textAlign: 'center',
                lineHeight: '2'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Type this text:</strong>
                </div>
                <div style={{ 
                  fontSize: '1.5rem',
                  fontFamily: 'serif',
                  marginBottom: '1rem'
                }}>
                  {renderText()}
                </div>
                {currentText.romanization && (
                  <div style={{ 
                    fontSize: '1rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem'
                  }}>
                    Romanization: {currentText.romanization}
                  </div>
                )}
                {currentText.translation && (
                  <div style={{ 
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)'
                  }}>
                    Translation: {currentText.translation}
                  </div>
                )}
              </div>

              {/* Input Field */}
              <div style={{ marginBottom: '2rem' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Start typing here..."
                  disabled={isCompleted}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.2rem',
                    fontFamily: 'serif',
                    border: `2px solid ${isCompleted ? '#28a745' : errors.length > 0 ? '#dc3545' : 'var(--border-color)'}`,
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: isCompleted ? '#d4edda' : 'white',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Real-time Stats */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--border-radius)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {userInput.length}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Characters
                  </div>
                </div>
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--border-radius)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: errors.length > 0 ? '#dc3545' : '#28a745' }}>
                    {errors.length}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Errors
                  </div>
                </div>
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--border-radius)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {Math.round(((userInput.length - errors.length) / Math.max(userInput.length, 1)) * 100)}%
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Accuracy
                  </div>
                </div>
                {startTime && (
                  <div style={{ 
                    padding: '1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--border-radius)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      {Math.round((Date.now() - startTime) / 1000)}s
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Time
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center'
              }}>
                {isCompleted ? (
                  <>
                    <div style={{ 
                      padding: '1rem',
                      textAlign: 'center',
                      backgroundColor: '#d4edda',
                      borderRadius: 'var(--border-radius)',
                      border: '1px solid #28a745',
                      marginRight: '1rem'
                    }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#155724' }}>
                        ✓ Text Completed!
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#155724' }}>
                        WPM: {wpm} | Accuracy: {accuracy}%
                      </div>
                    </div>
                    {currentTextIndex < exercise.texts.length - 1 ? (
                      <button 
                        className="btn btn-primary"
                        onClick={nextText}
                      >
                        Next Text →
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        onClick={nextText}
                      >
                        Complete Exercise
                      </button>
                    )}
                  </>
                ) : (
                  <button 
                    className="btn btn-secondary"
                    onClick={resetCurrentText}
                  >
                    Reset Current Text
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Results Screen */
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                padding: '2rem',
                backgroundColor: accuracy >= 80 ? '#d4edda' : '#f8d7da',
                borderRadius: 'var(--border-radius)',
                border: `1px solid ${accuracy >= 80 ? '#28a745' : '#dc3545'}`,
                marginBottom: '2rem'
              }}>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '1rem',
                  color: accuracy >= 80 ? '#155724' : '#721c24'
                }}>
                  {accuracy >= 80 ? '🎉 Excellent Typing!' : '📚 Keep Practicing!'}
                </h3>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{wpm}</div>
                    <div style={{ fontSize: '0.9rem' }}>WPM</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{accuracy}%</div>
                    <div style={{ fontSize: '0.9rem' }}>Accuracy</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{exercise.texts.length}</div>
                    <div style={{ fontSize: '0.9rem' }}>Texts Completed</div>
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-secondary"
                onClick={resetExercise}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TypingExercise