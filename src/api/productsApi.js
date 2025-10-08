// Products API service functions
import { APP_CONSTANTS } from '../constants';
import { getProductsOptimized } from '../services/optimizedApi';
import groceryData from '../groceryData.json';

const API_BASE_URL = APP_CONSTANTS.API_BASE_URL;

// Offline storage utilities
const DB_NAME = 'ShalviEcommerceDB';
const PRODUCTS_STORE = 'products';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

  // Debug: Log the raw product data
  console.log('🔄 processProductData - Raw product:', product);
  console.log('🔄 processProductData - p_code field:', product.p_code);
  console.log('🔄 processProductData - _id field:', product._id);

  // Calculate discount percentage
  const mrp = convertToNumber(product.product_mrp, 0);
  const ourPrice = convertToNumber(product.our_price, 0);
  const discountPercentage = mrp > 0 ? Math.round(((mrp - ourPrice) / mrp) * 100) : 0;

  const processedProduct = {
    ...product,
    _id: convertObjectId(product._id),
    p_code: product.p_code || product.pcode || product._id, // Preserve p_code field
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

  // Debug: Log the processed product data
  console.log('✅ processProductData - Processed product:', processedProduct);
  console.log('✅ processProductData - Final p_code:', processedProduct.p_code);
  console.log('✅ processProductData - Final _id:', processedProduct._id);

  return processedProduct;
};

// Convert grocery data to API format
const convertGroceryDataToApiFormat = (groceryProducts, page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = groceryProducts.slice(startIndex, endIndex);
  
  const convertedProducts = paginatedProducts.map((product, index) => ({
    _id: product.id.toString(),
    product_name: product.name,
    product_description: product.description || `${product.name} - ${product.brand}`,
    product_mrp: product.mrp || product.price * 1.2, // Add 20% markup for MRP
    our_price: product.price,
    discount_percentage: product.discount || Math.round(((product.mrp || product.price * 1.2) - product.price) / (product.mrp || product.price * 1.2) * 100),
    store_quantity: product.stock || Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
    max_quantity_allowed: 10,
    package_size: product.package_size || '1 kg',
    category: product.subcategory || 'General',
    brand: product.brand,
    image_url: product.image || '/images/placeholder-product.jpg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const totalProducts = groceryProducts.length;
  const totalPages = Math.ceil(totalProducts / limit);

  return {
    products: convertedProducts,
    pagination: {
      page: page,
      limit: limit,
      total_products: totalProducts,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1
    }
  };
};

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create products store
      if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
        const store = db.createObjectStore(PRODUCTS_STORE, { keyPath: 'cacheKey' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Cache products data
const cacheProductsData = async (cacheKey, data) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([PRODUCTS_STORE], 'readwrite');
    const store = transaction.objectStore(PRODUCTS_STORE);

    await store.put({
      cacheKey,
      data,
      timestamp: Date.now()
    });

    db.close();
  } catch (error) {
    console.warn('Failed to cache products data:', error);
  }
};

// Get cached products data
const getCachedProductsData = async (cacheKey) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([PRODUCTS_STORE], 'readonly');
    const store = transaction.objectStore(PRODUCTS_STORE);

    return new Promise((resolve) => {
      const request = store.get(cacheKey);

      request.onsuccess = () => {
        const result = request.result;

        if (result && (Date.now() - result.timestamp) < CACHE_EXPIRY) {
          resolve(result.data);
        } else {
          // Cache expired or doesn't exist
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.warn('Failed to get cached products data:', error);
    return null;
  }
};

// Clear expired cache entries
const clearExpiredCache = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([PRODUCTS_STORE], 'readwrite');
    const store = transaction.objectStore(PRODUCTS_STORE);
    const index = store.index('timestamp');

    const request = index.openCursor();
    const expiredKeys = [];

    return new Promise((resolve) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
          if (Date.now() - cursor.value.timestamp > CACHE_EXPIRY) {
            expiredKeys.push(cursor.primaryKey);
          }
          cursor.continue();
        } else {
          // Delete expired entries
          expiredKeys.forEach(key => store.delete(key));
          resolve();
        }
      };

      request.onerror = () => resolve();
    });
  } catch (error) {
    console.warn('Failed to clear expired cache:', error);
  }
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
 * Fetch products with pagination support and offline caching
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.dept_id - Department ID (default: "2")
 * @param {string} params.category_id - Category ID (default: "72")
 * @param {string} params.sub_category_id - Sub-category ID (default: "391")
 * @returns {Promise<Object>} - API response with products and pagination
 */
export const getProducts = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      dept_id = "2",
      category_id = "72",
      sub_category_id = "391"
    } = params;

    const url = `${API_BASE_URL}/products/get_active_products_list`;
    const cacheKey = `products_${page}_${limit}_${dept_id}_${category_id}_${sub_category_id}`;

    // Clear expired cache entries periodically
    if (Math.random() < 0.1) { // 10% chance to clear expired cache
      clearExpiredCache();
    }

    // If online, try to fetch from network first
    if (isOnline()) {
      try {
        const requestBody = {
          dept_id,
          category_id,
          sub_category_id,
          store_code: process.env.REACT_APP_STORE_CODE || "your_store_code",
          project_code: process.env.REACT_APP_PROJECT_CODE || "your_project_code",
          page,
          limit
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();

        // Validate response structure
        if (!data.success || !data.data) {
          throw new Error('Invalid API response structure');
        }

        // Process and convert MongoDB types in product data
        const processedData = {
          products: data.data?.map(processProductData) || [],
          pagination: data.pagination ? {
            page: data.pagination.current_page || page,
            limit: data.pagination.per_page || limit,
            total_products: data.pagination.total_products || 0,
            total_pages: data.pagination.total_pages || 1,
            has_next: data.pagination.has_next || false,
            has_prev: data.pagination.has_prev || false
          } : {
            page: page,
            limit: limit,
            total_products: data.data?.length || 0,
            total_pages: Math.ceil((data.data?.length || 0) / limit),
            has_next: page < Math.ceil((data.data?.length || 0) / limit),
            has_prev: page > 1
          }
        };

        // Cache the processed response for offline use
        await cacheProductsData(cacheKey, processedData);

        return processedData;
      } catch (networkError) {
        console.warn('Network request failed, trying cache:', networkError);

        // If network fails, try to get from cache
        const cachedData = await getCachedProductsData(cacheKey);
        if (cachedData) {
          console.log('Serving products from cache');
          // Process cached data to ensure it's in the correct format
          const processedCachedData = {
            ...cachedData,
            products: cachedData.products?.map(processProductData) || []
          };
          return { ...processedCachedData, isOffline: true };
        }

        // If no cache available, use grocery data as fallback
        console.log('No cache available, using grocery data as fallback');
        const fallbackData = convertGroceryDataToApiFormat(groceryData.products, page, limit);
        return { ...fallbackData, isOffline: true, isFallback: true };
      }
    } else {
      // Offline mode - try to get from cache
      console.log('Offline mode: Attempting to load products from cache');
      const cachedData = await getCachedProductsData(cacheKey);

      if (cachedData) {
        console.log('Serving products from cache (offline mode)');
        // Process cached data to ensure it's in the correct format
        const processedCachedData = {
          ...cachedData,
          products: cachedData.products?.map(processProductData) || []
        };
        return { ...processedCachedData, isOffline: true };
      } else {
        // No cache available, use grocery data as fallback
        console.log('No cache available in offline mode, using grocery data as fallback');
        const fallbackData = convertGroceryDataToApiFormat(groceryData.products, page, limit);
        return { ...fallbackData, isOffline: true, isFallback: true };
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Keep the old function for backward compatibility but mark as deprecated
export const fetchProducts = async (params = {}) => {
  console.warn('fetchProducts is deprecated. Use getProducts instead.');
  return getProducts(params);
};

export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    // Check if we're online
    if (!navigator.onLine) {
      throw new Error('No internet connection');
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/products/categories`, {}, 10000);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Return fallback data structure instead of throwing
    return {
      success: false,
      data: [],
      message: 'Failed to fetch categories. Using fallback data.',
      error: error.message
    };
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`Failed to search products: ${response.statusText}`);
    }

    const products = await response.json();
    // Simple client-side search - in a real app, this would be server-side
    const filteredProducts = products.filter(product =>
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );

    return filteredProducts;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};
