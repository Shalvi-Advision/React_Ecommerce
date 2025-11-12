import React from 'react';
import BestsellerProductCard from './BestsellerProductCard';

// Dummy data for bestseller products
const dummyBestsellerProducts = [
  {
    id: 'bs1',
    p_code: 'BS001',
    product_name: 'Ind Chska Kas Methi Mas 25gm',
    image_url: '/images/logo.jpg',
    product_mrp: 30,
    our_price: 24,
    discount_percentage: 20,
    package_size: '25',
    package_unit: 'GM',
    brand_name: 'Indian-chaska'
  },
  {
    id: 'bs2',
    p_code: 'BS002',
    product_name: 'Ind Chska Kanda Las Mas 500gm',
    image_url: '/images/logo.jpg',
    product_mrp: 175,
    our_price: 150,
    discount_percentage: 14,
    package_size: '500',
    package_unit: 'GM',
    brand_name: 'Indian-chaska'
  },
  {
    id: 'bs3',
    p_code: 'BS003',
    product_name: 'Ind Chska Chaat Masala 100gm',
    image_url: '/images/logo.jpg',
    product_mrp: 45,
    our_price: 36,
    discount_percentage: 20,
    package_size: '100',
    package_unit: 'GM',
    brand_name: 'Indian-chaska'
  },
  {
    id: 'bs4',
    p_code: 'BS004',
    product_name: 'Ind Chska Biryani Masala 200gm',
    image_url: '/images/logo.jpg',
    product_mrp: 80,
    our_price: 68,
    discount_percentage: 15,
    package_size: '200',
    package_unit: 'GM',
    brand_name: 'Indian-chaska'
  },
  {
    id: 'bs5',
    p_code: 'BS005',
    product_name: 'Ind Chska Kitchen King Masala 100gm',
    image_url: '/images/logo.jpg',
    product_mrp: 55,
    our_price: 44,
    discount_percentage: 20,
    package_size: '100',
    package_unit: 'GM',
    brand_name: 'Indian-chaska'
  },
  {
    id: 'bs6',
    p_code: 'BS006',
    product_name: 'Ind Chska Sambhar Masala 200gm',
    image_url: '/images/logo.jpg',
    product_mrp: 70,
    our_price: 59,
    discount_percentage: 16,
    package_size: '200',
    package_unit: 'GM',
    brand_name: 'Indian-chaska'
  }
];

const BestsellerProducts = () => {
  return (
    <div className="relative overflow-hidden py-3 sm:py-4 lg:py-5">
      {/* Vibrant Pink Background with Animated Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/60 via-rose-50/60 to-pink-100/60"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-400/25 to-rose-400/25 rounded-full blur-3xl -translate-y-1/4 animate-pulse"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-br from-rose-400/25 to-pink-500/25 rounded-full blur-3xl translate-y-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Container with consistent padding for entire component */}
      <div className="relative container mx-auto px-2 sm:px-4 lg:px-6">
        {/* Promotional Banner at the top - Seamlessly integrated */}
        <div className="relative w-full">
          <div className="relative w-full h-[140px] sm:h-[160px] lg:h-[180px] xl:h-[200px] overflow-hidden" style={{ borderRadius: '0.75rem 0.75rem 0 0' }}>
            <img
              src={`${process.env.PUBLIC_URL}/images/seasonal_banner.jpg`}
              alt="Bestseller Products Banner"
              className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                display: 'block'
              }}
              onLoad={() => {
                console.log('🖼️ Bestseller Banner image loaded successfully');
              }}
              onError={() => {
                console.log('❌ Bestseller Banner image failed to load');
              }}
            />
            {/* Strong overlay gradient for perfect seamless transition */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% via-pink-300/60 via-70% to-pink-400/90"></div>
          </div>
        </div>

        {/* Products section - Perfectly merged with banner */}
        <div 
          className="relative w-full pt-0 pb-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(244, 143, 177, 1), rgba(236, 72, 153, 0.98), rgba(219, 39, 119, 0.98))',
            marginTop: '-1px',
            borderRadius: '0 0 0.75rem 0.75rem',
            boxShadow: '0 20px 25px -5px rgba(236, 72, 153, 0.15), 0 10px 10px -5px rgba(236, 72, 153, 0.1)'
          }}
        >
          {/* Horizontal Scrollable Products with Enhanced Spacing */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="relative">
              <div className="overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex gap-4 sm:gap-6 lg:gap-8" style={{ width: 'max-content' }}>
                  {dummyBestsellerProducts.map((product, index) => (
                    <div 
                      key={product.id || product.p_code}
                      className="transform transition-all duration-300 hover:scale-105"
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards',
                        opacity: 0
                      }}
                    >
                      <BestsellerProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Scroll Indicators - Gradient edges */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-pink-400/40 to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-pink-500/40 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar and animations */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default BestsellerProducts;

