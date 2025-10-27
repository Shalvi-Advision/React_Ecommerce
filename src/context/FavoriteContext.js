import React, { createContext, useContext, useState, useEffect } from 'react';
import { addToFavorites as addToFavoritesAPI, removeFromFavorites as removeFromFavoritesAPI, getFavorites as getFavoritesAPI } from '../api/favoritesApi';

const FavoriteContext = createContext();

export const useFavorite = () => {
  return useContext(FavoriteContext);
};

export const FavoriteProvider = ({ children }) => {
  // Get auth status without using useAuth hook to avoid circular dependency
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };
    
    checkAuthStatus();
    
    // Listen for auth changes via custom events or polling
    const interval = setInterval(checkAuthStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize from localStorage if available (for guests)
  useEffect(() => {
    if (!isAuthenticated) {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    }
  }, [isAuthenticated]);

  // Save to localStorage whenever favorites change (for guest users)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, isAuthenticated]);

  // Load favorites from API for authenticated users and sync localStorage favorites
  useEffect(() => {
    const loadFavorites = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          // Check for localStorage favorites to sync on login
          const savedFavorites = localStorage.getItem('favorites');
          const localStorageProducts = savedFavorites ? JSON.parse(savedFavorites).filter(item => typeof item === 'object' && item !== null) : [];
          
          // Fetch favorites from API
          const response = await getFavoritesAPI();
          if (response.success && response.data) {
            // Store only p_code values for authenticated users
            const favoriteIds = response.data.map(item => item.p_code);
            
            // If there are localStorage favorites, sync them to API
            if (localStorageProducts.length > 0) {
              console.log(`🔄 Syncing ${localStorageProducts.length} localStorage favorites to API...`);
              const syncPromises = localStorageProducts.map(async (product) => {
                const p_code = product.p_code || product._id;
                if (p_code && !favoriteIds.includes(p_code)) {
                  try {
                    await addToFavoritesAPI(p_code);
                    console.log(`✅ Synced favorite: ${p_code}`);
                  } catch (error) {
                    console.error(`❌ Failed to sync favorite ${p_code}:`, error);
                  }
                }
              });
              
              await Promise.all(syncPromises);
              
              // Clear localStorage favorites after sync
              localStorage.removeItem('favorites');
              console.log('✅ localStorage favorites cleared after sync');
            }
            
            // Store the current favorites from API
            setFavorites(favoriteIds);
          } else if (localStorageProducts.length > 0) {
            // If API has no favorites but localStorage does, use localStorage
            console.log('📦 Using localStorage favorites (no API favorites)');
            const favoriteIds = localStorageProducts.map(item => item.p_code || item._id);
            setFavorites(favoriteIds);
          }
        } catch (error) {
          console.error('Error loading favorites:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadFavorites();
  }, [isAuthenticated]);

  const addToFavorites = async (product) => {
    try {
      // Use p_code as identifier
      const p_code = product.p_code || product._id;
      
      if (!p_code) {
        console.error('No p_code provided for favorite');
        return;
      }

      if (isAuthenticated) {
        // Call API for authenticated users only if token exists
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('No auth token found, using localStorage instead');
          // Fall back to localStorage
          setFavorites((prev) => {
            if (!prev.some(item => (typeof item === 'object' ? item.p_code : item) === p_code)) {
              const updated = [...prev, product];
              localStorage.setItem('favorites', JSON.stringify(updated));
              return updated;
            }
            return prev;
          });
          return;
        }
        
        const response = await addToFavoritesAPI(p_code);
        if (response.success) {
          // Add to local state with full product data
          setFavorites((prev) => {
            if (!prev.some(item => (typeof item === 'object' ? item.p_code : item) === p_code)) {
              const updated = [...prev, product];
              return updated;
            }
            return prev;
          });
        }
      } else {
        // Use localStorage for guest users
        setFavorites((prev) => {
          if (!prev.some(item => (typeof item === 'object' ? item.p_code : item) === p_code)) {
            // Store full product data for guest users
            const updated = [...prev, product];
            localStorage.setItem('favorites', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      // Fall back to localStorage on API error
      const p_code = product.p_code || product._id;
      setFavorites((prev) => {
        if (!prev.some(item => (typeof item === 'object' ? item.p_code : item) === p_code)) {
          const updated = [...prev, product];
          localStorage.setItem('favorites', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }
  };

  const removeFromFavorites = async (p_code) => {
    try {
      if (isAuthenticated) {
        // Call API for authenticated users only if token exists
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('No auth token found, using localStorage instead');
          // Fall back to localStorage
          setFavorites((prev) => {
            const updated = prev.filter(item => {
              if (typeof item === 'object') {
                return item.p_code !== p_code;
              }
              return item !== p_code;
            });
            localStorage.setItem('favorites', JSON.stringify(updated));
            return updated;
          });
          return { success: true };
        }
        
        try {
          const response = await removeFromFavoritesAPI(p_code);
          if (response.success) {
            console.log('✅ Removed from favorites API:', p_code);
            // Remove from local state (handle both object and string formats)
            setFavorites((prev) => prev.filter(item => {
              if (typeof item === 'object') {
                return item.p_code !== p_code;
              }
              return item !== p_code;
            }));
            return response;
          }
        } catch (apiError) {
          // Check if error is "Product not found in favorites"
          const errorMessage = apiError.response?.data?.error || apiError.message;
          
          if (errorMessage && (errorMessage.includes('not found') || errorMessage.includes('Not found'))) {
            // Product doesn't exist in backend, but remove from UI anyway
            console.warn('⚠️ Product not in backend favorites, removing from local state');
            setFavorites((prev) => prev.filter(item => {
              if (typeof item === 'object') {
                return item.p_code !== p_code;
              }
              return item !== p_code;
            }));
            return { success: true, message: 'Removed from favorites (synced)' };
          } else {
            // Other errors - throw to outer catch
            throw apiError;
          }
        }
      } else {
        // Use localStorage for guest users
        setFavorites((prev) => {
          const updated = prev.filter(item => {
            if (typeof item === 'object') {
              return item.p_code !== p_code;
            }
            return item !== p_code;
          });
          localStorage.setItem('favorites', JSON.stringify(updated));
          return updated;
        });
        return { success: true };
      }
    } catch (error) {
      console.error('❌ Error removing from favorites:', error);
      // Fall back to localStorage on API error - still remove from UI
      console.warn('⚠️ API error, falling back to localStorage removal');
      setFavorites((prev) => {
        const updated = prev.filter(item => {
          if (typeof item === 'object') {
            return item.p_code !== p_code;
          }
          return item !== p_code;
        });
        localStorage.setItem('favorites', JSON.stringify(updated));
        return updated;
      });
      // Return success even on error so UI updates
      return { success: true, message: 'Removed from favorites (local)' };
    }
  };

  const isFavorite = (p_code) => {
    if (!p_code) return false;
    
    // Handle both object and string formats
    return favorites.some(item => {
      if (typeof item === 'object') {
        return item.p_code === p_code;
      }
      return item === p_code;
    });
  };

  const toggleFavorite = async (product) => {
    const p_code = product.p_code || product._id;
    
    try {
      if (isFavorite(p_code)) {
        await removeFromFavorites(p_code);
      } else {
        await addToFavorites(product);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  const value = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    isAuthenticated,
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};

