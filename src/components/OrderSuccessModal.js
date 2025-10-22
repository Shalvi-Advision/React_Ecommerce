import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const OrderSuccessModal = ({ isVisible, onClose, orderNumber }) => {
  const [animationClass, setAnimationClass] = useState('opacity-0 scale-95');
  const navigate = useNavigate();
  
  useEffect(() => {
    let timer;
    
    if (isVisible) {
      // Trigger entrance animation
      setAnimationClass('opacity-100 scale-100');
      
      // Auto-close after 5 seconds
      timer = setTimeout(() => {
        // Start exit animation
        setAnimationClass('opacity-0 scale-95');
        
        // Actually close after animation completes
        setTimeout(() => {
          onClose();
        }, 500);
      }, 5000);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isVisible, onClose]);
  
  if (!isVisible) return null;

  const handleViewOrder = () => {
    setAnimationClass('opacity-0 scale-95');
    setTimeout(() => {
      onClose();
      navigate('/orders');
    }, 500);
  };

  const handleContinueShopping = () => {
    setAnimationClass('opacity-0 scale-95');
    setTimeout(() => {
      onClose();
      navigate('/');
    }, 500);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
      <div 
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-500 ${animationClass}`}
      >
        {/* Success Header with Gradient Background */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 flex items-center justify-center relative">
          <div className="absolute -bottom-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-10 h-10 text-green-500" />
            </div>
          </div>
          
          {/* Close Button */}
          <button 
            onClick={() => {
              setAnimationClass('opacity-0 scale-95');
              setTimeout(onClose, 500);
            }}
            className="absolute top-3 right-3 text-white hover:text-green-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 pt-14 pb-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Order Placed Successfully!
          </h3>
          
          <div className="flex items-center justify-center my-5">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-2">
            Thank you for your purchase!
          </p>
          
          {orderNumber && (
            <p className="text-gray-800 font-medium mb-4">
              Order #{orderNumber}
            </p>
          )}
          
          <p className="text-sm text-gray-500 mb-6">
            You will receive an order confirmation email with details of your order.
          </p>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleViewOrder}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              View Order
            </button>
            <button
              onClick={handleContinueShopping}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        
        {/* Progress Bar Animation */}
        <div className="relative h-1 bg-gray-200">
          <div className="absolute inset-0 bg-green-500 origin-left animate-shrink-linear" />
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
