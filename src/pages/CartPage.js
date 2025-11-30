import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import cartService from '../services/cartService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { COLORS } from '../constants/theme';
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const CartPage = () => {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    removeItem, 
    updateQuantity, 
    clearCart,
    loading,
    syncing,
    syncError,
    lastSynced,
    validationResult,
    validateCart,
    syncCart,
    isAuthenticated,
    userMobile
  } = useCart();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();
  const [showClearModal, setShowClearModal] = useState(false);
  const [validating, setValidating] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [showStockErrorModal, setShowStockErrorModal] = useState(false);
  const [stockErrorMessage, setStockErrorMessage] = useState('');

  // Calculate savings (assuming 20% discount for demo purposes)
  const calculateSavings = (price) => {
    const validPrice = Number(price) || 0;
    return Math.round(validPrice * 0.2);
  };

  const totalSavings = items.reduce((total, item) => {
    const validPrice = Number(item.price) || 0;
    return total + (calculateSavings(validPrice) * item.quantity);
  }, 0);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
    showSuccess('Item removed from cart');
  };

  const handleRemoveAll = async () => {
    try {
      await clearCart();
      setShowClearModal(false);
      showSuccess('Cart cleared successfully');
    } catch (error) {
      showError('Failed to clear cart');
    }
  };

  const handleValidateCart = async () => {
    setValidating(true);
    try {
      const result = await validateCart();
      if (result.success) {
        showSuccess('Cart validation successful');
      } else {
        showError(result.message || 'Cart validation failed');
      }
    } catch (error) {
      showError('Failed to validate cart');
    } finally {
      setValidating(false);
    }
  };

  const handleSyncCart = async () => {
    try {
      await syncCart();
      showSuccess('Cart synced successfully');
    } catch (error) {
      showError('Failed to sync cart');
    }
  };

  const handleProceedToCheckout = async () => {
    setProcessingCheckout(true);
    try {
      // Step 1: Save cart to database first (to ensure backend has latest quantities)
      // This is important because quantity updates are debounced, so we need to sync before validation
      if (isAuthenticated) {
        const saveResponse = await cartService.saveCart(items);
        
        if (!saveResponse.success) {
          showError(saveResponse.message || 'Failed to save cart');
          setProcessingCheckout(false);
          return;
        }
      }

      // Step 2: Validate cart (now with the latest synced data)
      const validateResponse = await cartService.validateCart();
      
      // Check if API call was successful
      if (!validateResponse.success) {
        showError(validateResponse.message || 'Cart validation failed');
        setProcessingCheckout(false);
        return;
      }

      // Check if actual validation passed (validation.valid)
      const validation = validateResponse.validation;
      if (validation && validation.valid === false) {
        // Extract error message from invalid items
        if (validation.invalidItems && validation.invalidItems.length > 0) {
          const firstInvalidItem = validation.invalidItems[0];
          const errorReason = firstInvalidItem.reason || 'Some items are unavailable.';
          
          // Show modal with the error message from API
          setStockErrorMessage(errorReason);
          setShowStockErrorModal(true);
        } else {
          // Fallback if no invalid items but validation failed
          setStockErrorMessage('Please review your cart items.');
          setShowStockErrorModal(true);
        }
        
        setProcessingCheckout(false);
        return;
      }

      // Step 3: Navigate to checkout
      navigate('/checkout');
      
    } catch (error) {
      console.error('Error processing checkout:', error);
      showError(error.message || 'Failed to process checkout');
    } finally {
      setProcessingCheckout(false);
    }
  };

  const formatLastSynced = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16" style={{ backgroundColor: COLORS.gray[50] }}>
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto" style={{ color: COLORS.gray[400] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.gray[900] }}>Your cart is empty</h2>
          <p className="mb-8" style={{ color: COLORS.gray[600] }}>
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/">
            <Button size="large">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.gray[50] }}>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            
            {/* Left Section - Cart Items */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.gray[900] }}>
                    My Cart
                    <span className="text-base sm:text-lg font-normal ml-2" style={{ color: COLORS.gray[500] }}>
                      ({totalItems} item{totalItems !== 1 ? 's' : ''})
                    </span>
                  </h1>
                </div>
              </div>

              {/* Column Headers - Hidden on mobile */}
              <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: COLORS.white, borderColor: COLORS.gray[200], borderWidth: '1px', borderStyle: 'solid' }}>
                <div className="hidden sm:grid grid-cols-12 gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b" style={{ backgroundColor: COLORS.gray[50], borderColor: COLORS.gray[200] }}>
                  <div className="col-span-4">
                    <span className="text-xs sm:text-sm font-medium" style={{ color: COLORS.gray[700] }}>Product</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-xs sm:text-sm font-medium" style={{ color: COLORS.gray[700] }}>You Pay</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-xs sm:text-sm font-medium" style={{ color: COLORS.gray[700] }}>You Save</span>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="text-xs sm:text-sm font-medium" style={{ color: COLORS.gray[700] }}>Quantity</span>
                  </div>
                  <div className="col-span-1"></div>
                </div>

                {/* Cart Items */}
                <div className="divide-y" style={{ borderColor: COLORS.gray[200] }}>
                  {items.map((item, index) => {
                    const itemPrice = Number(item.price) || 0;
                    const itemSavings = calculateSavings(itemPrice);
                    const variant = item.quantity > 1 ? `${item.quantity} units` : '1 unit';
                    
                    return (
                      <div key={item.id} className="p-3 sm:p-4 lg:p-6">
                        {/* Mobile Layout */}
                        <div className="sm:hidden">
                          <div className="flex gap-3 mb-3">
                            <img
                              src={item.image || '/images/logo.jpg'}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              style={{ borderColor: COLORS.gray[200], borderWidth: '1px', borderStyle: 'solid' }}
                              onError={(e) => {
                                e.target.src = '/images/logo.jpg';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm leading-tight mb-1" style={{ color: COLORS.gray[900] }}>
                                {item.title}
                              </h3>
                              <p className="text-xs mb-2" style={{ color: COLORS.gray[500] }}>
                                Variant: <span className="font-bold">{variant}</span>
                              </p>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-semibold" style={{ color: COLORS.gray[900] }}>
                                    ₹{itemPrice}
                                  </span>
                                  <span className="text-xs ml-2" style={{ color: COLORS.success[600] }}>
                                    Save ₹{itemSavings}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-1 transition-colors"
                                  style={{ color: COLORS.gray[600] }}
                                  onMouseEnter={(e) => e.target.style.color = COLORS.error[600]}
                                  onMouseLeave={(e) => e.target.style.color = COLORS.gray[600]}
                                  title="Remove item"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="flex items-center rounded-lg" style={{ borderColor: COLORS.gray[300], borderWidth: '1px', borderStyle: 'solid' }}>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="w-8 h-8 text-white rounded-l-lg flex items-center justify-center transition-colors"
                                style={{ 
                                  backgroundColor: item.quantity <= 1 ? COLORS.gray[400] : COLORS.primary[600]
                                }}
                                onMouseEnter={(e) => {
                                  if (item.quantity > 1) {
                                    e.target.style.backgroundColor = COLORS.primary[700];
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (item.quantity > 1) {
                                    e.target.style.backgroundColor = COLORS.primary[600];
                                  }
                                }}
                                disabled={item.quantity <= 1}
                              >
                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center" style={{ backgroundColor: COLORS.white }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="w-8 h-8 text-white rounded-r-lg flex items-center justify-center transition-colors"
                                style={{ backgroundColor: COLORS.primary[600] }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = COLORS.primary[700]}
                                onMouseLeave={(e) => e.target.style.backgroundColor = COLORS.primary[600]}
                              >
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                          {/* Product Image & Details */}
                          <div className="col-span-4 flex items-center gap-3 lg:gap-4">
                            <img
                              src={item.image || '/images/logo.jpg'}
                              alt={item.title}
                              className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded-lg flex-shrink-0"
                              style={{ borderColor: COLORS.gray[200], borderWidth: '1px', borderStyle: 'solid' }}
                              onError={(e) => {
                                e.target.src = '/images/logo.jpg';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-xs lg:text-sm leading-tight" style={{ color: COLORS.gray[900] }}>
                                {item.title} : {variant}
                              </h3>
                              <p className="text-xs mt-1" style={{ color: COLORS.gray[500] }}>
                                Variant: <span className="font-bold">{variant}</span>
                              </p>
                            </div>
                          </div>

                          {/* You Pay */}
                          <div className="col-span-2 text-center">
                            <span className="text-xs lg:text-sm font-semibold" style={{ color: COLORS.gray[900] }}>
                              ₹{itemPrice}
                            </span>
                          </div>

                          {/* You Save */}
                          <div className="col-span-2 text-center">
                            <span className="text-xs lg:text-sm font-semibold" style={{ color: COLORS.success[600] }}>
                              ₹{itemSavings}
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="col-span-3 flex items-center justify-center gap-2">
                            <div className="flex items-center rounded-lg" style={{ borderColor: COLORS.gray[300], borderWidth: '1px', borderStyle: 'solid' }}>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="w-6 h-6 lg:w-8 lg:h-8 text-white rounded-l-lg flex items-center justify-center transition-colors"
                                style={{ 
                                  backgroundColor: item.quantity <= 1 ? COLORS.gray[400] : COLORS.primary[600]
                                }}
                                onMouseEnter={(e) => {
                                  if (item.quantity > 1) {
                                    e.target.style.backgroundColor = COLORS.primary[700];
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (item.quantity > 1) {
                                    e.target.style.backgroundColor = COLORS.primary[600];
                                  }
                                }}
                                disabled={item.quantity <= 1}
                              >
                                <MinusIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                              </button>
                              <span className="px-2 lg:px-3 py-1 text-xs lg:text-sm font-medium min-w-[1.5rem] lg:min-w-[2rem] text-center" style={{ backgroundColor: COLORS.white }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="w-6 h-6 lg:w-8 lg:h-8 text-white rounded-r-lg flex items-center justify-center transition-colors"
                                style={{ backgroundColor: COLORS.primary[600] }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = COLORS.primary[700]}
                                onMouseLeave={(e) => e.target.style.backgroundColor = COLORS.primary[600]}
                              >
                                <PlusIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <div className="col-span-1 flex justify-center">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 transition-colors"
                              style={{ color: COLORS.gray[600] }}
                              onMouseEnter={(e) => e.target.style.color = COLORS.error[600]}
                              onMouseLeave={(e) => e.target.style.color = COLORS.gray[600]}
                              title="Remove item"
                            >
                              <TrashIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Remove All and Action Buttons */}
                <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t" style={{ borderColor: COLORS.gray[200] }}>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={() => setShowClearModal(true)}
                      className="flex items-center gap-2 transition-colors"
                      style={{ color: COLORS.error[500] }}
                      onMouseEnter={(e) => e.target.style.color = COLORS.error[700]}
                      onMouseLeave={(e) => e.target.style.color = COLORS.error[500]}
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">Remove all</span>
                    </button>
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Price Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-lg shadow-sm p-4 sm:p-6 sticky top-4 sm:top-8" style={{ backgroundColor: COLORS.white, borderColor: COLORS.gray[200], borderWidth: '1px', borderStyle: 'solid' }}>
                <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6" style={{ color: COLORS.gray[900] }}>Price Summary</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Cart Total */}
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: COLORS.gray[200] }}>
                    <span className="font-bold text-sm sm:text-base" style={{ color: COLORS.gray[900] }}>Cart Total</span>
                    <span className="font-bold text-sm sm:text-base" style={{ color: COLORS.gray[900] }}>₹{totalPrice}</span>
                  </div>

                  {/* Delivery Charge */}
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: COLORS.gray[200] }}>
                    <div className="flex items-center gap-1">
                      <span className="text-sm sm:text-base" style={{ color: COLORS.gray[700] }}>Delivery Charge</span>
                      <InformationCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: COLORS.gray[400] }} />
                    </div>
                    <span className="text-xs sm:text-sm" style={{ color: COLORS.error[500] }}>+ Extra</span>
                  </div>

                  {/* Savings */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm sm:text-base" style={{ color: COLORS.gray[700] }}>Savings</span>
                    <span className="font-semibold text-sm sm:text-base" style={{ color: COLORS.success[600] }}>₹{totalSavings}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  disabled={processingCheckout}
                  className="w-full mt-4 sm:mt-6 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: processingCheckout ? COLORS.gray[400] : COLORS.primary[600]
                  }}
                  onMouseEnter={(e) => {
                    if (!processingCheckout) {
                      e.target.style.backgroundColor = COLORS.primary[700];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!processingCheckout) {
                      e.target.style.backgroundColor = COLORS.primary[600];
                    }
                  }}
                >
                  {processingCheckout ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">PROCEED TO CHECKOUT</span>
                      <span className="sm:hidden">CHECKOUT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="rounded-lg shadow-xl max-w-md w-full" style={{ backgroundColor: COLORS.white }}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.error[100] }}>
                  <ExclamationTriangleIcon className="w-6 h-6" style={{ color: COLORS.error[600] }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: COLORS.gray[900] }}>Clear Cart</h3>
                  <p className="text-sm" style={{ color: COLORS.gray[500] }}>This action cannot be undone</p>
                </div>
              </div>
              
              <p className="mb-6" style={{ color: COLORS.gray[700] }}>
                Are you sure you want to remove all items from your cart? This will permanently delete all {totalItems} item{totalItems !== 1 ? 's' : ''} from your cart.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                  style={{ 
                    color: COLORS.gray[700], 
                    backgroundColor: COLORS.gray[100]
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = COLORS.gray[200];
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = COLORS.gray[100];
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveAll}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
                  style={{ 
                    backgroundColor: COLORS.error[600]
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = COLORS.error[700];
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = COLORS.error[600];
                  }}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Error Modal */}
      <Modal
        isOpen={showStockErrorModal}
        onClose={() => setShowStockErrorModal(false)}
        title="Stock Unavailable"
        size="medium"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.error[100] }}>
              <ExclamationTriangleIcon className="w-8 h-8" style={{ color: COLORS.error[600] }} />
            </div>
          </div>
          
          <p className="text-base mb-6" style={{ color: COLORS.gray[700] }}>
            {stockErrorMessage}
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={() => setShowStockErrorModal(false)}
              className="px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: COLORS.error[600] }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = COLORS.error[700];
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = COLORS.error[600];
              }}
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CartPage;
