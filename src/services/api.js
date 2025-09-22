// Base API service with authentication support
import axios from 'axios';
import { APP_CONSTANTS } from '../constants';

// OTP Authentication Configuration
const OTP_PROJECT_CODE = "RET90";
const API_BASE_URL = APP_CONSTANTS.API_BASE_URL;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearStoredToken();
      // You might want to redirect to login or dispatch logout action
      window.location.href = '/login';
    }

    // Log error for debugging
    console.error('API Error:', error.response?.data || error.message);

    return Promise.reject(error);
  }
);

// Token storage utilities
export const getStoredToken = () => {
  // Try localStorage first (web)
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('auth_token');
  }

  // For PWA/mobile, we'll use IndexedDB as fallback
  // This is a simplified version - in production you'd want more robust IndexedDB handling
  return null;
};

export const setStoredToken = async (token) => {
  // Store in localStorage for web
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('auth_token', token);
  }

  // For PWA compatibility, you could also store in IndexedDB
  // This ensures offline persistence
  if (typeof window !== 'undefined' && window.indexedDB) {
    try {
      const db = await openAuthDB();
      const transaction = db.transaction(['tokens'], 'readwrite');
      const store = transaction.objectStore('tokens');
      await store.put({ id: 'auth_token', value: token, timestamp: Date.now() });
      db.close();
    } catch (error) {
      console.warn('IndexedDB storage failed:', error);
    }
  }
};

export const clearStoredToken = () => {
  // Clear from localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('auth_token');
  }

  // Clear from IndexedDB
  if (typeof window !== 'undefined' && window.indexedDB) {
    clearIndexedDBToken();
  }
};

// IndexedDB utilities for PWA token persistence
const openAuthDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AuthDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tokens')) {
        db.createObjectStore('tokens', { keyPath: 'id' });
      }
    };
  });
};

const clearIndexedDBToken = async () => {
  try {
    const db = await openAuthDB();
    const transaction = db.transaction(['tokens'], 'readwrite');
    const store = transaction.objectStore('tokens');
    await store.delete('auth_token');
    db.close();
  } catch (error) {
    console.warn('IndexedDB clear failed:', error);
  }
};

// Reusable API methods
export const apiPost = async (endpoint, data) => {
  try {
    console.log('🌐 apiPost called:', { endpoint, data });
    console.log('🌐 Full URL:', `${API_BASE_URL}${endpoint}`);
    console.log('🌐 Request headers:', api.defaults.headers);
    
    const response = await api.post(endpoint, data);
    console.log('✅ apiPost response status:', response.status);
    console.log('✅ apiPost response headers:', response.headers);
    console.log('✅ apiPost response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ apiPost error occurred');
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error response status:', error.response?.status);
    console.error('❌ Error response statusText:', error.response?.statusText);
    console.error('❌ Error response data:', error.response?.data);
    console.error('❌ Full error object:', error);
    throw error.response?.data || error;
  }
};

// POST method that automatically includes project code
export const postWithProjectCode = async (endpoint, data) => {
  try {
    const dataWithProjectCode = {
      ...data,
      project_code: OTP_PROJECT_CODE
    };
    const response = await api.post(endpoint, dataWithProjectCode);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const apiGet = async (endpoint, params = {}) => {
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const apiPut = async (endpoint, data) => {
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const apiDelete = async (endpoint) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// OTP Authentication API Methods
export const otpAuth = {
  // Get OTP for mobile number
  getOtp: async (mobileNo) => {
    try {
      return await postWithProjectCode('/auth/get_otp', {
        mobileNo: mobileNo.replace(/\s+/g, ''), // Remove spaces
      });
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Validate OTP and get token
  validateOtp: async (mobileNo, otp) => {
    try {
      return await postWithProjectCode('/auth/validate_otp', {
        mobileNo: mobileNo.replace(/\s+/g, ''), // Remove spaces
        otp: otp.replace(/\s+/g, ''), // Remove spaces
      });
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify token validity
  verifyToken: async (token) => {
    try {
      const response = await api.post('/auth/verify_token', {
        token
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Refresh token
  refreshToken: async (token) => {
    try {
      const response = await api.post('/auth/refresh_token', {
        token
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Centralized postAuth method that handles authentication automatically
export const postAuth = async (endpoint, data, useToken = true) => {
  try {
    const config = {};

    // Add authorization header if token exists and useToken is true
    if (useToken) {
      const token = getStoredToken();
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`
        };
      }
    }

    const response = await api.post(endpoint, data, config);
    return response.data;
  } catch (error) {
    // Handle token expiration
    if (error.response?.status === 401 && useToken) {
      // Clear stored token on authentication error
      clearStoredToken();
      // Optionally redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw error.response?.data || error;
  }
};

// Utility function to convert MongoDB Decimal128 to number
const convertToNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) return defaultValue;

  // Handle MongoDB Decimal128 objects
  if (typeof value === 'object' && value !== null && '$numberDecimal' in value) {
    return parseFloat(value.$numberDecimal) || defaultValue;
  }

  // Handle regular numbers
  if (typeof value === 'number') return value;

  // Handle string numbers
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  return defaultValue;
};

// Utility function to convert MongoDB ObjectId to string
const convertObjectId = (id) => {
  if (id === null || id === undefined) return null;

  // Handle MongoDB ObjectId objects
  if (typeof id === 'object' && id !== null && '$oid' in id) {
    return id.$oid;
  }

  // Handle regular strings
  if (typeof id === 'string') return id;

  // Try to convert to string
  return id?.toString() || null;
};

// Process product data to convert MongoDB types
const processProductData = (product) => {
  if (!product || typeof product !== 'object') return product;

  // Calculate discount percentage
  const mrp = convertToNumber(product.product_mrp, 0);
  const ourPrice = convertToNumber(product.our_price, 0);
  const discountPercentage = mrp > 0 ? Math.round(((mrp - ourPrice) / mrp) * 100) : 0;

  return {
    ...product,
    _id: convertObjectId(product._id),
    product_name: product.product_name || '',
    product_description: product.product_description || '',
    product_mrp: mrp,
    our_price: ourPrice,
    discount_percentage: discountPercentage,
    store_quantity: convertToNumber(product.store_quantity, 50), // Default stock
    max_quantity_allowed: convertToNumber(product.max_quantity_allowed, 10),
    package_size: product.package_size ? `${product.package_size} ${product.package_unit || 'GM'}` : '1 GM',
    category: product.category || 'General',
    brand: product.brand_name || product.brand || 'Unknown',
    image_url: product.pcode_img || product.image_url || '/images/placeholder-product.jpg',
    is_active: product.pcode_status === 'Y',
    created_at: product.created_at || new Date().toISOString(),
    updated_at: product.updated_at || new Date().toISOString()
  };
};

// Product Details API
export const getProductDetails = async (p_code, store_code, project_code) => {
  try {
    console.log('🔍 getProductDetails called with:', { p_code, store_code, project_code });
    console.log('🌐 API Base URL:', API_BASE_URL);
    console.log('🔗 Full endpoint URL:', `${API_BASE_URL}/products/getpcodeproducts`);
    
    const response = await apiPost('/products/getpcodeproducts', {
      p_code,
      store_code,
      project_code
    });
    
    console.log('📦 getProductDetails API response:', response);
    
    // Check if the response indicates an error
    if (response && response.success === false) {
      console.error('❌ API returned success: false', response);
      throw new Error(response.message || 'Product not found');
    }
    
    // Check if response has data
    if (!response || !response.data) {
      console.error('❌ API response missing data:', response);
      throw new Error('Product data not found in response');
    }
    
    // Process the product data to convert MongoDB types
    console.log('🔄 Processing product data...');
    console.log('🔄 Raw product data:', response.data);
    const processedData = processProductData(response.data);
    console.log('✅ Processed product data:', processedData);
    console.log('✅ Processed data type:', typeof processedData);
    console.log('✅ Processed data keys:', Object.keys(processedData || {}));
    
    // Return the response with processed data
    const finalResponse = {
      ...response,
      data: processedData
    };
    console.log('✅ Final response to return:', finalResponse);
    return finalResponse;
  } catch (error) {
    console.error('❌ getProductDetails error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // If it's already an Error object, re-throw it
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 404) {
        throw new Error('Product not found (404)');
      } else if (error.response.status === 500) {
        throw new Error('Server error (500)');
      } else {
        throw new Error(`API error: ${error.response.status} - ${error.response.statusText}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error - unable to reach server');
    } else {
      // Other error
      const errorMessage = error.message || 'Failed to fetch product details';
      throw new Error(errorMessage);
    }
  }
};

export default api;
