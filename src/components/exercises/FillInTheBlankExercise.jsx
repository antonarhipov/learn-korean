import React, { useState, useEffect } from 'react'

const FillInTheBlankExercise = ({ exercise, onComplete, onProgress }) => {
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // Initialize answers object
    const initialAnswers = {}
    exercise.questions.forEach((question, index) => {
      initialAnswers[index] = ''
    })
    setAnswers(initialAnswers)
  }, [exercise])

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }))
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
        exerciseType: 'fill-in-the-blank',
        score: finalScore,
        timeSpent,
        correctAnswers: correctCount,
        totalQuestions: exercise.questions.length
      })
    }

    // Report completion if score is good enough
    if (finalScore >= 70 && onComplete) {
      onComplete({
        exerciseType: 'fill-in-the-blank',
        score: finalScore,
        timeSpent
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
  }

  const renderQuestion = (question, index) => {
    const parts = question.sentence.split('___')
    const userAnswer = answers[index] || ''
    const isCorrect = showResults && userAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase()
    const isIncorrect = showResults && userAnswer.trim().toLowerCase() !== question.correctAnswer.toLowerCase()

    return (
      <div key={index} className="question-container" style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Question {index + 1}:</strong>
        </div>
        
        <div style={{ 
          fontSize: '1.2rem', 
          marginBottom: '1rem',
          lineHeight: '1.6'
        }}>
          {parts[0]}
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            disabled={showResults}
            style={{
              display: 'inline-block',
              minWidth: '120px',
              padding: '0.5rem',
              margin: '0 0.5rem',
              border: `2px solid ${isCorrect ? '#28a745' : isIncorrect ? '#dc3545' : 'var(--border-color)'}`,
              borderRadius: 'var(--border-radius)',
              fontSize: '1rem',
              backgroundColor: isCorrect ? '#d4edda' : isIncorrect ? '#f8d7da' : 'white'
            }}
            placeholder="답을 입력하세요"
          />
          {parts[1]}
        </div>

        {question.hint && (
          <div style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            marginBottom: '0.5rem'
          }}>
            💡 Hint: {question.hint}
          </div>
        )}

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
              <span style={{ color: '#155724' }}>✓ Correct!</span>
            ) : (
              <span style={{ color: '#721c24' }}>
                ✗ Incorrect. The correct answer is: <strong>{question.correctAnswer}</strong>
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
          <p className="card-subtitle">Fill in the blanks with the correct Korean words or phrases</p>
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
                    {score >= 70 ? '🎉 Great job!' : '📚 Keep practicing!'}
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

export default FillInTheBlankExercise