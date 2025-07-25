/**
 * Lesson Preview Component
 * Renders lessons exactly as they would appear to students for testing
 */

import React, { useState, useRef, useEffect } from 'react';

const LessonPreview = ({ lesson, onClose }) => {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showFlashcardBack, setShowFlashcardBack] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Reset state when lesson changes
  useEffect(() => {
    setCurrentExercise(0);
    setExerciseAnswers({});
    setShowResults(false);
    setCurrentFlashcard(0);
    setShowFlashcardBack(false);
  }, [lesson]);

  const playAudio = (audioPath) => {
    if (audioRef.current) {
      audioRef.current.src = audioPath;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => console.warn('Audio playback failed:', error));
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleQuizAnswer = (exerciseIndex, questionIndex, answer) => {
    setExerciseAnswers(prev => ({
      ...prev,
      [`${exerciseIndex}-${questionIndex}`]: answer
    }));
  };

  const checkQuizAnswers = (exercise, exerciseIndex) => {
    const results = exercise.questions.map((question, questionIndex) => {
      const userAnswer = exerciseAnswers[`${exerciseIndex}-${questionIndex}`];
      return {
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: userAnswer === question.correctAnswer
      };
    });

    const score = results.filter(r => r.isCorrect).length;
    const total = results.length;

    return { results, score, total };
  };

  const nextExercise = () => {
    if (currentExercise < lesson.exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setShowResults(false);
    }
  };

  const previousExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(prev => prev - 1);
      setShowResults(false);
    }
  };

  const nextFlashcard = (exercise) => {
    if (currentFlashcard < exercise.cards.length - 1) {
      setCurrentFlashcard(prev => prev + 1);
      setShowFlashcardBack(false);
    }
  };

  const previousFlashcard = () => {
    if (currentFlashcard > 0) {
      setCurrentFlashcard(prev => prev - 1);
      setShowFlashcardBack(false);
    }
  };

  const flipFlashcard = () => {
    setShowFlashcardBack(prev => !prev);
  };

  if (!lesson) {
    return (
      <div className="lesson-preview">
        <div className="preview-header">
          <h2>Lesson Preview</h2>
          <button onClick={onClose} className="btn-secondary">Close Preview</button>
        </div>
        <div className="no-lesson">
          <p>No lesson data to preview</p>
        </div>
      </div>
    );
  }

  const currentExerciseData = lesson.exercises[currentExercise];

  return (
    <div className="lesson-preview">
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded}
        style={{ display: 'none' }}
      />

      <div className="preview-header">
        <div className="lesson-info">
          <h2>{lesson.title}</h2>
          <div className="lesson-meta">
            <span className="level">{lesson.level}</span>
            <span className="category">{lesson.category}</span>
            <span className="time">{lesson.estimatedTime} min</span>
          </div>
        </div>
        <button onClick={onClose} className="btn-secondary">Close Preview</button>
      </div>

      <div className="preview-content">
        {/* Lesson Content Section */}
        <div className="lesson-content">
          <div className="content-text">
            {lesson.content.text.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {lesson.content.media.image && (
            <div className="content-image">
              <img 
                src={lesson.content.media.image} 
                alt="Lesson illustration"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="image-placeholder" style={{ display: 'none' }}>
                Image not available: {lesson.content.media.image}
              </div>
            </div>
          )}

          {lesson.content.examples.length > 0 && (
            <div className="examples-section">
              <h3>Examples</h3>
              <div className="examples-grid">
                {lesson.content.examples.map((example, index) => (
                  <div key={index} className="example-card">
                    <div className="korean-text">{example.korean}</div>
                    <div className="romanization">{example.romanization}</div>
                    <div className="translation">{example.translation}</div>
                    {example.audio && (
                      <button 
                        className="audio-button"
                        onClick={() => playAudio(example.audio)}
                        disabled={isPlaying}
                      >
                        🔊 {isPlaying ? 'Playing...' : 'Play'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Exercises Section */}
        {lesson.exercises.length > 0 && (
          <div className="exercises-section">
            <div className="exercise-navigation">
              <h3>Exercises ({currentExercise + 1} of {lesson.exercises.length})</h3>
              <div className="nav-buttons">
                <button 
                  onClick={previousExercise}
                  disabled={currentExercise === 0}
                  className="btn-secondary"
                >
                  Previous
                </button>
                <button 
                  onClick={nextExercise}
                  disabled={currentExercise === lesson.exercises.length - 1}
                  className="btn-secondary"
                >
                  Next
                </button>
              </div>
            </div>

            {currentExerciseData && (
              <div className="exercise-content">
                <h4>{currentExerciseData.title}</h4>

                {/* Quiz Exercise */}
                {currentExerciseData.type === 'quiz' && (
                  <div className="quiz-exercise">
                    {!showResults ? (
                      <>
                        {currentExerciseData.questions.map((question, questionIndex) => (
                          <div key={questionIndex} className="quiz-question">
                            <h5>Question {questionIndex + 1}: {question.question}</h5>
                            <div className="quiz-options">
                              {question.options.map((option, optionIndex) => (
                                <label key={optionIndex} className="quiz-option">
                                  <input
                                    type="radio"
                                    name={`question-${currentExercise}-${questionIndex}`}
                                    value={option}
                                    onChange={(e) => handleQuizAnswer(currentExercise, questionIndex, e.target.value)}
                                    checked={exerciseAnswers[`${currentExercise}-${questionIndex}`] === option}
                                  />
                                  {option}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button 
                          onClick={() => setShowResults(true)}
                          className="btn-primary"
                          disabled={currentExerciseData.questions.some((_, i) => 
                            !exerciseAnswers[`${currentExercise}-${i}`]
                          )}
                        >
                          Check Answers
                        </button>
                      </>
                    ) : (
                      <div className="quiz-results">
                        {(() => {
                          const { results, score, total } = checkQuizAnswers(currentExerciseData, currentExercise);
                          return (
                            <>
                              <h5>Results: {score}/{total} correct</h5>
                              {results.map((result, index) => (
                                <div key={index} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                                  <p><strong>Q:</strong> {result.question}</p>
                                  <p><strong>Your answer:</strong> {result.userAnswer || 'No answer'}</p>
                                  <p><strong>Correct answer:</strong> {result.correctAnswer}</p>
                                </div>
                              ))}
                              <button 
                                onClick={() => setShowResults(false)}
                                className="btn-secondary"
                              >
                                Try Again
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Flashcard Exercise */}
                {currentExerciseData.type === 'flashcard' && (
                  <div className="flashcard-exercise">
                    {currentExerciseData.cards.length > 0 && (
                      <>
                        <div className="flashcard-navigation">
                          <span>Card {currentFlashcard + 1} of {currentExerciseData.cards.length}</span>
                          <div className="flashcard-nav-buttons">
                            <button 
                              onClick={previousFlashcard}
                              disabled={currentFlashcard === 0}
                              className="btn-secondary-small"
                            >
                              Previous
                            </button>
                            <button 
                              onClick={() => nextFlashcard(currentExerciseData)}
                              disabled={currentFlashcard === currentExerciseData.cards.length - 1}
                              className="btn-secondary-small"
                            >
                              Next
                            </button>
                          </div>
                        </div>

                        <div className="flashcard" onClick={flipFlashcard}>
                          <div className={`flashcard-inner ${showFlashcardBack ? 'flipped' : ''}`}>
                            <div className="flashcard-front">
                              {currentExerciseData.cards[currentFlashcard]?.front}
                            </div>
                            <div className="flashcard-back">
                              {currentExerciseData.cards[currentFlashcard]?.back}
                            </div>
                          </div>
                        </div>

                        <p className="flashcard-instruction">Click the card to flip it</p>
                      </>
                    )}
                  </div>
                )}

                {/* Pronunciation Exercise */}
                {currentExerciseData.type === 'pronunciation' && (
                  <div className="pronunciation-exercise">
                    <div className="pronunciation-text">
                      {currentExerciseData.text}
                    </div>
                    
                    {currentExerciseData.audio && (
                      <div className="pronunciation-audio">
                        <button 
                          className="audio-button-large"
                          onClick={() => playAudio(currentExerciseData.audio)}
                          disabled={isPlaying}
                        >
                          🔊 {isPlaying ? 'Playing...' : 'Play Audio'}
                        </button>
                      </div>
                    )}

                    {currentExerciseData.instructions && (
                      <div className="pronunciation-instructions">
                        <p>{currentExerciseData.instructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .lesson-preview {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .lesson-info h2 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .lesson-meta {
          display: flex;
          gap: 15px;
        }

        .lesson-meta span {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .level {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .category {
          background-color: #f3e5f5;
          color: #7b1fa2;
        }

        .time {
          background-color: #e8f5e8;
          color: #388e3c;
        }

        .preview-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .lesson-content, .exercises-section {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .content-text p {
          line-height: 1.6;
          margin-bottom: 15px;
          color: #333;
        }

        .content-image {
          margin: 20px 0;
          text-align: center;
        }

        .content-image img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .image-placeholder {
          padding: 40px;
          background-color: #f5f5f5;
          border: 2px dashed #ddd;
          border-radius: 8px;
          color: #666;
          font-style: italic;
        }

        .examples-section h3 {
          margin-bottom: 20px;
          color: #333;
        }

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .example-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          background: #fafafa;
        }

        .korean-text {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #333;
        }

        .romanization {
          font-size: 16px;
          color: #666;
          margin-bottom: 8px;
        }

        .translation {
          font-size: 14px;
          color: #888;
          margin-bottom: 15px;
        }

        .audio-button, .audio-button-large {
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .audio-button-large {
          padding: 12px 24px;
          font-size: 16px;
        }

        .audio-button:hover, .audio-button-large:hover {
          background-color: #0056b3;
        }

        .audio-button:disabled, .audio-button-large:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .exercise-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .nav-buttons {
          display: flex;
          gap: 10px;
        }

        .btn-primary, .btn-secondary, .btn-secondary-small {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .btn-secondary-small {
          padding: 6px 12px;
          font-size: 12px;
        }

        .btn-primary {
          background-color: #28a745;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #218838;
        }

        .btn-secondary, .btn-secondary-small {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled), .btn-secondary-small:hover:not(:disabled) {
          background-color: #545b62;
        }

        .btn-primary:disabled, .btn-secondary:disabled, .btn-secondary-small:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .quiz-question {
          margin-bottom: 25px;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #fafafa;
        }

        .quiz-question h5 {
          margin-bottom: 15px;
          color: #333;
        }

        .quiz-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .quiz-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .quiz-option:hover {
          background-color: #f0f0f0;
        }

        .quiz-option input[type="radio"] {
          margin: 0;
        }

        .quiz-results {
          margin-top: 20px;
        }

        .result-item {
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .result-item.correct {
          background-color: #d4edda;
          border-left-color: #28a745;
        }

        .result-item.incorrect {
          background-color: #f8d7da;
          border-left-color: #dc3545;
        }

        .flashcard-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .flashcard-nav-buttons {
          display: flex;
          gap: 10px;
        }

        .flashcard {
          width: 300px;
          height: 200px;
          margin: 20px auto;
          perspective: 1000px;
          cursor: pointer;
        }

        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flashcard-inner.flipped {
          transform: rotateY(180deg);
        }

        .flashcard-front, .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #007bff;
          border-radius: 12px;
          font-size: 24px;
          font-weight: bold;
          color: #333;
          background: white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .flashcard-back {
          transform: rotateY(180deg);
          background-color: #f8f9fa;
        }

        .flashcard-instruction {
          text-align: center;
          color: #666;
          font-style: italic;
          margin-top: 10px;
        }

        .pronunciation-exercise {
          text-align: center;
        }

        .pronunciation-text {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 30px;
          color: #333;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .pronunciation-audio {
          margin-bottom: 20px;
        }

        .pronunciation-instructions {
          color: #666;
          font-style: italic;
        }

        .no-lesson {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default LessonPreview;