# Requirements for the Korean Language Learning Web App MVP

The app is a client-side React-based web application designed for a single user to learn Korean on a desktop browser. It features lesson modules stored in a JSON file, interactive exercises, progress tracking, and a simple yet effective UI. New lessons are added by updating the JSON file, and the app emphasizes a structured learning path with multimedia support.

---

## Functional Requirements

### 1. Lesson Modules

**Purpose:** Deliver structured Korean language lessons.

**Storage:** Lessons are defined in a single `lessons.json` file located in `src/data/`.

**Submission Process:** New lessons are added by editing `lessons.json` and updating multimedia files in `public/assets/`. The app must be rebuilt or refreshed to reflect changes (no live updates in the MVP).

**Structure:** Each lesson is a JSON object with metadata, content, and exercises (detailed below).

### 2. Interactive Exercises

**Types:**
- **Quizzes:** Multiple-choice questions with immediate feedback
- **Flashcards:** Vocabulary cards with Korean on the front and translations on the back
- **Pronunciation Practice:** Audio examples for users to mimic (no recording or feedback)

**Integration:** Exercises are embedded within lessons and accessible after the main content.

### 3. Progress Tracking

**Storage:** Use localStorage to save:
- Completed lesson IDs
- Exercise scores (e.g., quiz percentages)

**Features:** Display progress with completion percentages and a list of completed lessons.

### 4. Multimedia Content

**Support:** Include audio (required), images (optional), and videos (optional).

**Implementation:** Use HTML5 elements (`<audio>`, `<img>`, `<video>`) with file paths referenced in the JSON.

### 5. Learning Path

**Structure:** Lessons are grouped into modules (e.g., Hangul Basics, Greetings).

**Progression:** Linear path within each module; users must complete lessons in order based on prerequisites.

---

## Detailed Specifications

### Lesson Module Format

Each lesson in `lessons.json` follows this structure:

```json
{
  "id": "lesson-001",
  "title": "Introduction to Hangul",
  "level": "beginner",
  "category": "pronunciation",
  "description": "Learn the basics of the Korean alphabet.",
  "prerequisites": [],
  "nextLessons": ["lesson-002"],
  "content": {
    "text": "Hangul is the Korean alphabet, created by King Sejong in 1443...",
    "examples": [
      {
        "korean": "ㄱ",
        "romanization": "g/k",
        "translation": "Consonant G/K",
        "audio": "/assets/audio/g.mp3"
      }
    ],
    "media": {
      "image": "/assets/images/hangul-chart.jpg",
      "video": null
    }
  },
  "exercises": [
    {
      "type": "quiz",
      "questions": [
        {
          "question": "Which letter represents 'g/k'?",
          "options": ["ㄱ", "ㄴ", "ㄷ", "ㄹ"],
          "correctAnswer": "ㄱ"
        }
      ]
    },
    {
      "type": "flashcard",
      "cards": [
        {
          "front": "ㄱ",
          "back": "g/k"
        }
      ]
    },
    {
      "type": "pronunciation",
      "audio": "/assets/audio/hangul-sounds.mp3",
      "text": "ㄱ, ㄴ, ㄷ",
      "instructions": "Repeat after the audio."
    }
  ]
}
```

**Fields:**
- `id`: Unique string (e.g., "lesson-001")
- `title`: Lesson name
- `level`: "beginner", "intermediate", or "advanced"
- `category`: "vocabulary", "grammar", "pronunciation", or "culture"
- `description`: Short summary
- `prerequisites`: Array of lesson IDs (empty if none)
- `nextLessons`: Array of suggested follow-up lesson IDs
- `content`:
  - `text`: Plain text or markdown for lesson explanation
  - `examples`: Array of objects with Korean text, romanization, translation, and audio
  - `media`: Object with paths to image and video (null if unused)
- `exercises`: Array of exercise objects (see below)

### Exercise Formats

#### Quiz
- **Structure:** Array of questions with text, options, and a correct answer
- **Behavior:** Show one question at a time, provide feedback after submission, display final score

#### Flashcard
- **Structure:** Array of cards with front (Korean) and back (translation/romanization)
- **Behavior:** Flip cards on click; option to mark as "known"

#### Pronunciation
- **Structure:** Audio file, text to pronounce, and instructions
- **Behavior:** Play audio on demand; no user input required

### Sample Module Structure

#### Module 1: Hangul Basics
- **Lesson 1:** Introduction to Hangul (ID: "lesson-001")
- **Lesson 2:** Vowels and Consonants (ID: "lesson-002", prerequisite: "lesson-001")
- **Lesson 3:** Reading Practice (ID: "lesson-003", prerequisite: "lesson-002")

#### Module 2: Greetings
- **Lesson 1:** Basic Greetings (ID: "lesson-004")
- **Lesson 2:** Introducing Yourself (ID: "lesson-005", prerequisite: "lesson-004")

**MVP Scope:** 2 modules, 5–7 lessons total.

---

## UI Layouts

### Layout Overview
- **Target:** Desktop browsers (minimum width: 1024px)
- **Structure:** Two-column layout with a fixed sidebar and a main content area

### Sidebar Navigation
**Sections:**
- **Home:** App overview
- **Lessons:** List of modules and lessons (locked if prerequisites unmet)
- **Progress:** Completion stats
- **Settings:** Theme toggle (light/dark)

**Width:** Fixed at ~250px

### Main Content Area
**Pages:**
- **Home:** Welcome text and "Start Learning" button
- **Lessons List:** Grid of lesson cards (title, level, status)
- **Lesson Detail:**
  - Title and description
  - Rendered content (text, examples with audio, media)
  - Exercise buttons/links
  - Previous/next lesson navigation
- **Exercise Interface:** Full-screen quiz, flashcard, or pronunciation views
- **Progress Dashboard:** Progress bar, completed lessons list

---

## Technical Requirements

### Framework and Libraries
- **Frontend:** React.js (latest stable version)
- **Styling:** CSS Modules or Styled Components
- **State Management:** React Context API or useState/useReducer hooks
- **Routing:** React Router for navigation between pages
- **Audio/Video:** HTML5 media elements

### Data Management
- **Lesson Data:** Static JSON file (`src/data/lessons.json`)
- **Progress Storage:** Browser localStorage
- **File Structure:**
  ```
  src/
    components/
    data/
      lessons.json
    pages/
    styles/
  public/
    assets/
      audio/
      images/
      videos/
  ```

### Browser Compatibility
- **Target Browsers:** Modern desktop browsers (Chrome, Firefox, Safari, Edge)
- **Minimum Screen Resolution:** 1024px width
- **JavaScript:** ES6+ features supported

### Performance Requirements
- **Load Time:** Initial page load under 3 seconds
- **Audio Files:** Compressed format (MP3, OGG)
- **Images:** Optimized formats (WebP, JPEG, PNG)
- **Bundle Size:** Keep JavaScript bundle under 1MB

### Accessibility
- **Keyboard Navigation:** Full keyboard accessibility
- **Screen Readers:** Proper ARIA labels and semantic HTML
- **Color Contrast:** WCAG 2.1 AA compliance
- **Audio Controls:** Accessible media controls

### Development Requirements
- **Build Tool:** Vite
- **Code Quality:** ESLint and Prettier configuration
- **Version Control:** Git with meaningful commit messages
- **Documentation:** README with setup and deployment instructions


