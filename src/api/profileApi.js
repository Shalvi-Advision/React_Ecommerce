// Profile API service functions
import { apiPost } from '../services/api';
import { APP_CONSTANTS } from '../constants';

// Get customer profile
export const getCustomerProfile = async (storeCode) => {
  try {
    console.log('🔍 getCustomerProfile called with store_code:', storeCode);
    
    const response = await apiPost('/users/get_customer_profile', {
      store_code: storeCode
    });
    
    console.log('📦 getCustomerProfile API response:', response);
    
    // Check if the response indicates an error
    if (response && response.success === false) {
      console.error('❌ API returned success: false', response);
      throw new Error(response.message || 'Failed to fetch customer profile');
    }
    
    // Check if response has data
    if (!response || !response.data) {
      console.error('❌ API response missing data:', response);
      throw new Error('Customer profile data not found in response');
    }
    
    console.log('✅ Customer profile data:', response.data);
    return response;
  } catch (error) {
    console.error('❌ getCustomerProfile error:', error);
    
    // If it's already an Error object, re-throw it
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 404) {
        throw new Error('Customer profile not found');
      } else if (error.response.status === 500) {
        throw new Error('Server error while fetching profile');
      } else {
        throw new Error(`API error: ${error.response.status} - ${error.response.statusText}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error - unable to reach server');
    } else {
      // Other error
      const errorMessage = error.message || 'Failed to fetch customer profile';
      throw new Error(errorMessage);
    }
  }
};

// Add or update customer profile
export const addUpdateCustomerProfile = async (profileData) => {
  try {
    console.log('🔍 addUpdateCustomerProfile called with data:', profileData);
    
    const response = await apiPost('/users/add_update_customer_profile', profileData);
    
    console.log('📦 addUpdateCustomerProfile API response:', response);
    
    // Check if the response indicates an error
    if (response && response.success === false) {
      console.error('❌ API returned success: false', response);
      throw new Error(response.message || 'Failed to update customer profile');
    }
    
    // Check if response has data
    if (!response || !response.data) {
      console.error('❌ API response missing data:', response);
      throw new Error('Customer profile update data not found in response');
    }
    
    console.log('✅ Customer profile updated successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ addUpdateCustomerProfile error:', error);
    
    // If it's already an Error object, re-throw it
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 400) {
        throw new Error('Invalid profile data provided');
      } else if (error.response.status === 500) {
        throw new Error('Server error while updating profile');
      } else {
        throw new Error(`API error: ${error.response.status} - ${error.response.statusText}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error - unable to reach server');
    } else {
      // Other error
      const errorMessage = error.message || 'Failed to update customer profile';
      throw new Error(errorMessage);
    }
  }
};

// Helper function to format profile data for API
export const formatProfileDataForAPI = (formData, storeCode) => {
  return {
    store_code: storeCode,
    first_name: formData.firstName || '',
    last_name: formData.lastName || '',
    email_id: formData.email || '',
    mobile_number: formData.mobile || '',
    delivery_addr_line_1: formData.addressLine1 || '',
    delivery_addr_line_2: formData.addressLine2 || '',
    delivery_addr_city: formData.city || '',
    delivery_addr_pincode: formData.pincode || '',
    latitude: formData.latitude || '',
    longitude: formData.longitude || ''
  };
};

// Helper function to format API response data for UI
export const formatProfileDataForUI = (apiData) => {
  if (!apiData) return null;
  
  return {
    id: apiData._id,
    fullName: apiData.full_name || '',
    firstName: apiData.first_name || '',
    lastName: apiData.last_name || '',
    mobileNumber: apiData.mobile_number || '',
    emailId: apiData.email_id || '',
    addressLine1: apiData.delivery_addr_line_1 || '',
    addressLine2: apiData.delivery_addr_line_2 || '',
    city: apiData.delivery_addr_city || '',
    pincode: apiData.delivery_addr_pincode || '',
    isDefault: apiData.is_default === 'Yes',
    latitude: apiData.latitude || '',
    longitude: apiData.longitude || '',
    areaId: apiData.area_id || '',
    userId: apiData.user_id || '',
    storeCode: apiData.store_code || '',
    createdAt: apiData.created_at || '',
    updatedAt: apiData.updated_at || ''
  };
};

