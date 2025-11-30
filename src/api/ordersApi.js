// Orders API service functions
import { APP_CONSTANTS } from '../constants';
import { apiPost } from '../services/api';

const API_BASE_URL = APP_CONSTANTS.API_BASE_URL;

// Helper to get store_code from localStorage
const getStoreCode = () => {
  try {
    const locationData = localStorage.getItem('confirmedLocation');
    if (locationData) {
      const location = JSON.parse(locationData);
      // Try both storeCode and store_code (for backwards compatibility)
      return location?.store?.storeCode || location?.store?.store_code;
    }
  } catch (error) {
    console.error('Failed to get store_code from localStorage:', error);
  }
  return null;
};

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Place an order
 * @param {Object} orderData - Order details
 * @param {string} orderData.store_code - Store code
 * @param {string} orderData.project_code - Project code
 * @param {boolean} orderData.cart_validated - Whether cart is validated
 * @param {number} orderData.delivery_slot_id - Delivery slot ID
 * @param {string} orderData.delivery_date - Delivery date in YYYY-MM-DD format
 * @param {string} orderData.address_id - Address ID
 * @param {number} orderData.payment_mode_id - Payment mode ID
 * @param {string} orderData.order_notes - Order notes (optional)
 * @param {Object} orderData.payment_details - Payment details
 * @returns {Promise<Object>} - Place order response
 */
export const placeOrder = async (orderData) => {
  try {
    const storeCode = getStoreCode();
    
    // Validate that store code exists in localStorage
    if (!storeCode) {
      const error = new Error('Store code not found. Please select a location first.');
      error.code = 'STORE_CODE_MISSING';
      console.error('❌ Store code validation failed:', error);
      throw error;
    }
    
    const projectCode = APP_CONSTANTS.PROJECT_CODE;
    const token = getAuthToken();

    const url = `${API_BASE_URL}/orders/place-order`;
    
    const requestBody = {
      store_code: storeCode,
      project_code: projectCode,
      cart_validated: orderData.cart_validated ?? true,
      delivery_slot_id: orderData.delivery_slot_id,
      delivery_date: orderData.delivery_date,
      address_id: orderData.address_id,
      payment_mode_id: orderData.payment_mode_id,
      order_notes: orderData.order_notes || '',
      payment_details: orderData.payment_details || {}
    };

    console.log('📦 Calling place order API:', {
      url,
      store_code: storeCode,
      project_code: projectCode,
      requestBody
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📦 Place order API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error('Could not parse error response as JSON');
      }
      
      console.error('❌ Place order API error:', errorText);
      const errorMessage = errorData.message || errorData.error || errorText || `Failed to place order: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    console.log('✅ Place order API response data:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error placing order:', error);
    throw error;
  }
};


