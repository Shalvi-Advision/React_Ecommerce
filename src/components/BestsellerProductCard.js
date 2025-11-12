import React, { useState } from 'react';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useFavorite } from '../context/FavoriteContext';
import { useCart } from '../context/CartContext';
import { createCartItemFromProduct } from '../utils/cartUtils';

const BestsellerProductCard = ({ product }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { toggleFavorite, isFavorite: checkFavorite } = useFavorite();
  const { addItem } = useCart();

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
      const cartItem = createCartItemFromProduct(product, 1);
      await addItem(cartItem, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const favoriteStatus = checkFavorite(productId) || isFavorite;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col w-[180px] sm:w-[200px] flex-shrink-0">
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

        {/* Add Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1.5 mt-auto"
        >
          <ShoppingCartIcon className="w-4 h-4" />
          <span>ADD</span>
        </button>
      </div>
    </div>
  );
};

export default BestsellerProductCard;

