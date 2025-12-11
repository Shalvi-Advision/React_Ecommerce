import React from 'react';
import useRazorpay from '../hooks/useRazorpay';

/**
 * PaymentButton Component
 * A reusable button component for initiating Razorpay payments
 *
 * @param {Object} props - Component props
 * @param {number} props.amount - Payment amount in INR
 * @param {Object} props.orderData - Order data and metadata
 * @param {Object} props.userDetails - User details for prefill
 * @param {Function} props.onPaymentSuccess - Callback on successful payment
 * @param {Function} props.onPaymentFailure - Callback on payment failure
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 */
const PaymentButton = ({
  amount,
  orderData = {},
  userDetails = {},
  onPaymentSuccess,
  onPaymentFailure,
  className = '',
  children = 'Pay Now',
  disabled = false,
}) => {
  const { processPayment, loading, error } = useRazorpay();

  const handlePayment = () => {
    processPayment({
      amount,
      currency: 'INR',
      notes: {
        ...orderData,
      },
      prefill: {
        name: userDetails.name || '',
        email: userDetails.email || '',
        contact: userDetails.mobile || userDetails.phone || '',
      },
      onSuccess: (response) => {
        console.log('Payment successful:', response);
        onPaymentSuccess && onPaymentSuccess(response);
      },
      onFailure: (error) => {
        console.error('Payment failed:', error);
        onPaymentFailure && onPaymentFailure(error);
      },
    });
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading || disabled}
        className={`
          px-6 py-3
          bg-primary-500 hover:bg-primary-600
          text-white font-medium rounded-lg
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          children
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default PaymentButton;
