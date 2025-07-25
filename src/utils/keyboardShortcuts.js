/**
 * Keyboard Shortcuts System for Korean Learning App
 * Provides keyboard accessibility for common actions
 * Optimized for language learning workflows
 */

class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map()
    this.isEnabled = true
    this.storageKey = 'korean-learning-shortcuts'
    this.activeModals = []
    this.focusHistory = []
    
    // Default shortcuts configuration
    this.defaultShortcuts = {
      // Audio and pronunciation
      'Space': {
        action: 'playAudio',
        description: 'Play audio for current Korean text',
        category: 'Audio',
        preventDefault: true,
        condition: () => this.hasKoreanTextFocus()
      },
      'KeyP': {
        action: 'pronounceText',
        description: 'Pronounce selected Korean text',
        category: 'Audio',
        modifiers: ['ctrl'],
        preventDefault: true
      },
      'KeyR': {
        action: 'repeatAudio',
        description: 'Repeat last audio',
        category: 'Audio',
        modifiers: ['ctrl'],
        preventDefault: true
      },
      
      // Navigation
      'ArrowRight': {
        action: 'nextLesson',
        description: 'Go to next lesson',
        category: 'Navigation',
        modifiers: ['ctrl'],
        preventDefault: true
      },
      'ArrowLeft': {
        action: 'previousLesson',
        description: 'Go to previous lesson',
        category: 'Navigation',
        modifiers: ['ctrl'],
        preventDefault: true
      },
      'KeyH': {
        action: 'goHome',
        description: 'Go to home page',
        category: 'Navigation',
        modifiers: ['ctrl'],
        preventDefault: true
      },
      'KeyL': {
        action: 'goToLessons',
        description: 'Go to lessons list',
        category: 'Navigation',
        modifiers: ['ctrl'],
        preventDefault: true
      },
      'KeyG': {
        action: 'goToProgress',
        description: 'Go to progress page',
        category: 'Navigation',
        modifiers: ['ctrl'],
        preventDefault: true
      },
      
      // Exercise controls
      'Enter': {
        action: 'submitAnswer',
        description: 'Submit current answer',
        category: 'Exercise',
        preventDefault: true,
        condition: () => this.isInExercise()
      },
      'KeyN': {
        action: 'nextExercise',
        description: 'Go to next exercise',
        category: 'Exercise',
        modifiers: ['ctrl'],
        preventDefault: true,
        condition: () => this.isInExercise()
      },
      'KeyS': {
        action: 'skipExercise',
        description: 'Skip current exercise',
        category: 'Exercise',
        modifiers: ['ctrl', 'shift'],
        preventDefault: true,
        condition: () => this.isInExercise()
      },
      'KeyT': {
        action: 'showHint',
        description: 'Show hint for current exercise',
        category: 'Exercise',
        modifiers: ['ctrl'],
        preventDefault: true,
        condition: () => this.isInExercise()
      },
      
      // Flashcard controls
      'KeyF': {
        action: 'flipCard',
        description: 'Flip flashcard',
        category: 'Flashcard',
        preventDefault: true,
        condition: () => this.isInFlashcard()
      },
      'Digit1': {
        action: 'markEasy',
        description: 'Mark flashcard as easy',
        category: 'Flashcard',
        preventDefault: true,
        condition: () => this.isInFlashcard()
      },
      'Digit2': {
        action: 'markMedium',
        description: 'Mark flashcard as medium',
        category: 'Flashcard',
        preventDefault: true,
        condition: () => this.isInFlashcard()
      },
      'Digit3': {
        action: 'markHard',
        description: 'Mark flashcard as hard',
        category: 'Flashcard',
        preventDefault: true,
        condition: () => this.isInFlashcard()
      },
      
      // Accessibility
      'KeyC': {
        action: 'toggleHighContrast',
        description: 'Toggle high contrast mode',
        category: 'Accessibility',
        modifiers: ['ctrl', 'shift'],
        preventDefault: true
      },
      'KeyV': {
        action: 'toggleTTS',
        description: 'Toggle text-to-speech',
        category: 'Accessibility',
        modifiers: ['ctrl', 'shift'],
        preventDefault: true
      },
      'KeyI': {
        action: 'increaseFontSize',
        description: 'Increase Korean text font size',
        category: 'Accessibility',
        modifiers: ['ctrl', 'shift'],
        preventDefault: true
      },
      'KeyD': {
        action: 'decreaseFontSize',
        description: 'Decrease Korean text font size',
        category: 'Accessibility',
        modifiers: ['ctrl', 'shift'],
        preventDefault: true
      },
      
      // General
      'Escape': {
        action: 'closeModal',
        description: 'Close current modal or dialog',
        category: 'General',
        preventDefault: true
      },
      'Slash': {
        action: 'showShortcuts',
        description: 'Show keyboard shortcuts help',
        category: 'General',
        modifiers: ['ctrl'],
        preventDefault: true
      },
      'KeyQ': {
        action: 'quickSearch',
        description: 'Quick search lessons',
        category: 'General',
        modifiers: ['ctrl'],
        preventDefault: true
      }
    }
    
    this.initialize()
  }

  /**
   * Initialize keyboard shortcuts system
   */
  initialize() {
    // Load user preferences
    this.loadPreferences()
    
    // Register default shortcuts
    this.registerDefaultShortcuts()
    
    // Set up event listeners
    this.setupEventListeners()
    
    // Create help overlay
    this.createHelpOverlay()
    
    console.log('Keyboard shortcuts initialized:', {
      enabled: this.isEnabled,
      shortcuts: this.shortcuts.size
    })
  }

  /**
   * Load user preferences from localStorage
   */
  loadPreferences() {
    try {
      const saved = localStorage.getItem(this.storageKey)
      if (saved) {
        const preferences = JSON.parse(saved)
        this.isEnabled = preferences.enabled !== false
        
        // Load custom shortcuts if any
        if (preferences.customShortcuts) {
          Object.entries(preferences.customShortcuts).forEach(([key, shortcut]) => {
            this.shortcuts.set(key, shortcut)
          })
        }
      }
    } catch (error) {
      console.error('Error loading keyboard shortcuts preferences:', error)
    }
  }

  /**
   * Save user preferences to localStorage
   */
  savePreferences() {
    try {
      const preferences = {
        enabled: this.isEnabled,
        customShortcuts: Object.fromEntries(this.shortcuts)
      }
      localStorage.setItem(this.storageKey, JSON.stringify(preferences))
    } catch (error) {
      console.error('Error saving keyboard shortcuts preferences:', error)
    }
  }

  /**
   * Register default shortcuts
   */
  registerDefaultShortcuts() {
    Object.entries(this.defaultShortcuts).forEach(([key, shortcut]) => {
      this.shortcuts.set(key, shortcut)
    })
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('keyup', this.handleKeyUp.bind(this))
    
    // Track focus changes for context-aware shortcuts
    document.addEventListener('focusin', this.handleFocusIn.bind(this))
    document.addEventListener('focusout', this.handleFocusOut.bind(this))
  }

  /**
   * Handle keydown events
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    if (!this.isEnabled) return
    
    // Skip if user is typing in an input field (unless it's a special case)
    if (this.isTypingInInput(event.target) && !this.isSpecialInputShortcut(event)) {
      return
    }
    
    const shortcutKey = this.getShortcutKey(event)
    const shortcut = this.shortcuts.get(shortcutKey)
    
    if (shortcut && this.shouldExecuteShortcut(shortcut, event)) {
      if (shortcut.preventDefault) {
        event.preventDefault()
      }
      
      this.executeShortcut(shortcut, event)
    }
  }

  /**
   * Handle keyup events
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyUp(event) {
    // Handle any keyup-specific logic here
  }

  /**
   * Handle focus in events
   * @param {FocusEvent} event - Focus event
   */
  handleFocusIn(event) {
    // Track focus history for better context awareness
    this.focusHistory.unshift({
      element: event.target,
      timestamp: Date.now(),
      type: event.target.tagName.toLowerCase(),
      classes: Array.from(event.target.classList),
      id: event.target.id
    })
    
    // Keep only last 10 focus events
    this.focusHistory = this.focusHistory.slice(0, 10)
  }

  /**
   * Handle focus out events
   * @param {FocusEvent} event - Focus event
   */
  handleFocusOut(event) {
    // Could be used for cleanup or state tracking
  }

  /**
   * Get shortcut key string from keyboard event
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {string} Shortcut key string
   */
  getShortcutKey(event) {
    const modifiers = []
    
    if (event.ctrlKey) modifiers.push('ctrl')
    if (event.shiftKey) modifiers.push('shift')
    if (event.altKey) modifiers.push('alt')
    if (event.metaKey) modifiers.push('meta')
    
    const key = event.code || event.key
    
    return modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key
  }

  /**
   * Check if shortcut should be executed
   * @param {Object} shortcut - Shortcut configuration
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {boolean}
   */
  shouldExecuteShortcut(shortcut, event) {
    // Check modifiers
    if (shortcut.modifiers) {
      const requiredModifiers = shortcut.modifiers
      const activeModifiers = []
      
      if (event.ctrlKey) activeModifiers.push('ctrl')
      if (event.shiftKey) activeModifiers.push('shift')
      if (event.altKey) activeModifiers.push('alt')
      if (event.metaKey) activeModifiers.push('meta')
      
      if (!this.arraysEqual(requiredModifiers.sort(), activeModifiers.sort())) {
        return false
      }
    }
    
    // Check condition
    if (shortcut.condition && !shortcut.condition()) {
      return false
    }
    
    return true
  }

  /**
   * Execute a shortcut action
   * @param {Object} shortcut - Shortcut configuration
   * @param {KeyboardEvent} event - Keyboard event
   */
  executeShortcut(shortcut, event) {
    console.log('Executing shortcut:', shortcut.action)
    
    try {
      switch (shortcut.action) {
        case 'playAudio':
          this.playAudio()
          break
        case 'pronounceText':
          this.pronounceText()
          break
        case 'repeatAudio':
          this.repeatAudio()
          break
        case 'nextLesson':
          this.navigateToNextLesson()
          break
        case 'previousLesson':
          this.navigateToPreviousLesson()
          break
        case 'goHome':
          this.navigateToHome()
          break
        case 'goToLessons':
          this.navigateToLessons()
          break
        case 'goToProgress':
          this.navigateToProgress()
          break
        case 'submitAnswer':
          this.submitAnswer()
          break
        case 'nextExercise':
          this.nextExercise()
          break
        case 'skipExercise':
          this.skipExercise()
          break
        case 'showHint':
          this.showHint()
          break
        case 'flipCard':
          this.flipCard()
          break
        case 'markEasy':
          this.markFlashcard('easy')
          break
        case 'markMedium':
          this.markFlashcard('medium')
          break
        case 'markHard':
          this.markFlashcard('hard')
          break
        case 'toggleHighContrast':
          this.toggleHighContrast()
          break
        case 'toggleTTS':
          this.toggleTTS()
          break
        case 'increaseFontSize':
          this.increaseFontSize()
          break
        case 'decreaseFontSize':
          this.decreaseFontSize()
          break
        case 'closeModal':
          this.closeModal()
          break
        case 'showShortcuts':
          this.showShortcutsHelp()
          break
        case 'quickSearch':
          this.quickSearch()
          break
        default:
          console.warn('Unknown shortcut action:', shortcut.action)
      }
      
      // Announce action to screen readers
      this.announceAction(shortcut)
      
    } catch (error) {
      console.error('Error executing shortcut:', error)
    }
  }

  /**
   * Shortcut action implementations
   */
  playAudio() {
    const audioButton = document.querySelector('.pronunciation-btn, .audio-btn, [aria-label*="audio"], [aria-label*="play"]')
    if (audioButton) {
      audioButton.click()
    } else {
      // Try to find Korean text and use TTS
      const koreanText = this.getCurrentKoreanText()
      if (koreanText && window.koreanTTS) {
        window.koreanTTS.speak(koreanText)
      }
    }
  }

  pronounceText() {
    const selectedText = window.getSelection().toString().trim()
    if (selectedText && window.koreanTTS) {
      window.koreanTTS.speak(selectedText)
    } else {
      const koreanText = this.getCurrentKoreanText()
      if (koreanText && window.koreanTTS) {
        window.koreanTTS.speak(koreanText)
      }
    }
  }

  repeatAudio() {
    // Try to replay last audio or TTS
    if (window.koreanTTS && window.koreanTTS.lastSpokenText) {
      window.koreanTTS.speak(window.koreanTTS.lastSpokenText)
    }
  }

  navigateToNextLesson() {
    const nextButton = document.querySelector('.next-lesson, .btn-next, [aria-label*="next"]')
    if (nextButton) {
      nextButton.click()
    }
  }

  navigateToPreviousLesson() {
    const prevButton = document.querySelector('.prev-lesson, .btn-prev, [aria-label*="previous"]')
    if (prevButton) {
      prevButton.click()
    }
  }

  navigateToHome() {
    window.location.href = '/'
  }

  navigateToLessons() {
    window.location.href = '/lessons'
  }

  navigateToProgress() {
    window.location.href = '/progress'
  }

  submitAnswer() {
    const submitButton = document.querySelector('.submit-btn, .btn-submit, [type="submit"]')
    if (submitButton) {
      submitButton.click()
    }
  }

  nextExercise() {
    const nextButton = document.querySelector('.next-exercise, .exercise-next')
    if (nextButton) {
      nextButton.click()
    }
  }

  skipExercise() {
    const skipButton = document.querySelector('.skip-exercise, .btn-skip')
    if (skipButton) {
      skipButton.click()
    }
  }

  showHint() {
    const hintButton = document.querySelector('.hint-btn, .show-hint')
    if (hintButton) {
      hintButton.click()
    }
  }

  flipCard() {
    const card = document.querySelector('.flashcard, .flip-card')
    if (card) {
      card.click()
    }
  }

  markFlashcard(difficulty) {
    const button = document.querySelector(`.mark-${difficulty}, .difficulty-${difficulty}`)
    if (button) {
      button.click()
    }
  }

  toggleHighContrast() {
    if (window.highContrastMode) {
      window.highContrastMode.toggle()
    }
  }

  toggleTTS() {
    if (window.koreanTTS) {
      window.koreanTTS.isEnabled = !window.koreanTTS.isEnabled
      this.announceToScreenReader(`Text-to-speech ${window.koreanTTS.isEnabled ? 'enabled' : 'disabled'}`)
    }
  }

  increaseFontSize() {
    if (window.highContrastMode) {
      const sizes = ['normal', 'large', 'extra-large', 'huge']
      const currentSize = this.getCurrentFontSize()
      const currentIndex = sizes.indexOf(currentSize)
      const nextIndex = Math.min(currentIndex + 1, sizes.length - 1)
      window.highContrastMode.setKoreanTextSize(sizes[nextIndex])
    }
  }

  decreaseFontSize() {
    if (window.highContrastMode) {
      const sizes = ['normal', 'large', 'extra-large', 'huge']
      const currentSize = this.getCurrentFontSize()
      const currentIndex = sizes.indexOf(currentSize)
      const prevIndex = Math.max(currentIndex - 1, 0)
      window.highContrastMode.setKoreanTextSize(sizes[prevIndex])
    }
  }

  closeModal() {
    const modal = document.querySelector('.modal.show, .dialog[open], .overlay.active')
    if (modal) {
      const closeButton = modal.querySelector('.close, .btn-close, [aria-label*="close"]')
      if (closeButton) {
        closeButton.click()
      } else {
        modal.style.display = 'none'
        modal.classList.remove('show', 'active')
      }
    }
  }

  showShortcutsHelp() {
    this.toggleHelpOverlay()
  }

  quickSearch() {
    const searchInput = document.querySelector('input[type="search"], .search-input, #search')
    if (searchInput) {
      searchInput.focus()
    }
  }

  /**
   * Helper methods
   */
  isTypingInInput(element) {
    const inputTypes = ['input', 'textarea', 'select']
    const editableTypes = ['text', 'email', 'password', 'search', 'url', 'tel']
    
    if (inputTypes.includes(element.tagName.toLowerCase())) {
      if (element.tagName.toLowerCase() === 'input') {
        return editableTypes.includes(element.type)
      }
      return true
    }
    
    return element.contentEditable === 'true'
  }

  isSpecialInputShortcut(event) {
    // Allow certain shortcuts even when typing
    const allowedKeys = ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']
    return allowedKeys.includes(event.code) || (event.ctrlKey && event.code === 'Slash')
  }

  hasKoreanTextFocus() {
    const focused = document.activeElement
    return focused && (
      focused.classList.contains('korean-text') ||
      focused.closest('.korean-text') ||
      focused.querySelector('.korean-text')
    )
  }

  isInExercise() {
    return document.querySelector('.exercise, .quiz, .practice') !== null
  }

  isInFlashcard() {
    return document.querySelector('.flashcard, .card-study') !== null
  }

  getCurrentKoreanText() {
    const focused = document.activeElement
    
    // Try focused element first
    if (focused && focused.classList.contains('korean-text')) {
      return focused.textContent.trim()
    }
    
    // Try to find Korean text in focused container
    if (focused) {
      const koreanText = focused.querySelector('.korean-text')
      if (koreanText) {
        return koreanText.textContent.trim()
      }
    }
    
    // Fall back to first visible Korean text
    const koreanElements = document.querySelectorAll('.korean-text')
    for (const element of koreanElements) {
      if (this.isElementVisible(element)) {
        return element.textContent.trim()
      }
    }
    
    return null
  }

  getCurrentFontSize() {
    const koreanText = document.querySelector('.korean-text')
    if (koreanText) {
      if (koreanText.classList.contains('korean-text-huge')) return 'huge'
      if (koreanText.classList.contains('korean-text-extra-large')) return 'extra-large'
      if (koreanText.classList.contains('korean-text-large')) return 'large'
    }
    return 'normal'
  }

  isElementVisible(element) {
    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0
  }

  arraysEqual(a, b) {
    return a.length === b.length && a.every((val, i) => val === b[i])
  }

  /**
   * Create help overlay for keyboard shortcuts
   */
  createHelpOverlay() {
    const overlay = document.createElement('div')
    overlay.id = 'keyboard-shortcuts-help'
    overlay.className = 'shortcuts-help-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    `
    
    const content = document.createElement('div')
    content.className = 'shortcuts-help-content'
    content.style.cssText = `
      background: var(--bg-primary);
      color: var(--text-primary);
      border-radius: 8px;
      padding: 2rem;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `
    
    content.innerHTML = this.generateHelpContent()
    overlay.appendChild(content)
    document.body.appendChild(overlay)
    
    // Close on click outside or escape
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hideHelpOverlay()
      }
    })
  }

  /**
   * Generate help content HTML
   * @returns {string} HTML content
   */
  generateHelpContent() {
    const categories = {}
    
    // Group shortcuts by category
    this.shortcuts.forEach((shortcut, key) => {
      const category = shortcut.category || 'General'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push({ key, ...shortcut })
    })
    
    let html = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2 style="margin: 0; color: var(--text-primary);">Keyboard Shortcuts</h2>
        <button onclick="window.keyboardShortcuts.hideHelpOverlay()" style="
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-secondary);
        ">×</button>
      </div>
    `
    
    Object.entries(categories).forEach(([category, shortcuts]) => {
      html += `
        <div style="margin-bottom: 2rem;">
          <h3 style="color: var(--primary-color); margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
            ${category}
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem;">
      `
      
      shortcuts.forEach(shortcut => {
        const keyDisplay = this.formatKeyForDisplay(shortcut.key)
        html += `
          <div style="display: contents;">
            <div style="font-family: monospace; background: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600;">
              ${keyDisplay}
            </div>
            <div style="color: var(--text-secondary);">
              ${shortcut.description}
            </div>
          </div>
        `
      })
      
      html += `
          </div>
        </div>
      `
    })
    
    html += `
      <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border-color); text-align: center; color: var(--text-muted); font-size: 0.875rem;">
        Press <kbd style="background: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl + /</kbd> to toggle this help
      </div>
    `
    
    return html
  }

  /**
   * Format key combination for display
   * @param {string} key - Key combination
   * @returns {string} Formatted key display
   */
  formatKeyForDisplay(key) {
    return key
      .replace(/ctrl\+/g, 'Ctrl + ')
      .replace(/shift\+/g, 'Shift + ')
      .replace(/alt\+/g, 'Alt + ')
      .replace(/meta\+/g, 'Cmd + ')
      .replace(/Key([A-Z])/g, '$1')
      .replace(/Digit([0-9])/g, '$1')
      .replace(/Arrow([A-Z][a-z]+)/g, '$1 Arrow')
  }

  /**
   * Toggle help overlay visibility
   */
  toggleHelpOverlay() {
    const overlay = document.getElementById('keyboard-shortcuts-help')
    if (overlay) {
      const isVisible = overlay.style.display === 'flex'
      overlay.style.display = isVisible ? 'none' : 'flex'
      
      if (!isVisible) {
        // Focus the overlay for accessibility
        overlay.setAttribute('tabindex', '-1')
        overlay.focus()
      }
    }
  }

  /**
   * Hide help overlay
   */
  hideHelpOverlay() {
    const overlay = document.getElementById('keyboard-shortcuts-help')
    if (overlay) {
      overlay.style.display = 'none'
    }
  }

  /**
   * Announce action to screen readers
   * @param {Object} shortcut - Shortcut that was executed
   */
  announceAction(shortcut) {
    this.announceToScreenReader(`Executed: ${shortcut.description}`)
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   */
  announceToScreenReader(message) {
    let liveRegion = document.getElementById('shortcuts-announcer')
    
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'shortcuts-announcer'
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.style.position = 'absolute'
      liveRegion.style.left = '-10000px'
      liveRegion.style.width = '1px'
      liveRegion.style.height = '1px'
      liveRegion.style.overflow = 'hidden'
      document.body.appendChild(liveRegion)
    }
    
    liveRegion.textContent = message
  }

  /**
   * Enable or disable keyboard shortcuts
   * @param {boolean} enabled - Whether to enable shortcuts
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    this.savePreferences()
    
    this.announceToScreenReader(`Keyboard shortcuts ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Get all registered shortcuts
   * @returns {Map} Map of shortcuts
   */
  getShortcuts() {
    return new Map(this.shortcuts)
  }

  /**
   * Register a custom shortcut
   * @param {string} key - Key combination
   * @param {Object} shortcut - Shortcut configuration
   */
  registerShortcut(key, shortcut) {
    this.shortcuts.set(key, shortcut)
    this.savePreferences()
  }

  /**
   * Unregister a shortcut
   * @param {string} key - Key combination to remove
   */
  unregisterShortcut(key) {
    this.shortcuts.delete(key)
    this.savePreferences()
  }
}

// Create singleton instance
const keyboardShortcuts = new KeyboardShortcuts()

// Make it globally available
window.keyboardShortcuts = keyboardShortcuts

export default keyboardShortcuts