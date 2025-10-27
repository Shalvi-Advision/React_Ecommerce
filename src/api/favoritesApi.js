import { apiPost } from '../services/api';
import api from '../services/api';
import { APP_CONSTANTS } from '../constants';
import { getStoredToken } from '../services/api';

const API_BASE_URL = APP_CONSTANTS.API_BASE_URL;
const PROJECT_CODE = APP_CONSTANTS.PROJECT_CODE;

/**
 * Get store code from localStorage
 */
const getStoreCode = () => {
  const locationData = localStorage.getItem('confirmedLocation');
  if (locationData) {
    try {
      const location = JSON.parse(locationData);
      return location?.store?.store_code || location?.store?.storeCode || APP_CONSTANTS.DEFAULT_STORE_CODE;
    } catch (error) {
      console.error('Error parsing location data:', error);
      return APP_CONSTANTS.DEFAULT_STORE_CODE;
    }
  }
  return APP_CONSTANTS.DEFAULT_STORE_CODE;
};

/**
 * Add a product to favorites
 * @param {string} p_code - Product code
 * @returns {Promise<Object>} API response
 */
export const addToFavorites = async (p_code) => {
  try {
    const store_code = getStoreCode();
    
    const requestBody = {
      store_code,
      project_code: PROJECT_CODE,
      p_code
    };

    console.log('🔗 Adding to favorites:', requestBody);

    const response = await apiPost('/favorites/add-to-favorites', requestBody);
    
    console.log('✅ Add to favorites response:', response);
    
    return response;
  } catch (error) {
    console.error('❌ Error adding to favorites:', error);
    throw error;
  }
};

/**
 * Remove a product from favorites using DELETE method
 * @param {string} p_code - Product code
 * @returns {Promise<Object>} API response
 */
export const removeFromFavorites = async (p_code) => {
  try {
    const store_code = getStoreCode();
    
    // Normalize p_code to ensure it matches backend format
    const normalizedPcode = String(p_code).trim();
    
    const requestBody = {
      store_code,
      project_code: PROJECT_CODE,
      p_code: normalizedPcode
    };

    console.log('🗑️ Removing from favorites:');
    console.log('   📦 Original p_code:', p_code);
    console.log('   📦 Normalized p_code:', normalizedPcode);
    console.log('   📦 Request Body:', requestBody);
    console.log('   🔍 P-Code Type:', typeof normalizedPcode);
    console.log('   🔍 P-Code Value:', JSON.stringify(normalizedPcode));
    console.log('   🔍 Store Code:', store_code);
    console.log('   🔍 Project Code:', PROJECT_CODE);

    // Try DELETE first (since your backend seems to expect it)
    let response;
    
    try {
      console.log('🔄 Trying DELETE method...');
      response = await api.delete('/favorites/remove-from-favorites', {
        data: requestBody
      });
      console.log('✅ DELETE Success - Remove from favorites response:', response.data);
      return response.data;
    } catch (deleteError) {
      console.log('❌ DELETE failed:', deleteError.response?.data || deleteError.message);
      console.log('🔄 Trying POST method...');
      
      try {
        // Fallback to POST
        response = await apiPost('/favorites/remove-from-favorites', requestBody);
        console.log('✅ POST Success - Remove from favorites response:', response);
        return response;
      } catch (postError) {
        console.error('❌ POST also failed:', postError.response?.data || postError.message);
        throw postError; // Throw the POST error
      }
    }
  } catch (error) {
    console.error('❌ Error removing from favorites:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Full Request:', { store_code: getStoreCode(), project_code: PROJECT_CODE, p_code });
    console.error('❌ P-Code Details:', { 
      original: p_code,
      normalized: normalizedPcode,
      type: typeof normalizedPcode,
      length: normalizedPcode?.length,
      trimmed: String(normalizedPcode).trim(),
      stringified: JSON.stringify(normalizedPcode)
    });
    
    // Helpful debugging info
    console.error('\n❌ TROUBLESHOOTING TIPS:');
    console.error('   1. Check if p_code format matches backend');
    console.error('   2. Backend might have it as number or different string format');
    console.error('   3. Try fetching favorites first to see exact p_code format');
    console.error('   Run in console: fetchFavorites()');
    
    throw error;
  }
};

/**
 * Get all favorites for the current user
 * @returns {Promise<Object>} API response with favorites list
 */
export const getFavorites = async () => {
  try {
    const store_code = getStoreCode();
    
    const requestBody = {
      store_code,
      project_code: PROJECT_CODE
    };

    console.log('🔗 Getting favorites:', requestBody);

    const response = await apiPost('/favorites/get-favorites', requestBody);
    
    console.log('✅ Get favorites response:', response);
    
    return response;
  } catch (error) {
    console.error('❌ Error getting favorites:', error);
    throw error;
  }
};

export default {
  addToFavorites,
  removeFromFavorites,
  getFavorites
};

