// API Optimization utilities and configuration
import { getApiStats, clearApiCache } from '../services/optimizedApi';

// API optimization configuration
export const API_OPTIMIZATION_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
    retryDelay: 1000,
    maxRetries: 3,
    backoffMultiplier: 2
  },
  
  // Caching
  CACHE: {
    defaultTTL: 300000, // 5 minutes
    productsTTL: 300000, // 5 minutes
    bannersTTL: 600000, // 10 minutes
    categoriesTTL: 1800000, // 30 minutes
    maxCacheSize: 100 // Maximum number of cached items
  },
  
  // Request optimization
  REQUEST: {
    timeout: 15000, // 15 seconds
    debounceDelay: 500, // 500ms
    batchSize: 5, // Maximum concurrent requests
    retryOnFailure: true
  }
};

// API performance monitoring
export class ApiPerformanceMonitor {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimitHits: 0
    };
    this.responseTimes = [];
  }

  recordRequest(success, responseTime, fromCache = false) {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
      if (fromCache) {
        this.metrics.cacheHits++;
      } else {
        this.metrics.cacheMisses++;
      }
    } else {
      this.metrics.failedRequests++;
    }

    if (responseTime) {
      this.responseTimes.push(responseTime);
      this.metrics.averageResponseTime = 
        this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    }
  }

  recordRateLimit() {
    this.metrics.rateLimitHits++;
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0 
        ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 
        : 0,
      cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
        ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100
        : 0
    };
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimitHits: 0
    };
    this.responseTimes = [];
  }
}

// Global performance monitor instance
export const apiMonitor = new ApiPerformanceMonitor();

// Request deduplication
class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }

  async deduplicate(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      console.log('🔄 Deduplicating request:', key);
      return this.pendingRequests.get(key);
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear() {
    this.pendingRequests.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// API call optimization utilities
export const optimizeApiCall = (apiFunction, options = {}) => {
  const {
    cacheKey = null,
    ttl = API_OPTIMIZATION_CONFIG.CACHE.defaultTTL,
    deduplicate = true,
    retryOnFailure = true,
    maxRetries = API_OPTIMIZATION_CONFIG.RATE_LIMIT.maxRetries
  } = options;

  return async (...args) => {
    const startTime = Date.now();
    const requestKey = deduplicate ? `${apiFunction.name}_${JSON.stringify(args)}` : null;

    try {
      let result;
      
      if (deduplicate && requestKey) {
        result = await requestDeduplicator.deduplicate(requestKey, () => apiFunction(...args));
      } else {
        result = await apiFunction(...args);
      }

      const responseTime = Date.now() - startTime;
      apiMonitor.recordRequest(true, responseTime, false);
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      apiMonitor.recordRequest(false, responseTime, false);

      if (error.response?.status === 429) {
        apiMonitor.recordRateLimit();
      }

      if (retryOnFailure && maxRetries > 0) {
        console.log(`🔄 Retrying API call (${maxRetries} attempts left)`);
        return optimizeApiCall(apiFunction, { ...options, maxRetries: maxRetries - 1 })(...args);
      }

      throw error;
    }
  };
};

// Batch API calls optimization
export const createBatchApiCall = (apiCalls, options = {}) => {
  const {
    maxConcurrent = API_OPTIMIZATION_CONFIG.REQUEST.batchSize,
    delayBetweenBatches = 100
  } = options;

  return async () => {
    const results = [];
    const errors = [];

    // Process calls in batches
    for (let i = 0; i < apiCalls.length; i += maxConcurrent) {
      const batch = apiCalls.slice(i, i + maxConcurrent);
      
      try {
        const batchResults = await Promise.allSettled(
          batch.map(call => call())
        );

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push({ index: i + index, data: result.value });
          } else {
            errors.push({ index: i + index, error: result.reason });
          }
        });

        // Add delay between batches to respect rate limits
        if (i + maxConcurrent < apiCalls.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      } catch (error) {
        console.error('Batch API call failed:', error);
        errors.push({ error: error.message });
      }
    }

    return { results, errors };
  };
};

// Cache management utilities
export const manageCache = {
  // Clear all caches
  clearAll: () => {
    clearApiCache();
    requestDeduplicator.clear();
    apiMonitor.reset();
    console.log('🗑️ All caches cleared');
  },

  // Get cache statistics
  getStats: () => {
    const apiStats = getApiStats();
    const performanceMetrics = apiMonitor.getMetrics();
    
    return {
      cache: apiStats,
      performance: performanceMetrics,
      timestamp: new Date().toISOString()
    };
  },

  // Optimize cache based on usage patterns
  optimize: () => {
    const stats = getApiStats();
    
    if (stats.cacheSize > API_OPTIMIZATION_CONFIG.CACHE.maxCacheSize) {
      console.log('🧹 Cache size exceeded, clearing old entries');
      clearApiCache();
    }
  }
};

// API health check
export const checkApiHealth = async () => {
  try {
    const stats = manageCache.getStats();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: stats.performance,
      cache: stats.cache,
      recommendations: []
    };

    // Add recommendations based on metrics
    if (stats.performance.successRate < 80) {
      health.recommendations.push('Low success rate detected. Consider implementing retry logic.');
    }

    if (stats.performance.cacheHitRate < 50) {
      health.recommendations.push('Low cache hit rate. Consider increasing cache TTL.');
    }

    if (stats.performance.averageResponseTime > 5000) {
      health.recommendations.push('High response times detected. Consider optimizing API calls.');
    }

    if (stats.performance.rateLimitHits > 0) {
      health.recommendations.push('Rate limiting detected. Consider implementing request queuing.');
    }

    return health;
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      recommendations: ['Check API configuration and network connectivity']
    };
  }
};

// Initialize API optimization
export const initializeApiOptimization = () => {
  console.log('🚀 Initializing API optimization...');
  
  // Set up periodic cache optimization
  setInterval(() => {
    manageCache.optimize();
  }, 300000); // Every 5 minutes

  // Set up performance monitoring
  setInterval(() => {
    const health = checkApiHealth();
    if (health.status === 'unhealthy') {
      console.warn('⚠️ API health check failed:', health);
    }
  }, 60000); // Every minute

  console.log('✅ API optimization initialized');
};

export default {
  API_OPTIMIZATION_CONFIG,
  ApiPerformanceMonitor,
  apiMonitor,
  requestDeduplicator,
  optimizeApiCall,
  createBatchApiCall,
  manageCache,
  checkApiHealth,
  initializeApiOptimization
};
