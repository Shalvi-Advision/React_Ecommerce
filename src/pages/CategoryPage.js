import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import GroceryProductCard from '../components/GroceryProductCard';
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { getProductsOptimized } from '../api/productsApi';
import groceryApiService from '../services/groceryApi';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // State management
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentImage, setDepartmentImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    brand: '',
    category: '',
    colour: '',
    material: '',
    capacity: '',
    warranty: '',
    volume: '',
    dimension: ''
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total_products: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Convert category slug back to department name
  const getDepartmentNameFromSlug = (slug) => {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Memoized function to load department data
  const loadDepartmentData = useCallback(async () => {
    try {
      setLoading(true);
      const departmentName = getDepartmentNameFromSlug(categoryName);
      setSelectedDepartment(departmentName);
      
      // Fetch department image from API
      try {
        const departmentsResponse = await groceryApiService.getActiveDepartments();
        if (departmentsResponse.success && departmentsResponse.data) {
          const department = departmentsResponse.data.find(
            dept => dept.department_name.toLowerCase() === departmentName.toLowerCase()
          );
          if (department && department.image_link) {
            setDepartmentImage(department.image_link);
          }
        }
      } catch (e) {
        console.error('Error fetching department image:', e);
      }
      
      // Use local storage cache if available
      const cachedCategories = localStorage.getItem(`categories_${departmentName}`);
      const cacheTimestamp = localStorage.getItem(`categories_timestamp_${departmentName}`);
      const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
      const cacheValid = cacheAge < 30 * 60 * 1000; // 30 minutes cache validity
      
      if (cachedCategories && cacheValid) {
        try {
          // Use cached categories
          setCategories(JSON.parse(cachedCategories));
          console.log('Using cached categories data for', departmentName);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Error parsing cached categories:', e);
          // Fall through to fetch fresh data
        }
      }
      
      // Load categories for this department
      const response = await groceryApiService.getActiveCategoriesByDepartmentName(departmentName);
      if (response.success) {
        setCategories(response.data);

        // Cache the categories
        try {
          localStorage.setItem(`categories_${departmentName}`, JSON.stringify(response.data));
          localStorage.setItem(`categories_timestamp_${departmentName}`, Date.now().toString());
        } catch (e) {
          console.error('Error caching categories:', e);
        }
      } else {
        setCategories([]);
        setError('Failed to load categories');
      }
    } catch (err) {
      console.error('Error loading department data:', err);
      setError('Failed to load department data');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  // Load department and categories on component mount
  useEffect(() => {
    if (categoryName) {
      loadDepartmentData();
    }
  }, [categoryName, loadDepartmentData]);

  // Memoized loadProducts function to prevent recreating on every render
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use optimized productsApi to fetch products
      const response = await getProductsOptimized({
        page: currentPage,
        limit: 20,
        dept_id: "2", // Default department ID
        category_id: selectedCategory?.idcategory_master?.toString() || "72", // Use selected category or default
        sub_category_id: "391" // Default sub-category ID
      });

      if (response) {
        setProducts(response.products || []);
        setPagination(response.pagination || {
          page: currentPage,
          limit: 20,
          total_products: response.products?.length || 0,
          total_pages: 1,
          has_next: false,
          has_prev: false
        });
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
      
      // If offline, show appropriate message
      if (!navigator.onLine) {
        setError('You are currently offline. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory]);
  
  // Load products when category changes or current page changes
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, currentPage, loadProducts]);

  // Filter products based on additional filters and sorting
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply additional filters
    if (filters.brand) {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.our_price - b.our_price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.our_price - a.our_price);
        break;
      case 'discount':
        filtered.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return filtered;
  }, [products, filters, sortBy]);

  // Get unique brands from filtered products
  const availableBrands = useMemo(() => {
    const brands = [...new Set(filteredProducts.map(product => product.brand).filter(Boolean))];
    return brands.sort();
  }, [filteredProducts]);

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      brand: '',
      category: '',
      colour: '',
      material: '',
      capacity: '',
      warranty: '',
      volume: '',
      dimension: ''
    });
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Modern Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-transparent border-t-emerald-500 border-r-teal-500 border-b-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-lg animate-pulse"></div>
          </div>
          <p className="mt-4 text-gray-600 font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  // Modern Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/60 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Products</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Modern Mobile Header */}
      {isMobile && (
        <div className="relative bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-emerald-50 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              {departmentImage && (
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg flex items-center justify-center overflow-hidden shadow-md">
                  <img 
                    src={departmentImage} 
                    alt={selectedDepartment}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {selectedDepartment || 'Categories'}
              </h1>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>
      )}

      <div className="flex">
        {/* Modern Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-80' : 'w-80'}
          bg-white/90 backdrop-blur-sm border-r border-gray-200/50 transition-transform duration-300 ease-in-out shadow-xl
          ${isMobile ? '' : 'sticky top-0 h-screen'}
        `}>
          {/* Mobile sidebar header */}
          {isMobile && (
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10"></div>
              <div className="relative flex items-center justify-between p-4 border-b border-gray-200/50">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg flex items-center justify-center overflow-hidden shadow-md">
                    {departmentImage ? (
                      <img 
                        src={departmentImage} 
                        alt={selectedDepartment}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="text-lg">📂</span>';
                        }}
                      />
                    ) : (
                      <span className="text-lg">📂</span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Subcategories</h2>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
          )}

          {/* Desktop sidebar header */}
          {!isMobile && (
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10"></div>
              <div className="relative p-6 border-b border-gray-200/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                    {departmentImage ? (
                      <img 
                        src={departmentImage} 
                        alt={selectedDepartment}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="text-2xl">📂</span>';
                        }}
                      />
                    ) : (
                      <span className="text-2xl">📂</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedDepartment}</h2>
                    <p className="text-xs text-gray-500">Select a subcategory</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subcategories List with Deduplication */}
          <div className="overflow-y-auto h-full custom-scrollbar">
            <div className="p-4 space-y-1.5">
              {categories
                .filter((category, index, self) => {
                  // Remove duplicates based on category_id or category_name
                  const identifier = category.category_id || category.category_name;
                  return index === self.findIndex(c => 
                    (c.category_id || c.category_name) === identifier
                  );
                })
                .map((category) => (
                  <button
                    key={category.category_id || category.category_name}
                    onClick={() => handleCategorySelect(category)}
                    className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between ${
                      selectedCategory?.category_id === category.category_id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105'
                        : 'bg-white hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 text-gray-700 hover:shadow-md hover:scale-102 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                        {category.image_link ? (
                          <img 
                            src={category.image_link} 
                            alt={category.category_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<span class="text-lg">📦</span>';
                            }}
                          />
                        ) : (
                          <span className="text-lg">📦</span>
                        )}
                      </div>
                      <span className={`font-semibold text-sm ${
                        selectedCategory?.category_id === category.category_id
                          ? 'text-white'
                          : 'text-gray-800 group-hover:text-emerald-700'
                      }`}>
                        {category.category_name}
                      </span>
                    </div>
                    {category.product_count && category.product_count > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        selectedCategory?.category_id === category.category_id
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                      }`}>
                        {category.product_count}
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Modern Mobile sidebar overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm z-40 animate-fade-in"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Modern Breadcrumb and Title */}
          <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-4 sm:px-6 py-6 shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <span className="hover:text-emerald-600 cursor-pointer transition-colors">Home</span>
                <span className="mx-2">›</span>
                <span className="text-gray-900 font-medium">{selectedDepartment}</span>
                {selectedCategory && (
                  <>
                    <span className="mx-2">›</span>
                    <span className="text-emerald-600 font-semibold">{selectedCategory.category_name}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {selectedCategory?.category_name || selectedDepartment || 'All Products'}
              </h1>
            </div>
          </div>

          {/* Modern Filters and Sort */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 sm:px-6 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {/* Modern Filter Dropdowns */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-300"
                >
                  <option value="">Brand</option>
                  {availableBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>

                <select
                  value={filters.material}
                  onChange={(e) => handleFilterChange('material', e.target.value)}
                  className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-300"
                >
                  <option value="">Material</option>
                  <option value="stainless-steel">Stainless Steel</option>
                  <option value="aluminum">Aluminum</option>
                  <option value="cast-iron">Cast Iron</option>
                  <option value="non-stick">Non-Stick</option>
                </select>
              </div>

              {/* Modern Sort By */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-600 font-semibold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Discount</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modern Products Grid */}
          <div className="p-4 sm:p-6">
            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {/* Modern Product Cards */}
                  {filteredProducts.map((product, index) => (
                    <div key={product._id || product.p_code || index} className="group bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100/50 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300">
                      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                        <img 
                          src={product.image_url || '/images/placeholder-product.jpg'} 
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-product.jpg';
                          }}
                        />
                        {product.discount_percentage > 0 && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg animate-pulse">
                            {product.discount_percentage}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">{product.product_name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg font-bold text-gray-900">₹{product.our_price}</span>
                          {product.product_mrp !== product.our_price && (
                            <span className="text-sm text-gray-500 line-through">₹{product.product_mrp}</span>
                          )}
                        </div>
                        {product.package_size && (
                          <div className="text-xs text-gray-500 mb-3 font-medium">
                            {product.package_size}
                          </div>
                        )}
                        <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 px-4 rounded-xl text-sm font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
                          ADD TO CART
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modern Pagination Controls */}
                {pagination.total_pages > 1 && (
                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-sm text-gray-600 font-medium">
                        Showing <span className="text-emerald-600 font-bold">{products.length}</span> of <span className="text-emerald-600 font-bold">{pagination.total_products}</span> products
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!pagination.has_prev}
                          className="px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          Previous
                        </button>
                        
                        <div className="flex items-center space-x-1.5">
                          {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                                  currentPage === pageNum
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-110'
                                    : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-emerald-400 hover:scale-105'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!pagination.has_next}
                          className="px-4 sm:px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl text-sm font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <span className="text-6xl">📦</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or browse different subcategories to find what you're looking for
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #14b8a6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #0d9488);
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;