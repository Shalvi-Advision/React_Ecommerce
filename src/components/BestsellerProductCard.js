import React, { useState, useEffect } from 'react';
import { HeartIcon as HeartOutline, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useFavorite } from '../context/FavoriteContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { createCartItemFromProduct } from '../utils/cartUtils';

const BestsellerProductCard = ({ product }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { toggleFavorite, isFavorite: checkFavorite } = useFavorite();
  const { addItem, updateQuantity, items: cartItems } = useCart();
  const { showError } = useToast();

  // Extract product data with safe defaults
  const {
    id,
    p_code,
    product_name,
    image_url,
    pcode_img,
    product_mrp,
    our_price,
    discount_percentage,
    package_size,
    package_unit,
    brand_name
  } = product || {};

  const productId = p_code || id || 'unknown';
  const displayName = product_name || 'Product';
  const displayImage = image_url || pcode_img || '/images/logo.jpg';
  const displayMrp = product_mrp || 0;
  const displayPrice = our_price || 0;
  const discount = discount_percentage || 0;
  const maxQuantity = product?.max_quantity_allowed || 10;

  // Sync quantity selector state with cart items
  useEffect(() => {
    const cartItem = cartItems.find(item => (item.p_code || item.id) === productId);
    if (cartItem) {
      setShowQuantitySelector(true);
      setQuantity(cartItem.quantity);
    } else {
      setShowQuantitySelector(false);
      setQuantity(1);
    }
  }, [cartItems, productId]);
  // Format weight with decimal (e.g., "25.0 GM", "500.0 GM")
  const weight = package_size && package_unit 
    ? `${parseFloat(package_size).toFixed(1)} ${package_unit.toUpperCase()}` 
    : '1.0 UNIT';

  // Calculate discount percentage if not provided
  const calculatedDiscount = discount > 0 
    ? discount 
    : displayMrp > 0 && displayPrice < displayMrp
      ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
      : 0;

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toggleFavorite({
      ...product,
      p_code: productId,
      _id: productId,
      product_name: displayName,
      our_price: displayPrice,
      image_url: displayImage,
      pcode_img: displayImage,
      brand_name: brand_name || '',
      package_size: package_size || '',
      package_unit: package_unit || '',
      product_mrp: displayMrp,
      discount_percentage: calculatedDiscount
    });
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setAddingToCart(true);
      
      // Create cart item from product
      const cartItem = createCartItemFromProduct(product, 1);
      
      // Add to cart using context
      await addItem(cartItem, 1);
      
      // Show quantity selector after adding to cart
      setShowQuantitySelector(true);
      setQuantity(1);
      
      // Success - no toast message (same as CategoryPage)
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
      
      try {
        // Update cart with exact quantity (not adding to existing)
        updateQuantity(productId, newQuantity);
      } catch (error) {
        console.error('Error updating cart quantity:', error);
        showError('Failed to update quantity');
      }
    }
  };

  const favoriteStatus = checkFavorite(productId) || isFavorite;

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col w-[180px] sm:w-[200px] flex-shrink-0">
      {/* Product Image Container */}
      <div className="relative bg-white flex items-center justify-center p-3 pt-4">
        {/* Favorite Icon - Top Left */}
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-2 left-2 z-20 p-1.5 bg-white/90 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
        >
          {favoriteStatus ? (
            <HeartSolid className="w-4 h-4 text-red-500" />
          ) : (
            <HeartOutline className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
          )}
        </button>

        {/* Discount Badge - Top Right (Red Banner Style) */}
        {calculatedDiscount > 0 && (
          <div className="absolute top-2 right-2 z-20 bg-red-500 text-white text-xs px-2.5 py-1 rounded font-bold shadow-md">
            {calculatedDiscount}% OFF
          </div>
        )}

        {/* Product Image */}
        <div className="w-full flex flex-col items-center">
          <img
            src={displayImage}
            alt={displayName}
            className="w-24 h-24 object-contain mb-2"
            onError={(e) => {
              e.target.src = '/images/logo.jpg';
            }}
          />
          {/* Placeholder for prepared dish image - can be added later */}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 flex-grow flex flex-col">
        {/* Product Name */}
        <h3 className="text-xs text-gray-900 mb-1 line-clamp-2 min-h-[2rem] font-medium">
          {displayName}
        </h3>

        {/* Weight */}
        <p className="text-xs text-gray-600 mb-2">
          {weight}
        </p>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">₹{displayPrice}</span>
            {displayMrp > displayPrice && (
              <span className="text-xs text-gray-400 line-through">₹{displayMrp}</span>
            )}
          </div>
        </div>

        {/* Add to Cart Button or Quantity Selector */}
        {!showQuantitySelector ? (
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1.5 mt-auto ${
              addingToCart 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {addingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>ADDING...</span>
              </>
            ) : (
              <>
                <ShoppingCartIcon className="w-4 h-4" />
                <span>ADD</span>
              </>
            )}
          </button>
        ) : (
          <div className="w-full mt-auto" onClick={(e) => e.stopPropagation()}>
            {/* Quantity Selector */}
            <div className="flex items-stretch bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg overflow-hidden shadow-md w-full hover:shadow-lg transition-all duration-200">
              {/* Minus Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuantityChange(quantity - 1);
                }}
                disabled={quantity <= 1}
                className={`flex items-center justify-center px-3 py-2 transition-all duration-200 ${
                  quantity <= 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white hover:shadow-md active:scale-95'
                }`}
              >
                <MinusIcon className="w-4 h-4 font-bold" strokeWidth={3} />
              </button>

              {/* Quantity Display */}
              <div className="bg-white px-4 py-2 flex-1 flex items-center justify-center border-x-2 border-purple-200">
                <span className="text-base font-bold text-purple-700">
                  {quantity}
                </span>
              </div>

              {/* Plus Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuantityChange(quantity + 1);
                }}
                disabled={quantity >= maxQuantity}
                className={`flex items-center justify-center px-3 py-2 transition-all duration-200 ${
                  quantity >= maxQuantity
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white hover:shadow-md active:scale-95'
                }`}
              >
                <PlusIcon className="w-4 h-4 font-bold" strokeWidth={3} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestsellerProductCard;

