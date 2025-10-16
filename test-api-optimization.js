/**
 * API Optimization Test Script
 * 
 * This script tests the API optimization mechanisms to ensure they're working correctly.
 * It simulates multiple simultaneous requests and checks for rate limiting and caching behavior.
 */

// Import required modules
const { optimizedFetch, clearCache, getCachedResponse, generateCacheKey } = require('./src/utils/apiOptimizer');
const { getProductsOptimized } = require('./src/api/productsApi');
const { APP_CONSTANTS } = require('./src/constants');

// API Base URL
const API_BASE_URL = APP_CONSTANTS.API_BASE_URL;

/**
 * Test caching behavior
 */
async function testCaching() {
  console.log('\n--- Testing Caching Mechanism ---');
  
  // Clear any existing cache
  clearCache();
  
  // Make first request - should go to network
  console.log('Making first request (should go to network)...');
  const start1 = Date.now();
  const result1 = await optimizedFetch(`${API_BASE_URL}/products/categories`);
  const time1 = Date.now() - start1;
  console.log(`Request completed in ${time1}ms`);
  
  // Make second request immediately - should use cache
  console.log('\nMaking second request (should use cache)...');
  const start2 = Date.now();
  const result2 = await optimizedFetch(`${API_BASE_URL}/products/categories`);
  const time2 = Date.now() - start2;
  console.log(`Request completed in ${time2}ms`);
  
  // Verify cache hit by comparing times
  if (time2 < time1) {
    console.log('✅ Cache is working! Second request was faster.');
  } else {
    console.log('❌ Cache may not be working correctly. Second request took the same or more time.');
  }
  
  // Check if response is identical
  console.log('\nVerifying responses are identical...');
  const areEqual = JSON.stringify(result1) === JSON.stringify(result2);
  console.log(areEqual ? '✅ Responses are identical.' : '❌ Responses differ!');
}

/**
 * Test rate limiting behavior
 */
async function testRateLimiting() {
  console.log('\n--- Testing Rate Limiting ---');
  
  // Make multiple requests in quick succession
  const requestCount = 10;
  console.log(`Making ${requestCount} simultaneous requests...`);
  
  const startTime = Date.now();
  
  // Create promises for multiple requests
  const promises = Array.from({ length: requestCount }, (_, i) => {
    console.log(`Starting request ${i+1}...`);
    return optimizedFetch(`${API_BASE_URL}/products?page=${i+1}`);
  });
  
  // Wait for all requests to complete
  const results = await Promise.allSettled(promises);
  const endTime = Date.now();
  
  // Count successful and rejected requests
  const fulfilled = results.filter(r => r.status === 'fulfilled').length;
  const rejected = results.filter(r => r.status === 'rejected').length;
  
  console.log(`\nResults: ${fulfilled} successful, ${rejected} rejected/throttled`);
  console.log(`Total time: ${endTime - startTime}ms`);
  
  // If all requests completed immediately, rate limiting might not be working
  if (fulfilled === requestCount && (endTime - startTime) < 1000) {
    console.log('❓ All requests completed quickly. Rate limiting might not be active.');
  } else {
    console.log('✅ Rate limiting appears to be working.');
  }
}

/**
 * Test request deduplication
 */
async function testDeduplication() {
  console.log('\n--- Testing Request Deduplication ---');
  
  // Make identical requests simultaneously
  const requests = Array.from({ length: 5 }, () => 
    optimizedFetch(`${API_BASE_URL}/products/categories`)
  );
  
  console.log('Making 5 identical requests simultaneously...');
  const startTime = Date.now();
  await Promise.all(requests);
  const totalTime = Date.now() - startTime;
  
  console.log(`All requests completed in ${totalTime}ms`);
  console.log('If deduplication is working, only one network request should have been made.');
  
  // We can't programmatically verify this, but we can check the network tab in browser
}

/**
 * Test the products API optimization
 */
async function testProductsApi() {
  console.log('\n--- Testing Products API Optimization ---');
  
  // Test params for different requests
  const testParams = [
    { page: 1, limit: 20, category_id: "72" },
    { page: 2, limit: 20, category_id: "72" },
    { page: 1, limit: 20, category_id: "72" } // Duplicate of first request to test caching
  ];
  
  // Execute each request and measure time
  for (let i = 0; i < testParams.length; i++) {
    console.log(`\nRequest ${i+1} with params:`, testParams[i]);
    
    const start = Date.now();
    try {
      const result = await getProductsOptimized(testParams[i]);
      const time = Date.now() - start;
      
      console.log(`Request completed in ${time}ms`);
      console.log(`Got ${result.products?.length || 0} products`);
      
      // For the duplicate request, it should be faster
      if (i === 2) {
        console.log('This was a duplicate request and should have been served from cache.');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=== API OPTIMIZATION TEST SUITE ===');
  console.log('Testing API optimizations to ensure they work correctly.\n');
  
  try {
    await testCaching();
    await testRateLimiting();
    await testDeduplication();
    await testProductsApi();
    
    console.log('\n=== TEST SUITE COMPLETE ===');
    console.log('All tests completed. Check the console output for results.');
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

// Run the tests
runTests();
