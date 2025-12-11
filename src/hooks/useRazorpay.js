import { useState } from 'react';
import { loadRazorpayScript } from '../utils/loadRazorpay';
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/razorpayApi';

/**
 * Custom hook for Razorpay payment integration
 * @returns {Object} - Payment processing utilities
 */
const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Process payment with Razorpay
   * @param {Object} options - Payment options
   * @param {number} options.amount - Amount in INR (not paise)
   * @param {string} options.currency - Currency code (default: INR)
   * @param {Object} options.notes - Additional notes/metadata
   * @param {Object} options.prefill - User prefill data
   * @param {Function} options.onSuccess - Success callback
   * @param {Function} options.onFailure - Failure callback
   */
  const processPayment = async ({
    amount,
    currency = 'INR',
    notes = {},
    prefill = {},
    onSuccess,
    onFailure,
  }) => {
    try {
      setLoading(true);
      setError(null);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order on backend
      const orderResponse = await createRazorpayOrder({
        amount,
        currency,
        notes,
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      // Configure Razorpay checkout options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderResponse.amount, // Amount in paise
        currency: orderResponse.currency,
        name: process.env.REACT_APP_COMPANY_NAME || 'Patel Mart',
        description: 'Order Payment',
        order_id: orderResponse.id,
        prefill: {
          name: prefill.name || '',
          email: prefill.email || '',
          contact: prefill.contact || '',
        },
        theme: {
          color: '#10b981', // Primary green color
        },
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.success && verifyResponse.status === 'success') {
              setLoading(false);
              onSuccess && onSuccess(verifyResponse);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyError) {
            setLoading(false);
            setError(verifyError.message);
            onFailure && onFailure(verifyError);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            const dismissError = new Error('Payment cancelled by user');
            setError(dismissError.message);
            onFailure && onFailure(dismissError);
          },
        },
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setLoading(false);
      setError(err.message);
      onFailure && onFailure(err);
    }
  };

  return {
    processPayment,
    loading,
    error,
  };
};

export default useRazorpay;
