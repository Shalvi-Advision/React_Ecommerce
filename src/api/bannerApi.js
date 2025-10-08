// Banner API service functions
import { APP_CONSTANTS } from '../constants';
import { getBannersOptimized } from '../services/optimizedApi';

const API_BASE_URL = APP_CONSTANTS.API_BASE_URL;

// Offline storage utilities for banners
const DB_NAME = 'ShalviEcommerceDB';
const BANNERS_STORE = 'banners';
const CACHE_EXPIRY = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// Initialize IndexedDB for banners
const initBannerDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2); // Increment version to trigger upgrade

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create banners store if it doesn't exist
      if (!db.objectStoreNames.contains(BANNERS_STORE)) {
        const store = db.createObjectStore(BANNERS_STORE, { keyPath: 'cacheKey' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('✅ Created banners object store in IndexedDB');
      }
    };
  });
};

// Cache banner data
const cacheBannerData = async (cacheKey, data) => {
  try {
    const db = await initBannerDB();
    
    // Check if the object store exists
    if (!db.objectStoreNames.contains(BANNERS_STORE)) {
      console.warn('Banners object store does not exist, skipping cache');
      db.close();
      return;
    }
    
    const transaction = db.transaction([BANNERS_STORE], 'readwrite');
    const store = transaction.objectStore(BANNERS_STORE);

    await store.put({
      cacheKey,
      data,
      timestamp: Date.now()
    });

    console.log('✅ Banner data cached successfully');
    db.close();
  } catch (error) {
    console.warn('Failed to cache banner data:', error);
  }
};

// Get cached banner data
const getCachedBannerData = async (cacheKey) => {
  try {
    const db = await initBannerDB();
    
    // Check if the object store exists
    if (!db.objectStoreNames.contains(BANNERS_STORE)) {
      console.warn('Banners object store does not exist, no cached data available');
      db.close();
      return null;
    }
    
    const transaction = db.transaction([BANNERS_STORE], 'readonly');
    const store = transaction.objectStore(BANNERS_STORE);

    return new Promise((resolve) => {
      const request = store.get(cacheKey);

      request.onsuccess = () => {
        const result = request.result;

        if (result && (Date.now() - result.timestamp) < CACHE_EXPIRY) {
          console.log('✅ Retrieved banner data from cache');
          resolve(result.data);
        } else {
          // Cache expired or doesn't exist
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.warn('Failed to get cached banner data:', error);
    return null;
  }
};

// Process banner data to ensure consistent format
const processBannerData = (banner) => {
  if (!banner || typeof banner !== 'object') return banner;

  return {
    _id: banner._id || banner.id || `banner_${Date.now()}_${Math.random()}`,
    redirect_link: banner.redirect_link || '#',
    banner_img: banner.banner_img || '/images/placeholder-banner.jpg',
    is_active: banner.is_active === 'Enabled' || banner.is_active === true,
    banner_type_id: banner.banner_type_id || 1,
    sequence_id: banner.sequence_id || 0,
    store_code: banner.store_code || 'DEFAULT',
    banner_bg_color: banner.banner_bg_color || '#FFFFFF',
    __v: banner.__v || 0,
    // Additional fields for carousel
    title: banner.title || '',
    description: banner.description || '',
    alt_text: banner.alt_text || 'Banner image'
  };
};

// Convert banner data from API response format
const convertBannerData = (apiResponse) => {
  if (!apiResponse || !apiResponse.data) {
    return [];
  }

  const banners = [];
  
  // Handle the nested structure where data contains numbered keys
  Object.keys(apiResponse.data).forEach(key => {
    if (Array.isArray(apiResponse.data[key])) {
      banners.push(...apiResponse.data[key]);
    }
  });

  // Sort by sequence_id for proper order
  return banners
    .filter(banner => banner.is_active === 'Enabled' || banner.is_active === true)
    .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
    .map(processBannerData);
};

// Fallback banner data for offline mode
const getFallbackBanners = () => {
  return [
    {
      _id: 'fallback_1',
      redirect_link: '#',
      banner_img: '/images/banner1.jpg',
      is_active: true,
      banner_type_id: 1,
      sequence_id: 1,
      store_code: 'FALLBACK',
      banner_bg_color: '#FFFFFF',
      title: 'Welcome to Our Store',
      description: 'Discover amazing products',
      alt_text: 'Welcome banner'
    },
    {
      _id: 'fallback_2',
      redirect_link: '#',
      banner_img: '/images/banner2.jpg',
      is_active: true,
      banner_type_id: 1,
      sequence_id: 2,
      store_code: 'FALLBACK',
      banner_bg_color: '#FFFFFF',
      title: 'Special Offers',
      description: 'Limited time deals',
      alt_text: 'Special offers banner'
    },
    {
      _id: 'fallback_3',
      redirect_link: '#',
      banner_img: '/images/banner3.jpg',
      is_active: true,
      banner_type_id: 1,
      sequence_id: 3,
      store_code: 'FALLBACK',
      banner_bg_color: '#FFFFFF',
      title: 'New Arrivals',
      description: 'Fresh products daily',
      alt_text: 'New arrivals banner'
    }
  ];
};

// Check if user is online
const isOnline = () => {
  return navigator.onLine;
};

// Utility function to make API calls with timeout
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

/**
 * Fetch banners from API with optimized caching and rate limiting
 * @param {Object} params - Query parameters
 * @param {string} params.store_code - Store code (default: from env or "KET")
 * @param {string} params.project_code - Project code (default: from env or "RET90")
 * @returns {Promise<Object>} - API response with banners
 */
export const getBanners = async (params = {}) => {
  try {
    const {
      store_code = process.env.REACT_APP_STORE_CODE || "KET",
      project_code = process.env.REACT_APP_PROJECT_CODE || "RET90"
    } = params;

    // Use optimized API call with rate limiting and caching
    try {
      const data = await getBannersOptimized(params);
      
      // Validate response structure
      if (!data.success) {
        throw new Error('API returned success: false');
      }

      if (!data.data) {
        console.warn('⚠️ No data field in response, using empty banners array');
        return {
          banners: [],
          success: data.success,
          message: data.message || 'No banners available',
          isOffline: false,
          isFallback: false
        };
      }

      // Process and convert banner data
      const processedBanners = convertBannerData(data);
      console.log('✅ Processed banners:', processedBanners.length, 'banners');

      return {
        banners: processedBanners,
        success: data.success,
        message: data.message || 'Banners retrieved successfully',
        isOffline: false,
        isFallback: false
      };
    } catch (apiError) {
      console.warn('API request failed, using fallback data:', apiError.message);
      
      // If API fails, use fallback data
      const fallbackBanners = getFallbackBanners();
      return {
        banners: fallbackBanners,
        success: true,
        message: 'Using fallback banner data',
        isOffline: true,
        isFallback: true
      };
    }
  } catch (error) {
    console.error('❌ Error fetching banners:', error);
    
    // Return fallback data instead of throwing error
    const fallbackBanners = getFallbackBanners();
    return {
      banners: fallbackBanners,
      success: false,
      message: `Failed to fetch banners: ${error.message}. Using fallback data.`,
      error: error.message,
      isOffline: true,
      isFallback: true
    };
  }
};

export default {
  getBanners
};
