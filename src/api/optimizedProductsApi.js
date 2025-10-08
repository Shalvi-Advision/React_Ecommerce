// Optimized Products API service with rate limiting and caching
import { getProductsOptimized } from '../services/optimizedApi';
import groceryData from '../groceryData.json';

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

// Convert grocery data to API format for fallback
const convertGroceryDataToApiFormat = (products, page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = products.slice(startIndex, endIndex);

  return {
    products: paginatedProducts.map(product => ({
      _id: product.id.toString(),
      product_name: product.name,
      product_description: `${product.name} - ${product.brand}`,
      product_mrp: product.mrp,
      our_price: product.price,
      brand_name: product.brand,
      store_quantity: 50, // Default stock
      max_quantity_allowed: 10,
      package_size: product.weightOptions?.[0] || '1 kg',
      category: product.subcategory || 'General',
      pcode_img: product.image || '/images/placeholder-product.jpg',
      p_code: product.id.toString(),
      discount_percentage: product.discount || 0,
      is_active: true
    })),
    pagination: {
      page: page,
      limit: limit,
      total_products: products.length,
      total_pages: Math.ceil(products.length / limit),
      has_next: page < Math.ceil(products.length / limit),
      has_prev: page > 1
    }
  };
};

/**
 * Fetch products with pagination support and optimized caching
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

    // Use optimized API call with rate limiting and caching
    try {
      const data = await getProductsOptimized(params);
      
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

      return processedData;
    } catch (apiError) {
      console.warn('API request failed, using fallback data:', apiError.message);
      
      // If API fails, use grocery data as fallback
      const fallbackData = convertGroceryDataToApiFormat(groceryData.products, page, limit);
      return { ...fallbackData, isOffline: true, isFallback: true };
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch product by ID with optimized caching
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Product data
 */
export const fetchProductById = async (productId) => {
  try {
    // For now, search in grocery data as fallback
    const product = groceryData.products.find(p => p.id.toString() === productId);
    
    if (product) {
      return processProductData({
        _id: product.id.toString(),
        product_name: product.name,
        product_description: `${product.name} - ${product.brand}`,
        product_mrp: product.mrp,
        our_price: product.price,
        brand_name: product.brand,
        store_quantity: 50,
        max_quantity_allowed: 10,
        package_size: product.weightOptions?.[0] || '1 kg',
        category: product.subcategory || 'General',
        pcode_img: product.image || '/images/placeholder-product.jpg',
        p_code: product.id.toString(),
        discount_percentage: product.discount || 0,
        is_active: true
      });
    }
    
    throw new Error('Product not found');
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

/**
 * Search products with optimized caching
 * @param {string} query - Search query
 * @param {Object} params - Additional parameters
 * @returns {Promise<Object>} - Search results
 */
export const searchProducts = async (query, params = {}) => {
  try {
    const { page = 1, limit = 20 } = params;
    
    // For now, search in grocery data as fallback
    const searchResults = groceryData.products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.subcategory.toLowerCase().includes(query.toLowerCase())
    );
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = searchResults.slice(startIndex, endIndex);
    
    return {
      products: paginatedResults.map(product => processProductData({
        _id: product.id.toString(),
        product_name: product.name,
        product_description: `${product.name} - ${product.brand}`,
        product_mrp: product.mrp,
        our_price: product.price,
        brand_name: product.brand,
        store_quantity: 50,
        max_quantity_allowed: 10,
        package_size: product.weightOptions?.[0] || '1 kg',
        category: product.subcategory || 'General',
        pcode_img: product.image || '/images/placeholder-product.jpg',
        p_code: product.id.toString(),
        discount_percentage: product.discount || 0,
        is_active: true
      })),
      pagination: {
        page: page,
        limit: limit,
        total_products: searchResults.length,
        total_pages: Math.ceil(searchResults.length / limit),
        has_next: page < Math.ceil(searchResults.length / limit),
        has_prev: page > 1
      }
    };
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

/**
 * Fetch categories with optimized caching
 * @returns {Promise<Array>} - Categories list
 */
export const fetchCategories = async () => {
  try {
    // Return static categories for now
    return [
      'GROCERY & STAPLES',
      'FRUITS & VEGETABLES',
      'DAIRY & BEVERAGES',
      'PACKAGED FOOD',
      'PERSONAL CARE',
      'HOME & KITCHEN',
      'CLEANING SUPPLIES',
      'BABY CARE',
      'PET CARE',
      'HEALTH & WELLNESS',
      'HOUSEHOLD ITEMS',
      'STATIONERY & OFFICE',
      'AUTOMOTIVE',
      'ELECTRONICS',
      'FASHION & CLOTHING',
      'HOME FURNISHING',
      'BOOKS & MEDIA',
      'SPORTS & FITNESS',
      'GARDEN & OUTDOOR',
      'TOYS & GAMES',
      'JEWELRY & WATCHES'
    ];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export default {
  getProducts,
  fetchProductById,
  searchProducts,
  fetchCategories
};
