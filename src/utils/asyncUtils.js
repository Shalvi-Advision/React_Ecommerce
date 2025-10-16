/**
 * Async Utilities for API optimization
 * 
 * This module provides debouncing, throttling and request batching utilities
 * to prevent excessive API calls and optimize performance.
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} [immediate=false] - Whether to invoke the function on the leading edge
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  
  return function executedFunction(...args) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
};

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per every specified wait period.
 * 
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} - The throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  let lastResult;
  
  return function executedFunction(...args) {
    const context = this;
    
    if (!inThrottle) {
      lastResult = func.apply(context, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  };
};

/**
 * Request batching utility that groups multiple API calls into a single request
 */
export class RequestBatcher {
  constructor(batchFunction, options = {}) {
    this.batchFunction = batchFunction;
    this.queue = [];
    this.timeout = null;
    this.options = {
      maxBatchSize: options.maxBatchSize || 10,
      delayMs: options.delayMs || 50,
      ...options
    };
  }

  /**
   * Add a request to the batch queue
   * @param {any} requestData - Data for the request
   * @returns {Promise} - Promise that resolves with the response
   */
  add(requestData) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestData,
        resolve,
        reject
      });

      this._scheduleProcessing();
    });
  }

  /**
   * Schedule the processing of the queue
   */
  _scheduleProcessing() {
    if (this.timeout === null) {
      this.timeout = setTimeout(() => {
        this._processQueue();
      }, this.options.delayMs);
    }

    // If we've reached maximum batch size, process immediately
    if (this.queue.length >= this.options.maxBatchSize) {
      clearTimeout(this.timeout);
      this.timeout = null;
      this._processQueue();
    }
  }

  /**
   * Process the current batch queue
   */
  async _processQueue() {
    const currentQueue = [...this.queue];
    this.queue = [];
    this.timeout = null;

    if (currentQueue.length === 0) return;

    try {
      // Extract request data from queue items
      const requestDataItems = currentQueue.map(item => item.requestData);
      
      // Execute the batch request
      const responses = await this.batchFunction(requestDataItems);
      
      // Distribute responses to the corresponding promises
      if (Array.isArray(responses) && responses.length === currentQueue.length) {
        responses.forEach((response, index) => {
          currentQueue[index].resolve(response);
        });
      } else {
        // If response format doesn't match expectations, resolve with the entire response
        currentQueue.forEach(item => {
          item.resolve(responses);
        });
      }
    } catch (error) {
      // Reject all promises if the batch request fails
      currentQueue.forEach(item => {
        item.reject(error);
      });
    }
  }

  /**
   * Clear the queue and cancel pending batch
   */
  clear() {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    this.queue.forEach(item => {
      item.reject(new Error('Batch request cancelled'));
    });
    
    this.queue = [];
  }
}

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {Object} options - Options for retrying
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.initialDelayMs - Initial delay in milliseconds
 * @param {number} options.maxDelayMs - Maximum delay in milliseconds
 * @returns {Promise} - Result of the function
 */
export const retryWithBackoff = async (fn, {
  maxRetries = 5,
  initialDelayMs = 300,
  maxDelayMs = 10000
} = {}) => {
  let retries = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }
      
      retries++;
      
      // Wait for the backoff delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff with jitter
      delay = Math.min(delay * 2, maxDelayMs) * (0.8 + Math.random() * 0.4);
    }
  }
};

export default {
  debounce,
  throttle,
  RequestBatcher,
  retryWithBackoff
};
