/**
 * Content Integrity Checker
 * Validates asset files, checks for corruption, and ensures content consistency
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

class ContentIntegrityChecker {
  constructor(options = {}) {
    this.options = {
      assetsDir: 'public/assets',
      lessonsFile: 'src/data/lessons.json',
      metadataDir: 'public/assets/metadata',
      checksumFile: 'public/assets/checksums.json',
      verbose: true,
      ...options
    };
    
    this.results = {
      totalFiles: 0,
      validFiles: 0,
      corruptFiles: 0,
      missingFiles: 0,
      orphanedFiles: 0,
      metadataErrors: 0,
      checksumMismatches: 0,
      errors: []
    };
  }

  /**
   * Run complete integrity check
   */
  async checkIntegrity() {
    try {
      this.log('Starting content integrity check...');
      
      // Load lesson data and existing checksums
      const lessons = await this.loadLessons();
      const existingChecksums = await this.loadChecksums();
      
      // Get all asset files
      const assetFiles = await this.getAllAssetFiles();
      const referencedAssets = this.extractReferencedAssets(lessons);
      
      // Perform various integrity checks
      await this.checkFileIntegrity(assetFiles, existingChecksums);
      await this.checkAssetReferences(referencedAssets, assetFiles);
      await this.checkOrphanedAssets(assetFiles, referencedAssets);
      await this.checkMetadataConsistency(assetFiles);
      await this.validateAssetFormats(assetFiles);
      
      // Generate new checksums
      const newChecksums = await this.generateChecksums(assetFiles);
      await this.saveChecksums(newChecksums);
      
      // Generate report
      this.generateReport();
      
      return this.results;
      
    } catch (error) {
      this.error('Integrity check failed:', error.message);
      throw error;
    }
  }

  /**
   * Load lessons data
   */
  async loadLessons() {
    try {
      const lessonsData = await fs.readFile(this.options.lessonsFile, 'utf8');
      return JSON.parse(lessonsData);
    } catch (error) {
      throw new Error(`Failed to load lessons: ${error.message}`);
    }
  }

  /**
   * Load existing checksums
   */
  async loadChecksums() {
    try {
      const checksumData = await fs.readFile(this.options.checksumFile, 'utf8');
      return JSON.parse(checksumData);
    } catch (error) {
      this.log('No existing checksums found, will generate new ones');
      return {};
    }
  }

  /**
   * Save checksums to file
   */
  async saveChecksums(checksums) {
    try {
      await fs.mkdir(path.dirname(this.options.checksumFile), { recursive: true });
      await fs.writeFile(
        this.options.checksumFile,
        JSON.stringify(checksums, null, 2),
        'utf8'
      );
      this.log('Checksums saved successfully');
    } catch (error) {
      this.error('Failed to save checksums:', error.message);
    }
  }

  /**
   * Get all asset files recursively
   */
  async getAllAssetFiles() {
    const files = [];
    
    async function scanDirectory(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            await scanDirectory(fullPath);
          } else {
            // Skip metadata and checksum files
            if (!entry.name.endsWith('.meta.json') && entry.name !== 'checksums.json') {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
    }
    
    await scanDirectory(this.options.assetsDir);
    return files;
  }

  /**
   * Extract all asset references from lessons
   */
  extractReferencedAssets(lessonsData) {
    const assets = new Set();
    
    function extractFromObject(obj) {
      if (typeof obj === 'string' && obj.startsWith('/assets/')) {
        assets.add(obj);
      } else if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach(extractFromObject);
        } else {
          Object.values(obj).forEach(extractFromObject);
        }
      }
    }
    
    extractFromObject(lessonsData);
    return Array.from(assets);
  }

  /**
   * Check file integrity using checksums
   */
  async checkFileIntegrity(files, existingChecksums) {
    this.log('Checking file integrity...');
    
    for (const filePath of files) {
      try {
        const relativePath = path.relative(process.cwd(), filePath);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          this.results.totalFiles++;
          
          // Calculate current checksum
          const currentChecksum = await this.calculateChecksum(filePath);
          
          // Compare with existing checksum if available
          if (existingChecksums[relativePath]) {
            if (existingChecksums[relativePath].checksum !== currentChecksum) {
              this.results.checksumMismatches++;
              this.results.errors.push({
                type: 'checksum_mismatch',
                file: relativePath,
                message: 'File checksum has changed'
              });
            } else {
              this.results.validFiles++;
            }
          } else {
            // New file, consider it valid for now
            this.results.validFiles++;
          }
          
          // Additional file validation
          await this.validateFileFormat(filePath);
        }
      } catch (error) {
        this.results.corruptFiles++;
        this.results.errors.push({
          type: 'file_error',
          file: filePath,
          message: error.message
        });
      }
    }
  }

  /**
   * Check that all referenced assets exist
   */
  async checkAssetReferences(referencedAssets, existingFiles) {
    this.log('Checking asset references...');
    
    const existingFilesSet = new Set(
      existingFiles.map(f => '/' + path.relative('public', f))
    );
    
    for (const assetPath of referencedAssets) {
      if (!existingFilesSet.has(assetPath)) {
        this.results.missingFiles++;
        this.results.errors.push({
          type: 'missing_asset',
          file: assetPath,
          message: 'Referenced asset file does not exist'
        });
      }
    }
  }

  /**
   * Check for orphaned assets (not referenced in lessons)
   */
  async checkOrphanedAssets(existingFiles, referencedAssets) {
    this.log('Checking for orphaned assets...');
    
    const referencedSet = new Set(referencedAssets);
    
    for (const filePath of existingFiles) {
      const webPath = '/' + path.relative('public', filePath);
      
      if (!referencedSet.has(webPath)) {
        this.results.orphanedFiles++;
        this.results.errors.push({
          type: 'orphaned_asset',
          file: webPath,
          message: 'Asset file is not referenced in any lesson'
        });
      }
    }
  }

  /**
   * Check metadata consistency
   */
  async checkMetadataConsistency(files) {
    this.log('Checking metadata consistency...');
    
    for (const filePath of files) {
      try {
        const metadataPath = filePath + '.meta.json';
        
        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf8');
          const metadata = JSON.parse(metadataContent);
          
          // Validate required metadata fields
          const requiredFields = ['creationDate', 'creator', 'description', 'tags'];
          for (const field of requiredFields) {
            if (!metadata[field]) {
              this.results.metadataErrors++;
              this.results.errors.push({
                type: 'metadata_missing_field',
                file: filePath,
                message: `Missing required metadata field: ${field}`
              });
            }
          }
          
          // Validate metadata format
          if (metadata.creationDate && !this.isValidISO8601(metadata.creationDate)) {
            this.results.metadataErrors++;
            this.results.errors.push({
              type: 'metadata_invalid_date',
              file: filePath,
              message: 'Invalid ISO 8601 date format in metadata'
            });
          }
          
        } catch (metaError) {
          // Metadata file doesn't exist or is invalid - this might be acceptable
          this.log(`No metadata found for ${filePath}`);
        }
        
      } catch (error) {
        this.results.metadataErrors++;
        this.results.errors.push({
          type: 'metadata_error',
          file: filePath,
          message: error.message
        });
      }
    }
  }

  /**
   * Validate asset file formats
   */
  async validateAssetFormats(files) {
    this.log('Validating asset formats...');
    
    for (const filePath of files) {
      try {
        const ext = path.extname(filePath).toLowerCase();
        
        switch (ext) {
          case '.mp3':
          case '.ogg':
            await this.validateAudioFile(filePath);
            break;
          case '.jpg':
          case '.jpeg':
          case '.png':
          case '.webp':
            await this.validateImageFile(filePath);
            break;
          case '.mp4':
            await this.validateVideoFile(filePath);
            break;
          case '.svg':
            await this.validateSVGFile(filePath);
            break;
        }
      } catch (error) {
        this.results.corruptFiles++;
        this.results.errors.push({
          type: 'format_validation_error',
          file: filePath,
          message: error.message
        });
      }
    }
  }

  /**
   * Validate audio file format and integrity
   */
  async validateAudioFile(filePath) {
    try {
      // Use ffprobe to validate audio file
      const cmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
      const output = execSync(cmd, { encoding: 'utf8' });
      const info = JSON.parse(output);
      
      if (!info.streams || info.streams.length === 0) {
        throw new Error('No audio streams found');
      }
      
      const audioStream = info.streams.find(s => s.codec_type === 'audio');
      if (!audioStream) {
        throw new Error('No audio stream found');
      }
      
      // Check audio quality standards
      const sampleRate = parseInt(audioStream.sample_rate);
      if (sampleRate < 44100) {
        this.results.errors.push({
          type: 'audio_quality_warning',
          file: filePath,
          message: `Sample rate ${sampleRate}Hz is below recommended 44.1kHz`
        });
      }
      
    } catch (error) {
      throw new Error(`Audio validation failed: ${error.message}`);
    }
  }

  /**
   * Validate image file format and integrity
   */
  async validateImageFile(filePath) {
    try {
      // Use ImageMagick identify to validate image
      const cmd = `identify -ping -format "%w %h %m" "${filePath}"`;
      const output = execSync(cmd, { encoding: 'utf8' }).trim();
      const [width, height, format] = output.split(' ');
      
      if (!width || !height || !format) {
        throw new Error('Invalid image format');
      }
      
      // Check image dimensions
      const w = parseInt(width);
      const h = parseInt(height);
      
      if (w > 4000 || h > 4000) {
        this.results.errors.push({
          type: 'image_size_warning',
          file: filePath,
          message: `Image dimensions ${w}x${h} are very large`
        });
      }
      
    } catch (error) {
      throw new Error(`Image validation failed: ${error.message}`);
    }
  }

  /**
   * Validate video file format and integrity
   */
  async validateVideoFile(filePath) {
    try {
      // Use ffprobe to validate video file
      const cmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
      const output = execSync(cmd, { encoding: 'utf8' });
      const info = JSON.parse(output);
      
      if (!info.streams || info.streams.length === 0) {
        throw new Error('No streams found');
      }
      
      const videoStream = info.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        throw new Error('No video stream found');
      }
      
    } catch (error) {
      throw new Error(`Video validation failed: ${error.message}`);
    }
  }

  /**
   * Validate SVG file
   */
  async validateSVGFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Basic SVG validation
      if (!content.includes('<svg') || !content.includes('</svg>')) {
        throw new Error('Invalid SVG format');
      }
      
      // Check for potential security issues
      const dangerousElements = ['script', 'object', 'embed', 'iframe'];
      for (const element of dangerousElements) {
        if (content.includes(`<${element}`)) {
          this.results.errors.push({
            type: 'svg_security_warning',
            file: filePath,
            message: `SVG contains potentially dangerous element: ${element}`
          });
        }
      }
      
    } catch (error) {
      throw new Error(`SVG validation failed: ${error.message}`);
    }
  }

  /**
   * Validate individual file format
   */
  async validateFileFormat(filePath) {
    try {
      const stats = await fs.stat(filePath);
      
      // Check file size limits based on asset management guidelines
      const ext = path.extname(filePath).toLowerCase();
      const sizeMB = stats.size / (1024 * 1024);
      
      const sizeLimits = {
        '.mp3': 5,
        '.ogg': 5,
        '.jpg': 2,
        '.jpeg': 2,
        '.png': 2,
        '.webp': 2,
        '.mp4': 50,
        '.svg': 0.05
      };
      
      if (sizeLimits[ext] && sizeMB > sizeLimits[ext]) {
        this.results.errors.push({
          type: 'file_size_warning',
          file: filePath,
          message: `File size ${sizeMB.toFixed(2)}MB exceeds recommended limit of ${sizeLimits[ext]}MB`
        });
      }
      
    } catch (error) {
      throw new Error(`File format validation failed: ${error.message}`);
    }
  }

  /**
   * Calculate file checksum
   */
  async calculateChecksum(filePath) {
    const hash = crypto.createHash('sha256');
    const data = await fs.readFile(filePath);
    hash.update(data);
    return hash.digest('hex');
  }

  /**
   * Generate checksums for all files
   */
  async generateChecksums(files) {
    this.log('Generating checksums...');
    
    const checksums = {};
    
    for (const filePath of files) {
      try {
        const relativePath = path.relative(process.cwd(), filePath);
        const stats = await fs.stat(filePath);
        const checksum = await this.calculateChecksum(filePath);
        
        checksums[relativePath] = {
          checksum,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          generated: new Date().toISOString()
        };
      } catch (error) {
        this.error(`Failed to generate checksum for ${filePath}:`, error.message);
      }
    }
    
    return checksums;
  }

  /**
   * Validate ISO 8601 date format
   */
  isValidISO8601(dateString) {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return iso8601Regex.test(dateString);
  }

  /**
   * Generate integrity check report
   */
  generateReport() {
    console.log('\n=== Content Integrity Report ===');
    console.log(`Total files checked: ${this.results.totalFiles}`);
    console.log(`Valid files: ${this.results.validFiles}`);
    console.log(`Corrupt files: ${this.results.corruptFiles}`);
    console.log(`Missing files: ${this.results.missingFiles}`);
    console.log(`Orphaned files: ${this.results.orphanedFiles}`);
    console.log(`Metadata errors: ${this.results.metadataErrors}`);
    console.log(`Checksum mismatches: ${this.results.checksumMismatches}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n=== Issues Found ===');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.file}: ${error.message}`);
      });
    }
    
    const successRate = ((this.results.validFiles / this.results.totalFiles) * 100).toFixed(2);
    console.log(`\nIntegrity success rate: ${successRate}%`);
    console.log('===============================\n');
  }

  /**
   * Logging utilities
   */
  log(message) {
    if (this.options.verbose) {
      console.log(`[INTEGRITY] ${message}`);
    }
  }

  error(message, details = '') {
    console.error(`[ERROR] ${message}`, details);
  }
}

export default ContentIntegrityChecker;