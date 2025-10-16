/**
 * API Optimizer Utility
 * 
 * This utility provides caching, rate limiting, request deduplication, and retry logic
 * to optimize API usage and prevent "Too many requests" errors.
 */

// Cache storage for responses
const responseCache = new Map();
const inFlightRequests = new Map();
const requestTimestamps = [];
const MAX_REQUESTS_PER_WINDOW = 50; // Maximum requests per time window
const TIME_WINDOW_MS = 10000; // Time window in milliseconds (10 seconds)
const CACHE_TTL = 5 * 60 * 1000; // Cache TTL: 5 minutes

/**
 * Generates a cache key from request details
 * @param {string} url - Request URL
 * @param {Object} params - Request parameters or body
 * @param {string} method - HTTP method
 * @returns {string} - Cache key
 */
export const generateCacheKey = (url, params = {}, method = 'GET') => {
  const normalizedParams = typeof params === 'string' ? params : JSON.stringify(params || {});
  return `${method}:${url}:${normalizedParams}`;
};

/**
 * Checks if a request is rate-limited
 * @returns {boolean} - True if request should be rate limited
 */
export const isRateLimited = () => {
  const now = Date.now();
  
  // Remove timestamps outside the current time window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - TIME_WINDOW_MS) {
    requestTimestamps.shift();
  }
  
  // If we have too many requests in the current window, rate limit
  return requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW;
};

/**
 * Adds a timestamp for rate limiting calculations
 */
export const trackRequest = () => {
  requestTimestamps.push(Date.now());
};

/**
 * Gets cached response if available and not expired
 * @param {string} cacheKey - The cache key
 * @returns {Object|null} - Cached response or null
 */
export const getCachedResponse = (cacheKey) => {
  if (!responseCache.has(cacheKey)) {
    return null;
  }
  
  const { data, timestamp } = responseCache.get(cacheKey);
  
  // Check if cache is expired
  if (Date.now() - timestamp > CACHE_TTL) {
    responseCache.delete(cacheKey);
    return null;
  }
  
  return data;
};

/**
 * Caches a response
 * @param {string} cacheKey - The cache key
 * @param {Object} data - Response data
 */
export const cacheResponse = (cacheKey, data) => {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
};

/**
 * Clears the entire cache or a specific item
 * @param {string} [cacheKey] - Optional cache key to clear
 */
export const clearCache = (cacheKey) => {
  if (cacheKey) {
    responseCache.delete(cacheKey);
  } else {
    responseCache.clear();
  }
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      responseCache.delete(key);
    }
  }
};

/**
 * Optimized fetch with caching, deduplication, rate limiting and retry logic
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {boolean} [useCache=true] - Whether to use caching
 * @param {number} [maxRetries=3] - Maximum number of retries
 * @param {number} [retryDelay=1000] - Delay between retries in milliseconds
 * @returns {Promise<Object>} - Response data
 */
export const optimizedFetch = async (
  url,
  options = {},
  useCache = true,
  maxRetries = 3,
  retryDelay = 1000
) => {
  // Default options
  const defaultOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  
  const fetchOptions = { ...defaultOptions, ...options };
  const params = fetchOptions.body ? JSON.parse(fetchOptions.body) : {};
  const method = fetchOptions.method;
  const cacheKey = generateCacheKey(url, params, method);
  
  // Return cached response if available and caching is enabled
  if (useCache && method === 'GET') {
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      console.log('🔄 Serving from cache:', url);
      return cachedResponse;
    }
  }

  // Check for in-flight requests to the same endpoint to avoid duplicates
  if (inFlightRequests.has(cacheKey)) {
    console.log('🔄 Reusing in-flight request:', url);
    return inFlightRequests.get(cacheKey);
  }
  
  // Check rate limiting
  if (isRateLimited()) {
    console.warn('⚠️ Rate limited request:', url);
    const waitTime = TIME_WINDOW_MS - (Date.now() - requestTimestamps[0]);
    
    // Return promise that resolves after rate limit window passes
    const rateLimitPromise = new Promise(resolve => {
      setTimeout(async () => {
        // Retry after waiting
        try {
          const response = await optimizedFetch(url, options, useCache, maxRetries, retryDelay);
          resolve(response);
        } catch (error) {
          throw error;
        }
      }, waitTime + 100); // Add a small buffer
    });
    
    inFlightRequests.set(cacheKey, rateLimitPromise);
    
    try {
      const response = await rateLimitPromise;
      inFlightRequests.delete(cacheKey);
      return response;
    } catch (error) {
      inFlightRequests.delete(cacheKey);
      throw error;
    }
  }
  
  // Track this request for rate limiting
  trackRequest();
  
  // Create the fetch promise with retry logic
  const executeFetch = async (retries) => {
    try {
      const response = await fetch(url, fetchOptions);
      
      // Handle HTTP errors
      if (!response.ok) {
        // If rate limited by server
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
          
          if (retries > 0) {
            console.warn(`⚠️ Rate limited by server. Retrying after ${retryAfter} seconds.`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return executeFetch(retries - 1);
          } else {
            throw new Error(`Rate limit exceeded. Try again later.`);
          }
        }
        
        // Other HTTP errors
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the successful response
      if (useCache && method === 'GET') {
        cacheResponse(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      // Network errors or JSON parsing errors
      if (retries > 0 && !error.message.includes('Rate limit exceeded')) {
        console.warn(`⚠️ Request failed. Retrying... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return executeFetch(retries - 1);
      }
      
      throw error;
    }
  };
  
  // Store the fetch promise to handle duplicate requests
  const fetchPromise = executeFetch(maxRetries);
  inFlightRequests.set(cacheKey, fetchPromise);
  
  try {
    const response = await fetchPromise;
    inFlightRequests.delete(cacheKey);
    return response;
  } catch (error) {
    inFlightRequests.delete(cacheKey);
    throw error;
  }
};

/**
 * Cleanup function - should be called on component unmount
 */
export const cleanup = () => {
  inFlightRequests.clear();
};

// Automatically clean expired cache every 5 minutes
setInterval(clearExpiredCache, 5 * 60 * 1000);

export default {
  optimizedFetch,
  generateCacheKey,
  getCachedResponse,
  cacheResponse,
  clearCache,
  cleanup,
  isRateLimited,
  trackRequest
};
