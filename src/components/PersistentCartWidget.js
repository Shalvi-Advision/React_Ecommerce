import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useResponsive } from '../hooks/useResponsive';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { COLORS } from '../constants/theme';

const PersistentCartWidget = () => {
  const { items, totalItems, totalPrice } = useCart();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();

  // Calculate savings (20% discount for each item)
  const calculateSavings = (price) => {
    const validPrice = Number(price) || 0;
    return Math.round(validPrice * 0.2);
  };

  const totalSavings = items.reduce((total, item) => {
    const validPrice = Number(item.price) || 0;
    return total + (calculateSavings(validPrice) * item.quantity);
  }, 0);

  // Don't show widget if:
  // - Not on mobile
  // - Cart is empty
  // - Already on cart page
  if (!isMobile || items.length === 0 || location.pathname === '/cart') {
    return null;
  }

  const handleClick = () => {
    navigate('/cart');
  };

  return (
    <div
      className="fixed left-0 right-0 z-40 lg:hidden"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        paddingLeft: '12px',
        paddingRight: '12px',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden'
      }}
    >
      <div
        onClick={handleClick}
        className="flex items-center justify-between px-2 py-2 rounded-xl cursor-pointer transition-all duration-200 active:scale-98"
        style={{
          backgroundColor: COLORS.primary[600],
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.primary[700]}`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.2), 0 6px 15px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Left Side - Cart Icon and Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Cart Icon with Badge */}
          <div className="relative flex-shrink-0">
            <ShoppingCartIcon className="w-6 h-6" style={{ color: COLORS.white }} />
            {totalItems > 0 && (
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: COLORS.warning[500],
                  color: COLORS.white
                }}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </div>
            )}
          </div>

          {/* Cart Info - Two Lines */}
          <div className="flex-1 min-w-0">
            {/* First Line - Total Cart Amount */}
            <div className="mb-1">
              <span className="text-base font-bold text-white">
                ₹{totalPrice.toFixed(2)}
              </span>
            </div>
            {/* Second Line - Items and Savings (smaller text) */}
            <div className="flex items-center gap-3 text-xs text-white/90">
              <span>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
              <span>•</span>
              <span>₹{totalSavings.toFixed(2)} Saved</span>
            </div>
          </div>
        </div>

        {/* Right Side - CART Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="flex-shrink-0 ml-5 px-8 py-2 rounded-lg font-bold text-sm transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: COLORS.white,
            color: COLORS.primary[600],
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.gray[50];
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.white;
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          CART
        </button>
      </div>
    </div>
  );
};

export default PersistentCartWidget;

