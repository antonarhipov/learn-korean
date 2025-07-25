/**
 * Focus Management System for Korean Learning App
 * Ensures proper focus handling and keyboard accessibility
 * Optimized for exercise interfaces and screen readers
 */

class FocusManagement {
  constructor() {
    this.focusHistory = []
    this.focusTrapStack = []
    this.skipLinks = []
    this.isEnabled = true
    this.storageKey = 'korean-learning-focus-settings'
    
    // Focus management settings
    this.settings = {
      highlightFocus: true,
      announceChanges: true,
      skipToContent: true,
      trapFocus: true,
      restoreFocus: true,
      keyboardNavigation: true
    }
    
    this.initialize()
  }

  /**
   * Initialize focus management system
   */
  initialize() {
    this.loadSettings()
    this.setupFocusStyles()
    this.setupEventListeners()
    this.createSkipLinks()
    this.enhanceExistingElements()
    
    console.log('Focus management initialized:', {
      enabled: this.isEnabled,
      settings: this.settings
    })
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem(this.storageKey)
      if (saved) {
        const savedSettings = JSON.parse(saved)
        this.settings = { ...this.settings, ...savedSettings }
        this.isEnabled = savedSettings.enabled !== false
      }
    } catch (error) {
      console.error('Error loading focus management settings:', error)
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      const settingsToSave = {
        ...this.settings,
        enabled: this.isEnabled
      }
      localStorage.setItem(this.storageKey, JSON.stringify(settingsToSave))
    } catch (error) {
      console.error('Error saving focus management settings:', error)
    }
  }

  /**
   * Setup focus styles for better visibility
   */
  setupFocusStyles() {
    const styleId = 'focus-management-styles'
    
    // Remove existing styles
    const existingStyle = document.getElementById(styleId)
    if (existingStyle) {
      existingStyle.remove()
    }
    
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      /* Enhanced focus styles */
      .focus-enhanced *:focus {
        outline: 3px solid var(--primary-color) !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 1px var(--bg-primary), 0 0 0 4px var(--primary-color) !important;
        border-radius: 4px !important;
      }
      
      /* Skip links */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: var(--bg-primary);
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
        z-index: 10000;
        transition: top 0.3s;
      }
      
      .skip-link:focus {
        top: 6px;
      }
      
      /* Focus trap container */
      .focus-trap {
        position: relative;
      }
      
      .focus-trap::before,
      .focus-trap::after {
        content: '';
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
      }
      
      /* Keyboard navigation indicators */
      .keyboard-user *:focus {
        outline: 2px solid var(--primary-color) !important;
        outline-offset: 2px !important;
      }
      
      /* Exercise interface focus styles */
      .exercise-container *:focus,
      .quiz-container *:focus,
      .flashcard-container *:focus {
        outline: 3px solid var(--success-color) !important;
        outline-offset: 2px !important;
        background-color: rgba(16, 185, 129, 0.1) !important;
      }
      
      /* Korean text focus styles */
      .korean-text:focus {
        background-color: var(--primary-color) !important;
        color: var(--bg-primary) !important;
        outline: 3px solid var(--warning-color) !important;
        outline-offset: 2px !important;
      }
      
      /* Button focus styles */
      button:focus,
      .btn:focus {
        transform: scale(1.05);
        transition: transform 0.2s ease;
      }
      
      /* Input focus styles */
      input:focus,
      textarea:focus,
      select:focus {
        border: 2px solid var(--primary-color) !important;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
      }
      
      /* Focus visible only for keyboard users */
      .js-focus-visible :focus:not(.focus-visible) {
        outline: none;
      }
      
      /* Roving tabindex styles */
      .roving-tabindex [tabindex="-1"]:focus {
        outline: 2px solid var(--secondary-color) !important;
      }
      
      /* Focus announcement styles */
      .focus-announcement {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
    `
    
    document.head.appendChild(style)
    
    // Add focus enhancement class to body if enabled
    if (this.settings.highlightFocus) {
      document.body.classList.add('focus-enhanced')
    }
  }

  /**
   * Setup event listeners for focus management
   */
  setupEventListeners() {
    // Track focus changes
    document.addEventListener('focusin', this.handleFocusIn.bind(this))
    document.addEventListener('focusout', this.handleFocusOut.bind(this))
    
    // Handle keyboard navigation
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    
    // Track mouse vs keyboard usage
    document.addEventListener('mousedown', this.handleMouseDown.bind(this))
    document.addEventListener('keydown', this.handleKeyboardUsage.bind(this))
    
    // Handle modal and dialog focus
    document.addEventListener('DOMNodeInserted', this.handleDOMChanges.bind(this))
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }

  /**
   * Handle focus in events
   * @param {FocusEvent} event - Focus event
   */
  handleFocusIn(event) {
    if (!this.isEnabled) return
    
    const element = event.target
    
    // Add to focus history
    this.addToFocusHistory(element)
    
    // Announce focus changes if enabled
    if (this.settings.announceChanges) {
      this.announceFocusChange(element)
    }
    
    // Handle roving tabindex
    this.handleRovingTabindex(element)
    
    // Ensure element is visible
    this.ensureElementVisible(element)
  }

  /**
   * Handle focus out events
   * @param {FocusEvent} event - Focus event
   */
  handleFocusOut(event) {
    if (!this.isEnabled) return
    
    // Could be used for cleanup or validation
  }

  /**
   * Handle keydown events for navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    if (!this.isEnabled || !this.settings.keyboardNavigation) return
    
    // Handle arrow key navigation in grids and lists
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      this.handleArrowKeyNavigation(event)
    }
    
    // Handle escape key for focus traps
    if (event.code === 'Escape') {
      this.handleEscapeKey(event)
    }
    
    // Handle tab key for focus traps
    if (event.code === 'Tab') {
      this.handleTabKey(event)
    }
  }

  /**
   * Handle mouse down events
   */
  handleMouseDown() {
    document.body.classList.remove('keyboard-user')
    document.body.classList.add('mouse-user')
  }

  /**
   * Handle keyboard usage
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyboardUsage(event) {
    if (event.code === 'Tab') {
      document.body.classList.remove('mouse-user')
      document.body.classList.add('keyboard-user')
    }
  }

  /**
   * Handle DOM changes for dynamic content
   * @param {Event} event - DOM mutation event
   */
  handleDOMChanges(event) {
    if (!this.isEnabled) return
    
    const element = event.target
    
    // Auto-enhance new elements
    if (element.nodeType === Node.ELEMENT_NODE) {
      this.enhanceElement(element)
      
      // Handle new modals or dialogs
      if (element.matches('.modal, .dialog, .overlay')) {
        this.setupFocusTrap(element)
      }
    }
  }

  /**
   * Handle page visibility changes
   */
  handleVisibilityChange() {
    if (document.visibilityState === 'visible' && this.settings.restoreFocus) {
      // Restore focus when page becomes visible
      this.restoreLastFocus()
    }
  }

  /**
   * Add element to focus history
   * @param {HTMLElement} element - Element to add
   */
  addToFocusHistory(element) {
    this.focusHistory.unshift({
      element,
      timestamp: Date.now(),
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      textContent: element.textContent?.substring(0, 50)
    })
    
    // Keep only last 20 focus events
    this.focusHistory = this.focusHistory.slice(0, 20)
  }

  /**
   * Announce focus changes to screen readers
   * @param {HTMLElement} element - Focused element
   */
  announceFocusChange(element) {
    let announcement = ''
    
    // Get element description
    const label = element.getAttribute('aria-label') || 
                  element.getAttribute('title') || 
                  element.textContent?.trim()
    
    const role = element.getAttribute('role') || element.tagName.toLowerCase()
    
    if (label) {
      announcement = `${role}: ${label}`
    } else {
      announcement = `${role} focused`
    }
    
    // Add state information
    if (element.getAttribute('aria-expanded')) {
      announcement += `, ${element.getAttribute('aria-expanded') === 'true' ? 'expanded' : 'collapsed'}`
    }
    
    if (element.getAttribute('aria-selected')) {
      announcement += `, ${element.getAttribute('aria-selected') === 'true' ? 'selected' : 'not selected'}`
    }
    
    if (element.disabled) {
      announcement += ', disabled'
    }
    
    this.announceToScreenReader(announcement)
  }

  /**
   * Handle roving tabindex navigation
   * @param {HTMLElement} element - Currently focused element
   */
  handleRovingTabindex(element) {
    const container = element.closest('[role="tablist"], [role="radiogroup"], [role="listbox"], .roving-tabindex')
    
    if (container) {
      // Remove tabindex from siblings
      const siblings = container.querySelectorAll('[tabindex="0"]')
      siblings.forEach(sibling => {
        if (sibling !== element) {
          sibling.setAttribute('tabindex', '-1')
        }
      })
      
      // Set current element as tabbable
      element.setAttribute('tabindex', '0')
    }
  }

  /**
   * Ensure focused element is visible in viewport
   * @param {HTMLElement} element - Element to make visible
   */
  ensureElementVisible(element) {
    const rect = element.getBoundingClientRect()
    const isVisible = rect.top >= 0 && 
                     rect.left >= 0 && 
                     rect.bottom <= window.innerHeight && 
                     rect.right <= window.innerWidth
    
    if (!isVisible) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })
    }
  }

  /**
   * Handle arrow key navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleArrowKeyNavigation(event) {
    const element = event.target
    const container = element.closest('[role="grid"], [role="listbox"], [role="tablist"], .arrow-navigation')
    
    if (!container) return
    
    const focusableElements = container.querySelectorAll('[tabindex="0"], [tabindex="-1"]')
    const currentIndex = Array.from(focusableElements).indexOf(element)
    
    if (currentIndex === -1) return
    
    let nextIndex = currentIndex
    
    switch (event.code) {
      case 'ArrowUp':
        nextIndex = Math.max(0, currentIndex - 1)
        break
      case 'ArrowDown':
        nextIndex = Math.min(focusableElements.length - 1, currentIndex + 1)
        break
      case 'ArrowLeft':
        nextIndex = Math.max(0, currentIndex - 1)
        break
      case 'ArrowRight':
        nextIndex = Math.min(focusableElements.length - 1, currentIndex + 1)
        break
    }
    
    if (nextIndex !== currentIndex) {
      event.preventDefault()
      focusableElements[nextIndex].focus()
    }
  }

  /**
   * Handle escape key for closing modals and focus traps
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleEscapeKey(event) {
    const currentTrap = this.getCurrentFocusTrap()
    
    if (currentTrap) {
      event.preventDefault()
      this.releaseFocusTrap(currentTrap)
    }
  }

  /**
   * Handle tab key for focus trapping
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleTabKey(event) {
    const currentTrap = this.getCurrentFocusTrap()
    
    if (currentTrap) {
      this.handleFocusTrapTab(event, currentTrap)
    }
  }

  /**
   * Setup focus trap for modal or dialog
   * @param {HTMLElement} container - Container to trap focus within
   * @returns {Object} Focus trap object
   */
  setupFocusTrap(container) {
    const focusableElements = this.getFocusableElements(container)
    
    if (focusableElements.length === 0) {
      console.warn('No focusable elements found in focus trap container')
      return null
    }
    
    const trap = {
      container,
      firstElement: focusableElements[0],
      lastElement: focusableElements[focusableElements.length - 1],
      previousFocus: document.activeElement,
      isActive: true
    }
    
    // Add to trap stack
    this.focusTrapStack.push(trap)
    
    // Focus first element
    trap.firstElement.focus()
    
    // Add trap class
    container.classList.add('focus-trap')
    
    return trap
  }

  /**
   * Release focus trap
   * @param {Object} trap - Focus trap to release
   */
  releaseFocusTrap(trap) {
    if (!trap || !trap.isActive) return
    
    // Remove from stack
    const index = this.focusTrapStack.indexOf(trap)
    if (index > -1) {
      this.focusTrapStack.splice(index, 1)
    }
    
    // Remove trap class
    trap.container.classList.remove('focus-trap')
    
    // Restore previous focus
    if (trap.previousFocus && this.settings.restoreFocus) {
      trap.previousFocus.focus()
    }
    
    trap.isActive = false
  }

  /**
   * Handle tab navigation within focus trap
   * @param {KeyboardEvent} event - Keyboard event
   * @param {Object} trap - Active focus trap
   */
  handleFocusTrapTab(event, trap) {
    const focusableElements = this.getFocusableElements(trap.container)
    const currentIndex = focusableElements.indexOf(document.activeElement)
    
    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (currentIndex <= 0) {
        event.preventDefault()
        focusableElements[focusableElements.length - 1].focus()
      }
    } else {
      // Tab (forward)
      if (currentIndex >= focusableElements.length - 1) {
        event.preventDefault()
        focusableElements[0].focus()
      }
    }
  }

  /**
   * Get current active focus trap
   * @returns {Object|null} Current focus trap
   */
  getCurrentFocusTrap() {
    return this.focusTrapStack[this.focusTrapStack.length - 1] || null
  }

  /**
   * Get all focusable elements within container
   * @param {HTMLElement} container - Container to search
   * @returns {Array} Array of focusable elements
   */
  getFocusableElements(container) {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')
    
    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(element => {
        return element.offsetWidth > 0 && 
               element.offsetHeight > 0 && 
               !element.hidden &&
               window.getComputedStyle(element).visibility !== 'hidden'
      })
  }

  /**
   * Create skip links for better navigation
   */
  createSkipLinks() {
    if (!this.settings.skipToContent) return
    
    const skipLinksContainer = document.createElement('div')
    skipLinksContainer.className = 'skip-links'
    skipLinksContainer.setAttribute('aria-label', 'Skip navigation links')
    
    // Main content skip link
    const skipToMain = document.createElement('a')
    skipToMain.href = '#main-content'
    skipToMain.className = 'skip-link'
    skipToMain.textContent = 'Skip to main content'
    skipLinksContainer.appendChild(skipToMain)
    
    // Navigation skip link
    const skipToNav = document.createElement('a')
    skipToNav.href = '#main-navigation'
    skipToNav.className = 'skip-link'
    skipToNav.textContent = 'Skip to navigation'
    skipLinksContainer.appendChild(skipToNav)
    
    // Search skip link
    const skipToSearch = document.createElement('a')
    skipToSearch.href = '#search'
    skipToSearch.className = 'skip-link'
    skipToSearch.textContent = 'Skip to search'
    skipLinksContainer.appendChild(skipToSearch)
    
    // Insert at beginning of body
    document.body.insertBefore(skipLinksContainer, document.body.firstChild)
    
    this.skipLinks = [skipToMain, skipToNav, skipToSearch]
  }

  /**
   * Enhance existing elements for better accessibility
   */
  enhanceExistingElements() {
    // Enhance Korean text elements
    this.enhanceKoreanTextElements()
    
    // Enhance exercise interfaces
    this.enhanceExerciseInterfaces()
    
    // Enhance form elements
    this.enhanceFormElements()
    
    // Enhance navigation elements
    this.enhanceNavigationElements()
  }

  /**
   * Enhance Korean text elements
   */
  enhanceKoreanTextElements() {
    const koreanTextElements = document.querySelectorAll('.korean-text')
    
    koreanTextElements.forEach(element => {
      // Make focusable if not already
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0')
      }
      
      // Add role if not present
      if (!element.hasAttribute('role')) {
        element.setAttribute('role', 'text')
      }
      
      // Add aria-label if not present
      if (!element.hasAttribute('aria-label') && element.textContent) {
        element.setAttribute('aria-label', `Korean text: ${element.textContent}`)
      }
      
      // Add language attribute
      element.setAttribute('lang', 'ko')
    })
  }

  /**
   * Enhance exercise interfaces
   */
  enhanceExerciseInterfaces() {
    const exerciseContainers = document.querySelectorAll('.exercise, .quiz, .flashcard')
    
    exerciseContainers.forEach(container => {
      // Add role and aria-label
      if (!container.hasAttribute('role')) {
        container.setAttribute('role', 'application')
      }
      
      if (!container.hasAttribute('aria-label')) {
        container.setAttribute('aria-label', 'Korean learning exercise')
      }
      
      // Setup roving tabindex for exercise options
      const options = container.querySelectorAll('.option, .choice, .answer')
      if (options.length > 0) {
        container.classList.add('roving-tabindex')
        
        options.forEach((option, index) => {
          option.setAttribute('tabindex', index === 0 ? '0' : '-1')
          option.setAttribute('role', 'option')
          
          if (!option.hasAttribute('aria-label')) {
            option.setAttribute('aria-label', `Option ${index + 1}: ${option.textContent}`)
          }
        })
      }
    })
  }

  /**
   * Enhance form elements
   */
  enhanceFormElements() {
    const forms = document.querySelectorAll('form')
    
    forms.forEach(form => {
      // Add form role and label
      if (!form.hasAttribute('role')) {
        form.setAttribute('role', 'form')
      }
      
      // Enhance form inputs
      const inputs = form.querySelectorAll('input, textarea, select')
      inputs.forEach(input => {
        // Associate with labels
        const label = form.querySelector(`label[for="${input.id}"]`) || 
                     input.closest('label')
        
        if (!label && !input.hasAttribute('aria-label')) {
          const placeholder = input.getAttribute('placeholder')
          if (placeholder) {
            input.setAttribute('aria-label', placeholder)
          }
        }
        
        // Add required indicator
        if (input.hasAttribute('required')) {
          input.setAttribute('aria-required', 'true')
        }
      })
    })
  }

  /**
   * Enhance navigation elements
   */
  enhanceNavigationElements() {
    const navElements = document.querySelectorAll('nav, .navigation')
    
    navElements.forEach(nav => {
      if (!nav.hasAttribute('role')) {
        nav.setAttribute('role', 'navigation')
      }
      
      if (!nav.hasAttribute('aria-label')) {
        nav.setAttribute('aria-label', 'Main navigation')
      }
      
      // Enhance nav links
      const links = nav.querySelectorAll('a')
      links.forEach(link => {
        if (link.getAttribute('aria-current') === 'page') {
          link.setAttribute('aria-label', `${link.textContent} (current page)`)
        }
      })
    })
  }

  /**
   * Enhance a single element
   * @param {HTMLElement} element - Element to enhance
   */
  enhanceElement(element) {
    // Add basic accessibility attributes if missing
    if (element.matches('button') && !element.hasAttribute('type')) {
      element.setAttribute('type', 'button')
    }
    
    if (element.matches('img') && !element.hasAttribute('alt')) {
      element.setAttribute('alt', '')
    }
    
    // Enhance interactive elements
    if (element.matches('button, a, input, select, textarea')) {
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0')
      }
    }
  }

  /**
   * Focus first focusable element in container
   * @param {HTMLElement} container - Container to search
   * @returns {boolean} Success status
   */
  focusFirstElement(container) {
    const focusableElements = this.getFocusableElements(container)
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
      return true
    }
    
    return false
  }

  /**
   * Focus last focusable element in container
   * @param {HTMLElement} container - Container to search
   * @returns {boolean} Success status
   */
  focusLastElement(container) {
    const focusableElements = this.getFocusableElements(container)
    
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus()
      return true
    }
    
    return false
  }

  /**
   * Restore focus to last focused element
   */
  restoreLastFocus() {
    if (this.focusHistory.length > 0) {
      const lastFocus = this.focusHistory[0]
      if (lastFocus.element && document.contains(lastFocus.element)) {
        lastFocus.element.focus()
      }
    }
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite' or 'assertive'
   */
  announceToScreenReader(message, priority = 'polite') {
    let liveRegion = document.getElementById('focus-announcer')
    
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'focus-announcer'
      liveRegion.className = 'focus-announcement'
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.setAttribute('aria-atomic', 'true')
      document.body.appendChild(liveRegion)
    }
    
    liveRegion.textContent = message
  }

  /**
   * Update settings
   * @param {Object} newSettings - New settings to apply
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    
    // Re-apply focus styles if highlight setting changed
    if ('highlightFocus' in newSettings) {
      if (newSettings.highlightFocus) {
        document.body.classList.add('focus-enhanced')
      } else {
        document.body.classList.remove('focus-enhanced')
      }
    }
  }

  /**
   * Get current settings
   * @returns {Object} Current settings
   */
  getSettings() {
    return { ...this.settings }
  }

  /**
   * Enable or disable focus management
   * @param {boolean} enabled - Whether to enable focus management
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    this.saveSettings()
    
    if (enabled) {
      this.setupFocusStyles()
      document.body.classList.add('focus-enhanced')
    } else {
      document.body.classList.remove('focus-enhanced', 'keyboard-user')
    }
    
    this.announceToScreenReader(`Focus management ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Get focus history
   * @returns {Array} Focus history array
   */
  getFocusHistory() {
    return [...this.focusHistory]
  }

  /**
   * Clear focus history
   */
  clearFocusHistory() {
    this.focusHistory = []
  }
}

// Create singleton instance
const focusManagement = new FocusManagement()

// Make it globally available
window.focusManagement = focusManagement

export default focusManagement