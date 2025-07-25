import React, { useState, useRef, useEffect } from 'react'
import { retryImageLoad, globalRetryManager } from '../utils/retryMechanism'

const ImageWithFallback = ({
  src,
  alt = '',
  fallbackText = 'Image not available',
  fallbackIcon = '🖼️',
  className = '',
  width,
  height,
  style = {},
  onError,
  onLoad,
  showFallbackText = true,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!src) {
      setIsLoading(false)
      setHasError(true)
      setRetryAttempts(0)
      return
    }

    const loadImageWithRetry = async () => {
      setIsLoading(true)
      setHasError(false)
      setIsRetrying(false)
      
      try {
        // Get retry statistics for this image
        const retryStats = globalRetryManager.getRetryStats(src)
        setRetryAttempts(retryStats.attempts)

        // Check if image has permanently failed
        if (globalRetryManager.hasPermanentlyFailed(src)) {
          setIsLoading(false)
          setHasError(true)
          if (onError) {
            onError(new Error('Image permanently failed'), src)
          }
          return
        }

        // Use sophisticated retry mechanism
        const img = await retryImageLoad(src, {
          onRetry: (attempt, delay) => {
            setIsRetrying(true)
            setRetryAttempts(attempt)
            console.log(`Retrying image load: attempt ${attempt}, delay ${delay}ms`)
          }
        })

        // Success! Update the image source
        setImageSrc(img.src)
        setIsLoading(false)
        setHasError(false)
        setIsRetrying(false)
        
        if (onLoad) {
          onLoad({ target: img })
        }

      } catch (error) {
        setIsLoading(false)
        setHasError(true)
        setIsRetrying(false)
        
        // Update retry attempts from the retry manager
        const retryStats = globalRetryManager.getRetryStats(src)
        setRetryAttempts(retryStats.attempts)
        
        console.error(`Image failed to load after retries: ${src}`, error)
        if (onError) {
          onError(error, src)
        }
      }
    }

    loadImageWithRetry()
  }, [src, onError, onLoad])

  const handleRetry = () => {
    if (!src) return
    
    // Reset the asset in the retry manager to allow fresh attempts
    globalRetryManager.resetAsset(src)
    setRetryAttempts(0)
    
    // Trigger a reload by updating the effect dependency
    const loadImageWithRetry = async () => {
      setIsLoading(true)
      setHasError(false)
      setIsRetrying(false)
      
      try {
        const img = await retryImageLoad(src, {
          onRetry: (attempt, delay) => {
            setIsRetrying(true)
            setRetryAttempts(attempt)
            console.log(`Manual retry - attempt ${attempt}, delay ${delay}ms`)
          }
        })

        setImageSrc(img.src)
        setIsLoading(false)
        setHasError(false)
        setIsRetrying(false)
        
        if (onLoad) {
          onLoad({ target: img })
        }

      } catch (error) {
        setIsLoading(false)
        setHasError(true)
        setIsRetrying(false)
        
        const retryStats = globalRetryManager.getRetryStats(src)
        setRetryAttempts(retryStats.attempts)
        
        console.error(`Manual retry failed: ${src}`, error)
        if (onError) {
          onError(error, src)
        }
      }
    }

    loadImageWithRetry()
  }

  // Fallback UI for missing or failed images
  if (hasError || !src) {
    return (
      <div 
        className={`image-fallback ${className}`}
        style={{
          width: width || style.width || '100%',
          height: height || style.height || 'auto',
          minHeight: '120px',
          ...style
        }}
        {...props}
      >
        <div className="image-fallback-content">
          <div className="image-fallback-icon">{fallbackIcon}</div>
          {showFallbackText && (
            <div className="image-fallback-text">
              <span className="image-fallback-message">{fallbackText}</span>
              {alt && (
                <div className="image-fallback-alt">
                  <strong>Description:</strong> {alt}
                </div>
              )}
            </div>
          )}
          {src && (
            <button 
              className="image-retry-btn"
              onClick={handleRetry}
              aria-label="Retry loading image"
            >
              🔄 Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`image-loading ${className}`}
        style={{
          width: width || style.width || '100%',
          height: height || style.height || 'auto',
          minHeight: '120px',
          ...style
        }}
        {...props}
      >
        <div className="image-loading-content">
          <div className="image-loading-spinner">⏳</div>
          <span>
            {isRetrying 
              ? `Retrying image load... (attempt ${retryAttempts})`
              : 'Loading image...'
            }
          </span>
        </div>
      </div>
    )
  }

  // Normal image display
  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  )
}

export default ImageWithFallback