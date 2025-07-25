import React, { useState, useEffect } from 'react'

const QuizExercise = ({ exercise, onComplete, onProgress }) => {
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime] = useState(Date.now())
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLimit, setTimeLimit] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [randomizeQuestions, setRandomizeQuestions] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState([])
  const [showExplanations, setShowExplanations] = useState(false)
  const [difficultyAdjustment, setDifficultyAdjustment] = useState(null)

  // Shuffle array utility function
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  useEffect(() => {
    // Initialize questions (shuffled or original order)
    const questionsToUse = randomizeQuestions 
      ? shuffleArray(exercise.questions.map((q, i) => ({ ...q, originalIndex: i })))
      : exercise.questions.map((q, i) => ({ ...q, originalIndex: i }))
    
    setShuffledQuestions(questionsToUse)
    
    // Initialize answers object
    const initialAnswers = {}
    questionsToUse.forEach((question, index) => {
      initialAnswers[index] = ''
    })
    setAnswers(initialAnswers)
  }, [exercise, randomizeQuestions])

  // Timer effect
  useEffect(() => {
    if (timeLimit && timeRemaining > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !showResults) {
      // Time's up - auto-submit
      checkQuizAnswers()
    }
  }, [timeRemaining, showResults, timeLimit])

  const handleQuizAnswer = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const checkQuizAnswers = () => {
    setIsLoading(true)
    
    // Add loading delay for better UX
    setTimeout(() => {
      const questionsToCheck = shuffledQuestions.length > 0 ? shuffledQuestions : exercise.questions
      const results = questionsToCheck.map((question, questionIndex) => {
        const userAnswer = answers[questionIndex]
        return {
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: userAnswer === question.correctAnswer,
          explanation: question.explanation || null
        }
      })

      const correctCount = results.filter(r => r.isCorrect).length
      const total = results.length
      const finalScore = Math.round((correctCount / total) * 100)
      
      setScore(finalScore)
      setShowResults(true)
      setIsLoading(false)

      // Report progress with analytics
      const timeSpent = Date.now() - startTime
      const analytics = {
        exerciseType: 'quiz',
        score: finalScore,
        timeSpent,
        correctAnswers: correctCount,
        totalQuestions: total,
        averageTimePerQuestion: Math.round(timeSpent / total),
        questionsRandomized: randomizeQuestions,
        timeLimitUsed: timeLimit !== null,
        completedWithTimeRemaining: timeRemaining > 0
      }

      if (onProgress) {
        onProgress(analytics)
      }

      // Difficulty adjustment analysis
      const avgTimePerQuestion = timeSpent / total
      const difficultyRecommendation = analyzeDifficulty(finalScore, avgTimePerQuestion, total)
      setDifficultyAdjustment(difficultyRecommendation)

      // Report completion if score is good enough
      if (finalScore >= 70 && onComplete) {
        onComplete({
          exerciseType: 'quiz',
          score: finalScore,
          timeSpent,
          analytics,
          difficultyRecommendation
        })
      }
    }, 800) // Loading animation duration
  }

  const resetQuiz = () => {
    // Re-shuffle questions if randomization is enabled
    const questionsToUse = randomizeQuestions 
      ? shuffleArray(exercise.questions.map((q, i) => ({ ...q, originalIndex: i })))
      : exercise.questions.map((q, i) => ({ ...q, originalIndex: i }))
    
    setShuffledQuestions(questionsToUse)
    
    const initialAnswers = {}
    questionsToUse.forEach((question, index) => {
      initialAnswers[index] = ''
    })
    setAnswers(initialAnswers)
    setShowResults(false)
    setScore(0)
    setIsLoading(false)
    setCurrentQuestionIndex(0)
    
    // Reset timer if enabled
    if (timeLimit) {
      setTimeRemaining(timeLimit * 60) // Convert minutes to seconds
    }
  }

  const isAllAnswered = () => {
    const questionsToCheck = shuffledQuestions.length > 0 ? shuffledQuestions : exercise.questions
    return questionsToCheck.every((_, index) => answers[index])
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startQuizWithSettings = () => {
    if (timeLimit) {
      setTimeRemaining(timeLimit * 60)
    }
    setCurrentQuestionIndex(0)
  }

  // Difficulty adjustment analysis function
  const analyzeDifficulty = (score, avgTimePerQuestion, totalQuestions) => {
    const recommendations = []
    let difficultyLevel = 'maintain'
    let confidence = 0

    // Score-based analysis
    if (score >= 95) {
      recommendations.push('Excellent performance! Consider trying more challenging questions.')
      difficultyLevel = 'increase'
      confidence += 30
    } else if (score >= 85) {
      recommendations.push('Great job! You might be ready for slightly harder questions.')
      difficultyLevel = 'slight_increase'
      confidence += 20
    } else if (score >= 70) {
      recommendations.push('Good work! Continue practicing at this level.')
      difficultyLevel = 'maintain'
      confidence += 10
    } else if (score >= 50) {
      recommendations.push('Keep practicing! Consider reviewing the material or trying easier questions.')
      difficultyLevel = 'slight_decrease'
      confidence += 20
    } else {
      recommendations.push('Focus on fundamentals. Try easier questions to build confidence.')
      difficultyLevel = 'decrease'
      confidence += 30
    }

    // Time-based analysis (assuming 30-60 seconds per question is optimal)
    const avgTimeSeconds = avgTimePerQuestion / 1000
    if (avgTimeSeconds < 15) {
      recommendations.push('You answered very quickly. Consider more challenging questions.')
      if (difficultyLevel === 'maintain') difficultyLevel = 'slight_increase'
      confidence += 15
    } else if (avgTimeSeconds > 120) {
      recommendations.push('Take your time, but consider reviewing the material.')
      if (difficultyLevel === 'maintain') difficultyLevel = 'slight_decrease'
      confidence += 15
    }

    // Question count analysis
    if (totalQuestions < 5) {
      recommendations.push('Try longer quizzes to better assess your knowledge.')
      confidence -= 10
    }

    return {
      level: difficultyLevel,
      confidence: Math.max(0, Math.min(100, confidence)),
      recommendations,
      nextSteps: getNextSteps(difficultyLevel, score)
    }
  }

  const getNextSteps = (difficultyLevel, score) => {
    switch (difficultyLevel) {
      case 'increase':
        return [
          'Try advanced level quizzes',
          'Explore specialized topics',
          'Consider timed challenges'
        ]
      case 'slight_increase':
        return [
          'Mix in some harder questions',
          'Try intermediate level content',
          'Practice with time limits'
        ]
      case 'maintain':
        return [
          'Continue current difficulty level',
          'Focus on consistency',
          'Review incorrect answers'
        ]
      case 'slight_decrease':
        return [
          'Review fundamental concepts',
          'Practice with easier questions',
          'Take more time per question'
        ]
      case 'decrease':
        return [
          'Start with basic level quizzes',
          'Review study materials',
          'Practice without time pressure'
        ]
      default:
        return ['Continue practicing regularly']
    }
  }

  const questionsToRender = shuffledQuestions.length > 0 ? shuffledQuestions : exercise.questions

  return (
    <div style={{ padding: '1rem 2rem 2rem', maxWidth: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{exercise.title}</h3>
        {exercise.instructions && (
          <p style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '1.5rem',
            fontSize: '0.95rem'
          }}>
            {exercise.instructions}
          </p>
        )}

        {/* Quiz Settings */}
        {!showResults && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={randomizeQuestions}
                onChange={(e) => setRandomizeQuestions(e.target.checked)}
                disabled={Object.values(answers).some(answer => answer)}
              />
              Randomize Questions
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              Time Limit:
              <select
                value={timeLimit || ''}
                onChange={(e) => {
                  const limit = e.target.value ? parseInt(e.target.value) : null
                  setTimeLimit(limit)
                  if (limit) setTimeRemaining(limit * 60)
                }}
                disabled={Object.values(answers).some(answer => answer)}
                style={{
                  padding: '0.25rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <option value="">No Limit</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={showExplanations}
                onChange={(e) => setShowExplanations(e.target.checked)}
              />
              Show Explanations
            </label>
          </div>
        )}

        {/* Progress and Timer Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: 'var(--primary-light)',
          borderRadius: 'var(--border-radius)',
          border: '2px solid var(--primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>
              Progress: {Object.values(answers).filter(a => a).length}/{questionsToRender.length}
            </span>
            <div style={{
              width: '200px',
              height: '8px',
              backgroundColor: 'white',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(Object.values(answers).filter(a => a).length / questionsToRender.length) * 100}%`,
                height: '100%',
                backgroundColor: 'var(--primary)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
          
          {timeRemaining !== null && (
            <div style={{ 
              fontWeight: 'bold', 
              color: timeRemaining < 60 ? 'var(--error)' : 'var(--primary-dark)',
              fontSize: '1.1rem'
            }}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
          )}
        </div>
      </div>

      {!showResults ? (
        <div className="quiz-questions">
          {questionsToRender.map((question, questionIndex) => (
            <div 
              key={questionIndex} 
              style={{ 
                marginBottom: '2rem',
                padding: '1.5rem',
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                transform: answers[questionIndex] ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              <h5 style={{ 
                marginBottom: '1rem',
                color: 'var(--text-primary)',
                fontSize: '1.1rem'
              }}>
                Question {questionIndex + 1}: {question.question}
              </h5>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {question.options.map((option, optionIndex) => {
                  const isSelected = answers[questionIndex] === option
                  return (
                    <label 
                      key={optionIndex} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        padding: '1rem',
                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--border-radius)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'white',
                        transition: 'all 0.3s ease',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.target.style.backgroundColor = 'var(--bg-hover)'
                          e.target.style.borderColor = 'var(--primary-light)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.target.style.backgroundColor = 'white'
                          e.target.style.borderColor = 'var(--border-color)'
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={option}
                        onChange={(e) => handleQuizAnswer(questionIndex, e.target.value)}
                        checked={isSelected}
                        style={{ 
                          marginRight: '1rem',
                          transform: 'scale(1.2)',
                          accentColor: 'var(--primary)'
                        }}
                        aria-label={`Option ${optionIndex + 1} for question ${questionIndex + 1}`}
                      />
                      <span style={{ 
                        fontSize: '1rem',
                        fontWeight: isSelected ? '600' : '400',
                        color: isSelected ? 'var(--primary-dark)' : 'var(--text-primary)'
                      }}>
                        {option}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={checkQuizAnswers}
              disabled={!isAllAnswered() || isLoading}
              style={{
                padding: '1.2rem 2.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                backgroundColor: isAllAnswered() && !isLoading ? 'var(--primary)' : 'var(--text-disabled)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                cursor: isAllAnswered() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                transform: isAllAnswered() && !isLoading ? 'scale(1)' : 'scale(0.95)',
                boxShadow: isAllAnswered() && !isLoading ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                position: 'relative',
                minWidth: '200px'
              }}
              aria-label="Check your answers"
              onMouseEnter={(e) => {
                if (isAllAnswered() && !isLoading) {
                  e.target.style.transform = 'scale(1.05)'
                  e.target.style.backgroundColor = 'var(--primary-dark)'
                }
              }}
              onMouseLeave={(e) => {
                if (isAllAnswered() && !isLoading) {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.backgroundColor = 'var(--primary)'
                }
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Checking Answers...
                </span>
              ) : (
                '🎯 Check Answers'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-results">
          {/* Enhanced Results Header with Analytics */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            padding: '2rem',
            background: score >= 70 
              ? 'linear-gradient(135deg, var(--success-light) 0%, var(--success) 100%)' 
              : 'linear-gradient(135deg, var(--warning-light) 0%, var(--warning) 100%)',
            borderRadius: 'var(--border-radius)',
            border: `3px solid ${score >= 70 ? 'var(--success)' : 'var(--warning)'}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            color: 'white'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {score >= 90 ? '🏆' : score >= 70 ? '🎉' : '📚'}
            </div>
            <h4 style={{ 
              fontSize: '2rem',
              marginBottom: '1rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {score >= 90 ? 'Excellent!' : score >= 70 ? 'Well Done!' : 'Keep Practicing!'}
            </h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Score: {score}%
            </div>
            <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
              {questionsToRender.filter((_, i) => answers[i] === questionsToRender[i].correctAnswer).length} out of {questionsToRender.length} correct
            </p>
            
            {/* Analytics Summary */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginTop: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {Math.round((Date.now() - startTime) / 1000)}s
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Time</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {Math.round((Date.now() - startTime) / questionsToRender.length / 1000)}s
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Avg per Question</div>
              </div>
              {timeRemaining !== null && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {formatTime(timeRemaining)}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Time Remaining</div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Question Results */}
          <div style={{ marginBottom: '2rem' }}>
            {questionsToRender.map((question, index) => {
              const userAnswer = answers[index]
              const isCorrect = userAnswer === question.correctAnswer
              
              return (
                <div 
                  key={index} 
                  style={{ 
                    marginBottom: '1.5rem',
                    padding: '2rem',
                    border: `3px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`,
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: isCorrect ? 'var(--success-light)' : 'var(--error-light)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      marginRight: '1rem',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: isCorrect ? 'var(--success)' : 'var(--error)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {isCorrect ? '✓' : '✗'}
                    </div>
                    <h5 style={{ 
                      margin: 0,
                      fontSize: '1.2rem',
                      color: 'var(--text-primary)'
                    }}>
                      Question {index + 1}: {question.question}
                    </h5>
                  </div>
                  
                  <div style={{ marginLeft: '3rem' }}>
                    <p style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>
                      <strong>Your answer:</strong> 
                      <span style={{ 
                        color: isCorrect ? 'var(--success-dark)' : 'var(--error-dark)',
                        marginLeft: '0.5rem',
                        fontWeight: '600'
                      }}>
                        {userAnswer || 'No answer'}
                      </span>
                    </p>
                    <p style={{ marginBottom: showExplanations && question.explanation ? '1rem' : 0, fontSize: '1rem' }}>
                      <strong>Correct answer:</strong> 
                      <span style={{ 
                        color: 'var(--success-dark)',
                        marginLeft: '0.5rem',
                        fontWeight: '600'
                      }}>
                        {question.correctAnswer}
                      </span>
                    </p>
                    
                    {/* Explanations */}
                    {showExplanations && question.explanation && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}>
                        <strong style={{ color: 'var(--primary-dark)' }}>💡 Explanation:</strong>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Difficulty Adjustment Recommendations */}
          {difficultyAdjustment && (
            <div style={{
              marginBottom: '2rem',
              padding: '2rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius)',
              border: '2px solid var(--primary)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ 
                color: 'var(--primary-dark)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🎯 Personalized Learning Recommendations
                <span style={{
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontWeight: 'normal'
                }}>
                  {difficultyAdjustment.confidence}% confidence
                </span>
              </h4>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  📊 Performance Analysis:
                </h5>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0,
                  margin: 0
                }}>
                  {difficultyAdjustment.recommendations.map((rec, index) => (
                    <li key={index} style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      backgroundColor: 'white',
                      borderRadius: 'var(--border-radius)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem'
                    }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  🚀 Next Steps:
                </h5>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {difficultyAdjustment.nextSteps.map((step, index) => (
                    <div key={index} style={{
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: 'var(--border-radius)',
                      border: '2px solid var(--primary-light)',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                      e.target.style.borderColor = 'var(--primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                      e.target.style.borderColor = 'var(--primary-light)'
                    }}>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        marginBottom: '0.5rem',
                        color: 'var(--primary)'
                      }}>
                        {index === 0 ? '🎯' : index === 1 ? '📚' : '⚡'}
                      </div>
                      <div style={{ 
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--border-radius)',
                textAlign: 'center'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem',
                  color: 'var(--primary-dark)',
                  fontStyle: 'italic'
                }}>
                  💡 These recommendations are based on your performance patterns and learning analytics.
                </p>
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div style={{ 
            textAlign: 'center',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={resetQuiz}
              style={{
                padding: '1.2rem 2.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                backgroundColor: 'var(--secondary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                minWidth: '180px'
              }}
              aria-label="Try the quiz again"
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
                e.target.style.backgroundColor = 'var(--secondary-dark)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.backgroundColor = 'var(--secondary)'
              }}
            >
              🔄 Try Again
            </button>
            
            {score >= 70 && (
              <button 
                onClick={() => window.print()}
                style={{
                  padding: '1.2rem 2.5rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  minWidth: '180px'
                }}
                aria-label="Print results"
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)'
                  e.target.style.backgroundColor = 'var(--primary-dark)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.backgroundColor = 'var(--primary)'
                }}
              >
                🖨️ Print Results
              </button>
            )}
          </div>
        </div>
      )}

      {/* CSS Keyframes for animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .quiz-questions {
            padding: 0 0.5rem;
          }
          
          .quiz-questions > div {
            padding: 1rem !important;
            margin-bottom: 1.5rem !important;
          }
          
          .quiz-questions label {
            padding: 0.75rem !important;
            font-size: 0.9rem;
          }
          
          .quiz-results > div:first-child {
            padding: 1.5rem 1rem !important;
          }
          
          .quiz-results > div:first-child h4 {
            font-size: 1.5rem !important;
          }
          
          .quiz-results > div:first-child > div:last-child {
            gap: 1rem !important;
          }
          
          .quiz-results > div:first-child > div:last-child > div {
            min-width: 80px;
          }
          
          .quiz-results button {
            padding: 1rem 1.5rem !important;
            font-size: 1rem !important;
            min-width: 140px !important;
          }
        }
        
        @media (max-width: 480px) {
          .quiz-questions > div {
            padding: 0.75rem !important;
          }
          
          .quiz-questions h5 {
            font-size: 1rem !important;
          }
          
          .quiz-results > div:first-child {
            padding: 1rem !important;
          }
          
          .quiz-results > div:first-child h4 {
            font-size: 1.2rem !important;
          }
          
          .quiz-results > div:first-child > div:first-child {
            font-size: 2rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default QuizExercise