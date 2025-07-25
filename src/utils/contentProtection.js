/**
 * Content Protection System
 * Implements basic content protection measures for Korean Learning App assets
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

class ContentProtection {
  constructor(options = {}) {
    this.options = {
      watermarkText: 'Korean Learning App',
      watermarkOpacity: 0.3,
      watermarkPosition: 'bottom-right',
      encryptionKey: process.env.CONTENT_ENCRYPTION_KEY || 'default-key-change-in-production',
      protectedExtensions: ['.mp3', '.mp4', '.jpg', '.png'],
      maxDownloads: 5,
      sessionTimeout: 3600000, // 1 hour
      verbose: true,
      ...options
    };
    
    this.accessLog = new Map();
    this.downloadCounts = new Map();
  }

  /**
   * Apply watermark to images
   */
  async watermarkImage(inputPath, outputPath = null) {
    try {
      const output = outputPath || inputPath.replace(/(\.[^.]+)$/, '_watermarked$1');
      
      // Create watermark command using ImageMagick
      let cmd = `convert "${inputPath}"`;
      
      // Add semi-transparent watermark
      cmd += ` -gravity ${this.getGravityFromPosition(this.options.watermarkPosition)}`;
      cmd += ` -pointsize 24 -fill "rgba(255,255,255,${this.options.watermarkOpacity})"`;
      cmd += ` -annotate +10+10 "${this.options.watermarkText}"`;
      cmd += ` "${output}"`;
      
      execSync(cmd, { stdio: 'ignore' });
      
      this.log(`Watermarked image: ${path.basename(inputPath)}`);
      return output;
      
    } catch (error) {
      throw new Error(`Failed to watermark image: ${error.message}`);
    }
  }

  /**
   * Apply watermark to videos
   */
  async watermarkVideo(inputPath, outputPath = null) {
    try {
      const output = outputPath || inputPath.replace(/(\.[^.]+)$/, '_watermarked$1');
      
      // Create watermark overlay using FFmpeg
      let cmd = `ffmpeg -i "${inputPath}" -y`;
      cmd += ` -vf "drawtext=text='${this.options.watermarkText}':fontcolor=white@${this.options.watermarkOpacity}:fontsize=24:x=w-tw-10:y=h-th-10"`;
      cmd += ` -codec:a copy "${output}"`;
      
      execSync(cmd, { stdio: 'ignore' });
      
      this.log(`Watermarked video: ${path.basename(inputPath)}`);
      return output;
      
    } catch (error) {
      throw new Error(`Failed to watermark video: ${error.message}`);
    }
  }

  /**
   * Encrypt sensitive content files
   */
  async encryptFile(inputPath, outputPath = null) {
    try {
      const output = outputPath || inputPath + '.encrypted';
      const key = crypto.scryptSync(this.options.encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipher('aes-256-cbc', key);
      const input = await fs.readFile(inputPath);
      
      let encrypted = cipher.update(input);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      // Prepend IV to encrypted data
      const result = Buffer.concat([iv, encrypted]);
      await fs.writeFile(output, result);
      
      this.log(`Encrypted file: ${path.basename(inputPath)}`);
      return output;
      
    } catch (error) {
      throw new Error(`Failed to encrypt file: ${error.message}`);
    }
  }

  /**
   * Decrypt content files
   */
  async decryptFile(inputPath, outputPath = null) {
    try {
      const output = outputPath || inputPath.replace('.encrypted', '');
      const key = crypto.scryptSync(this.options.encryptionKey, 'salt', 32);
      
      const encryptedData = await fs.readFile(inputPath);
      const iv = encryptedData.slice(0, 16);
      const encrypted = encryptedData.slice(16);
      
      const decipher = crypto.createDecipher('aes-256-cbc', key);
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      await fs.writeFile(output, decrypted);
      
      this.log(`Decrypted file: ${path.basename(inputPath)}`);
      return output;
      
    } catch (error) {
      throw new Error(`Failed to decrypt file: ${error.message}`);
    }
  }

  /**
   * Generate secure access token for protected content
   */
  generateAccessToken(userId, contentId, expiresIn = 3600) {
    const payload = {
      userId,
      contentId,
      timestamp: Date.now(),
      expiresAt: Date.now() + (expiresIn * 1000)
    };
    
    const token = crypto
      .createHmac('sha256', this.options.encryptionKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return {
      token,
      payload: Buffer.from(JSON.stringify(payload)).toString('base64')
    };
  }

  /**
   * Validate access token
   */
  validateAccessToken(token, payload) {
    try {
      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
      
      // Check if token is expired
      if (Date.now() > decodedPayload.expiresAt) {
        return { valid: false, reason: 'Token expired' };
      }
      
      // Verify token signature
      const expectedToken = crypto
        .createHmac('sha256', this.options.encryptionKey)
        .update(JSON.stringify(decodedPayload))
        .digest('hex');
      
      if (token !== expectedToken) {
        return { valid: false, reason: 'Invalid token signature' };
      }
      
      return { valid: true, payload: decodedPayload };
      
    } catch (error) {
      return { valid: false, reason: 'Invalid token format' };
    }
  }

  /**
   * Check download limits for user
   */
  checkDownloadLimit(userId, contentId) {
    const key = `${userId}:${contentId}`;
    const current = this.downloadCounts.get(key) || 0;
    
    if (current >= this.options.maxDownloads) {
      return { allowed: false, remaining: 0 };
    }
    
    return { allowed: true, remaining: this.options.maxDownloads - current };
  }

  /**
   * Record download attempt
   */
  recordDownload(userId, contentId, success = true) {
    const key = `${userId}:${contentId}`;
    const current = this.downloadCounts.get(key) || 0;
    
    if (success) {
      this.downloadCounts.set(key, current + 1);
    }
    
    // Log access attempt
    this.accessLog.set(key, {
      userId,
      contentId,
      timestamp: Date.now(),
      success,
      downloads: this.downloadCounts.get(key) || 0
    });
  }

  /**
   * Apply content protection to a file
   */
  async protectContent(inputPath, options = {}) {
    const ext = path.extname(inputPath).toLowerCase();
    const protectionOptions = { ...this.options, ...options };
    
    if (!this.options.protectedExtensions.includes(ext)) {
      this.log(`Skipping protection for ${inputPath} - extension not in protected list`);
      return inputPath;
    }
    
    try {
      let protectedPath = inputPath;
      
      // Apply watermarking for images and videos
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        protectedPath = await this.watermarkImage(inputPath);
      } else if (['.mp4'].includes(ext)) {
        protectedPath = await this.watermarkVideo(inputPath);
      }
      
      // Apply encryption for premium content
      if (protectionOptions.encrypt) {
        protectedPath = await this.encryptFile(protectedPath);
      }
      
      this.log(`Protected content: ${path.basename(inputPath)}`);
      return protectedPath;
      
    } catch (error) {
      this.error(`Failed to protect content ${inputPath}:`, error.message);
      throw error;
    }
  }

  /**
   * Batch protect multiple files
   */
  async protectBatch(inputPaths, options = {}) {
    const results = [];
    
    for (const inputPath of inputPaths) {
      try {
        const protectedPath = await this.protectContent(inputPath, options);
        results.push({ input: inputPath, output: protectedPath, success: true });
      } catch (error) {
        results.push({ input: inputPath, error: error.message, success: false });
      }
    }
    
    return results;
  }

  /**
   * Generate content fingerprint for piracy detection
   */
  async generateFingerprint(filePath) {
    try {
      const data = await fs.readFile(filePath);
      const hash = crypto.createHash('sha256').update(data).digest('hex');
      
      // Create additional metadata fingerprint
      const stats = await fs.stat(filePath);
      const metadata = {
        size: stats.size,
        modified: stats.mtime.toISOString(),
        hash: hash.substring(0, 16), // Shortened hash for performance
        filename: path.basename(filePath)
      };
      
      const fingerprint = crypto
        .createHash('md5')
        .update(JSON.stringify(metadata))
        .digest('hex');
      
      return {
        fingerprint,
        metadata,
        fullHash: hash
      };
      
    } catch (error) {
      throw new Error(`Failed to generate fingerprint: ${error.message}`);
    }
  }

  /**
   * Create protected asset manifest
   */
  async createAssetManifest(assetPaths) {
    const manifest = {
      version: '1.0.0',
      created: new Date().toISOString(),
      assets: [],
      protection: {
        watermarked: true,
        encrypted: false,
        fingerprinted: true
      }
    };
    
    for (const assetPath of assetPaths) {
      try {
        const fingerprint = await this.generateFingerprint(assetPath);
        const relativePath = path.relative(process.cwd(), assetPath);
        
        manifest.assets.push({
          path: relativePath,
          fingerprint: fingerprint.fingerprint,
          hash: fingerprint.fullHash,
          size: fingerprint.metadata.size,
          protected: this.options.protectedExtensions.includes(path.extname(assetPath))
        });
      } catch (error) {
        this.error(`Failed to process asset ${assetPath}:`, error.message);
      }
    }
    
    return manifest;
  }

  /**
   * Verify asset integrity against manifest
   */
  async verifyAssetIntegrity(manifestPath) {
    try {
      const manifestData = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestData);
      
      const results = {
        total: manifest.assets.length,
        valid: 0,
        modified: 0,
        missing: 0,
        errors: []
      };
      
      for (const asset of manifest.assets) {
        try {
          const assetPath = path.resolve(asset.path);
          const currentFingerprint = await this.generateFingerprint(assetPath);
          
          if (currentFingerprint.fullHash === asset.hash) {
            results.valid++;
          } else {
            results.modified++;
            results.errors.push({
              type: 'modified',
              path: asset.path,
              message: 'Asset has been modified'
            });
          }
        } catch (error) {
          results.missing++;
          results.errors.push({
            type: 'missing',
            path: asset.path,
            message: 'Asset file not found'
          });
        }
      }
      
      return results;
      
    } catch (error) {
      throw new Error(`Failed to verify asset integrity: ${error.message}`);
    }
  }

  /**
   * Clean up expired access tokens and download counts
   */
  cleanupExpiredData() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, data] of this.accessLog.entries()) {
      if (now - data.timestamp > this.options.sessionTimeout) {
        this.accessLog.delete(key);
        this.downloadCounts.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.log(`Cleaned up ${cleaned} expired access records`);
    }
  }

  /**
   * Get access statistics
   */
  getAccessStats() {
    const stats = {
      totalSessions: this.accessLog.size,
      totalDownloads: Array.from(this.downloadCounts.values()).reduce((a, b) => a + b, 0),
      activeUsers: new Set(Array.from(this.accessLog.values()).map(d => d.userId)).size,
      topContent: this.getTopAccessedContent()
    };
    
    return stats;
  }

  /**
   * Get most accessed content
   */
  getTopAccessedContent(limit = 10) {
    const contentAccess = new Map();
    
    for (const data of this.accessLog.values()) {
      const current = contentAccess.get(data.contentId) || 0;
      contentAccess.set(data.contentId, current + 1);
    }
    
    return Array.from(contentAccess.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([contentId, count]) => ({ contentId, accessCount: count }));
  }

  /**
   * Convert position string to ImageMagick gravity
   */
  getGravityFromPosition(position) {
    const gravityMap = {
      'top-left': 'NorthWest',
      'top-center': 'North',
      'top-right': 'NorthEast',
      'center-left': 'West',
      'center': 'Center',
      'center-right': 'East',
      'bottom-left': 'SouthWest',
      'bottom-center': 'South',
      'bottom-right': 'SouthEast'
    };
    
    return gravityMap[position] || 'SouthEast';
  }

  /**
   * Logging utilities
   */
  log(message) {
    if (this.options.verbose) {
      console.log(`[PROTECTION] ${message}`);
    }
  }

  error(message, details = '') {
    console.error(`[ERROR] ${message}`, details);
  }
}

export default ContentProtection;