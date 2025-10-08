// Optimized API service with rate limiting, caching, and request management
import axios from 'axios';
import { APP_CONSTANTS } from '../constants';

const API_BASE_URL = APP_CONSTANTS.API_BASE_URL;

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequests: 10, // Maximum requests per window
  windowMs: 60000, // 1 minute window
  retryDelay: 1000, // Initial retry delay
  maxRetries: 3, // Maximum retry attempts
  backoffMultiplier: 2, // Exponential backoff multiplier
};

// Request queue and rate limiting
class RequestManager {
  constructor() {
    this.requestQueue = [];
    this.requestCount = 0;
    this.windowStart = Date.now();
    this.pendingRequests = new Map();
    this.cache = new Map();
    this.retryQueue = [];
  }

  // Check if we can make a request
  canMakeRequest() {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.windowStart > RATE_LIMIT_CONFIG.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }
    
    return this.requestCount < RATE_LIMIT_CONFIG.maxRequests;
  }

  // Add request to queue
  async queueRequest(requestFn, cacheKey = null, ttl = 300000) { // 5 minutes default TTL
    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < ttl) {
        console.log('📦 Serving from memory cache:', cacheKey);
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    // Check if request is already pending
    if (cacheKey && this.pendingRequests.has(cacheKey)) {
      console.log('⏳ Request already pending, waiting...');
      return this.pendingRequests.get(cacheKey);
    }

    // Create promise for pending request
    const requestPromise = this.executeRequest(requestFn, cacheKey, ttl);
    
    if (cacheKey) {
      this.pendingRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }

  // Execute request with rate limiting
  async executeRequest(requestFn, cacheKey = null, ttl = 300000) {
    // Wait if we're at rate limit
    while (!this.canMakeRequest()) {
      const waitTime = RATE_LIMIT_CONFIG.windowMs - (Date.now() - this.windowStart);
      if (waitTime > 0) {
        console.log(`⏳ Rate limit reached, waiting ${waitTime}ms`);
        await this.delay(waitTime);
      }
    }

    this.requestCount++;
    
    try {
      const result = await requestFn();
      
      // Cache successful result
      if (cacheKey) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      return result;
    } catch (error) {
      // Handle rate limiting errors
      if (error.response?.status === 429) {
        console.warn('⚠️ Rate limited, adding to retry queue');
        return this.addToRetryQueue(requestFn, cacheKey, ttl);
      }
      throw error;
    } finally {
      if (cacheKey) {
        this.pendingRequests.delete(cacheKey);
      }
    }
  }

  // Add request to retry queue with exponential backoff
  async addToRetryQueue(requestFn, cacheKey = null, ttl = 300000) {
    const retryAttempt = 0;
    const retryPromise = this.retryWithBackoff(requestFn, retryAttempt, cacheKey, ttl);
    
    if (cacheKey) {
      this.pendingRequests.set(cacheKey, retryPromise);
    }
    
    return retryPromise;
  }

  // Retry with exponential backoff
  async retryWithBackoff(requestFn, attempt, cacheKey = null, ttl = 300000) {
    if (attempt >= RATE_LIMIT_CONFIG.maxRetries) {
      throw new Error('Max retry attempts exceeded');
    }

    const delay = RATE_LIMIT_CONFIG.retryDelay * Math.pow(RATE_LIMIT_CONFIG.backoffMultiplier, attempt);
    console.log(`🔄 Retrying request in ${delay}ms (attempt ${attempt + 1})`);
    
    await this.delay(delay);
    
    try {
      const result = await this.executeRequest(requestFn, cacheKey, ttl);
      return result;
    } catch (error) {
      if (error.response?.status === 429) {
        return this.retryWithBackoff(requestFn, attempt + 1, cacheKey, ttl);
      }
      throw error;
    }
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    console.log('🗑️ API cache cleared');
  }

  // Get cache stats
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      requestCount: this.requestCount,
      windowStart: this.windowStart
    };
  }
}

// Create global request manager instance
const requestManager = new RequestManager();

// Create axios instance with optimized configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for rate limiting and token management
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`✅ API ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? Date.now() - error.config.metadata.startTime : 0;
    console.error(`❌ API ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`, error.response?.status);
    
    // Handle common error cases
    if (error.response?.status === 401) {
      clearStoredToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Token storage utilities (optimized)
export const getStoredToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.warn('Failed to get token from localStorage:', error);
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    localStorage.setItem('auth_token', token);
    return true;
  } catch (error) {
    console.warn('Failed to set token in localStorage:', error);
    return false;
  }
};

export const clearStoredToken = () => {
  try {
    localStorage.removeItem('auth_token');
    return true;
  } catch (error) {
    console.warn('Failed to clear token from localStorage:', error);
    return false;
  }
};

// Optimized API methods with caching and rate limiting
export const optimizedApiPost = async (endpoint, data, options = {}) => {
  const { cacheKey = null, ttl = 300000, skipRateLimit = false } = options;
  
  const requestFn = async () => {
    const response = await api.post(endpoint, data);
    return response.data;
  };

  if (skipRateLimit) {
    return requestFn();
  }

  const finalCacheKey = cacheKey || `post_${endpoint}_${JSON.stringify(data)}`;
  return requestManager.queueRequest(requestFn, finalCacheKey, ttl);
};

export const optimizedApiGet = async (endpoint, params = {}, options = {}) => {
  const { cacheKey = null, ttl = 300000, skipRateLimit = false } = options;
  
  const requestFn = async () => {
    const response = await api.get(endpoint, { params });
    return response.data;
  };

  if (skipRateLimit) {
    return requestFn();
  }

  const finalCacheKey = cacheKey || `get_${endpoint}_${JSON.stringify(params)}`;
  return requestManager.queueRequest(requestFn, finalCacheKey, ttl);
};

// Batch API calls to reduce requests
export const batchApiCalls = async (calls) => {
  const results = await Promise.allSettled(calls);
  
  return results.map((result, index) => ({
    index,
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  }));
};

// Debounced API calls to prevent rapid successive requests
export const createDebouncedApiCall = (apiFunction, delay = 500) => {
  let timeoutId;
  
  return (...args) => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        try {
          const result = await apiFunction(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
};

// Cache management utilities
export const clearApiCache = () => {
  requestManager.clearCache();
};

export const getApiStats = () => {
  return requestManager.getCacheStats();
};

// Optimized product API calls
export const getProductsOptimized = async (params = {}) => {
  const {
    page = 1,
    limit = 20,
    dept_id = "2",
    category_id = "72",
    sub_category_id = "391"
  } = params;

  const cacheKey = `products_${page}_${limit}_${dept_id}_${category_id}_${sub_category_id}`;
  
  return optimizedApiPost('/products/get_active_products_list', {
    dept_id,
    category_id,
    sub_category_id,
    store_code: process.env.REACT_APP_STORE_CODE || "KET",
    project_code: process.env.REACT_APP_PROJECT_CODE || "RET90",
    page,
    limit
  }, {
    cacheKey,
    ttl: 300000 // 5 minutes cache
  });
};

// Optimized banner API calls
export const getBannersOptimized = async (params = {}) => {
  const {
    store_code = process.env.REACT_APP_STORE_CODE || "KET",
    project_code = process.env.REACT_APP_PROJECT_CODE || "RET90"
  } = params;

  const cacheKey = `banners_${store_code}_${project_code}`;
  
  return optimizedApiPost('/banners/get_all_banners', {
    store_code,
    project_code
  }, {
    cacheKey,
    ttl: 600000 // 10 minutes cache
  });
};

// Optimized product details API calls
export const getProductDetailsOptimized = async (p_code, store_code, project_code) => {
  const cacheKey = `product_${p_code}_${store_code}_${project_code}`;
  
  return optimizedApiPost('/products/getpcodeproducts', {
    p_code,
    store_code,
    project_code
  }, {
    cacheKey,
    ttl: 600000 // 10 minutes cache
  });
};

// Optimized categories API calls
export const getCategoriesOptimized = async (params = {}) => {
  const {
    store_code = process.env.REACT_APP_STORE_CODE || "KET",
    project_code = process.env.REACT_APP_PROJECT_CODE || "RET90"
  } = params;

  const cacheKey = `categories_${store_code}_${project_code}`;
  
  return optimizedApiPost('/categories/get_active_categories', {
    store_code,
    project_code
  }, {
    cacheKey,
    ttl: 1800000 // 30 minutes cache
  });
};

// Optimized departments API calls
export const getDepartmentsOptimized = async (params = {}) => {
  const {
    store_code = process.env.REACT_APP_STORE_CODE || "KET",
    project_code = process.env.REACT_APP_PROJECT_CODE || "RET90"
  } = params;

  const cacheKey = `departments_${store_code}_${project_code}`;
  
  return optimizedApiPost('/departments/get_active_departments', {
    store_code,
    project_code
  }, {
    cacheKey,
    ttl: 1800000 // 30 minutes cache
  });
};

// Initialize API with preloading
export const initializeApi = async () => {
  console.log('🚀 Initializing optimized API...');
  
  // Preload essential data
  try {
    const [banners, departments] = await Promise.allSettled([
      getBannersOptimized(),
      getDepartmentsOptimized()
    ]);
    
    console.log('✅ API initialization complete');
    console.log('📊 Cache stats:', getApiStats());
    
    return {
      banners: banners.status === 'fulfilled' ? banners.value : null,
      departments: departments.status === 'fulfilled' ? departments.value : null
    };
  } catch (error) {
    console.warn('⚠️ API initialization failed:', error);
    return { banners: null, departments: null };
  }
};

export default {
  optimizedApiPost,
  optimizedApiGet,
  batchApiCalls,
  createDebouncedApiCall,
  clearApiCache,
  getApiStats,
  getProductsOptimized,
  getBannersOptimized,
  getProductDetailsOptimized,
  getCategoriesOptimized,
  getDepartmentsOptimized,
  initializeApi
};
