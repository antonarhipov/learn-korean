// JSON Schema for lesson data validation
export const lessonSchema = {
  type: "object",
  properties: {
    lessons: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            pattern: "^lesson-\\d{3}$",
            description: "Unique lesson identifier in format 'lesson-XXX'"
          },
          title: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            description: "Lesson title"
          },
          level: {
            type: "string",
            enum: ["beginner", "intermediate", "advanced"],
            description: "Difficulty level"
          },
          category: {
            type: "string",
            enum: ["vocabulary", "grammar", "pronunciation", "culture"],
            description: "Lesson category"
          },
          description: {
            type: "string",
            minLength: 1,
            maxLength: 500,
            description: "Short lesson description"
          },
          prerequisites: {
            type: "array",
            items: {
              type: "string",
              pattern: "^lesson-\\d{3}$"
            },
            description: "Array of prerequisite lesson IDs"
          },
          nextLessons: {
            type: "array",
            items: {
              type: "string",
              pattern: "^lesson-\\d{3}$"
            },
            description: "Array of suggested next lesson IDs"
          },
          estimatedTime: {
            type: "integer",
            minimum: 1,
            maximum: 120,
            description: "Estimated completion time in minutes"
          },
          content: {
            type: "object",
            properties: {
              text: {
                type: "string",
                minLength: 1,
                description: "Main lesson content text"
              },
              examples: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    korean: {
                      type: "string",
                      minLength: 1,
                      description: "Korean text"
                    },
                    romanization: {
                      type: "string",
                      minLength: 1,
                      description: "Romanized pronunciation"
                    },
                    translation: {
                      type: "string",
                      minLength: 1,
                      description: "English translation"
                    },
                    audio: {
                      type: "string",
                      pattern: "^/assets/audio/.*\\.(mp3|ogg|wav)$",
                      description: "Audio file path"
                    }
                  },
                  required: ["korean", "romanization", "translation", "audio"],
                  additionalProperties: false
                },
                description: "Array of lesson examples"
              },
              media: {
                type: "object",
                properties: {
                  image: {
                    oneOf: [
                      { type: "null" },
                      {
                        type: "string",
                        pattern: "^/assets/images/.*\\.(jpg|jpeg|png|webp|gif)$"
                      }
                    ],
                    description: "Image file path or null"
                  },
                  video: {
                    oneOf: [
                      { type: "null" },
                      {
                        type: "string",
                        pattern: "^/assets/videos/.*\\.(mp4|webm|ogg)$"
                      }
                    ],
                    description: "Video file path or null"
                  }
                },
                required: ["image", "video"],
                additionalProperties: false
              }
            },
            required: ["text", "examples", "media"],
            additionalProperties: false
          },
          exercises: {
            type: "array",
            items: {
              oneOf: [
                {
                  // Quiz exercise
                  type: "object",
                  properties: {
                    type: { const: "quiz" },
                    title: {
                      type: "string",
                      minLength: 1,
                      maxLength: 100
                    },
                    questions: {
                      type: "array",
                      minItems: 1,
                      items: {
                        type: "object",
                        properties: {
                          question: {
                            type: "string",
                            minLength: 1
                          },
                          options: {
                            type: "array",
                            minItems: 2,
                            maxItems: 6,
                            items: {
                              type: "string",
                              minLength: 1
                            }
                          },
                          correctAnswer: {
                            type: "string",
                            minLength: 1
                          }
                        },
                        required: ["question", "options", "correctAnswer"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["type", "title", "questions"],
                  additionalProperties: false
                },
                {
                  // Flashcard exercise
                  type: "object",
                  properties: {
                    type: { const: "flashcard" },
                    title: {
                      type: "string",
                      minLength: 1,
                      maxLength: 100
                    },
                    cards: {
                      type: "array",
                      minItems: 1,
                      items: {
                        type: "object",
                        properties: {
                          front: {
                            type: "string",
                            minLength: 1
                          },
                          back: {
                            type: "string",
                            minLength: 1
                          }
                        },
                        required: ["front", "back"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["type", "title", "cards"],
                  additionalProperties: false
                },
                {
                  // Pronunciation exercise
                  type: "object",
                  properties: {
                    type: { const: "pronunciation" },
                    title: {
                      type: "string",
                      minLength: 1,
                      maxLength: 100
                    },
                    audio: {
                      type: "string",
                      pattern: "^/assets/audio/.*\\.(mp3|ogg|wav)$"
                    },
                    text: {
                      type: "string",
                      minLength: 1
                    },
                    instructions: {
                      type: "string",
                      minLength: 1
                    }
                  },
                  required: ["type", "title", "audio", "text", "instructions"],
                  additionalProperties: false
                }
              ]
            },
            minItems: 1,
            description: "Array of lesson exercises"
          }
        },
        required: [
          "id", "title", "level", "category", "description", 
          "prerequisites", "nextLessons", "estimatedTime", 
          "content", "exercises"
        ],
        additionalProperties: false
      },
      minItems: 1,
      description: "Array of lessons"
    },
    modules: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            pattern: "^module-\\d+$",
            description: "Unique module identifier"
          },
          title: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            description: "Module title"
          },
          description: {
            type: "string",
            minLength: 1,
            maxLength: 500,
            description: "Module description"
          },
          lessons: {
            type: "array",
            items: {
              type: "string",
              pattern: "^lesson-\\d{3}$"
            },
            minItems: 1,
            description: "Array of lesson IDs in this module"
          },
          level: {
            type: "string",
            enum: ["beginner", "intermediate", "advanced"],
            description: "Module difficulty level"
          },
          estimatedTime: {
            type: "integer",
            minimum: 1,
            description: "Total estimated time for module in minutes"
          }
        },
        required: ["id", "title", "description", "lessons", "level", "estimatedTime"],
        additionalProperties: false
      },
      minItems: 1,
      description: "Array of modules"
    }
  },
  required: ["lessons", "modules"],
  additionalProperties: false
}

// Custom validation functions
export const customValidations = {
  // Validate that prerequisite lessons exist
  validatePrerequisites: (data) => {
    const lessonIds = new Set(data.lessons.map(lesson => lesson.id))
    const errors = []
    
    data.lessons.forEach(lesson => {
      lesson.prerequisites.forEach(prereqId => {
        if (!lessonIds.has(prereqId)) {
          errors.push({
            path: `lessons[${lesson.id}].prerequisites`,
            message: `Prerequisite lesson '${prereqId}' does not exist`
          })
        }
      })
    })
    
    return errors
  },
  
  // Validate that next lessons exist
  validateNextLessons: (data) => {
    const lessonIds = new Set(data.lessons.map(lesson => lesson.id))
    const errors = []
    
    data.lessons.forEach(lesson => {
      lesson.nextLessons.forEach(nextId => {
        if (!lessonIds.has(nextId)) {
          errors.push({
            path: `lessons[${lesson.id}].nextLessons`,
            message: `Next lesson '${nextId}' does not exist`
          })
        }
      })
    })
    
    return errors
  },
  
  // Validate that module lessons exist
  validateModuleLessons: (data) => {
    const lessonIds = new Set(data.lessons.map(lesson => lesson.id))
    const errors = []
    
    data.modules.forEach(module => {
      module.lessons.forEach(lessonId => {
        if (!lessonIds.has(lessonId)) {
          errors.push({
            path: `modules[${module.id}].lessons`,
            message: `Lesson '${lessonId}' referenced in module does not exist`
          })
        }
      })
    })
    
    return errors
  },
  
  // Validate that quiz correct answers are in options
  validateQuizAnswers: (data) => {
    const errors = []
    
    data.lessons.forEach(lesson => {
      lesson.exercises.forEach((exercise, exerciseIndex) => {
        if (exercise.type === 'quiz') {
          exercise.questions.forEach((question, questionIndex) => {
            if (!question.options.includes(question.correctAnswer)) {
              errors.push({
                path: `lessons[${lesson.id}].exercises[${exerciseIndex}].questions[${questionIndex}]`,
                message: `Correct answer '${question.correctAnswer}' is not in the options array`
              })
            }
          })
        }
      })
    })
    
    return errors
  }
}