import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, MinusIcon, PlusIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  
  // Calculate discount
  const originalPrice = product.price * 1.55; // MRP calculation
  const discount = Math.round(originalPrice - product.price);
  const unitPrice = (product.price / 1000).toFixed(2); // Assuming 1kg = 1000g

  const handleAddToCart = () => {
    setShowQuantitySelector(true);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleRemoveFromCart = () => {
    setShowQuantitySelector(false);
    setQuantity(1);
  };

  const handleClose = () => {
    setShowQuantitySelector(false);
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100" style={{ width: '280px', height: '420px' }}>
      {/* Image Container */}
      <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 h-40 flex items-center justify-center p-6">
        <Link to={`/product/${product.id}`} className="block w-full h-full flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="max-w-full max-h-full object-contain"
          />
        </Link>
        {/* Vegetarian Badge */}
        <div className="absolute top-3 right-3">
          <div className="w-5 h-5 border-2 border-green-600 bg-white rounded-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-3 pb-4 flex flex-col" style={{ height: 'calc(420px - 192px)' }}>
        {/* Fixed height content area */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Product Name - Fixed height */}
            <Link to={`/product/${product.id}`}>
              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-green-600 transition-colors leading-tight h-10 flex items-start">
                {product.title}
              </h3>
            </Link>

            {/* Pricing Section - Fixed height */}
            <div className="space-y-1 h-16">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="text-xs text-gray-500 font-medium">MRP</div>
                    <div className="text-sm text-gray-500 line-through">₹{originalPrice.toFixed(0)}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-500 font-medium">E-Shop</div>
                    <div className="text-xl font-bold text-gray-900">₹{product.price}</div>
                  </div>
                </div>
                <div className="bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full font-semibold">
                  ₹{discount} OFF
                </div>
              </div>
              <p className="text-xs text-gray-500">(Inclusive of all taxes)</p>
            </div>

            {/* Quantity Selector - Fixed height */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 h-10 flex items-center">
              <span className="text-xs text-gray-600 font-medium">1 kg (₹{unitPrice} / 1 g)</span>
            </div>
          </div>

          {/* Add to Cart Button or Quantity Selector */}
          {!showQuantitySelector ? (
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 mt-4 mb-2"
            >
              <ShoppingCartIcon className="w-4 h-4" />
              ADD TO CART
            </button>
          ) : (
            <div className="flex items-center gap-2 mt-4 mb-2">
              {/* Quantity Selector */}
              <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {/* Minus/Remove Button */}
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 flex items-center justify-center transition-colors duration-200"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
                
                {/* Quantity Display */}
                <div className="bg-white px-4 py-2 min-w-[3rem] flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-900">{quantity}</span>
                </div>
                
                {/* Plus Button */}
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 flex items-center justify-center transition-colors duration-200"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="bg-white border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800 p-2 rounded-lg flex items-center justify-center transition-colors duration-200 shadow-sm"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
