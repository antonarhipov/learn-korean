/**
 * Lesson Editor Component
 * Web-based editor for creating and editing Korean language lessons
 */

import React, { useState, useEffect } from 'react';
import { validateLesson } from '../data/schemas/lessonSchema.js';

const LessonEditor = ({ initialLesson = null, onSave, onCancel }) => {
  const [lesson, setLesson] = useState({
    id: '',
    title: '',
    level: 'beginner',
    category: 'pronunciation',
    description: '',
    prerequisites: [],
    nextLessons: [],
    estimatedTime: 15,
    content: {
      text: '',
      examples: [],
      media: {
        image: '',
        video: null
      }
    },
    exercises: []
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize with existing lesson data
  useEffect(() => {
    if (initialLesson) {
      setLesson(initialLesson);
    }
  }, [initialLesson]);

  // Validate lesson whenever it changes
  useEffect(() => {
    const validation = validateLesson(lesson);
    setValidationErrors(validation.errors || []);
    setIsValid(validation.isValid);
  }, [lesson]);

  const updateLesson = (path, value) => {
    setLesson(prev => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const addExample = () => {
    const newExample = {
      korean: '',
      romanization: '',
      translation: '',
      audio: ''
    };
    
    setLesson(prev => ({
      ...prev,
      content: {
        ...prev.content,
        examples: [...prev.content.examples, newExample]
      }
    }));
  };

  const updateExample = (index, field, value) => {
    setLesson(prev => ({
      ...prev,
      content: {
        ...prev.content,
        examples: prev.content.examples.map((example, i) => 
          i === index ? { ...example, [field]: value } : example
        )
      }
    }));
  };

  const removeExample = (index) => {
    setLesson(prev => ({
      ...prev,
      content: {
        ...prev.content,
        examples: prev.content.examples.filter((_, i) => i !== index)
      }
    }));
  };

  const addExercise = (type) => {
    let newExercise;
    
    switch (type) {
      case 'quiz':
        newExercise = {
          type: 'quiz',
          title: '',
          questions: []
        };
        break;
      case 'flashcard':
        newExercise = {
          type: 'flashcard',
          title: '',
          cards: []
        };
        break;
      case 'pronunciation':
        newExercise = {
          type: 'pronunciation',
          title: '',
          audio: '',
          text: '',
          instructions: ''
        };
        break;
      default:
        return;
    }
    
    setLesson(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const updateExercise = (index, field, value) => {
    setLesson(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const removeExercise = (index) => {
    setLesson(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const addQuizQuestion = (exerciseIndex) => {
    const newQuestion = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: ''
    };
    
    setLesson(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex ? {
          ...exercise,
          questions: [...(exercise.questions || []), newQuestion]
        } : exercise
      )
    }));
  };

  const updateQuizQuestion = (exerciseIndex, questionIndex, field, value) => {
    setLesson(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex ? {
          ...exercise,
          questions: exercise.questions.map((question, j) => 
            j === questionIndex ? { ...question, [field]: value } : question
          )
        } : exercise
      )
    }));
  };

  const addFlashcard = (exerciseIndex) => {
    const newCard = {
      front: '',
      back: ''
    };
    
    setLesson(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex ? {
          ...exercise,
          cards: [...(exercise.cards || []), newCard]
        } : exercise
      )
    }));
  };

  const updateFlashcard = (exerciseIndex, cardIndex, field, value) => {
    setLesson(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex ? {
          ...exercise,
          cards: exercise.cards.map((card, j) => 
            j === cardIndex ? { ...card, [field]: value } : card
          )
        } : exercise
      )
    }));
  };

  const handleSave = () => {
    if (isValid && onSave) {
      onSave(lesson);
    }
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(lesson, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lesson-${lesson.id || 'new'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="lesson-editor">
      <div className="editor-header">
        <h2>{initialLesson ? 'Edit Lesson' : 'Create New Lesson'}</h2>
        <div className="editor-actions">
          <button onClick={exportJSON} className="btn-secondary">
            Export JSON
          </button>
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className={`btn-primary ${!isValid ? 'disabled' : ''}`}
            disabled={!isValid}
          >
            Save Lesson
          </button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h3>Validation Errors:</h3>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index} className="error">{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="editor-tabs">
        <button 
          className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Info
        </button>
        <button 
          className={`tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button 
          className={`tab ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          Exercises
        </button>
        <button 
          className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>

      <div className="editor-content">
        {activeTab === 'basic' && (
          <div className="basic-info-tab">
            <div className="form-group">
              <label>Lesson ID:</label>
              <input
                type="text"
                value={lesson.id}
                onChange={(e) => updateLesson('id', e.target.value)}
                placeholder="lesson-001"
              />
            </div>

            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => updateLesson('title', e.target.value)}
                placeholder="Introduction to Hangul"
              />
            </div>

            <div className="form-group">
              <label>Level:</label>
              <select
                value={lesson.level}
                onChange={(e) => updateLesson('level', e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category:</label>
              <select
                value={lesson.category}
                onChange={(e) => updateLesson('category', e.target.value)}
              >
                <option value="pronunciation">Pronunciation</option>
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="conversation">Conversation</option>
                <option value="culture">Culture</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={lesson.description}
                onChange={(e) => updateLesson('description', e.target.value)}
                placeholder="Learn the basics of the Korean alphabet."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Estimated Time (minutes):</label>
              <input
                type="number"
                value={lesson.estimatedTime}
                onChange={(e) => updateLesson('estimatedTime', parseInt(e.target.value))}
                min="5"
                max="120"
              />
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content-tab">
            <div className="form-group">
              <label>Main Content:</label>
              <textarea
                value={lesson.content.text}
                onChange={(e) => updateLesson('content.text', e.target.value)}
                placeholder="Enter the main lesson content here..."
                rows="8"
              />
            </div>

            <div className="form-group">
              <label>Featured Image:</label>
              <input
                type="text"
                value={lesson.content.media.image}
                onChange={(e) => updateLesson('content.media.image', e.target.value)}
                placeholder="/assets/images/lessons/lesson-001_chart_hangul-overview.jpg"
              />
            </div>

            <div className="examples-section">
              <div className="section-header">
                <h3>Examples</h3>
                <button onClick={addExample} className="btn-secondary">
                  Add Example
                </button>
              </div>

              {lesson.content.examples.map((example, index) => (
                <div key={index} className="example-item">
                  <div className="example-header">
                    <h4>Example {index + 1}</h4>
                    <button 
                      onClick={() => removeExample(index)}
                      className="btn-danger-small"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Korean:</label>
                      <input
                        type="text"
                        value={example.korean}
                        onChange={(e) => updateExample(index, 'korean', e.target.value)}
                        placeholder="ㄱ"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Romanization:</label>
                      <input
                        type="text"
                        value={example.romanization}
                        onChange={(e) => updateExample(index, 'romanization', e.target.value)}
                        placeholder="g/k"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Translation:</label>
                      <input
                        type="text"
                        value={example.translation}
                        onChange={(e) => updateExample(index, 'translation', e.target.value)}
                        placeholder="Consonant G/K"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Audio File:</label>
                      <input
                        type="text"
                        value={example.audio}
                        onChange={(e) => updateExample(index, 'audio', e.target.value)}
                        placeholder="/assets/audio/lessons/lesson-001_example_01.mp3"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'exercises' && (
          <div className="exercises-tab">
            <div className="section-header">
              <h3>Exercises</h3>
              <div className="exercise-buttons">
                <button onClick={() => addExercise('quiz')} className="btn-secondary">
                  Add Quiz
                </button>
                <button onClick={() => addExercise('flashcard')} className="btn-secondary">
                  Add Flashcards
                </button>
                <button onClick={() => addExercise('pronunciation')} className="btn-secondary">
                  Add Pronunciation
                </button>
              </div>
            </div>

            {lesson.exercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="exercise-item">
                <div className="exercise-header">
                  <h4>{exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)} Exercise</h4>
                  <button 
                    onClick={() => removeExercise(exerciseIndex)}
                    className="btn-danger-small"
                  >
                    Remove
                  </button>
                </div>

                <div className="form-group">
                  <label>Exercise Title:</label>
                  <input
                    type="text"
                    value={exercise.title}
                    onChange={(e) => updateExercise(exerciseIndex, 'title', e.target.value)}
                    placeholder="Enter exercise title"
                  />
                </div>

                {exercise.type === 'quiz' && (
                  <div className="quiz-section">
                    <div className="section-header">
                      <h5>Questions</h5>
                      <button 
                        onClick={() => addQuizQuestion(exerciseIndex)}
                        className="btn-secondary-small"
                      >
                        Add Question
                      </button>
                    </div>

                    {(exercise.questions || []).map((question, questionIndex) => (
                      <div key={questionIndex} className="question-item">
                        <div className="form-group">
                          <label>Question:</label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => updateQuizQuestion(exerciseIndex, questionIndex, 'question', e.target.value)}
                            placeholder="Which letter represents 'g/k'?"
                          />
                        </div>

                        <div className="options-grid">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="form-group">
                              <label>Option {optionIndex + 1}:</label>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuizQuestion(exerciseIndex, questionIndex, 'options', newOptions);
                                }}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="form-group">
                          <label>Correct Answer:</label>
                          <input
                            type="text"
                            value={question.correctAnswer}
                            onChange={(e) => updateQuizQuestion(exerciseIndex, questionIndex, 'correctAnswer', e.target.value)}
                            placeholder="Enter the correct answer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {exercise.type === 'flashcard' && (
                  <div className="flashcard-section">
                    <div className="section-header">
                      <h5>Flashcards</h5>
                      <button 
                        onClick={() => addFlashcard(exerciseIndex)}
                        className="btn-secondary-small"
                      >
                        Add Card
                      </button>
                    </div>

                    {(exercise.cards || []).map((card, cardIndex) => (
                      <div key={cardIndex} className="card-item">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Front:</label>
                            <input
                              type="text"
                              value={card.front}
                              onChange={(e) => updateFlashcard(exerciseIndex, cardIndex, 'front', e.target.value)}
                              placeholder="ㄱ"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Back:</label>
                            <input
                              type="text"
                              value={card.back}
                              onChange={(e) => updateFlashcard(exerciseIndex, cardIndex, 'back', e.target.value)}
                              placeholder="g/k"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {exercise.type === 'pronunciation' && (
                  <div className="pronunciation-section">
                    <div className="form-group">
                      <label>Audio File:</label>
                      <input
                        type="text"
                        value={exercise.audio || ''}
                        onChange={(e) => updateExercise(exerciseIndex, 'audio', e.target.value)}
                        placeholder="/assets/audio/exercises/exercise_001_pronunciation_01.mp3"
                      />
                    </div>

                    <div className="form-group">
                      <label>Text to Practice:</label>
                      <input
                        type="text"
                        value={exercise.text || ''}
                        onChange={(e) => updateExercise(exerciseIndex, 'text', e.target.value)}
                        placeholder="ㄱ, ㄴ, ㅏ"
                      />
                    </div>

                    <div className="form-group">
                      <label>Instructions:</label>
                      <textarea
                        value={exercise.instructions || ''}
                        onChange={(e) => updateExercise(exerciseIndex, 'instructions', e.target.value)}
                        placeholder="Repeat after the audio."
                        rows="2"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="preview-tab">
            <h3>JSON Preview</h3>
            <pre className="json-preview">
              {JSON.stringify(lesson, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <style jsx>{`
        .lesson-editor {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .editor-actions {
          display: flex;
          gap: 10px;
        }

        .btn-primary, .btn-secondary, .btn-danger-small, .btn-secondary-small {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover:not(.disabled) {
          background-color: #0056b3;
        }

        .btn-primary.disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary, .btn-secondary-small {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover, .btn-secondary-small:hover {
          background-color: #545b62;
        }

        .btn-danger-small {
          background-color: #dc3545;
          color: white;
          padding: 4px 8px;
          font-size: 12px;
        }

        .btn-danger-small:hover {
          background-color: #c82333;
        }

        .validation-errors {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .validation-errors h3 {
          margin: 0 0 10px 0;
          color: #721c24;
        }

        .validation-errors ul {
          margin: 0;
          padding-left: 20px;
        }

        .validation-errors .error {
          color: #721c24;
        }

        .editor-tabs {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 20px;
        }

        .tab {
          padding: 12px 24px;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: border-color 0.2s;
        }

        .tab.active {
          border-bottom-color: #007bff;
          color: #007bff;
        }

        .tab:hover {
          background-color: #f8f9fa;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px 0 15px 0;
        }

        .exercise-buttons {
          display: flex;
          gap: 10px;
        }

        .example-item, .exercise-item, .question-item, .card-item {
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 15px;
        }

        .example-header, .exercise-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .json-preview {
          background-color: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 15px;
          overflow-x: auto;
          font-size: 12px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default LessonEditor;