/**
 * Content Review and Quality Assurance System
 * Comprehensive system for reviewing and validating lesson content
 */

import { validateLesson } from '../data/schemas/lessonSchema.js';
import ContentIntegrityChecker from './contentIntegrityChecker.js';

class ContentReviewSystem {
  constructor(options = {}) {
    this.options = {
      minQualityScore: 80,
      requireNativeReview: true,
      autoApproveThreshold: 95,
      maxReviewCycles: 3,
      reviewTimeoutDays: 7,
      verbose: true,
      ...options
    };
    
    this.reviewQueue = new Map();
    this.reviewHistory = new Map();
    this.reviewers = new Map();
    this.qualityMetrics = new Map();
    this.integrityChecker = new ContentIntegrityChecker();
  }

  /**
   * Submit lesson for review
   */
  async submitForReview(lesson, submitterId, reviewType = 'full') {
    try {
      const submissionId = this.generateSubmissionId();
      const timestamp = new Date().toISOString();
      
      // Initial validation
      const validation = await this.performInitialValidation(lesson);
      if (!validation.passed) {
        return {
          success: false,
          submissionId,
          status: 'rejected',
          reason: 'Failed initial validation',
          errors: validation.errors
        };
      }
      
      // Create review entry
      const reviewEntry = {
        submissionId,
        lesson,
        submitterId,
        reviewType,
        status: 'pending',
        submittedAt: timestamp,
        reviewCycle: 1,
        reviewers: [],
        comments: [],
        qualityScore: null,
        approvalStatus: 'pending',
        history: []
      };
      
      this.reviewQueue.set(submissionId, reviewEntry);
      this.log(`Lesson submitted for review: ${submissionId}`);
      
      // Auto-assign reviewers
      await this.assignReviewers(submissionId);
      
      return {
        success: true,
        submissionId,
        status: 'submitted',
        estimatedReviewTime: this.calculateEstimatedReviewTime(reviewType)
      };
      
    } catch (error) {
      this.error('Failed to submit lesson for review:', error.message);
      throw error;
    }
  }

  /**
   * Perform initial automated validation
   */
  async performInitialValidation(lesson) {
    const errors = [];
    let passed = true;
    
    try {
      // Schema validation
      const schemaValidation = validateLesson(lesson);
      if (!schemaValidation.isValid) {
        errors.push(...schemaValidation.errors.map(e => ({ type: 'schema', message: e })));
        passed = false;
      }
      
      // Content quality checks
      const qualityChecks = await this.performQualityChecks(lesson);
      if (!qualityChecks.passed) {
        errors.push(...qualityChecks.errors);
        passed = false;
      }
      
      // Asset integrity checks
      const assetChecks = await this.checkAssetIntegrity(lesson);
      if (!assetChecks.passed) {
        errors.push(...assetChecks.errors);
        passed = false;
      }
      
      // Accessibility validation
      const accessibilityChecks = this.validateAccessibility(lesson);
      if (!accessibilityChecks.passed) {
        errors.push(...accessibilityChecks.errors);
        passed = false;
      }
      
      return { passed, errors };
      
    } catch (error) {
      return {
        passed: false,
        errors: [{ type: 'system', message: `Validation failed: ${error.message}` }]
      };
    }
  }

  /**
   * Perform content quality checks
   */
  async performQualityChecks(lesson) {
    const errors = [];
    let passed = true;
    
    // Check content length
    if (lesson.content.text.length < 200) {
      errors.push({ type: 'content', message: 'Main content is too short (minimum 200 characters)' });
      passed = false;
    }
    
    if (lesson.content.text.length > 2000) {
      errors.push({ type: 'content', message: 'Main content is too long (maximum 2000 characters)' });
      passed = false;
    }
    
    // Check examples
    if (lesson.content.examples.length < 2) {
      errors.push({ type: 'content', message: 'Minimum 2 examples required' });
      passed = false;
    }
    
    if (lesson.content.examples.length > 10) {
      errors.push({ type: 'content', message: 'Maximum 10 examples allowed' });
      passed = false;
    }
    
    // Validate examples structure
    for (let i = 0; i < lesson.content.examples.length; i++) {
      const example = lesson.content.examples[i];
      if (!example.korean || !example.romanization || !example.translation) {
        errors.push({ 
          type: 'content', 
          message: `Example ${i + 1} is missing required fields (korean, romanization, translation)` 
        });
        passed = false;
      }
    }
    
    // Check exercises
    if (lesson.exercises.length < 1) {
      errors.push({ type: 'content', message: 'At least one exercise is required' });
      passed = false;
    }
    
    if (lesson.exercises.length > 5) {
      errors.push({ type: 'content', message: 'Maximum 5 exercises allowed' });
      passed = false;
    }
    
    // Validate exercise structure
    for (let i = 0; i < lesson.exercises.length; i++) {
      const exercise = lesson.exercises[i];
      if (!exercise.type || !exercise.title) {
        errors.push({ 
          type: 'content', 
          message: `Exercise ${i + 1} is missing required fields (type, title)` 
        });
        passed = false;
      }
      
      // Type-specific validation
      if (exercise.type === 'quiz' && (!exercise.questions || exercise.questions.length === 0)) {
        errors.push({ 
          type: 'content', 
          message: `Quiz exercise ${i + 1} must have at least one question` 
        });
        passed = false;
      }
      
      if (exercise.type === 'flashcard' && (!exercise.cards || exercise.cards.length === 0)) {
        errors.push({ 
          type: 'content', 
          message: `Flashcard exercise ${i + 1} must have at least one card` 
        });
        passed = false;
      }
    }
    
    // Check estimated time
    if (lesson.estimatedTime < 5 || lesson.estimatedTime > 60) {
      errors.push({ type: 'content', message: 'Estimated time must be between 5 and 60 minutes' });
      passed = false;
    }
    
    return { passed, errors };
  }

  /**
   * Check asset integrity
   */
  async checkAssetIntegrity(lesson) {
    const errors = [];
    let passed = true;
    
    try {
      // Check if referenced assets exist
      const referencedAssets = this.extractAssetReferences(lesson);
      
      for (const assetPath of referencedAssets) {
        // This would normally check if the file exists
        // For now, we'll just validate the path format
        if (!this.isValidAssetPath(assetPath)) {
          errors.push({ 
            type: 'asset', 
            message: `Invalid asset path format: ${assetPath}` 
          });
          passed = false;
        }
      }
      
      return { passed, errors };
      
    } catch (error) {
      return {
        passed: false,
        errors: [{ type: 'asset', message: `Asset check failed: ${error.message}` }]
      };
    }
  }

  /**
   * Validate accessibility requirements
   */
  validateAccessibility(lesson) {
    const errors = [];
    let passed = true;
    
    // Check for alt text on images
    if (lesson.content.media.image && !lesson.content.media.imageAlt) {
      errors.push({ 
        type: 'accessibility', 
        message: 'Images must have alt text for accessibility' 
      });
      passed = false;
    }
    
    // Check for audio transcripts
    const audioAssets = this.extractAudioReferences(lesson);
    if (audioAssets.length > 0) {
      // In a real implementation, we'd check for transcript files
      this.log(`Found ${audioAssets.length} audio assets - transcripts should be verified`);
    }
    
    return { passed, errors };
  }

  /**
   * Calculate quality score for a lesson
   */
  calculateQualityScore(lesson, reviewComments = []) {
    let score = 100;
    const penalties = {
      'schema': -20,
      'content': -10,
      'asset': -15,
      'accessibility': -10,
      'cultural': -5,
      'language': -15
    };
    
    // Apply penalties based on validation errors
    const validation = this.performInitialValidation(lesson);
    if (validation.errors) {
      for (const error of validation.errors) {
        score += penalties[error.type] || -5;
      }
    }
    
    // Apply penalties based on reviewer comments
    for (const comment of reviewComments) {
      if (comment.severity === 'critical') {
        score -= 15;
      } else if (comment.severity === 'major') {
        score -= 10;
      } else if (comment.severity === 'minor') {
        score -= 5;
      }
    }
    
    // Bonus points for quality indicators
    if (lesson.content.examples.length >= 5) score += 5;
    if (lesson.exercises.length >= 3) score += 5;
    if (lesson.content.media.image) score += 3;
    if (lesson.content.text.length >= 500) score += 3;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assign reviewers to a submission
   */
  async assignReviewers(submissionId) {
    const reviewEntry = this.reviewQueue.get(submissionId);
    if (!reviewEntry) return;
    
    const lesson = reviewEntry.lesson;
    const requiredReviewers = this.getRequiredReviewers(lesson, reviewEntry.reviewType);
    
    for (const reviewerType of requiredReviewers) {
      const reviewer = this.findAvailableReviewer(reviewerType);
      if (reviewer) {
        reviewEntry.reviewers.push({
          id: reviewer.id,
          type: reviewerType,
          assignedAt: new Date().toISOString(),
          status: 'assigned',
          comments: []
        });
        
        this.log(`Assigned ${reviewerType} reviewer ${reviewer.id} to ${submissionId}`);
      }
    }
    
    this.reviewQueue.set(submissionId, reviewEntry);
  }

  /**
   * Submit review feedback
   */
  async submitReview(submissionId, reviewerId, feedback) {
    const reviewEntry = this.reviewQueue.get(submissionId);
    if (!reviewEntry) {
      throw new Error('Submission not found');
    }
    
    // Find reviewer
    const reviewerIndex = reviewEntry.reviewers.findIndex(r => r.id === reviewerId);
    if (reviewerIndex === -1) {
      throw new Error('Reviewer not assigned to this submission');
    }
    
    // Update reviewer status
    reviewEntry.reviewers[reviewerIndex] = {
      ...reviewEntry.reviewers[reviewerIndex],
      status: 'completed',
      completedAt: new Date().toISOString(),
      recommendation: feedback.recommendation,
      comments: feedback.comments,
      qualityScore: feedback.qualityScore
    };
    
    // Add to history
    reviewEntry.history.push({
      timestamp: new Date().toISOString(),
      action: 'review_submitted',
      reviewerId,
      recommendation: feedback.recommendation
    });
    
    this.reviewQueue.set(submissionId, reviewEntry);
    
    // Check if all reviews are complete
    await this.checkReviewCompletion(submissionId);
    
    return {
      success: true,
      status: 'review_submitted',
      allReviewsComplete: this.areAllReviewsComplete(reviewEntry)
    };
  }

  /**
   * Check if review process is complete and make final decision
   */
  async checkReviewCompletion(submissionId) {
    const reviewEntry = this.reviewQueue.get(submissionId);
    if (!reviewEntry || !this.areAllReviewsComplete(reviewEntry)) {
      return;
    }
    
    // Calculate overall quality score
    const qualityScore = this.calculateOverallQualityScore(reviewEntry);
    reviewEntry.qualityScore = qualityScore;
    
    // Make approval decision
    const decision = this.makeApprovalDecision(reviewEntry);
    reviewEntry.approvalStatus = decision.status;
    reviewEntry.finalDecision = decision;
    
    // Update status
    if (decision.status === 'approved') {
      reviewEntry.status = 'approved';
      this.log(`Lesson ${submissionId} approved with quality score ${qualityScore}`);
    } else if (decision.status === 'rejected') {
      reviewEntry.status = 'rejected';
      this.log(`Lesson ${submissionId} rejected with quality score ${qualityScore}`);
    } else {
      reviewEntry.status = 'revision_required';
      this.log(`Lesson ${submissionId} requires revision with quality score ${qualityScore}`);
    }
    
    // Move to history
    this.reviewHistory.set(submissionId, {
      ...reviewEntry,
      completedAt: new Date().toISOString()
    });
    
    // Remove from active queue if approved or rejected
    if (decision.status !== 'revision_required') {
      this.reviewQueue.delete(submissionId);
    }
    
    this.reviewQueue.set(submissionId, reviewEntry);
  }

  /**
   * Make final approval decision
   */
  makeApprovalDecision(reviewEntry) {
    const qualityScore = reviewEntry.qualityScore;
    const reviewers = reviewEntry.reviewers;
    
    // Check for critical issues
    const hasCriticalIssues = reviewers.some(r => 
      r.comments.some(c => c.severity === 'critical')
    );
    
    if (hasCriticalIssues) {
      return {
        status: 'rejected',
        reason: 'Critical issues identified',
        requiredActions: this.extractRequiredActions(reviewers)
      };
    }
    
    // Check quality score threshold
    if (qualityScore < this.options.minQualityScore) {
      return {
        status: 'revision_required',
        reason: `Quality score ${qualityScore} below minimum ${this.options.minQualityScore}`,
        requiredActions: this.extractRequiredActions(reviewers)
      };
    }
    
    // Check reviewer recommendations
    const approvalCount = reviewers.filter(r => r.recommendation === 'approve').length;
    const rejectionCount = reviewers.filter(r => r.recommendation === 'reject').length;
    
    if (rejectionCount > 0) {
      return {
        status: 'revision_required',
        reason: 'Reviewer(s) recommended changes',
        requiredActions: this.extractRequiredActions(reviewers)
      };
    }
    
    if (approvalCount === reviewers.length && qualityScore >= this.options.autoApproveThreshold) {
      return {
        status: 'approved',
        reason: 'All reviewers approved and quality score exceeds auto-approval threshold'
      };
    }
    
    return {
      status: 'approved',
      reason: 'Quality standards met and reviewers approved'
    };
  }

  /**
   * Get review status and statistics
   */
  getReviewStats() {
    const activeReviews = Array.from(this.reviewQueue.values());
    const completedReviews = Array.from(this.reviewHistory.values());
    
    return {
      active: {
        total: activeReviews.length,
        pending: activeReviews.filter(r => r.status === 'pending').length,
        inReview: activeReviews.filter(r => r.status === 'in_review').length,
        revisionRequired: activeReviews.filter(r => r.status === 'revision_required').length
      },
      completed: {
        total: completedReviews.length,
        approved: completedReviews.filter(r => r.approvalStatus === 'approved').length,
        rejected: completedReviews.filter(r => r.approvalStatus === 'rejected').length,
        averageQualityScore: this.calculateAverageQualityScore(completedReviews)
      },
      performance: {
        averageReviewTime: this.calculateAverageReviewTime(completedReviews),
        approvalRate: this.calculateApprovalRate(completedReviews)
      }
    };
  }

  /**
   * Helper methods
   */
  generateSubmissionId() {
    return `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  extractAssetReferences(lesson) {
    const assets = [];
    
    // Extract from examples
    lesson.content.examples.forEach(example => {
      if (example.audio) assets.push(example.audio);
    });
    
    // Extract from media
    if (lesson.content.media.image) assets.push(lesson.content.media.image);
    if (lesson.content.media.video) assets.push(lesson.content.media.video);
    
    // Extract from exercises
    lesson.exercises.forEach(exercise => {
      if (exercise.audio) assets.push(exercise.audio);
    });
    
    return assets;
  }

  extractAudioReferences(lesson) {
    return this.extractAssetReferences(lesson).filter(asset => 
      asset.endsWith('.mp3') || asset.endsWith('.ogg') || asset.endsWith('.wav')
    );
  }

  isValidAssetPath(path) {
    return path.startsWith('/assets/') && path.length > 10;
  }

  getRequiredReviewers(lesson, reviewType) {
    const reviewers = ['technical'];
    
    if (reviewType === 'full') {
      reviewers.push('content', 'cultural');
      if (this.options.requireNativeReview) {
        reviewers.push('native_speaker');
      }
    }
    
    return reviewers;
  }

  findAvailableReviewer(type) {
    // Mock implementation - in real system, this would query reviewer database
    return {
      id: `${type}-reviewer-${Math.random().toString(36).substr(2, 5)}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Reviewer`
    };
  }

  areAllReviewsComplete(reviewEntry) {
    return reviewEntry.reviewers.every(r => r.status === 'completed');
  }

  calculateOverallQualityScore(reviewEntry) {
    const reviewerScores = reviewEntry.reviewers
      .filter(r => r.qualityScore !== undefined)
      .map(r => r.qualityScore);
    
    if (reviewerScores.length === 0) {
      return this.calculateQualityScore(reviewEntry.lesson);
    }
    
    return Math.round(reviewerScores.reduce((a, b) => a + b, 0) / reviewerScores.length);
  }

  extractRequiredActions(reviewers) {
    const actions = [];
    
    reviewers.forEach(reviewer => {
      reviewer.comments.forEach(comment => {
        if (comment.actionRequired) {
          actions.push({
            reviewer: reviewer.type,
            action: comment.actionRequired,
            severity: comment.severity
          });
        }
      });
    });
    
    return actions;
  }

  calculateAverageQualityScore(reviews) {
    if (reviews.length === 0) return 0;
    
    const scores = reviews.filter(r => r.qualityScore !== null).map(r => r.qualityScore);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }

  calculateAverageReviewTime(reviews) {
    if (reviews.length === 0) return 0;
    
    const times = reviews
      .filter(r => r.submittedAt && r.completedAt)
      .map(r => new Date(r.completedAt) - new Date(r.submittedAt));
    
    return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length / (1000 * 60 * 60 * 24)) : 0;
  }

  calculateApprovalRate(reviews) {
    if (reviews.length === 0) return 0;
    
    const approved = reviews.filter(r => r.approvalStatus === 'approved').length;
    return Math.round((approved / reviews.length) * 100);
  }

  calculateEstimatedReviewTime(reviewType) {
    const baseTimes = {
      'quick': 1,
      'standard': 3,
      'full': 7
    };
    
    return baseTimes[reviewType] || baseTimes['standard'];
  }

  log(message) {
    if (this.options.verbose) {
      console.log(`[REVIEW] ${message}`);
    }
  }

  error(message, details = '') {
    console.error(`[REVIEW ERROR] ${message}`, details);
  }
}

export default ContentReviewSystem;