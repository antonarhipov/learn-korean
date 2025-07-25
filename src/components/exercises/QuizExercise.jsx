import React, { useState, useEffect } from 'react'

const QuizExercise = ({ exercise, onComplete, onProgress }) => {
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

  const handleQuizAnswer = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const checkQuizAnswers = () => {
    const results = exercise.questions.map((question, questionIndex) => {
      const userAnswer = answers[questionIndex]
      return {
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: userAnswer === question.correctAnswer
      }
    })

    const correctCount = results.filter(r => r.isCorrect).length
    const total = results.length
    const finalScore = Math.round((correctCount / total) * 100)
    
    setScore(finalScore)
    setShowResults(true)

    // Report progress
    const timeSpent = Date.now() - startTime
    if (onProgress) {
      onProgress({
        exerciseType: 'quiz',
        score: finalScore,
        timeSpent,
        correctAnswers: correctCount,
        totalQuestions: total
      })
    }

    // Report completion if score is good enough
    if (finalScore >= 70 && onComplete) {
      onComplete({
        exerciseType: 'quiz',
        score: finalScore,
        timeSpent
      })
    }

    return { results, score: finalScore, total }
  }

  const resetQuiz = () => {
    const initialAnswers = {}
    exercise.questions.forEach((question, index) => {
      initialAnswers[index] = ''
    })
    setAnswers(initialAnswers)
    setShowResults(false)
    setScore(0)
  }

  const isAllAnswered = () => {
    return exercise.questions.every((_, index) => answers[index])
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3>{exercise.title}</h3>
        {exercise.instructions && (
          <p style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '1.5rem',
            fontSize: '0.95rem'
          }}>
            {exercise.instructions}
          </p>
        )}
      </div>

      {!showResults ? (
        <div className="quiz-questions">
          {exercise.questions.map((question, questionIndex) => (
            <div 
              key={questionIndex} 
              style={{ 
                marginBottom: '2rem',
                padding: '1.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              <h5 style={{ marginBottom: '1rem' }}>
                Question {questionIndex + 1}: {question.question}
              </h5>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {question.options.map((option, optionIndex) => (
                  <label 
                    key={optionIndex} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: answers[questionIndex] === option ? 'var(--primary-light)' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={option}
                      onChange={(e) => handleQuizAnswer(questionIndex, e.target.value)}
                      checked={answers[questionIndex] === option}
                      style={{ marginRight: '0.75rem' }}
                      aria-label={`Option ${optionIndex + 1} for question ${questionIndex + 1}`}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={checkQuizAnswers}
              disabled={!isAllAnswered()}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                backgroundColor: isAllAnswered() ? 'var(--primary)' : 'var(--text-disabled)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                cursor: isAllAnswered() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
              aria-label="Check your answers"
            >
              Check Answers
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-results">
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: score >= 70 ? 'var(--success-light)' : 'var(--warning-light)',
            borderRadius: 'var(--border-radius)',
            border: `2px solid ${score >= 70 ? 'var(--success)' : 'var(--warning)'}`
          }}>
            <h4 style={{ 
              color: score >= 70 ? 'var(--success-dark)' : 'var(--warning-dark)',
              marginBottom: '0.5rem'
            }}>
              Quiz Results: {score}%
            </h4>
            <p style={{ 
              color: score >= 70 ? 'var(--success-dark)' : 'var(--warning-dark)',
              margin: 0
            }}>
              {exercise.questions.filter((_, i) => answers[i] === exercise.questions[i].correctAnswer).length} out of {exercise.questions.length} correct
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            {exercise.questions.map((question, index) => {
              const userAnswer = answers[index]
              const isCorrect = userAnswer === question.correctAnswer
              
              return (
                <div 
                  key={index} 
                  style={{ 
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    border: `2px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`,
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: isCorrect ? 'var(--success-light)' : 'var(--error-light)'
                  }}
                >
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    <strong>Q{index + 1}:</strong> {question.question}
                  </p>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Your answer:</strong> 
                    <span style={{ 
                      color: isCorrect ? 'var(--success-dark)' : 'var(--error-dark)',
                      marginLeft: '0.5rem'
                    }}>
                      {userAnswer || 'No answer'}
                    </span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Correct answer:</strong> 
                    <span style={{ 
                      color: 'var(--success-dark)',
                      marginLeft: '0.5rem'
                    }}>
                      {question.correctAnswer}
                    </span>
                  </p>
                </div>
              )
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={resetQuiz}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                backgroundColor: 'var(--secondary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              aria-label="Try the quiz again"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizExercise