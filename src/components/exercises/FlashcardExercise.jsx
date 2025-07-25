import React, { useState, useEffect } from 'react'

const FlashcardExercise = ({ exercise, onComplete, onProgress }) => {
  const [currentFlashcard, setCurrentFlashcard] = useState(0)
  const [showFlashcardBack, setShowFlashcardBack] = useState(false)
  const [viewedCards, setViewedCards] = useState(new Set())
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // Reset state when exercise changes
    setCurrentFlashcard(0)
    setShowFlashcardBack(false)
    setViewedCards(new Set())
  }, [exercise])

  useEffect(() => {
    // Track viewed cards for completion
    if (showFlashcardBack) {
      setViewedCards(prev => new Set([...prev, currentFlashcard]))
    }
  }, [showFlashcardBack, currentFlashcard])

  useEffect(() => {
    // Check for completion when all cards have been viewed
    if (viewedCards.size === exercise.cards.length && exercise.cards.length > 0) {
      const timeSpent = Date.now() - startTime
      
      // Report progress
      if (onProgress) {
        onProgress({
          exerciseType: 'flashcard',
          score: 100, // Completion-based rather than score-based
          timeSpent,
          cardsViewed: viewedCards.size,
          totalCards: exercise.cards.length
        })
      }

      // Report completion
      if (onComplete) {
        onComplete({
          exerciseType: 'flashcard',
          score: 100,
          timeSpent
        })
      }
    }
  }, [viewedCards, exercise.cards.length, onComplete, onProgress, startTime])

  const nextFlashcard = () => {
    if (currentFlashcard < exercise.cards.length - 1) {
      setCurrentFlashcard(prev => prev + 1)
      setShowFlashcardBack(false)
    }
  }

  const previousFlashcard = () => {
    if (currentFlashcard > 0) {
      setCurrentFlashcard(prev => prev - 1)
      setShowFlashcardBack(false)
    }
  }

  const flipFlashcard = () => {
    setShowFlashcardBack(prev => !prev)
  }

  const goToCard = (cardIndex) => {
    setCurrentFlashcard(cardIndex)
    setShowFlashcardBack(false)
  }

  if (!exercise.cards || exercise.cards.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>{exercise.title}</h3>
        <p>No flashcards available for this exercise.</p>
      </div>
    )
  }

  const currentCard = exercise.cards[currentFlashcard]
  const completionPercentage = Math.round((viewedCards.size / exercise.cards.length) * 100)

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

      {/* Progress indicator */}
      <div style={{ 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontWeight: 'bold' }}>
            Card {currentFlashcard + 1} of {exercise.cards.length}
          </span>
          <span style={{ 
            color: completionPercentage === 100 ? 'var(--success-dark)' : 'var(--text-secondary)',
            fontWeight: completionPercentage === 100 ? 'bold' : 'normal'
          }}>
            {completionPercentage}% Complete
          </span>
        </div>
        
        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--border-color)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${completionPercentage}%`,
            height: '100%',
            backgroundColor: completionPercentage === 100 ? 'var(--success)' : 'var(--primary)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Navigation buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <button 
          onClick={previousFlashcard}
          disabled={currentFlashcard === 0}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: currentFlashcard === 0 ? 'var(--text-disabled)' : 'var(--secondary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            cursor: currentFlashcard === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
          aria-label="Previous flashcard"
        >
          ← Previous
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {exercise.cards.map((_, index) => (
            <button
              key={index}
              onClick={() => goToCard(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: index === currentFlashcard 
                  ? 'var(--primary)' 
                  : viewedCards.has(index) 
                    ? 'var(--success)' 
                    : 'var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        <button 
          onClick={nextFlashcard}
          disabled={currentFlashcard === exercise.cards.length - 1}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: currentFlashcard === exercise.cards.length - 1 ? 'var(--text-disabled)' : 'var(--secondary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            cursor: currentFlashcard === exercise.cards.length - 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
          aria-label="Next flashcard"
        >
          Next →
        </button>
      </div>

      {/* Flashcard */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '2rem'
      }}>
        <div 
          onClick={flipFlashcard}
          style={{
            width: '100%',
            maxWidth: '500px',
            height: '300px',
            perspective: '1000px',
            cursor: 'pointer'
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              flipFlashcard()
            }
          }}
          aria-label={`Flashcard ${currentFlashcard + 1}. Click to flip. Currently showing ${showFlashcardBack ? 'back' : 'front'}.`}
        >
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: showFlashcardBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s ease'
          }}>
            {/* Front of card */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              border: '2px solid var(--primary)',
              borderRadius: 'var(--border-radius)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              padding: '2rem',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textAlign: 'center',
              color: 'var(--text-primary)'
            }}>
              {currentCard.front}
            </div>

            {/* Back of card */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--primary-light)',
              border: '2px solid var(--primary)',
              borderRadius: 'var(--border-radius)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              padding: '2rem',
              fontSize: '1.3rem',
              textAlign: 'center',
              color: 'var(--primary-dark)'
            }}>
              {currentCard.back}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        marginBottom: '1rem'
      }}>
        <p>Click the card to flip it</p>
        <p>Use the navigation buttons or dots to move between cards</p>
      </div>

      {/* Completion status */}
      {completionPercentage === 100 && (
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          backgroundColor: 'var(--success-light)',
          border: '2px solid var(--success)',
          borderRadius: 'var(--border-radius)',
          color: 'var(--success-dark)'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>🎉 Congratulations!</h4>
          <p style={{ margin: 0 }}>You've viewed all {exercise.cards.length} flashcards!</p>
        </div>
      )}
    </div>
  )
}

export default FlashcardExercise