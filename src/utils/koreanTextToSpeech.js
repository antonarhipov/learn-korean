/**
 * Korean Text-to-Speech Utility
 * Provides screen reader support and audio pronunciation for Korean text
 * Supports multiple Korean voices and fallback options
 */

class KoreanTextToSpeech {
  constructor() {
    this.isSupported = 'speechSynthesis' in window
    this.voices = []
    this.koreanVoices = []
    this.currentVoice = null
    this.isInitialized = false
    
    // Default settings
    this.settings = {
      rate: 0.8,        // Slower rate for language learning
      pitch: 1.0,
      volume: 1.0,
      lang: 'ko-KR'
    }
    
    if (this.isSupported) {
      this.initialize()
    }
  }

  /**
   * Initialize the text-to-speech system
   */
  async initialize() {
    if (!this.isSupported) {
      console.warn('Speech synthesis not supported in this browser')
      return false
    }

    // Load voices
    await this.loadVoices()
    
    // Set up voice change listener
    speechSynthesis.addEventListener('voiceschanged', () => {
      this.loadVoices()
    })
    
    this.isInitialized = true
    return true
  }

  /**
   * Load available voices and filter Korean voices
   */
  async loadVoices() {
    return new Promise((resolve) => {
      const loadVoicesImpl = () => {
        this.voices = speechSynthesis.getVoices()
        
        // Filter Korean voices
        this.koreanVoices = this.voices.filter(voice => 
          voice.lang.startsWith('ko') || 
          voice.name.toLowerCase().includes('korean') ||
          voice.name.toLowerCase().includes('ko-')
        )
        
        // Set default Korean voice
        if (this.koreanVoices.length > 0 && !this.currentVoice) {
          // Prefer native Korean voices
          const nativeVoice = this.koreanVoices.find(voice => 
            voice.lang === 'ko-KR' && voice.localService
          )
          this.currentVoice = nativeVoice || this.koreanVoices[0]
        }
        
        console.log('Korean TTS initialized:', {
          totalVoices: this.voices.length,
          koreanVoices: this.koreanVoices.length,
          currentVoice: this.currentVoice?.name
        })
        
        resolve()
      }

      if (this.voices.length === 0) {
        // Voices might not be loaded yet
        setTimeout(loadVoicesImpl, 100)
      } else {
        loadVoicesImpl()
      }
    })
  }

  /**
   * Speak Korean text
   * @param {string} text - Korean text to speak
   * @param {Object} options - Speech options
   * @returns {Promise} Promise that resolves when speech is complete
   */
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        console.warn('Speech synthesis not supported')
        resolve()
        return
      }

      if (!text || text.trim() === '') {
        resolve()
        return
      }

      // Stop any current speech
      this.stop()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Apply settings
      utterance.rate = options.rate || this.settings.rate
      utterance.pitch = options.pitch || this.settings.pitch
      utterance.volume = options.volume || this.settings.volume
      utterance.lang = options.lang || this.settings.lang

      // Set voice
      if (this.currentVoice) {
        utterance.voice = this.currentVoice
      }

      // Event handlers
      utterance.onend = () => {
        resolve()
      }

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error)
        reject(new Error(`Speech synthesis failed: ${event.error}`))
      }

      utterance.onstart = () => {
        console.log('Started speaking:', text.substring(0, 50))
      }

      // Speak the text
      speechSynthesis.speak(utterance)
    })
  }

  /**
   * Speak Korean text with screen reader optimizations
   * @param {string} text - Korean text to speak
   * @param {Object} options - Speech options
   */
  speakForScreenReader(text, options = {}) {
    const screenReaderOptions = {
      rate: 0.7,  // Slower for screen readers
      pitch: 1.0,
      volume: 1.0,
      ...options
    }
    
    return this.speak(text, screenReaderOptions)
  }

  /**
   * Speak individual Korean characters (for learning)
   * @param {string} character - Single Korean character
   * @param {Object} options - Speech options
   */
  speakCharacter(character, options = {}) {
    const characterOptions = {
      rate: 0.6,  // Very slow for character learning
      pitch: 1.1,
      ...options
    }
    
    return this.speak(character, characterOptions)
  }

  /**
   * Speak Korean word with pronunciation emphasis
   * @param {string} word - Korean word to speak
   * @param {Object} options - Speech options
   */
  speakWord(word, options = {}) {
    const wordOptions = {
      rate: 0.7,
      pitch: 1.0,
      ...options
    }
    
    return this.speak(word, wordOptions)
  }

  /**
   * Speak Korean sentence with natural rhythm
   * @param {string} sentence - Korean sentence to speak
   * @param {Object} options - Speech options
   */
  speakSentence(sentence, options = {}) {
    const sentenceOptions = {
      rate: 0.8,
      pitch: 1.0,
      ...options
    }
    
    return this.speak(sentence, sentenceOptions)
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.isSupported) {
      speechSynthesis.cancel()
    }
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.isSupported) {
      speechSynthesis.pause()
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.isSupported) {
      speechSynthesis.resume()
    }
  }

  /**
   * Check if currently speaking
   * @returns {boolean}
   */
  isSpeaking() {
    return this.isSupported && speechSynthesis.speaking
  }

  /**
   * Check if speech is paused
   * @returns {boolean}
   */
  isPaused() {
    return this.isSupported && speechSynthesis.paused
  }

  /**
   * Get available Korean voices
   * @returns {Array} Array of Korean voice objects
   */
  getKoreanVoices() {
    return this.koreanVoices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default
    }))
  }

  /**
   * Set the current Korean voice
   * @param {string} voiceName - Name of the voice to use
   * @returns {boolean} Success status
   */
  setVoice(voiceName) {
    const voice = this.koreanVoices.find(v => v.name === voiceName)
    if (voice) {
      this.currentVoice = voice
      return true
    }
    return false
  }

  /**
   * Update speech settings
   * @param {Object} newSettings - New settings to apply
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings }
  }

  /**
   * Get current settings
   * @returns {Object} Current speech settings
   */
  getSettings() {
    return { ...this.settings }
  }

  /**
   * Test Korean TTS with sample text
   */
  async test() {
    const testTexts = [
      '안녕하세요',      // Hello
      '감사합니다',      // Thank you
      '한국어',          // Korean language
      '공부하다'         // To study
    ]

    console.log('Testing Korean TTS...')
    
    for (const text of testTexts) {
      try {
        console.log(`Speaking: ${text}`)
        await this.speak(text)
        await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause
      } catch (error) {
        console.error(`Failed to speak "${text}":`, error)
      }
    }
    
    console.log('Korean TTS test completed')
  }

  /**
   * Create ARIA live region for screen reader announcements
   * @param {string} text - Text to announce
   * @param {string} priority - 'polite' or 'assertive'
   */
  announceToScreenReader(text, priority = 'polite') {
    // Create or get existing live region
    let liveRegion = document.getElementById('korean-tts-live-region')
    
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'korean-tts-live-region'
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.style.position = 'absolute'
      liveRegion.style.left = '-10000px'
      liveRegion.style.width = '1px'
      liveRegion.style.height = '1px'
      liveRegion.style.overflow = 'hidden'
      document.body.appendChild(liveRegion)
    }
    
    // Update the live region
    liveRegion.textContent = text
    
    // Also speak the text if TTS is available
    if (this.isSupported) {
      this.speakForScreenReader(text)
    }
  }

  /**
   * Add pronunciation button to Korean text elements
   * @param {string} selector - CSS selector for Korean text elements
   */
  addPronunciationButtons(selector = '.korean-text') {
    const elements = document.querySelectorAll(selector)
    
    elements.forEach(element => {
      // Skip if button already exists
      if (element.querySelector('.pronunciation-btn')) {
        return
      }
      
      const button = document.createElement('button')
      button.className = 'pronunciation-btn'
      button.innerHTML = '🔊'
      button.title = 'Pronounce Korean text'
      button.setAttribute('aria-label', 'Play pronunciation')
      
      // Style the button
      button.style.marginLeft = '0.5rem'
      button.style.padding = '0.25rem'
      button.style.border = 'none'
      button.style.background = 'transparent'
      button.style.cursor = 'pointer'
      button.style.fontSize = '0.875rem'
      
      button.addEventListener('click', (e) => {
        e.preventDefault()
        const text = element.textContent.trim()
        if (text) {
          this.speak(text)
        }
      })
      
      element.appendChild(button)
    })
  }

  /**
   * Remove pronunciation buttons
   * @param {string} selector - CSS selector for elements with pronunciation buttons
   */
  removePronunciationButtons(selector = '.korean-text') {
    const buttons = document.querySelectorAll(`${selector} .pronunciation-btn`)
    buttons.forEach(button => button.remove())
  }
}

// Create singleton instance
const koreanTTS = new KoreanTextToSpeech()

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    koreanTTS.initialize()
  })
} else {
  koreanTTS.initialize()
}

export default koreanTTS