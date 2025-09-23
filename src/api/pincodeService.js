// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Project code - this should be set in environment variables
const PROJECT_CODE = process.env.REACT_APP_PROJECT_CODE || 'default_project';

/**
 * Get all available pincodes
 * @returns {Promise<Object>} API response with pincode list
 */
export const getAllPincodes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pincodes/get_pincode_list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pincodes:', error);
    throw error;
  }
};

/**
 * Check if a pincode is serviceable
 * @param {string} pincode - The pincode to check
 * @returns {Promise<Object>} API response with serviceability status
 */
export const checkPincodeServiceability = async (pincode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pincodes/check_if_pincode_exists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pincode: pincode,
        project_code: PROJECT_CODE
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking pincode serviceability:', error);
    throw error;
  }
};

/**
 * Get stores available for a specific pincode
 * @param {string} pincode - The pincode to get stores for
 * @returns {Promise<Object>} API response with store list
 */
export const getPincodeStores = async (pincode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pincodes/get_pincodewise_outlet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pincode: pincode,
        project_code: PROJECT_CODE
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pincode stores:', error);
    throw error;
  }
};

/**
 * Get detailed information about a specific store
 * @param {string} storeCode - The store code to get details for
 * @returns {Promise<Object>} API response with store details
 */
export const getStoreDetails = async (storeCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pincodes/get_store_details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        store_code: storeCode,
        project_code: PROJECT_CODE
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching store details:', error);
    throw error;
  }
};

/**
 * Search pincodes with autocomplete functionality
 * @param {string} query - Search query
 * @param {Array} pincodeList - List of all pincodes
 * @returns {Array} Filtered pincodes matching the query
 */
export const searchPincodes = (query, pincodeList) => {
  if (!query || !pincodeList) return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  return pincodeList.filter(pincode => 
    pincode.pincode.includes(searchTerm) ||
    (pincode.area && pincode.area.toLowerCase().includes(searchTerm)) ||
    (pincode.fullAddress && pincode.fullAddress.toLowerCase().includes(searchTerm))
  ).slice(0, 20); // Limit to 20 results
};

/**
 * Format pincode data for display
 * @param {Object} pincodeData - Raw pincode data from API
 * @returns {Object} Formatted pincode data
 */
export const formatPincodeData = (pincodeData) => {
  return {
    _id: pincodeData._id,
    pincode: pincodeData.pincode,
    area: pincodeData.area || 'Unknown Area',
    fullAddress: `${pincodeData.pincode}, India`,
    isEnabled: pincodeData.is_enabled === 'Enabled'
  };
};

/**
 * Format store data for display
 * @param {Object} storeData - Raw store data from API
 * @returns {Object} Formatted store data
 */
export const formatStoreData = (storeData) => {
  return {
    _id: storeData._id,
    storeCode: storeData.store_code,
    storeName: storeData.mobile_outlet_name,
    storeAddress: storeData.store_address,
    pincode: storeData.pincode,
    minOrderAmount: storeData.min_order_amount,
    storeOpenTime: storeData.store_open_time,
    storeDeliveryTime: storeData.store_delivery_time,
    storeOfferName: storeData.store_offer_name,
    latitude: storeData.latitude,
    longitude: storeData.longitude,
    homeDelivery: storeData.home_delivery === 'yes',
    selfPickup: storeData.self_pickup === 'yes',
    storeMessage: storeData.store_message,
    contactNumber: storeData.contact_number,
    email: storeData.email,
    whatsappNumber: storeData.whatsappnumber,
    isEnabled: storeData.is_enabled === 'Enabled'
  };
};