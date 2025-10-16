/**
 * Utility Functions Export Index
 * 
 * This file exports all utility functions from the utils directory
 * for easier imports throughout the application.
 */

// API Optimizer utilities
export {
  optimizedFetch,
  generateCacheKey,
  getCachedResponse,
  cacheResponse,
  clearCache,
  clearExpiredCache,
  isRateLimited,
  trackRequest,
  cleanup as cleanupApiRequests
} from './apiOptimizer';

// Async utilities
export {
  debounce,
  throttle,
  RequestBatcher,
  retryWithBackoff
} from './asyncUtils';

// PWA utilities
export * from './pwa';

// Add other utility exports here as needed
