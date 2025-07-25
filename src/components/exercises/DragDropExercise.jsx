import React, { useState, useEffect } from 'react'

const DragDropExercise = ({ exercise, onComplete, onProgress }) => {
  const [draggedItem, setDraggedItem] = useState(null)
  const [dropZones, setDropZones] = useState({})
  const [availableWords, setAvailableWords] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // Initialize the exercise
    initializeExercise()
  }, [exercise])

  const initializeExercise = () => {
    const initialDropZones = {}
    const initialAvailableWords = []

    exercise.questions.forEach((question, questionIndex) => {
      // Initialize drop zones for this question
      initialDropZones[questionIndex] = new Array(question.correctOrder.length).fill(null)
      
      // Add shuffled words to available words pool
      const shuffledWords = [...question.words].sort(() => Math.random() - 0.5)
      initialAvailableWords.push(...shuffledWords.map((word, wordIndex) => ({
        id: `${questionIndex}-${wordIndex}`,
        text: word,
        questionIndex,
        originalIndex: question.words.indexOf(word)
      })))
    })

    setDropZones(initialDropZones)
    setAvailableWords(initialAvailableWords)
  }

  const handleDragStart = (e, item) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, questionIndex, dropIndex) => {
    e.preventDefault()
    
    if (!draggedItem) return

    // Remove item from available words if it came from there
    const newAvailableWords = availableWords.filter(word => word.id !== draggedItem.id)
    
    // If there's already an item in the drop zone, move it back to available words
    const currentItem = dropZones[questionIndex][dropIndex]
    if (currentItem) {
      newAvailableWords.push(currentItem)
    }

    // Update drop zones
    const newDropZones = { ...dropZones }
    newDropZones[questionIndex][dropIndex] = draggedItem

    setAvailableWords(newAvailableWords)
    setDropZones(newDropZones)
    setDraggedItem(null)
  }

  const handleDropToAvailable = (e) => {
    e.preventDefault()
    
    if (!draggedItem) return

    // Find and remove the item from drop zones
    const newDropZones = { ...dropZones }
    Object.keys(newDropZones).forEach(questionIndex => {
      const index = newDropZones[questionIndex].findIndex(item => item && item.id === draggedItem.id)
      if (index !== -1) {
        newDropZones[questionIndex][index] = null
      }
    })

    // Add back to available words
    const newAvailableWords = [...availableWords, draggedItem]

    setDropZones(newDropZones)
    setAvailableWords(newAvailableWords)
    setDraggedItem(null)
  }

  const checkAnswers = () => {
    let totalQuestions = exercise.questions.length
    let correctQuestions = 0

    exercise.questions.forEach((question, questionIndex) => {
      const userOrder = dropZones[questionIndex].map(item => item ? item.text : null)
      const correctOrder = question.correctOrder
      
      if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
        correctQuestions++
      }
    })

    const finalScore = Math.round((correctQuestions / totalQuestions) * 100)
    setScore(finalScore)
    setShowResults(true)

    // Report progress
    const timeSpent = Date.now() - startTime
    if (onProgress) {
      onProgress({
        exerciseType: 'drag-drop',
        score: finalScore,
        timeSpent,
        correctAnswers: correctQuestions,
        totalQuestions
      })
    }

    // Report completion if score is good enough
    if (finalScore >= 70 && onComplete) {
      onComplete({
        exerciseType: 'drag-drop',
        score: finalScore,
        timeSpent
      })
    }
  }

  const resetExercise = () => {
    initializeExercise()
    setShowResults(false)
    setScore(0)
  }

  const isQuestionComplete = (questionIndex) => {
    return dropZones[questionIndex] && dropZones[questionIndex].every(item => item !== null)
  }

  const isAllQuestionsComplete = () => {
    return Object.keys(dropZones).every(questionIndex => isQuestionComplete(questionIndex))
  }

  const renderQuestion = (question, questionIndex) => {
    const userOrder = dropZones[questionIndex] || []
    const correctOrder = question.correctOrder
    const isCorrect = showResults && JSON.stringify(userOrder.map(item => item ? item.text : null)) === JSON.stringify(correctOrder)

    return (
      <div key={questionIndex} className="question-container" style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Question {questionIndex + 1}:</strong> {question.instruction}
        </div>

        {question.context && (
          <div style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            fontStyle: 'italic'
          }}>
            Context: {question.context}
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem',
          marginBottom: '1rem',
          minHeight: '60px',
          padding: '1rem',
          border: `2px dashed ${isCorrect ? '#28a745' : showResults ? '#dc3545' : 'var(--border-color)'}`,
          borderRadius: 'var(--border-radius)',
          backgroundColor: isCorrect ? '#d4edda' : showResults ? '#f8d7da' : 'var(--bg-secondary)'
        }}>
          {userOrder.map((item, dropIndex) => (
            <div
              key={dropIndex}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, questionIndex, dropIndex)}
              style={{
                minWidth: '80px',
                minHeight: '40px',
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--border-radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: item ? 'var(--primary-color)' : 'transparent',
                color: item ? 'white' : 'var(--text-muted)',
                fontSize: '0.9rem',
                cursor: item ? 'grab' : 'default'
              }}
              draggable={item ? true : false}
              onDragStart={item ? (e) => handleDragStart(e, item) : undefined}
            >
              {item ? item.text : `${dropIndex + 1}`}
            </div>
          ))}
        </div>

        {question.translation && (
          <div style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem'
          }}>
            Translation: {question.translation}
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
              <span style={{ color: '#155724' }}>✓ Correct sentence construction!</span>
            ) : (
              <span style={{ color: '#721c24' }}>
                ✗ Incorrect. The correct order is: <strong>{correctOrder.join(' ')}</strong>
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="exercise-container">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{exercise.title}</h3>
          <p className="card-subtitle">Drag and drop the words to construct correct Korean sentences</p>
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

          {exercise.questions.map((question, index) => renderQuestion(question, index))}

          {/* Available Words Pool */}
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Available Words:</h4>
            <div 
              style={{ 
                minHeight: '80px',
                padding: '1rem',
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--border-radius)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
              onDragOver={handleDragOver}
              onDrop={handleDropToAvailable}
            >
              {availableWords.length === 0 ? (
                <div style={{ 
                  color: 'var(--text-muted)', 
                  fontStyle: 'italic',
                  width: '100%',
                  textAlign: 'center'
                }}>
                  All words have been used
                </div>
              ) : (
                availableWords.map((word) => (
                  <div
                    key={word.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, word)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'grab',
                      fontSize: '0.9rem',
                      userSelect: 'none'
                    }}
                  >
                    {word.text}
                  </div>
                ))
              )}
            </div>
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
                disabled={!isAllQuestionsComplete()}
              >
                Check Answers
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
                    {score >= 70 ? '🎉 Excellent sentence construction!' : '📚 Keep practicing!'}
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

export default DragDropExercise