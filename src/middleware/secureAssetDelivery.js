/**
 * Secure Asset Delivery Middleware
 * Implements secure asset serving with proper CORS policies and security headers
 */

import fs from 'fs/promises';
import path from 'path';
import mime from 'mime-types';
import ContentProtection from '../utils/contentProtection.js';

class SecureAssetDelivery {
  constructor(options = {}) {
    this.options = {
      assetsDir: 'public/assets',
      allowedOrigins: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://learn-korean.app',
        'https://www.learn-korean.app'
      ],
      allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400, // 24 hours
      enableCredentials: false,
      securityHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'; media-src 'self' data:; img-src 'self' data:;"
      },
      cacheControl: {
        images: 'public, max-age=31536000, immutable', // 1 year
        audio: 'public, max-age=31536000, immutable',   // 1 year
        videos: 'public, max-age=31536000, immutable',  // 1 year
        fonts: 'public, max-age=31536000, immutable',   // 1 year
        default: 'public, max-age=3600'                 // 1 hour
      },
      rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 1000,
        skipSuccessfulRequests: false
      },
      enableHotlinkProtection: true,
      allowedReferers: [
        'learn-korean.app',
        'www.learn-korean.app',
        'localhost'
      ],
      verbose: true,
      ...options
    };
    
    this.contentProtection = new ContentProtection();
    this.rateLimitStore = new Map();
    this.accessLog = [];
  }

  /**
   * Main middleware function for Express.js
   */
  middleware() {
    return async (req, res, next) => {
      try {
        // Check if this is an asset request
        if (!this.isAssetRequest(req.path)) {
          return next();
        }

        // Apply rate limiting
        if (!this.checkRateLimit(req)) {
          return this.sendError(res, 429, 'Too Many Requests');
        }

        // Apply CORS headers
        this.applyCORSHeaders(req, res);

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          return res.status(200).end();
        }

        // Apply security headers
        this.applySecurityHeaders(res);

        // Check hotlink protection
        if (!this.checkHotlinkProtection(req)) {
          return this.sendError(res, 403, 'Hotlinking not allowed');
        }

        // Validate and serve asset
        await this.serveAsset(req, res);

      } catch (error) {
        this.log(`Error serving asset: ${error.message}`);
        this.sendError(res, 500, 'Internal Server Error');
      }
    };
  }

  /**
   * Check if request is for an asset
   */
  isAssetRequest(path) {
    return path.startsWith('/assets/');
  }

  /**
   * Apply CORS headers
   */
  applyCORSHeaders(req, res) {
    const origin = req.headers.origin;
    
    // Check if origin is allowed
    if (this.isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (this.options.allowedOrigins.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    // Set other CORS headers
    res.setHeader('Access-Control-Allow-Methods', this.options.allowedMethods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', this.options.allowedHeaders.join(', '));
    res.setHeader('Access-Control-Max-Age', this.options.maxAge.toString());
    
    if (this.options.enableCredentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Vary header for proper caching
    res.setHeader('Vary', 'Origin');
  }

  /**
   * Check if origin is allowed
   */
  isOriginAllowed(origin) {
    if (!origin) return true; // Allow requests without origin (same-origin)
    
    return this.options.allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === '*') return true;
      if (allowedOrigin === origin) return true;
      
      // Support wildcard subdomains
      if (allowedOrigin.startsWith('*.')) {
        const domain = allowedOrigin.slice(2);
        return origin.endsWith(domain);
      }
      
      return false;
    });
  }

  /**
   * Apply security headers
   */
  applySecurityHeaders(res) {
    Object.entries(this.options.securityHeaders).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
  }

  /**
   * Check rate limiting
   */
  checkRateLimit(req) {
    const clientId = this.getClientId(req);
    const now = Date.now();
    const windowStart = now - this.options.rateLimiting.windowMs;
    
    // Clean up old entries
    this.cleanupRateLimitStore(windowStart);
    
    // Get current requests for this client
    const clientRequests = this.rateLimitStore.get(clientId) || [];
    const recentRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (recentRequests.length >= this.options.rateLimiting.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.rateLimitStore.set(clientId, recentRequests);
    
    return true;
  }

  /**
   * Get client identifier for rate limiting
   */
  getClientId(req) {
    // Use IP address as client identifier
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  }

  /**
   * Clean up old rate limit entries
   */
  cleanupRateLimitStore(windowStart) {
    for (const [clientId, requests] of this.rateLimitStore.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > windowStart);
      if (recentRequests.length === 0) {
        this.rateLimitStore.delete(clientId);
      } else {
        this.rateLimitStore.set(clientId, recentRequests);
      }
    }
  }

  /**
   * Check hotlink protection
   */
  checkHotlinkProtection(req) {
    if (!this.options.enableHotlinkProtection) {
      return true;
    }

    const referer = req.headers.referer || req.headers.referrer;
    
    // Allow requests without referer (direct access, bookmarks, etc.)
    if (!referer) {
      return true;
    }

    // Check if referer is allowed
    try {
      const refererUrl = new URL(referer);
      const refererHost = refererUrl.hostname;
      
      return this.options.allowedReferers.some(allowedReferer => {
        return refererHost === allowedReferer || refererHost.endsWith('.' + allowedReferer);
      });
    } catch (error) {
      // Invalid referer URL
      return false;
    }
  }

  /**
   * Serve asset file
   */
  async serveAsset(req, res) {
    try {
      const assetPath = this.getAssetPath(req.path);
      
      // Check if file exists
      const stats = await fs.stat(assetPath);
      if (!stats.isFile()) {
        return this.sendError(res, 404, 'Asset not found');
      }

      // Get file info
      const mimeType = mime.lookup(assetPath) || 'application/octet-stream';
      const fileSize = stats.size;
      const lastModified = stats.mtime;

      // Set content type
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', fileSize.toString());
      res.setHeader('Last-Modified', lastModified.toUTCString());

      // Set cache control headers
      const cacheControl = this.getCacheControl(assetPath);
      res.setHeader('Cache-Control', cacheControl);

      // Set ETag for caching
      const etag = this.generateETag(stats);
      res.setHeader('ETag', etag);

      // Check if client has cached version
      if (this.isNotModified(req, lastModified, etag)) {
        return res.status(304).end();
      }

      // Handle range requests for media files
      if (this.isMediaFile(assetPath) && req.headers.range) {
        return this.serveRangeRequest(req, res, assetPath, fileSize);
      }

      // Log access
      this.logAccess(req, assetPath, 200);

      // Stream file to response
      const fileStream = await fs.readFile(assetPath);
      res.status(200).send(fileStream);

    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logAccess(req, req.path, 404);
        return this.sendError(res, 404, 'Asset not found');
      }
      
      this.log(`Error serving asset ${req.path}: ${error.message}`);
      this.logAccess(req, req.path, 500);
      return this.sendError(res, 500, 'Internal Server Error');
    }
  }

  /**
   * Get full asset path
   */
  getAssetPath(requestPath) {
    // Remove /assets prefix and resolve to file system path
    const relativePath = requestPath.replace(/^\/assets\//, '');
    return path.join(this.options.assetsDir, relativePath);
  }

  /**
   * Get appropriate cache control header
   */
  getCacheControl(assetPath) {
    const ext = path.extname(assetPath).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
      return this.options.cacheControl.images;
    } else if (['.mp3', '.ogg', '.wav'].includes(ext)) {
      return this.options.cacheControl.audio;
    } else if (['.mp4', '.webm'].includes(ext)) {
      return this.options.cacheControl.videos;
    } else if (['.woff', '.woff2', '.ttf', '.otf'].includes(ext)) {
      return this.options.cacheControl.fonts;
    }
    
    return this.options.cacheControl.default;
  }

  /**
   * Generate ETag for file
   */
  generateETag(stats) {
    const mtime = stats.mtime.getTime().toString(16);
    const size = stats.size.toString(16);
    return `"${size}-${mtime}"`;
  }

  /**
   * Check if client has cached version
   */
  isNotModified(req, lastModified, etag) {
    const ifModifiedSince = req.headers['if-modified-since'];
    const ifNoneMatch = req.headers['if-none-match'];

    if (ifNoneMatch && ifNoneMatch === etag) {
      return true;
    }

    if (ifModifiedSince) {
      const clientDate = new Date(ifModifiedSince);
      if (clientDate >= lastModified) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if file is a media file
   */
  isMediaFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ['.mp3', '.ogg', '.wav', '.mp4', '.webm'].includes(ext);
  }

  /**
   * Serve range request for media files
   */
  async serveRangeRequest(req, res, filePath, fileSize) {
    const range = req.headers.range;
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = (end - start) + 1;

    if (start >= fileSize || end >= fileSize) {
      res.setHeader('Content-Range', `bytes */${fileSize}`);
      return this.sendError(res, 416, 'Range Not Satisfiable');
    }

    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', chunkSize.toString());
    res.status(206);

    // Read and send the requested chunk
    const fileHandle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(chunkSize);
    await fileHandle.read(buffer, 0, chunkSize, start);
    await fileHandle.close();

    this.logAccess(req, filePath, 206);
    res.send(buffer);
  }

  /**
   * Send error response
   */
  sendError(res, statusCode, message) {
    res.status(statusCode).json({
      error: message,
      statusCode
    });
  }

  /**
   * Log asset access
   */
  logAccess(req, assetPath, statusCode) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: this.getClientId(req),
      method: req.method,
      path: req.path,
      assetPath,
      statusCode,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer || req.headers.referrer
    };

    this.accessLog.push(logEntry);

    // Keep only last 1000 entries
    if (this.accessLog.length > 1000) {
      this.accessLog.shift();
    }

    if (this.options.verbose) {
      this.log(`${req.method} ${req.path} - ${statusCode} - ${this.getClientId(req)}`);
    }
  }

  /**
   * Get access statistics
   */
  getAccessStats() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    const recentAccess = this.accessLog.filter(entry => 
      new Date(entry.timestamp).getTime() > oneHourAgo
    );

    const dailyAccess = this.accessLog.filter(entry => 
      new Date(entry.timestamp).getTime() > oneDayAgo
    );

    return {
      totalRequests: this.accessLog.length,
      hourlyRequests: recentAccess.length,
      dailyRequests: dailyAccess.length,
      uniqueIPs: new Set(this.accessLog.map(entry => entry.ip)).size,
      topAssets: this.getTopAssets(),
      statusCodes: this.getStatusCodeStats()
    };
  }

  /**
   * Get most requested assets
   */
  getTopAssets(limit = 10) {
    const assetCounts = new Map();
    
    for (const entry of this.accessLog) {
      if (entry.statusCode === 200 || entry.statusCode === 206) {
        const current = assetCounts.get(entry.path) || 0;
        assetCounts.set(entry.path, current + 1);
      }
    }

    return Array.from(assetCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([path, count]) => ({ path, requests: count }));
  }

  /**
   * Get status code statistics
   */
  getStatusCodeStats() {
    const statusCounts = new Map();
    
    for (const entry of this.accessLog) {
      const current = statusCounts.get(entry.statusCode) || 0;
      statusCounts.set(entry.statusCode, current + 1);
    }

    return Object.fromEntries(statusCounts);
  }

  /**
   * Logging utility
   */
  log(message) {
    if (this.options.verbose) {
      console.log(`[ASSET-DELIVERY] ${message}`);
    }
  }
}

export default SecureAssetDelivery;