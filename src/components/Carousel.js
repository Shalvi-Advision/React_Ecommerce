import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getBanners } from '../api/bannerApi';
import Loading from './Loading';

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  
  // Touch handling refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);
  
  // Image loading state (simplified)
  const [imageErrors, setImageErrors] = useState(new Set());

  // Fetch banners on component mount
  useEffect(() => {
    loadBanners();
  }, []);

  // Auto-advance slides every 4 seconds (increased for better UX)
  useEffect(() => {
    if (banners.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
      }, 4000);

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [banners.length]);

  // Load banners from API
  const loadBanners = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBanners();
      
      console.log('📊 Banner API Response:', response);
      
      if (response.banners) {
        if (response.banners.length > 0) {
          setBanners(response.banners);
          setIsOffline(response.isOffline || false);
          setIsFallback(response.isFallback || false);
          console.log('✅ Banners loaded successfully:', response.banners.length, 'banners');
        } else {
          console.warn('⚠️ No banners in response, using fallback data');
          // Don't throw error, just use fallback data
          const fallbackBanners = [
            {
              _id: 'fallback_1',
              banner_img: '/images/banner1.jpg',
              redirect_link: '#',
              is_active: true,
              title: 'Welcome',
              alt_text: 'Welcome banner'
            },
            {
              _id: 'fallback_2',
              banner_img: '/images/banner2.jpg',
              redirect_link: '#',
              is_active: true,
              title: 'Special Offers',
              alt_text: 'Special offers banner'
            },
            {
              _id: 'fallback_3',
              banner_img: '/images/banner3.jpg',
              redirect_link: '#',
              is_active: true,
              title: 'New Arrivals',
              alt_text: 'New arrivals banner'
            }
          ];
          setBanners(fallbackBanners);
          setIsFallback(true);
          console.log('🔄 Using fallback banners due to empty response');
        }
      } else {
        console.warn('⚠️ No banners property in response, using fallback data');
        throw new Error(response.message || 'No banners property in response');
      }
    } catch (err) {
      console.warn('⚠️ Error loading banners, using fallback data:', err.message);
      setError(err.message || 'Failed to load banners');
      
      // Set fallback banners
      const fallbackBanners = [
        {
          _id: 'fallback_1',
          banner_img: '/images/banner1.jpg',
          redirect_link: '#',
          is_active: true,
          title: 'Welcome',
          alt_text: 'Welcome banner'
        },
        {
          _id: 'fallback_2',
          banner_img: '/images/banner2.jpg',
          redirect_link: '#',
          is_active: true,
          title: 'Special Offers',
          alt_text: 'Special offers banner'
        },
        {
          _id: 'fallback_3',
          banner_img: '/images/banner3.jpg',
          redirect_link: '#',
          is_active: true,
          title: 'New Arrivals',
          alt_text: 'New arrivals banner'
        }
      ];
      
      setBanners(fallbackBanners);
      setIsFallback(true);
      console.log('🔄 Using fallback banners:', fallbackBanners.length, 'banners');
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const goToSlide = useCallback((slideIndex) => {
    if (slideIndex >= 0 && slideIndex < banners.length) {
      setCurrentSlide(slideIndex);
    }
  }, [banners.length]);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
  }, [banners.length]);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    // Pause auto-play during touch
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }

    // Reset touch values
    touchStartX.current = 0;
    touchEndX.current = 0;

    // Resume auto-play
    if (banners.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
      }, 4000);
    }
  }, [goToNext, goToPrevious, banners.length]);

  // Image error handler
  const handleImageError = useCallback((imageId) => {
    setImageErrors(prev => new Set([...prev, imageId]));
  }, []);

  // Pause auto-play on hover (desktop)
  const handleMouseEnter = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (banners.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
      }, 4000);
    }
  }, [banners.length]);

  // Handle banner click
  const handleBannerClick = useCallback((banner) => {
    if (banner.redirect_link && banner.redirect_link !== '#') {
      // For product details, navigate to product page
      if (banner.redirect_link.startsWith('product_details/')) {
        const productId = banner.redirect_link.split('/')[1];
        window.location.href = `/product/${productId}`;
      } else {
        // For other links, navigate directly
        window.location.href = banner.redirect_link;
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="relative w-full h-[200px] sm:h-[250px] lg:h-[300px] xl:h-[350px] overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
        <Loading size="large" text="Loading banners..." />
      </div>
    );
  }

  // Show error state only if we have no banners at all
  if (error && banners.length === 0) {
    return (
      <div className="relative w-full h-[200px] sm:h-[250px] lg:h-[300px] xl:h-[350px] overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 mb-2 font-medium">Unable to load banners</p>
          <p className="text-gray-500 text-sm mb-4 max-w-md">
            {error.includes('404') 
              ? 'Banner API endpoint not available. Using demo banners instead.'
              : 'There was an issue loading banners. Please try again.'
            }
          </p>
          <button 
            onClick={loadBanners}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Don't render if no banners
  if (banners.length === 0) {
    return null;
  }

  return (
    <div 
      ref={carouselRef}
      className="relative w-full h-[200px] sm:h-[250px] lg:h-[300px] xl:h-[350px] overflow-hidden rounded-lg group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        maxWidth: '100%',
        maxHeight: '100%'
      }}
    >
      {/* Status Indicators */}
      {(isOffline || isFallback) && (
        <div className="absolute top-2 left-2 z-10 flex gap-2">
          {isOffline && (
            <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Offline</span>
            </div>
          )}
          {isFallback && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium" title="Using demo banners - API not available">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Demo</span>
            </div>
          )}
        </div>
      )}

      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full w-full"
        style={{ 
          transform: `translateX(-${currentSlide * 100}%)`,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className="w-full h-full flex-shrink-0 relative cursor-pointer overflow-hidden"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              minWidth: 0,
              minHeight: 0
            }}
            onClick={() => handleBannerClick(banner)}
          >
            {/* Background Image Container */}
            <div
              className="w-full h-full relative overflow-hidden"
              style={{ 
                backgroundColor: banner.banner_bg_color || '#f3f4f6'
              }}
            >
              {/* Main Banner Image */}
              <img
                src={banner.banner_img}
                alt={banner.alt_text || banner.title || `Banner ${index + 1}`}
                className="w-full h-full object-cover object-center"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                onLoad={() => {
                  console.log('🖼️ Image loaded:', banner._id, banner.banner_img);
                }}
                onError={() => {
                  console.log('❌ Image failed to load:', banner._id, banner.banner_img);
                }}
              />

              {/* Banner content overlay (optional) */}
              {(banner.title || banner.description) && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    {banner.title && (
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">
                        {banner.title}
                      </h3>
                    )}
                    {banner.description && (
                      <p className="text-sm sm:text-base opacity-90">
                        {banner.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if more than 1 banner */}
      {banners.length > 1 && (
        <>
      <button
        onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 touch-manipulation"
        aria-label="Previous slide"
      >
            <ChevronLeftIcon className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
      
      <button
        onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 touch-manipulation"
        aria-label="Next slide"
      >
            <ChevronRightIcon className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
        </>
      )}

      {/* Dots Indicator - Only show if more than 1 banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 touch-manipulation ${
              index === currentSlide
                ? 'bg-white scale-110'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      )}

      {/* Progress Bar - Only show if more than 1 banner */}
      {banners.length > 1 && (
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black bg-opacity-20">
        <div 
          className="h-full bg-white transition-all duration-200 ease-linear"
          style={{ 
              width: `${((currentSlide + 1) / banners.length) * 100}%` 
          }}
        />
      </div>
      )}
    </div>
  );
};

export default Carousel;
