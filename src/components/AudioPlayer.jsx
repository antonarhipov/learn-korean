import React, { useState, useRef, useEffect } from 'react'
import { retryAudioLoad, globalRetryManager } from '../utils/retryMechanism'
import { usePerformanceMonitor } from '../utils/performanceMonitor'

const AudioPlayer = ({ 
  src, 
  text = '', 
  fallbackText = 'Audio not available',
  showControls = true,
  autoPlay = false,
  className = '',
  onError,
  onLoad
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const audioRef = useRef(null)
  const { measureAsync } = usePerformanceMonitor('AudioPlayer')

  // Monitor audio loading performance
  useEffect(() => {
    if (src && !hasError && !isLoading) {
      measureAsync('audio_ready', async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
        return `Audio ready: ${src}`
      })
    }
  }, [src, hasError, isLoading, measureAsync])

  useEffect(() => {
    if (!src) {
      setIsLoading(false)
      setHasError(true)
      setRetryAttempts(0)
      return
    }

    const loadAudioWithRetry = async () => {
      setIsLoading(true)
      setHasError(false)
      setIsRetrying(false)
      
      try {
        // Get retry statistics for this audio file
        const retryStats = globalRetryManager.getRetryStats(src)
        setRetryAttempts(retryStats.attempts)

        // Check if audio has permanently failed
        if (globalRetryManager.hasPermanentlyFailed(src)) {
          setIsLoading(false)
          setHasError(true)
          if (onError) {
            onError(new Error('Audio permanently failed'), src)
          }
          return
        }

        // Use sophisticated retry mechanism
        const audio = await retryAudioLoad(src, {
          onRetry: (attempt, delay) => {
            setIsRetrying(true)
            setRetryAttempts(attempt)
            console.log(`Retrying audio load: attempt ${attempt}, delay ${delay}ms`)
          }
        })

        // Success! Set up the audio element
        if (audioRef.current) {
          const currentAudio = audioRef.current
          
          // Copy the successfully loaded audio properties
          currentAudio.src = audio.src
          currentAudio.load()

          const handleCanPlayThrough = () => {
            setIsLoading(false)
            setHasError(false)
            setIsRetrying(false)
            setDuration(currentAudio.duration)
            if (onLoad) {
              onLoad(currentAudio)
            }
          }

          const handleTimeUpdate = () => {
            setCurrentTime(currentAudio.currentTime)
          }

          const handlePlay = () => {
            setIsPlaying(true)
          }

          const handlePause = () => {
            setIsPlaying(false)
          }

          const handleEnded = () => {
            setIsPlaying(false)
            setCurrentTime(0)
          }

          const handleError = (e) => {
            console.warn(`Audio playback error: ${src}`, e)
            // Don't set hasError for playback errors, only loading errors
          }

          // Add event listeners
          currentAudio.addEventListener('canplaythrough', handleCanPlayThrough)
          currentAudio.addEventListener('timeupdate', handleTimeUpdate)
          currentAudio.addEventListener('play', handlePlay)
          currentAudio.addEventListener('pause', handlePause)
          currentAudio.addEventListener('ended', handleEnded)
          currentAudio.addEventListener('error', handleError)

          // Cleanup function
          return () => {
            currentAudio.removeEventListener('canplaythrough', handleCanPlayThrough)
            currentAudio.removeEventListener('timeupdate', handleTimeUpdate)
            currentAudio.removeEventListener('play', handlePlay)
            currentAudio.removeEventListener('pause', handlePause)
            currentAudio.removeEventListener('ended', handleEnded)
            currentAudio.removeEventListener('error', handleError)
          }
        }

      } catch (error) {
        setIsLoading(false)
        setHasError(true)
        setIsRetrying(false)
        
        // Update retry attempts from the retry manager
        const retryStats = globalRetryManager.getRetryStats(src)
        setRetryAttempts(retryStats.attempts)
        
        console.error(`Audio failed to load after retries: ${src}`, error)
        if (onError) {
          onError(error, src)
        }
      }
    }

    loadAudioWithRetry()
  }, [src, onError, onLoad])

  const handlePlayPause = () => {
    const audio = audioRef.current
    if (!audio || hasError) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch((e) => {
        console.warn('Audio play failed:', e)
        setHasError(true)
      })
    }
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio || hasError) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    audio.currentTime = percent * duration
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Fallback UI for missing or failed audio
  if (hasError || !src) {
    return (
      <div className={`audio-player audio-player-fallback ${className}`}>
        <div className="audio-fallback-content">
          <div className="audio-fallback-icon">🔇</div>
          <div className="audio-fallback-text">
            <span className="audio-fallback-message">{fallbackText}</span>
            {text && (
              <div className="audio-fallback-transcript">
                <strong>Text:</strong> {text}
              </div>
            )}
          </div>
        </div>
        {showControls && (
          <div className="audio-controls-disabled">
            <button className="audio-btn audio-btn-disabled" disabled>
              ▶️
            </button>
            <span className="audio-status">Audio unavailable</span>
          </div>
        )}
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`audio-player audio-player-loading ${className}`}>
        <div className="audio-loading-content">
          <div className="audio-loading-spinner">⏳</div>
          <span>
            {isRetrying 
              ? `Retrying audio load... (attempt ${retryAttempts})`
              : 'Loading audio...'
            }
          </span>
        </div>
      </div>
    )
  }

  // Normal audio player UI
  return (
    <div className={`audio-player ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        autoPlay={autoPlay}
      />
      
      {text && (
        <div className="audio-transcript">
          <strong>Text:</strong> {text}
        </div>
      )}

      {showControls && (
        <div className="audio-controls">
          <button 
            className={`audio-btn audio-btn-play ${isPlaying ? 'playing' : ''}`}
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <div className="audio-progress-container">
            <div 
              className="audio-progress-bar"
              onClick={handleSeek}
            >
              <div 
                className="audio-progress-fill"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="audio-time">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioPlayer