// Lesson utilities for tracking progress and analytics

/**
 * Calculate lesson completion percentage based on reading progress
 */
export const calculateLessonProgress = (timeSpent, estimatedDuration, scrollPosition = 0) => {
  // Use multiple factors to determine progress
  const timeProgress = Math.min((timeSpent / (estimatedDuration * 60)) * 100, 100);
  const scrollProgress = scrollPosition * 100;
  
  // Weight time spent more heavily than scroll position
  return Math.min(Math.round((timeProgress * 0.7) + (scrollProgress * 0.3)), 100);
};

/**
 * Track reading time and calculate progress
 */
export class LessonProgressTracker {
  constructor(lessonId, userId, estimatedDuration) {
    this.lessonId = lessonId;
    this.userId = userId;
    this.estimatedDuration = estimatedDuration;
    this.startTime = null;
    this.totalTimeSpent = 0;
    this.isActive = false;
    this.scrollPosition = 0;
    this.checkpoints = new Set();
  }

  start() {
    this.startTime = Date.now();
    this.isActive = true;
  }

  pause() {
    if (this.isActive && this.startTime) {
      this.totalTimeSpent += (Date.now() - this.startTime) / 1000; // Convert to seconds
      this.isActive = false;
    }
  }

  resume() {
    this.startTime = Date.now();
    this.isActive = true;
  }

  stop() {
    this.pause();
    return this.totalTimeSpent;
  }

  updateScrollPosition(position) {
    this.scrollPosition = Math.max(this.scrollPosition, position);
    
    // Track reading checkpoints (25%, 50%, 75%, 100%)
    const progressPoints = [0.25, 0.5, 0.75, 1.0];
    progressPoints.forEach(point => {
      if (position >= point && !this.checkpoints.has(point)) {
        this.checkpoints.add(point);
        this.onCheckpoint(point);
      }
    });
  }

  onCheckpoint(checkpoint) {
    // Override in implementations to handle checkpoints
    console.log(`Reached checkpoint: ${checkpoint * 100}%`);
  }

  getCurrentProgress() {
    const currentTime = this.isActive && this.startTime 
      ? this.totalTimeSpent + ((Date.now() - this.startTime) / 1000)
      : this.totalTimeSpent;
    
    return calculateLessonProgress(
      currentTime / 60, // Convert to minutes
      this.estimatedDuration,
      this.scrollPosition
    );
  }

  async saveProgress(status = 'in_progress') {
    const progress = this.getCurrentProgress();
    const timeSpentMinutes = this.totalTimeSpent / 60;

    try {
      const response = await fetch('/api/lessons/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          lessonId: this.lessonId,
          status: progress >= 100 ? 'completed' : status,
          percentage: progress,
          position: this.scrollPosition,
          timeSpent: timeSpentMinutes
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('Failed to save lesson progress:', error);
      throw error;
    }
  }
}

/**
 * Lesson completion analytics
 */
export const LessonAnalytics = {
  /**
   * Track lesson start event
   */
  trackStart: (lessonId, userId) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'lesson_start', {
        lesson_id: lessonId,
        user_id: userId
      });
    }
  },

  /**
   * Track lesson completion event
   */
  trackCompletion: (lessonId, userId, timeSpent, score = null) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'lesson_complete', {
        lesson_id: lessonId,
        user_id: userId,
        time_spent: timeSpent,
        score: score
      });
    }
  },

  /**
   * Track lesson checkpoint reached
   */
  trackCheckpoint: (lessonId, userId, checkpoint) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'lesson_checkpoint', {
        lesson_id: lessonId,
        user_id: userId,
        checkpoint: checkpoint
      });
    }
  }
};

/**
 * Lesson content utilities
 */
export const LessonUtils = {
  /**
   * Estimate reading time based on content length
   */
  estimateReadingTime: (content, wordsPerMinute = 200) => {
    if (!content) return 0;
    
    // Remove HTML tags and count words
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    return Math.ceil(wordCount / wordsPerMinute);
  },

  /**
   * Extract lesson outline from content
   */
  extractOutline: (content) => {
    if (!content) return [];
    
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const headings = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        text: match[2].replace(/<[^>]*>/g, ''),
        id: match[2].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      });
    }
    
    return headings;
  },

  /**
   * Format lesson duration for display
   */
  formatDuration: (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}min`
        : `${hours}h`;
    }
  },

  /**
   * Get difficulty color class
   */
  getDifficultyColor: (level) => {
    const colors = {
      beginner: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
      intermediate: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
      advanced: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[level] || colors.beginner;
  }
};

/**
 * Lesson state management hook
 */
export const useLessonState = () => {
  if (typeof window === 'undefined') {
    return {
      saveState: () => {},
      loadState: () => null,
      clearState: () => {}
    };
  }

  const saveState = (lessonId, state) => {
    try {
      localStorage.setItem(`lesson_${lessonId}`, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save lesson state:', error);
    }
  };

  const loadState = (lessonId) => {
    try {
      const state = localStorage.getItem(`lesson_${lessonId}`);
      return state ? JSON.parse(state) : null;
    } catch (error) {
      console.error('Failed to load lesson state:', error);
      return null;
    }
  };

  const clearState = (lessonId) => {
    try {
      localStorage.removeItem(`lesson_${lessonId}`);
    } catch (error) {
      console.error('Failed to clear lesson state:', error);
    }
  };

  return {
    saveState,
    loadState,
    clearState
  };
};
