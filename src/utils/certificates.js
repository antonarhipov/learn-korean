/**
 * Certificate Generation System for Korean Learning App
 * Creates personalized completion certificates for lessons, modules, and achievements
 */

// Certificate templates
export const CERTIFICATE_TEMPLATES = {
  LESSON: {
    id: 'lesson_completion',
    name: 'Lesson Completion Certificate',
    description: 'Certificate for completing a lesson',
    background: 'gradient-blue',
    border: 'elegant',
    icon: '📚',
    color: '#4a90e2'
  },
  MODULE: {
    id: 'module_completion',
    name: 'Module Mastery Certificate',
    description: 'Certificate for completing an entire module',
    background: 'gradient-purple',
    border: 'ornate',
    icon: '🎓',
    color: '#8e44ad'
  },
  ACHIEVEMENT: {
    id: 'achievement_certificate',
    name: 'Achievement Certificate',
    description: 'Certificate for earning special achievements',
    background: 'gradient-gold',
    border: 'premium',
    icon: '🏆',
    color: '#f39c12'
  },
  STREAK: {
    id: 'streak_certificate',
    name: 'Streak Milestone Certificate',
    description: 'Certificate for reaching streak milestones',
    background: 'gradient-fire',
    border: 'flame',
    icon: '🔥',
    color: '#e74c3c'
  },
  COURSE: {
    id: 'course_completion',
    name: 'Course Completion Certificate',
    description: 'Certificate for completing an entire course',
    background: 'gradient-emerald',
    border: 'master',
    icon: '👑',
    color: '#27ae60'
  }
}

// Certificate backgrounds
export const CERTIFICATE_BACKGROUNDS = {
  'gradient-blue': {
    type: 'gradient',
    colors: ['#667eea', '#764ba2'],
    pattern: 'diagonal'
  },
  'gradient-purple': {
    type: 'gradient',
    colors: ['#8e44ad', '#3498db'],
    pattern: 'radial'
  },
  'gradient-gold': {
    type: 'gradient',
    colors: ['#f39c12', '#f1c40f'],
    pattern: 'linear'
  },
  'gradient-fire': {
    type: 'gradient',
    colors: ['#e74c3c', '#ff6b6b'],
    pattern: 'diagonal'
  },
  'gradient-emerald': {
    type: 'gradient',
    colors: ['#27ae60', '#2ecc71'],
    pattern: 'radial'
  }
}

// Certificate borders
export const CERTIFICATE_BORDERS = {
  elegant: {
    style: 'solid',
    width: '8px',
    radius: '12px',
    shadow: 'medium'
  },
  ornate: {
    style: 'double',
    width: '12px',
    radius: '16px',
    shadow: 'large'
  },
  premium: {
    style: 'ridge',
    width: '10px',
    radius: '20px',
    shadow: 'extra-large'
  },
  flame: {
    style: 'dashed',
    width: '6px',
    radius: '8px',
    shadow: 'medium'
  },
  master: {
    style: 'groove',
    width: '14px',
    radius: '24px',
    shadow: 'ultimate'
  }
}

/**
 * Generate certificate data for a completed lesson
 * @param {Object} lesson - Lesson data
 * @param {Object} userStats - User statistics
 * @param {Object} completionData - Completion details
 * @returns {Object} Certificate data
 */
export function generateLessonCertificate(lesson, userStats, completionData) {
  const template = CERTIFICATE_TEMPLATES.LESSON
  const certificateId = `cert_lesson_${lesson.id}_${Date.now()}`
  
  return {
    id: certificateId,
    type: 'lesson',
    template: template,
    title: 'Certificate of Completion',
    subtitle: 'Korean Language Learning',
    content: {
      mainText: 'This certifies that',
      recipientName: userStats.userName || 'Korean Learner',
      achievementText: `has successfully completed the lesson`,
      lessonTitle: lesson.title,
      lessonDescription: lesson.description,
      completionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      score: completionData.score || 'N/A',
      timeSpent: formatTime(completionData.timeSpent || 0),
      exercisesCompleted: completionData.exercisesCompleted || 0
    },
    metadata: {
      lessonId: lesson.id,
      userId: userStats.userId,
      generatedAt: new Date().toISOString(),
      validationCode: generateValidationCode(certificateId),
      level: lesson.level,
      category: lesson.category
    },
    design: {
      background: template.background,
      border: template.border,
      primaryColor: template.color,
      icon: template.icon,
      layout: 'standard'
    }
  }
}

/**
 * Generate certificate data for a completed module
 * @param {Object} module - Module data
 * @param {Object} userStats - User statistics
 * @param {Object} completionData - Completion details
 * @returns {Object} Certificate data
 */
export function generateModuleCertificate(module, userStats, completionData) {
  const template = CERTIFICATE_TEMPLATES.MODULE
  const certificateId = `cert_module_${module.id}_${Date.now()}`
  
  return {
    id: certificateId,
    type: 'module',
    template: template,
    title: 'Certificate of Mastery',
    subtitle: 'Korean Language Learning Program',
    content: {
      mainText: 'This certifies that',
      recipientName: userStats.userName || 'Korean Learner',
      achievementText: `has successfully mastered the module`,
      moduleTitle: module.title,
      moduleDescription: module.description,
      completionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      lessonsCompleted: module.lessons?.length || 0,
      averageScore: Math.round(completionData.averageScore || 0),
      totalTimeSpent: formatTime(completionData.totalTimeSpent || 0),
      totalExercises: completionData.totalExercises || 0
    },
    metadata: {
      moduleId: module.id,
      userId: userStats.userId,
      generatedAt: new Date().toISOString(),
      validationCode: generateValidationCode(certificateId),
      level: module.level,
      estimatedTime: module.estimatedTime
    },
    design: {
      background: template.background,
      border: template.border,
      primaryColor: template.color,
      icon: template.icon,
      layout: 'premium'
    }
  }
}

/**
 * Generate certificate data for an achievement
 * @param {Object} achievement - Achievement data
 * @param {Object} userStats - User statistics
 * @returns {Object} Certificate data
 */
export function generateAchievementCertificate(achievement, userStats) {
  const template = CERTIFICATE_TEMPLATES.ACHIEVEMENT
  const certificateId = `cert_achievement_${achievement.id}_${Date.now()}`
  
  return {
    id: certificateId,
    type: 'achievement',
    template: template,
    title: 'Achievement Certificate',
    subtitle: 'Korean Learning Excellence',
    content: {
      mainText: 'This certifies that',
      recipientName: userStats.userName || 'Korean Learner',
      achievementText: `has earned the achievement`,
      achievementName: achievement.name,
      achievementDescription: achievement.description,
      completionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      pointsEarned: achievement.points,
      category: achievement.category,
      rarity: getAchievementRarity(achievement)
    },
    metadata: {
      achievementId: achievement.id,
      userId: userStats.userId,
      generatedAt: new Date().toISOString(),
      validationCode: generateValidationCode(certificateId),
      category: achievement.category
    },
    design: {
      background: template.background,
      border: template.border,
      primaryColor: template.color,
      icon: achievement.icon || template.icon,
      layout: 'achievement'
    }
  }
}

/**
 * Generate certificate data for a streak milestone
 * @param {Object} streakMilestone - Streak milestone data
 * @param {Object} userStats - User statistics
 * @returns {Object} Certificate data
 */
export function generateStreakCertificate(streakMilestone, userStats) {
  const template = CERTIFICATE_TEMPLATES.STREAK
  const certificateId = `cert_streak_${streakMilestone.streakLength}_${Date.now()}`
  
  return {
    id: certificateId,
    type: 'streak',
    template: template,
    title: 'Streak Achievement Certificate',
    subtitle: 'Dedication and Consistency Award',
    content: {
      mainText: 'This certifies that',
      recipientName: userStats.userName || 'Korean Learner',
      achievementText: `has maintained a learning streak of`,
      streakLength: `${streakMilestone.streakLength} consecutive days`,
      streakName: streakMilestone.name,
      completionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      pointsEarned: streakMilestone.points,
      dedication: getDedicationLevel(streakMilestone.streakLength)
    },
    metadata: {
      streakLength: streakMilestone.streakLength,
      userId: userStats.userId,
      generatedAt: new Date().toISOString(),
      validationCode: generateValidationCode(certificateId),
      milestoneId: streakMilestone.id
    },
    design: {
      background: template.background,
      border: template.border,
      primaryColor: template.color,
      icon: template.icon,
      layout: 'streak'
    }
  }
}

/**
 * Generate HTML content for certificate
 * @param {Object} certificate - Certificate data
 * @returns {string} HTML content
 */
export function generateCertificateHTML(certificate) {
  const { content, design, title, subtitle } = certificate
  const background = CERTIFICATE_BACKGROUNDS[design.background]
  const border = CERTIFICATE_BORDERS[design.border]
  
  const backgroundStyle = background.type === 'gradient' 
    ? `background: linear-gradient(45deg, ${background.colors.join(', ')})`
    : `background-color: ${background.colors[0]}`

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600&display=swap');
        
        body {
          margin: 0;
          padding: 20px;
          font-family: 'Open Sans', sans-serif;
          background: #f5f5f5;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        
        .certificate {
          width: 800px;
          height: 600px;
          ${backgroundStyle};
          border: ${border.width} ${border.style} ${design.primaryColor};
          border-radius: ${border.radius};
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: white;
          overflow: hidden;
        }
        
        .certificate::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(1px);
        }
        
        .certificate-content {
          position: relative;
          z-index: 2;
          padding: 40px;
        }
        
        .certificate-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .certificate-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .certificate-subtitle {
          font-size: 1.2rem;
          margin-bottom: 30px;
          opacity: 0.9;
        }
        
        .certificate-main-text {
          font-size: 1.1rem;
          margin-bottom: 10px;
        }
        
        .certificate-recipient {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          margin: 20px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          border-bottom: 2px solid rgba(255,255,255,0.5);
          padding-bottom: 10px;
          display: inline-block;
        }
        
        .certificate-achievement {
          font-size: 1.1rem;
          margin: 20px 0 10px 0;
        }
        
        .certificate-subject {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 700;
          margin: 10px 0 30px 0;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .certificate-details {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-top: 40px;
          font-size: 0.9rem;
        }
        
        .certificate-date {
          text-align: left;
        }
        
        .certificate-validation {
          text-align: right;
          opacity: 0.8;
        }
        
        .certificate-stats {
          margin: 20px 0;
          font-size: 0.95rem;
          opacity: 0.9;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .certificate {
            box-shadow: none;
            border: 2px solid #333;
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="certificate-content">
          <div class="certificate-icon">${design.icon}</div>
          <h1 class="certificate-title">${title}</h1>
          <p class="certificate-subtitle">${subtitle}</p>
          
          <p class="certificate-main-text">${content.mainText}</p>
          <div class="certificate-recipient">${content.recipientName}</div>
          <p class="certificate-achievement">${content.achievementText}</p>
          <div class="certificate-subject">${getSubjectText(certificate)}</div>
          
          ${generateStatsSection(certificate)}
          
          <div class="certificate-details">
            <div class="certificate-date">
              <strong>Date:</strong><br>
              ${content.completionDate}
            </div>
            <div class="certificate-validation">
              <strong>Certificate ID:</strong><br>
              ${certificate.metadata.validationCode}
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Get subject text based on certificate type
 * @param {Object} certificate - Certificate data
 * @returns {string} Subject text
 */
function getSubjectText(certificate) {
  switch (certificate.type) {
    case 'lesson':
      return certificate.content.lessonTitle
    case 'module':
      return certificate.content.moduleTitle
    case 'achievement':
      return certificate.content.achievementName
    case 'streak':
      return certificate.content.streakLength
    default:
      return 'Korean Learning Achievement'
  }
}

/**
 * Generate stats section based on certificate type
 * @param {Object} certificate - Certificate data
 * @returns {string} Stats HTML
 */
function generateStatsSection(certificate) {
  const { content, type } = certificate
  
  switch (type) {
    case 'lesson':
      return `
        <div class="certificate-stats">
          <strong>Score:</strong> ${content.score}% | 
          <strong>Time:</strong> ${content.timeSpent} | 
          <strong>Exercises:</strong> ${content.exercisesCompleted}
        </div>
      `
    case 'module':
      return `
        <div class="certificate-stats">
          <strong>Lessons:</strong> ${content.lessonsCompleted} | 
          <strong>Average Score:</strong> ${content.averageScore}% | 
          <strong>Total Time:</strong> ${content.totalTimeSpent}
        </div>
      `
    case 'achievement':
      return `
        <div class="certificate-stats">
          <strong>Points Earned:</strong> ${content.pointsEarned} | 
          <strong>Category:</strong> ${content.category} | 
          <strong>Rarity:</strong> ${content.rarity}
        </div>
      `
    case 'streak':
      return `
        <div class="certificate-stats">
          <strong>Points Earned:</strong> ${content.pointsEarned} | 
          <strong>Dedication Level:</strong> ${content.dedication}
        </div>
      `
    default:
      return ''
  }
}

/**
 * Generate validation code for certificate
 * @param {string} certificateId - Certificate ID
 * @returns {string} Validation code
 */
function generateValidationCode(certificateId) {
  const hash = certificateId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return `KL-${Math.abs(hash).toString(36).toUpperCase().padStart(8, '0')}`
}

/**
 * Get achievement rarity level
 * @param {Object} achievement - Achievement data
 * @returns {string} Rarity level
 */
function getAchievementRarity(achievement) {
  if (achievement.points >= 1000) return 'Legendary'
  if (achievement.points >= 500) return 'Epic'
  if (achievement.points >= 200) return 'Rare'
  if (achievement.points >= 100) return 'Uncommon'
  return 'Common'
}

/**
 * Get dedication level based on streak length
 * @param {number} streakLength - Length of streak
 * @returns {string} Dedication level
 */
function getDedicationLevel(streakLength) {
  if (streakLength >= 365) return 'Legendary Master'
  if (streakLength >= 100) return 'Ultimate Dedication'
  if (streakLength >= 50) return 'Exceptional Commitment'
  if (streakLength >= 30) return 'Outstanding Persistence'
  if (streakLength >= 14) return 'Strong Determination'
  if (streakLength >= 7) return 'Solid Commitment'
  return 'Good Start'
}

/**
 * Format time duration
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time
 */
function formatTime(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000)
  if (minutes < 60) {
    return `${minutes} minutes`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Convert certificate to downloadable format
 * @param {Object} certificate - Certificate data
 * @returns {Object} Download data
 */
export function prepareCertificateDownload(certificate) {
  const html = generateCertificateHTML(certificate)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  return {
    url,
    filename: `${certificate.type}_certificate_${certificate.metadata.validationCode}.html`,
    html,
    printReady: true
  }
}

/**
 * Get certificate sharing data
 * @param {Object} certificate - Certificate data
 * @returns {Object} Sharing data
 */
export function getCertificateShareData(certificate) {
  const { content, title } = certificate
  
  return {
    title: `${title} - ${content.recipientName}`,
    text: `I just earned a ${title} for ${getSubjectText(certificate)} in Korean learning! 🎉`,
    url: `#certificate/${certificate.id}`,
    hashtags: ['KoreanLearning', 'LanguageLearning', 'Achievement', 'Certificate']
  }
}