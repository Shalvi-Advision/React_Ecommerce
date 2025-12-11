/**
 * Dynamically loads the Razorpay checkout script
 * @returns {Promise<boolean>} - Returns true if script loaded successfully, false otherwise
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (document.getElementById('razorpay-js')) {
      return resolve(true);
    }

    // Create script element
    const script = document.createElement('script');
    script.id = 'razorpay-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';

    // Handle successful load
    script.onload = () => {
      console.log('Razorpay SDK loaded successfully');
      resolve(true);
    };

    // Handle error
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };

    // Append to document body
    document.body.appendChild(script);
  });
}
