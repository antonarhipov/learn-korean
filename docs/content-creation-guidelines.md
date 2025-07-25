# Content Creation Guidelines

## Overview
This document provides comprehensive guidelines for creating high-quality, consistent lessons for the Korean Language Learning Application. These standards ensure educational effectiveness, technical compatibility, and user experience consistency.

## Table of Contents
1. [General Principles](#general-principles)
2. [Lesson Structure](#lesson-structure)
3. [Content Writing Guidelines](#content-writing-guidelines)
4. [Korean Language Standards](#korean-language-standards)
5. [Exercise Design](#exercise-design)
6. [Asset Requirements](#asset-requirements)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [Quality Assurance](#quality-assurance)
9. [Technical Specifications](#technical-specifications)
10. [Review Process](#review-process)

## General Principles

### Educational Philosophy
- **Progressive Learning**: Each lesson builds upon previous knowledge
- **Practical Application**: Focus on real-world usage and communication
- **Cultural Context**: Include cultural insights alongside language instruction
- **Multiple Learning Styles**: Accommodate visual, auditory, and kinesthetic learners
- **Immediate Feedback**: Provide clear, constructive feedback on exercises

### Content Quality Standards
- **Accuracy**: All Korean content must be linguistically correct
- **Clarity**: Instructions and explanations must be clear and unambiguous
- **Engagement**: Content should be interesting and motivating
- **Relevance**: Topics should be practical and useful for learners
- **Consistency**: Maintain uniform style and approach across lessons

## Lesson Structure

### Required Components
Every lesson must include:

1. **Basic Information**
   - Unique lesson ID (format: `lesson-XXX`)
   - Descriptive title
   - Appropriate level (beginner/intermediate/advanced)
   - Category classification
   - Estimated completion time (5-60 minutes)
   - Clear description of learning objectives

2. **Main Content**
   - Introduction paragraph explaining the lesson topic
   - Core teaching content (200-800 words)
   - 3-8 practical examples with Korean text, romanization, and translation
   - Optional supporting media (images, videos)

3. **Exercises**
   - Minimum 2 exercises per lesson
   - Variety of exercise types
   - Progressive difficulty within the lesson
   - Clear instructions for each exercise

### Lesson Flow
1. **Introduction** (10-15% of lesson time)
   - Hook to engage learner interest
   - Clear statement of what will be learned
   - Connection to previous lessons (if applicable)

2. **Presentation** (40-50% of lesson time)
   - Core content delivery
   - Examples and demonstrations
   - Cultural context where relevant

3. **Practice** (30-40% of lesson time)
   - Guided exercises
   - Interactive activities
   - Immediate feedback

4. **Wrap-up** (5-10% of lesson time)
   - Summary of key points
   - Preview of next lesson (if applicable)

## Content Writing Guidelines

### Writing Style
- **Tone**: Friendly, encouraging, and supportive
- **Language Level**: Appropriate for target audience
- **Sentence Length**: Vary sentence length for readability
- **Active Voice**: Use active voice when possible
- **Personal Pronouns**: Use "you" to address learners directly

### Formatting Standards
- **Headings**: Use clear, descriptive headings
- **Lists**: Use bullet points or numbered lists for clarity
- **Emphasis**: Use **bold** for key terms, *italics* for emphasis
- **Code**: Use `backticks` for Korean romanization systems

### Content Organization
- **Logical Flow**: Present information in logical sequence
- **Chunking**: Break content into digestible sections
- **Transitions**: Use clear transitions between topics
- **Repetition**: Reinforce key concepts through strategic repetition

## Korean Language Standards

### Romanization System
- **Primary System**: Revised Romanization of Korean (RR)
- **Consistency**: Use the same romanization throughout a lesson
- **Pronunciation Guides**: Include pronunciation notes for difficult sounds
- **Alternative Systems**: Note McCune-Reischauer when helpful

### Korean Text Standards
- **Font**: Use Unicode-compliant Korean fonts
- **Spacing**: Follow Korean spacing rules (띄어쓰기)
- **Punctuation**: Use appropriate Korean punctuation marks
- **Formality Levels**: Clearly indicate formality levels (존댓말/반말)

### Translation Guidelines
- **Natural English**: Translations should sound natural in English
- **Cultural Adaptation**: Adapt cultural references when necessary
- **Literal vs. Free**: Balance literal accuracy with natural expression
- **Context**: Provide context for culturally specific terms

## Exercise Design

### Exercise Types and Usage

#### Quiz Exercises
- **Purpose**: Test comprehension and recall
- **Question Types**: Multiple choice, true/false
- **Guidelines**:
  - 3-6 questions per quiz
  - One clearly correct answer
  - Plausible distractors
  - Immediate feedback with explanations

#### Flashcard Exercises
- **Purpose**: Vocabulary memorization and recognition
- **Content**: Korean term on front, translation/explanation on back
- **Guidelines**:
  - 5-15 cards per set
  - Include audio pronunciation
  - Progress from recognition to recall
  - Group related vocabulary

#### Pronunciation Exercises
- **Purpose**: Develop accurate pronunciation
- **Components**: Audio model, text to practice, recording capability
- **Guidelines**:
  - Clear, native speaker audio
  - Isolated sounds and connected speech
  - Visual cues for mouth position when helpful
  - Immediate feedback on accuracy

### Exercise Difficulty Progression
- **Within Lesson**: Start easy, gradually increase difficulty
- **Across Lessons**: Build complexity over time
- **Scaffolding**: Provide support that can be gradually removed
- **Challenge**: Include optional advanced exercises

## Asset Requirements

### Audio Assets
- **Quality**: 44.1kHz, 16-bit minimum
- **Format**: MP3 or OGG
- **Duration**: 1-30 seconds for individual words/phrases
- **Speaker**: Native Korean speakers only
- **Recording**: Studio quality, no background noise
- **Naming**: Follow asset naming conventions

### Image Assets
- **Resolution**: Minimum 1920x1080 for lesson images
- **Format**: JPEG for photos, PNG for graphics, SVG for icons
- **Content**: Culturally appropriate and relevant
- **Copyright**: Use only licensed or original images
- **Alt Text**: Provide descriptive alt text for accessibility

### Video Assets (Optional)
- **Resolution**: 1080p minimum
- **Duration**: 30 seconds to 5 minutes
- **Content**: Directly related to lesson objectives
- **Subtitles**: Include Korean and English subtitles
- **Quality**: Professional production standards

## Accessibility Guidelines

### Visual Accessibility
- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Font Size**: Minimum 14px for body text
- **Korean Text**: Larger font sizes for Korean characters
- **Color Coding**: Don't rely solely on color to convey information

### Auditory Accessibility
- **Transcripts**: Provide text transcripts for all audio
- **Visual Cues**: Include visual indicators for audio content
- **Volume Control**: Allow users to adjust audio levels
- **Playback Speed**: Provide speed control options

### Motor Accessibility
- **Click Targets**: Minimum 44px touch targets
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Time Limits**: Provide adequate time for responses
- **Error Recovery**: Allow users to correct mistakes easily

## Quality Assurance

### Content Review Checklist
- [ ] Learning objectives clearly stated
- [ ] Content accuracy verified by native speaker
- [ ] Grammar and spelling checked
- [ ] Cultural appropriateness confirmed
- [ ] Exercise difficulty appropriate for level
- [ ] All assets functional and properly linked
- [ ] Accessibility requirements met
- [ ] Technical specifications followed

### Testing Requirements
- [ ] Lesson tested in preview mode
- [ ] All interactive elements functional
- [ ] Audio playback working correctly
- [ ] Images loading properly
- [ ] Exercise feedback accurate
- [ ] Navigation working smoothly
- [ ] Mobile compatibility verified

## Technical Specifications

### JSON Structure
All lessons must conform to the lesson schema:

```json
{
  "id": "lesson-001",
  "title": "Introduction to Hangul",
  "level": "beginner",
  "category": "pronunciation",
  "description": "Learn the basics of the Korean alphabet.",
  "prerequisites": [],
  "nextLessons": ["lesson-002"],
  "estimatedTime": 15,
  "content": {
    "text": "Main lesson content...",
    "examples": [
      {
        "korean": "ㄱ",
        "romanization": "g/k",
        "translation": "Consonant G/K",
        "audio": "/assets/audio/lessons/lesson-001_example_01.mp3"
      }
    ],
    "media": {
      "image": "/assets/images/lessons/lesson-001_chart_hangul-overview.jpg",
      "video": null
    }
  },
  "exercises": [
    {
      "type": "quiz",
      "title": "Hangul Recognition Quiz",
      "questions": [
        {
          "question": "Which letter represents 'g/k'?",
          "options": ["ㄱ", "ㄴ", "ㄷ", "ㄹ"],
          "correctAnswer": "ㄱ"
        }
      ]
    }
  ]
}
```

### File Naming Conventions
Follow the asset management guidelines:
- **Lessons**: `lesson-XXX.json`
- **Audio**: `lesson-XXX_type_index.mp3`
- **Images**: `lesson-XXX_type_description.jpg`
- **Videos**: `lesson-XXX_type_description.mp4`

### Validation Requirements
- All lessons must pass JSON schema validation
- Asset links must be verified
- Content must pass accessibility checks
- Korean text must be properly encoded (UTF-8)

## Review Process

### Submission Requirements
Before submitting a lesson for review:

1. **Complete Content Review**
   - All sections filled out completely
   - Content proofread and edited
   - Korean text verified by native speaker
   - Cultural appropriateness confirmed

2. **Technical Validation**
   - JSON structure validated
   - All assets uploaded and linked correctly
   - Preview testing completed successfully
   - Accessibility requirements met

3. **Documentation**
   - Learning objectives documented
   - Target audience specified
   - Prerequisites identified
   - Estimated completion time calculated

### Review Stages

#### Stage 1: Technical Review
- JSON structure validation
- Asset verification
- Link checking
- Performance testing

#### Stage 2: Content Review
- Educational effectiveness
- Language accuracy
- Cultural appropriateness
- Accessibility compliance

#### Stage 3: User Testing
- Preview testing with target users
- Feedback collection and analysis
- Usability assessment
- Final adjustments

### Approval Criteria
Lessons must meet all criteria to be approved:
- ✅ Technical specifications met
- ✅ Content quality standards achieved
- ✅ Educational objectives clear and measurable
- ✅ Accessibility requirements satisfied
- ✅ User testing feedback positive
- ✅ All review comments addressed

## Best Practices

### Content Creation Tips
1. **Start with Learning Objectives**: Define what learners should achieve
2. **Use Real Examples**: Include authentic Korean language usage
3. **Provide Context**: Explain when and how to use new language
4. **Include Cultural Notes**: Help learners understand cultural context
5. **Test Early and Often**: Use preview mode throughout development

### Common Mistakes to Avoid
- Overloading lessons with too much content
- Using inconsistent romanization systems
- Neglecting cultural context
- Creating exercises that are too easy or too difficult
- Forgetting to test audio and interactive elements

### Efficiency Tips
- Use lesson templates for consistent structure
- Batch similar content creation tasks
- Maintain a style guide for consistency
- Create reusable asset libraries
- Document decisions for future reference

## Resources

### Reference Materials
- Korean Language Style Guides
- Cultural Context Resources
- Audio Recording Guidelines
- Image Creation Standards
- Accessibility Checklists

### Tools and Software
- Lesson Editor (built-in)
- Audio Recording Software
- Image Editing Tools
- Korean Input Methods
- Validation Tools

### Support Contacts
- **Technical Issues**: development@learn-korean.app
- **Content Questions**: content@learn-korean.app
- **Cultural Review**: culture@learn-korean.app
- **Accessibility**: accessibility@learn-korean.app

---

**Document Version**: 1.0.0  
**Last Updated**: July 25, 2025  
**Next Review**: October 25, 2025  
**Maintained By**: Content Development Team