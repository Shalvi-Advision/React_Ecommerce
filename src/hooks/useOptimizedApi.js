// Custom hook for optimized API calls with debouncing and rate limiting
import { useState, useEffect, useCallback, useRef } from 'react';
import { getApiStats, clearApiCache } from '../services/optimizedApi';

export const useOptimizedApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const requestTimeouts = useRef(new Map());

  // Debounced API call function
  const debouncedApiCall = useCallback((apiFunction, delay = 500) => {
    return (...args) => {
      return new Promise((resolve, reject) => {
        // Clear existing timeout for this function
        const timeoutKey = apiFunction.name || 'default';
        if (requestTimeouts.current.has(timeoutKey)) {
          clearTimeout(requestTimeouts.current.get(timeoutKey));
        }

        // Set new timeout
        const timeoutId = setTimeout(async () => {
          try {
            setIsLoading(true);
            setError(null);
            const result = await apiFunction(...args);
            resolve(result);
          } catch (err) {
            setError(err);
            reject(err);
          } finally {
            setIsLoading(false);
            requestTimeouts.current.delete(timeoutKey);
          }
        }, delay);

        requestTimeouts.current.set(timeoutKey, timeoutId);
      });
    };
  }, []);

  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      requestTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
      requestTimeouts.current.clear();
    };
  }, []);

  // Update cache stats periodically
  useEffect(() => {
    const updateStats = () => {
      setCacheStats(getApiStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Clear cache function
  const clearCache = useCallback(() => {
    clearApiCache();
    setCacheStats(getApiStats());
  }, []);

  return {
    isLoading,
    error,
    cacheStats,
    debouncedApiCall,
    clearCache
  };
};

// Hook for managing API calls with retry logic
export const useApiWithRetry = (apiFunction, maxRetries = 3) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef(null);

  const executeWithRetry = useCallback(async (...args) => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      setRetryCount(0);
      return result;
    } catch (err) {
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          executeWithRetry(...args);
        }, delay);
      } else {
        setError(err);
        setRetryCount(0);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, maxRetries, retryCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    retryCount,
    executeWithRetry
  };
};

// Hook for batch API calls
export const useBatchApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);

  const executeBatch = useCallback(async (apiCalls) => {
    setIsLoading(true);
    setResults([]);
    setErrors([]);

    try {
      const promises = apiCalls.map(call => 
        call().catch(error => ({ error: error.message }))
      );

      const batchResults = await Promise.allSettled(promises);
      
      const successfulResults = [];
      const failedResults = [];

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && !result.value.error) {
          successfulResults.push({ index, data: result.value });
        } else {
          failedResults.push({ 
            index, 
            error: result.value?.error || result.reason?.message || 'Unknown error' 
          });
        }
      });

      setResults(successfulResults);
      setErrors(failedResults);
      
      return { successful: successfulResults, failed: failedResults };
    } catch (error) {
      console.error('Batch API execution failed:', error);
      setErrors([{ error: error.message }]);
      return { successful: [], failed: [{ error: error.message }] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    results,
    errors,
    executeBatch
  };
};

export default useOptimizedApi;
