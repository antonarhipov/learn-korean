#!/usr/bin/env node

/**
 * Asset Optimization Pipeline
 * Automated compression, format conversion, and optimization for Korean Learning App assets
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Input and output directories
  inputDir: 'assets-source',
  outputDir: 'public/assets',
  
  // Image optimization settings
  images: {
    quality: {
      jpeg: 85,
      webp: 80,
      avif: 70
    },
    maxWidth: 1920,
    maxHeight: 1080,
    formats: ['jpeg', 'webp'], // Output formats
    preserveOriginal: true
  },
  
  // Audio optimization settings
  audio: {
    bitrate: '128k',
    sampleRate: 44100,
    channels: 1, // Mono for speech
    formats: ['mp3', 'ogg'],
    normalize: true,
    removeNoise: true
  },
  
  // Video optimization settings
  video: {
    codec: 'libx264',
    bitrate: '2M',
    maxWidth: 1920,
    maxHeight: 1080,
    fps: 30,
    formats: ['mp4'],
    audioCodec: 'aac',
    audioBitrate: '128k'
  },
  
  // General settings
  parallel: 4, // Number of parallel processes
  verbose: true,
  dryRun: false
};

class AssetOptimizer {
  constructor(config = CONFIG) {
    this.config = config;
    this.stats = {
      processed: 0,
      errors: 0,
      sizeSaved: 0,
      startTime: Date.now()
    };
  }

  /**
   * Main optimization process
   */
  async optimize() {
    try {
      this.log('Starting asset optimization pipeline...');
      
      // Check dependencies
      await this.checkDependencies();
      
      // Create output directories
      await this.createOutputDirectories();
      
      // Process all asset types
      await this.processImages();
      await this.processAudio();
      await this.processVideos();
      
      // Generate optimization report
      this.generateReport();
      
    } catch (error) {
      this.error('Optimization failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Check if required tools are installed
   */
  async checkDependencies() {
    const dependencies = [
      { cmd: 'ffmpeg -version', name: 'FFmpeg' },
      { cmd: 'convert -version', name: 'ImageMagick' }
    ];

    for (const dep of dependencies) {
      try {
        execSync(dep.cmd, { stdio: 'ignore' });
        this.log(`✓ ${dep.name} is available`);
      } catch (error) {
        throw new Error(`${dep.name} is required but not installed`);
      }
    }
  }

  /**
   * Create output directory structure
   */
  async createOutputDirectories() {
    const dirs = [
      'audio/lessons',
      'audio/exercises', 
      'audio/pronunciation',
      'audio/ui',
      'images/lessons',
      'images/exercises',
      'images/ui',
      'images/charts',
      'videos/lessons',
      'videos/tutorials',
      'fonts/korean'
    ];

    for (const dir of dirs) {
      const fullPath = path.join(this.config.outputDir, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }
    
    this.log('Output directories created');
  }

  /**
   * Process and optimize images
   */
  async processImages() {
    this.log('Processing images...');
    
    const imageDir = path.join(this.config.inputDir, 'images');
    const images = await this.findFiles(imageDir, /\.(jpg|jpeg|png|gif|svg)$/i);
    
    for (const imagePath of images) {
      await this.optimizeImage(imagePath);
    }
  }

  /**
   * Optimize individual image
   */
  async optimizeImage(inputPath) {
    try {
      const relativePath = path.relative(path.join(this.config.inputDir, 'images'), inputPath);
      const outputDir = path.join(this.config.outputDir, 'images', path.dirname(relativePath));
      const baseName = path.parse(inputPath).name;
      const ext = path.parse(inputPath).ext.toLowerCase();
      
      await fs.mkdir(outputDir, { recursive: true });
      
      // Skip SVG files (copy as-is)
      if (ext === '.svg') {
        const outputPath = path.join(outputDir, path.basename(inputPath));
        await fs.copyFile(inputPath, outputPath);
        this.log(`Copied SVG: ${relativePath}`);
        return;
      }
      
      const originalSize = (await fs.stat(inputPath)).size;
      
      // Generate optimized versions in different formats
      for (const format of this.config.images.formats) {
        const outputPath = path.join(outputDir, `${baseName}.${format}`);
        
        let cmd;
        if (format === 'webp') {
          cmd = `convert "${inputPath}" -quality ${this.config.images.quality.webp} -resize ${this.config.images.maxWidth}x${this.config.images.maxHeight}> "${outputPath}"`;
        } else if (format === 'avif') {
          cmd = `convert "${inputPath}" -quality ${this.config.images.quality.avif} -resize ${this.config.images.maxWidth}x${this.config.images.maxHeight}> "${outputPath}"`;
        } else {
          cmd = `convert "${inputPath}" -quality ${this.config.images.quality.jpeg} -resize ${this.config.images.maxWidth}x${this.config.images.maxHeight}> "${outputPath}"`;
        }
        
        if (!this.config.dryRun) {
          execSync(cmd, { stdio: 'ignore' });
          const optimizedSize = (await fs.stat(outputPath)).size;
          this.stats.sizeSaved += Math.max(0, originalSize - optimizedSize);
        }
        
        this.log(`Optimized: ${relativePath} -> ${format}`);
      }
      
      this.stats.processed++;
      
    } catch (error) {
      this.error(`Failed to optimize image ${inputPath}:`, error.message);
      this.stats.errors++;
    }
  }

  /**
   * Process and optimize audio files
   */
  async processAudio() {
    this.log('Processing audio files...');
    
    const audioDir = path.join(this.config.inputDir, 'audio');
    const audioFiles = await this.findFiles(audioDir, /\.(mp3|wav|flac|ogg|m4a)$/i);
    
    for (const audioPath of audioFiles) {
      await this.optimizeAudio(audioPath);
    }
  }

  /**
   * Optimize individual audio file
   */
  async optimizeAudio(inputPath) {
    try {
      const relativePath = path.relative(path.join(this.config.inputDir, 'audio'), inputPath);
      const outputDir = path.join(this.config.outputDir, 'audio', path.dirname(relativePath));
      const baseName = path.parse(inputPath).name;
      
      await fs.mkdir(outputDir, { recursive: true });
      
      const originalSize = (await fs.stat(inputPath)).size;
      
      // Generate optimized versions in different formats
      for (const format of this.config.audio.formats) {
        const outputPath = path.join(outputDir, `${baseName}.${format}`);
        
        let cmd = `ffmpeg -i "${inputPath}" -y`;
        
        // Audio processing options
        if (this.config.audio.normalize) {
          cmd += ' -af "loudnorm"';
        }
        
        if (this.config.audio.removeNoise) {
          cmd += ' -af "highpass=f=80,lowpass=f=8000"';
        }
        
        // Format-specific options
        if (format === 'mp3') {
          cmd += ` -codec:a libmp3lame -b:a ${this.config.audio.bitrate}`;
        } else if (format === 'ogg') {
          cmd += ` -codec:a libvorbis -b:a ${this.config.audio.bitrate}`;
        }
        
        cmd += ` -ar ${this.config.audio.sampleRate} -ac ${this.config.audio.channels} "${outputPath}"`;
        
        if (!this.config.dryRun) {
          execSync(cmd, { stdio: 'ignore' });
          const optimizedSize = (await fs.stat(outputPath)).size;
          this.stats.sizeSaved += Math.max(0, originalSize - optimizedSize);
        }
        
        this.log(`Optimized: ${relativePath} -> ${format}`);
      }
      
      this.stats.processed++;
      
    } catch (error) {
      this.error(`Failed to optimize audio ${inputPath}:`, error.message);
      this.stats.errors++;
    }
  }

  /**
   * Process and optimize video files
   */
  async processVideos() {
    this.log('Processing video files...');
    
    const videoDir = path.join(this.config.inputDir, 'videos');
    const videoFiles = await this.findFiles(videoDir, /\.(mp4|avi|mov|mkv|webm)$/i);
    
    for (const videoPath of videoFiles) {
      await this.optimizeVideo(videoPath);
    }
  }

  /**
   * Optimize individual video file
   */
  async optimizeVideo(inputPath) {
    try {
      const relativePath = path.relative(path.join(this.config.inputDir, 'videos'), inputPath);
      const outputDir = path.join(this.config.outputDir, 'videos', path.dirname(relativePath));
      const baseName = path.parse(inputPath).name;
      
      await fs.mkdir(outputDir, { recursive: true });
      
      const originalSize = (await fs.stat(inputPath)).size;
      
      // Generate optimized versions
      for (const format of this.config.video.formats) {
        const outputPath = path.join(outputDir, `${baseName}.${format}`);
        
        let cmd = `ffmpeg -i "${inputPath}" -y`;
        cmd += ` -c:v ${this.config.video.codec}`;
        cmd += ` -b:v ${this.config.video.bitrate}`;
        cmd += ` -c:a ${this.config.video.audioCodec}`;
        cmd += ` -b:a ${this.config.video.audioBitrate}`;
        cmd += ` -r ${this.config.video.fps}`;
        cmd += ` -vf "scale='min(${this.config.video.maxWidth},iw)':'min(${this.config.video.maxHeight},ih)':force_original_aspect_ratio=decrease"`;
        cmd += ` "${outputPath}"`;
        
        if (!this.config.dryRun) {
          execSync(cmd, { stdio: 'ignore' });
          const optimizedSize = (await fs.stat(outputPath)).size;
          this.stats.sizeSaved += Math.max(0, originalSize - optimizedSize);
        }
        
        this.log(`Optimized: ${relativePath} -> ${format}`);
      }
      
      this.stats.processed++;
      
    } catch (error) {
      this.error(`Failed to optimize video ${inputPath}:`, error.message);
      this.stats.errors++;
    }
  }

  /**
   * Find files matching pattern recursively
   */
  async findFiles(dir, pattern) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          files.push(...await this.findFiles(fullPath, pattern));
        } else if (pattern.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist, skip
    }
    
    return files;
  }

  /**
   * Generate optimization report
   */
  generateReport() {
    const duration = Date.now() - this.stats.startTime;
    const sizeSavedMB = (this.stats.sizeSaved / 1024 / 1024).toFixed(2);
    
    console.log('\n=== Asset Optimization Report ===');
    console.log(`Files processed: ${this.stats.processed}`);
    console.log(`Errors: ${this.stats.errors}`);
    console.log(`Size saved: ${sizeSavedMB} MB`);
    console.log(`Duration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log('================================\n');
  }

  /**
   * Logging utilities
   */
  log(message) {
    if (this.config.verbose) {
      console.log(`[OPTIMIZER] ${message}`);
    }
  }

  error(message, details = '') {
    console.error(`[ERROR] ${message}`, details);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const config = { ...CONFIG };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run':
        config.dryRun = true;
        break;
      case '--quiet':
        config.verbose = false;
        break;
      case '--input':
        config.inputDir = args[++i];
        break;
      case '--output':
        config.outputDir = args[++i];
        break;
      case '--help':
        console.log(`
Asset Optimization Pipeline

Usage: node asset-optimizer.js [options]

Options:
  --dry-run     Show what would be done without actually processing files
  --quiet       Suppress verbose output
  --input DIR   Set input directory (default: assets-source)
  --output DIR  Set output directory (default: public/assets)
  --help        Show this help message

Examples:
  node asset-optimizer.js
  node asset-optimizer.js --dry-run
  node asset-optimizer.js --input ./raw-assets --output ./dist/assets
        `);
        process.exit(0);
    }
  }
  
  // Run optimization
  const optimizer = new AssetOptimizer(config);
  optimizer.optimize().catch(error => {
    console.error('Optimization failed:', error);
    process.exit(1);
  });
}

module.exports = AssetOptimizer;