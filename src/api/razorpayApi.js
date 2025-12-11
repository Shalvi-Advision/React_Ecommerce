import api from '../services/api';

/**
 * Create a Razorpay order
 * @param {Object} orderData - Order data including amount, currency, etc.
 * @returns {Promise} - Promise resolving to order details
 */
export const createRazorpayOrder = async (orderData) => {
  try {
    const response = await api.post('/razorpay/order', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

/**
 * Verify Razorpay payment
 * @param {Object} paymentData - Payment verification data
 * @returns {Promise} - Promise resolving to verification result
 */
export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const response = await api.post('/razorpay/verify', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
};
