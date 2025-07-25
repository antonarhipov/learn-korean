/**
 * High Contrast Mode for Korean Characters
 * Provides enhanced visibility and readability for Korean text
 * Optimized for users with visual impairments
 */

class HighContrastMode {
  constructor() {
    this.isEnabled = false
    this.currentTheme = 'default'
    this.storageKey = 'korean-learning-high-contrast'
    
    // High contrast themes optimized for Korean characters
    this.themes = {
      default: {
        name: 'Default',
        description: 'Standard contrast'
      },
      highContrast: {
        name: 'High Contrast',
        description: 'Black text on white background',
        styles: {
          '--bg-primary': '#ffffff',
          '--bg-secondary': '#f8f9fa',
          '--bg-tertiary': '#e9ecef',
          '--text-primary': '#000000',
          '--text-secondary': '#212529',
          '--text-muted': '#495057',
          '--border-color': '#000000',
          '--primary-color': '#0000ff',
          '--success-color': '#006400',
          '--error-color': '#dc143c',
          '--warning-color': '#ff8c00',
          '--korean-text-color': '#000000',
          '--korean-text-bg': '#ffffff',
          '--korean-text-shadow': '1px 1px 2px rgba(0,0,0,0.3)'
        }
      },
      darkHighContrast: {
        name: 'Dark High Contrast',
        description: 'White text on black background',
        styles: {
          '--bg-primary': '#000000',
          '--bg-secondary': '#1a1a1a',
          '--bg-tertiary': '#2d2d2d',
          '--text-primary': '#ffffff',
          '--text-secondary': '#e0e0e0',
          '--text-muted': '#b0b0b0',
          '--border-color': '#ffffff',
          '--primary-color': '#00bfff',
          '--success-color': '#00ff00',
          '--error-color': '#ff6b6b',
          '--warning-color': '#ffd700',
          '--korean-text-color': '#ffffff',
          '--korean-text-bg': '#000000',
          '--korean-text-shadow': '1px 1px 2px rgba(255,255,255,0.3)'
        }
      },
      yellowBlack: {
        name: 'Yellow on Black',
        description: 'Yellow text on black background for maximum contrast',
        styles: {
          '--bg-primary': '#000000',
          '--bg-secondary': '#1a1a00',
          '--bg-tertiary': '#2d2d00',
          '--text-primary': '#ffff00',
          '--text-secondary': '#ffff99',
          '--text-muted': '#cccc00',
          '--border-color': '#ffff00',
          '--primary-color': '#00ffff',
          '--success-color': '#00ff00',
          '--error-color': '#ff0000',
          '--warning-color': '#ff8000',
          '--korean-text-color': '#ffff00',
          '--korean-text-bg': '#000000',
          '--korean-text-shadow': '2px 2px 4px rgba(0,0,0,0.8)'
        }
      },
      blueYellow: {
        name: 'Blue on Yellow',
        description: 'Dark blue text on yellow background',
        styles: {
          '--bg-primary': '#ffff99',
          '--bg-secondary': '#ffffcc',
          '--bg-tertiary': '#ffffe6',
          '--text-primary': '#000080',
          '--text-secondary': '#003366',
          '--text-muted': '#004080',
          '--border-color': '#000080',
          '--primary-color': '#0000ff',
          '--success-color': '#006400',
          '--error-color': '#8b0000',
          '--warning-color': '#ff6600',
          '--korean-text-color': '#000080',
          '--korean-text-bg': '#ffff99',
          '--korean-text-shadow': '1px 1px 2px rgba(0,0,0,0.2)'
        }
      }
    }
    
    this.initialize()
  }

  /**
   * Initialize high contrast mode
   */
  initialize() {
    // Load saved preference
    this.loadPreference()
    
    // Apply saved theme
    if (this.isEnabled && this.currentTheme !== 'default') {
      this.applyTheme(this.currentTheme)
    }
    
    // Add CSS for Korean text enhancements
    this.addKoreanTextStyles()
    
    console.log('High contrast mode initialized:', {
      enabled: this.isEnabled,
      theme: this.currentTheme
    })
  }

  /**
   * Load user preference from localStorage
   */
  loadPreference() {
    try {
      const saved = localStorage.getItem(this.storageKey)
      if (saved) {
        const preference = JSON.parse(saved)
        this.isEnabled = preference.enabled || false
        this.currentTheme = preference.theme || 'default'
      }
    } catch (error) {
      console.error('Error loading high contrast preference:', error)
    }
  }

  /**
   * Save user preference to localStorage
   */
  savePreference() {
    try {
      const preference = {
        enabled: this.isEnabled,
        theme: this.currentTheme
      }
      localStorage.setItem(this.storageKey, JSON.stringify(preference))
    } catch (error) {
      console.error('Error saving high contrast preference:', error)
    }
  }

  /**
   * Toggle high contrast mode
   * @param {string} themeName - Optional theme name to switch to
   */
  toggle(themeName = null) {
    if (themeName && this.themes[themeName]) {
      this.currentTheme = themeName
      this.isEnabled = themeName !== 'default'
    } else {
      this.isEnabled = !this.isEnabled
      if (!this.isEnabled) {
        this.currentTheme = 'default'
      } else if (this.currentTheme === 'default') {
        this.currentTheme = 'highContrast'
      }
    }
    
    this.applyTheme(this.currentTheme)
    this.savePreference()
    
    // Announce change to screen readers
    this.announceChange()
    
    return this.isEnabled
  }

  /**
   * Apply a specific theme
   * @param {string} themeName - Name of the theme to apply
   */
  applyTheme(themeName) {
    const theme = this.themes[themeName]
    if (!theme) {
      console.error('Unknown theme:', themeName)
      return
    }
    
    // Remove existing high contrast classes
    document.body.classList.remove('high-contrast', 'dark-high-contrast', 'yellow-black', 'blue-yellow')
    
    if (themeName === 'default') {
      // Remove all custom CSS variables
      this.removeCustomStyles()
    } else {
      // Apply theme styles
      this.applyCustomStyles(theme.styles)
      
      // Add theme-specific class
      const themeClass = themeName.replace(/([A-Z])/g, '-$1').toLowerCase()
      document.body.classList.add(themeClass)
    }
    
    // Enhance Korean text visibility
    this.enhanceKoreanText()
    
    this.currentTheme = themeName
    console.log('Applied high contrast theme:', themeName)
  }

  /**
   * Apply custom CSS variables
   * @param {Object} styles - CSS custom properties to apply
   */
  applyCustomStyles(styles) {
    const root = document.documentElement
    
    Object.entries(styles).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
  }

  /**
   * Remove custom CSS variables
   */
  removeCustomStyles() {
    const root = document.documentElement
    
    // Remove all high contrast related custom properties
    Object.keys(this.themes.highContrast.styles).forEach(property => {
      root.style.removeProperty(property)
    })
  }

  /**
   * Add CSS styles specifically for Korean text enhancement
   */
  addKoreanTextStyles() {
    const styleId = 'korean-high-contrast-styles'
    
    // Remove existing styles
    const existingStyle = document.getElementById(styleId)
    if (existingStyle) {
      existingStyle.remove()
    }
    
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      /* High contrast Korean text styles */
      .korean-text {
        font-weight: 500;
        letter-spacing: 0.02em;
        line-height: 1.6;
      }
      
      .high-contrast .korean-text,
      .dark-high-contrast .korean-text,
      .yellow-black .korean-text,
      .blue-yellow .korean-text {
        color: var(--korean-text-color, var(--text-primary));
        background-color: var(--korean-text-bg, transparent);
        text-shadow: var(--korean-text-shadow, none);
        font-weight: 600;
        letter-spacing: 0.03em;
        padding: 0.1em 0.2em;
        border-radius: 2px;
        border: 1px solid var(--border-color);
      }
      
      /* Enhanced focus styles for high contrast */
      .high-contrast *:focus,
      .dark-high-contrast *:focus,
      .yellow-black *:focus,
      .blue-yellow *:focus {
        outline: 3px solid var(--primary-color) !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 1px var(--bg-primary), 0 0 0 4px var(--primary-color) !important;
      }
      
      /* Enhanced button styles */
      .high-contrast button,
      .dark-high-contrast button,
      .yellow-black button,
      .blue-yellow button {
        border: 2px solid var(--border-color) !important;
        font-weight: 600 !important;
      }
      
      /* Enhanced link styles */
      .high-contrast a,
      .dark-high-contrast a,
      .yellow-black a,
      .blue-yellow a {
        text-decoration: underline !important;
        font-weight: 600 !important;
      }
      
      /* Enhanced form input styles */
      .high-contrast input,
      .high-contrast textarea,
      .high-contrast select,
      .dark-high-contrast input,
      .dark-high-contrast textarea,
      .dark-high-contrast select,
      .yellow-black input,
      .yellow-black textarea,
      .yellow-black select,
      .blue-yellow input,
      .blue-yellow textarea,
      .blue-yellow select {
        border: 2px solid var(--border-color) !important;
        background-color: var(--bg-primary) !important;
        color: var(--text-primary) !important;
      }
      
      /* Enhanced card and container styles */
      .high-contrast .card,
      .dark-high-contrast .card,
      .yellow-black .card,
      .blue-yellow .card {
        border: 2px solid var(--border-color) !important;
        box-shadow: 2px 2px 4px rgba(0,0,0,0.3) !important;
      }
      
      /* Korean character size adjustments */
      .korean-text-large {
        font-size: 1.25em !important;
      }
      
      .korean-text-extra-large {
        font-size: 1.5em !important;
      }
      
      .korean-text-huge {
        font-size: 2em !important;
      }
    `
    
    document.head.appendChild(style)
  }

  /**
   * Enhance Korean text elements for better visibility
   */
  enhanceKoreanText() {
    const koreanTextElements = document.querySelectorAll('.korean-text')
    
    koreanTextElements.forEach(element => {
      // Add high contrast attributes
      element.setAttribute('data-high-contrast', this.isEnabled ? 'true' : 'false')
      
      // Ensure proper ARIA labeling
      if (!element.getAttribute('aria-label') && element.textContent) {
        element.setAttribute('aria-label', `Korean text: ${element.textContent}`)
      }
    })
  }

  /**
   * Get available themes
   * @returns {Array} Array of theme objects
   */
  getAvailableThemes() {
    return Object.entries(this.themes).map(([key, theme]) => ({
      key,
      name: theme.name,
      description: theme.description,
      current: key === this.currentTheme
    }))
  }

  /**
   * Check if high contrast mode is enabled
   * @returns {boolean}
   */
  isHighContrastEnabled() {
    return this.isEnabled
  }

  /**
   * Get current theme
   * @returns {string}
   */
  getCurrentTheme() {
    return this.currentTheme
  }

  /**
   * Set Korean text size
   * @param {string} size - 'normal', 'large', 'extra-large', 'huge'
   */
  setKoreanTextSize(size = 'normal') {
    const koreanTextElements = document.querySelectorAll('.korean-text')
    
    koreanTextElements.forEach(element => {
      // Remove existing size classes
      element.classList.remove('korean-text-large', 'korean-text-extra-large', 'korean-text-huge')
      
      // Add new size class
      if (size !== 'normal') {
        element.classList.add(`korean-text-${size.replace('-', '-')}`)
      }
    })
    
    // Save preference
    try {
      const preference = JSON.parse(localStorage.getItem(this.storageKey) || '{}')
      preference.textSize = size
      localStorage.setItem(this.storageKey, JSON.stringify(preference))
    } catch (error) {
      console.error('Error saving text size preference:', error)
    }
  }

  /**
   * Create high contrast toggle button
   * @param {HTMLElement} container - Container to append the button to
   * @returns {HTMLElement} The created button element
   */
  createToggleButton(container) {
    const button = document.createElement('button')
    button.className = 'high-contrast-toggle'
    button.innerHTML = '🔆'
    button.title = 'Toggle high contrast mode'
    button.setAttribute('aria-label', 'Toggle high contrast mode for better visibility')
    
    // Style the button
    button.style.position = 'fixed'
    button.style.top = '20px'
    button.style.right = '20px'
    button.style.zIndex = '9999'
    button.style.padding = '0.5rem'
    button.style.border = '2px solid var(--border-color)'
    button.style.borderRadius = '50%'
    button.style.backgroundColor = 'var(--bg-primary)'
    button.style.color = 'var(--text-primary)'
    button.style.cursor = 'pointer'
    button.style.fontSize = '1.2rem'
    button.style.width = '50px'
    button.style.height = '50px'
    button.style.display = 'flex'
    button.style.alignItems = 'center'
    button.style.justifyContent = 'center'
    
    button.addEventListener('click', () => {
      this.toggle()
      this.updateToggleButton(button)
    })
    
    this.updateToggleButton(button)
    
    if (container) {
      container.appendChild(button)
    } else {
      document.body.appendChild(button)
    }
    
    return button
  }

  /**
   * Update toggle button appearance
   * @param {HTMLElement} button - Button element to update
   */
  updateToggleButton(button) {
    if (this.isEnabled) {
      button.innerHTML = '🔅'
      button.title = 'Disable high contrast mode'
      button.setAttribute('aria-label', 'Disable high contrast mode')
      button.style.backgroundColor = 'var(--primary-color)'
      button.style.color = 'var(--bg-primary)'
    } else {
      button.innerHTML = '🔆'
      button.title = 'Enable high contrast mode'
      button.setAttribute('aria-label', 'Enable high contrast mode for better visibility')
      button.style.backgroundColor = 'var(--bg-primary)'
      button.style.color = 'var(--text-primary)'
    }
  }

  /**
   * Create theme selector dropdown
   * @param {HTMLElement} container - Container to append the selector to
   * @returns {HTMLElement} The created select element
   */
  createThemeSelector(container) {
    const wrapper = document.createElement('div')
    wrapper.className = 'theme-selector-wrapper'
    wrapper.style.marginBottom = '1rem'
    
    const label = document.createElement('label')
    label.textContent = 'High Contrast Theme:'
    label.style.display = 'block'
    label.style.marginBottom = '0.5rem'
    label.style.fontWeight = '600'
    
    const select = document.createElement('select')
    select.className = 'theme-selector'
    select.style.width = '100%'
    select.style.padding = '0.5rem'
    select.style.border = '2px solid var(--border-color)'
    select.style.borderRadius = '4px'
    select.style.backgroundColor = 'var(--bg-primary)'
    select.style.color = 'var(--text-primary)'
    
    // Add options
    this.getAvailableThemes().forEach(theme => {
      const option = document.createElement('option')
      option.value = theme.key
      option.textContent = `${theme.name} - ${theme.description}`
      option.selected = theme.current
      select.appendChild(option)
    })
    
    select.addEventListener('change', (e) => {
      this.toggle(e.target.value)
    })
    
    label.appendChild(select)
    wrapper.appendChild(label)
    
    if (container) {
      container.appendChild(wrapper)
    }
    
    return wrapper
  }

  /**
   * Announce theme change to screen readers
   */
  announceChange() {
    const theme = this.themes[this.currentTheme]
    const message = this.isEnabled 
      ? `High contrast mode enabled: ${theme.name}`
      : 'High contrast mode disabled'
    
    // Create or update live region
    let liveRegion = document.getElementById('high-contrast-announcer')
    
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'high-contrast-announcer'
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
   * Check if user prefers reduced motion
   * @returns {boolean}
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Check if user prefers high contrast
   * @returns {boolean}
   */
  prefersHighContrast() {
    return window.matchMedia('(prefers-contrast: high)').matches
  }

  /**
   * Auto-enable high contrast based on system preferences
   */
  autoEnableBasedOnPreferences() {
    if (this.prefersHighContrast() && !this.isEnabled) {
      console.log('Auto-enabling high contrast based on system preferences')
      this.toggle('highContrast')
    }
  }
}

// Create singleton instance
const highContrastMode = new HighContrastMode()

// Auto-enable based on system preferences
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    highContrastMode.autoEnableBasedOnPreferences()
  })
} else {
  highContrastMode.autoEnableBasedOnPreferences()
}

export default highContrastMode