import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getActiveDepartments, getActiveCategories, getActiveSubcategories } from '../services/groceryApi';
import { APP_CONSTANTS } from '../constants';
import { usePincode } from '../context/PincodeContext';
import { COLORS } from '../constants/theme';

// Helper function to convert hex color to rgba with opacity
const hexToRgba = (hex, opacity = 1) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const CategoriesDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { openPincodeModal } = usePincode();
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState({});
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState({});
  const [error, setError] = useState(null);
  const [requiresStoreSelection, setRequiresStoreSelection] = useState(false);
  const [requiresStoreChange, setRequiresStoreChange] = useState(false);
  
  const handleCategoryClick = (categoryName, departmentName, categoryData) => {
    // Navigate to department page (CategoryPage) with department slug
    const departmentSlug = departmentName.toLowerCase().replace(/\s+/g, '-');
    // Pass category info via state so CategoryPage can auto-select it
    navigate(`/category/${departmentSlug}`, {
      state: {
        selectedCategoryName: categoryName,
        selectedCategoryId: categoryData?.idcategory_master
      }
    });
    onClose();
  };

  const handleDepartmentClick = (departmentId) => {
    if (expandedDepartment === departmentId) {
      setExpandedDepartment(null);
    } else {
      setExpandedDepartment(departmentId);
      // Load categories for this department if not already loaded
      if (!categories[departmentId]) {
        loadCategoriesForDepartment(departmentId);
      }
    }
  };

  // Icon mapping for departments
  const getDepartmentIcon = (departmentName) => {
    const iconMap = {
      'GROCERY & STAPLES': '🛒',
      'FRUITS & VEGETABLES': '🥕',
      'DAIRY & BEVERAGES': '🥛',
      'PACKAGED FOOD': '📦',
      'PERSONAL CARE': '💄',
      'HOME & KITCHEN': '🏠',
      'CLEANING SUPPLIES': '🧽',
      'BABY CARE': '👶',
      'PET CARE': '🐾',
      'HEALTH & WELLNESS': '💊',
      'HOUSEHOLD ITEMS': '🏠',
      'STATIONERY & OFFICE': '✏️',
      'AUTOMOTIVE': '🚗',
      'ELECTRONICS': '📱',
      'FASHION & CLOTHING': '👕',
      'HOME FURNISHING': '🛏️',
      'BOOKS & MEDIA': '📚',
      'SPORTS & FITNESS': '⚽',
      'GARDEN & OUTDOOR': '🌱',
      'TOYS & GAMES': '🎮',
      'JEWELRY & WATCHES': '💍'
    };
    return iconMap[departmentName] || '📦';
  };

  // Default fallback values
  const getDefaultImage = () => '/images/logo.jpg';
  const getDefaultBgColor = () => '#f3f4f6';

  // Load categories for a specific department
  const loadCategoriesForDepartment = useCallback(async (departmentId) => {
    setCategoriesLoading(prev => ({ ...prev, [departmentId]: true }));
    
    try {
      const response = await getActiveCategories(departmentId);
      if (response.success) {
        setCategories(prev => ({
          ...prev,
          [departmentId]: response.data || []
        }));
      } else {
        console.error('Failed to load categories for department:', departmentId, response.message);
        setCategories(prev => ({
          ...prev,
          [departmentId]: []
        }));
      }
    } catch (err) {
      console.error('Error loading categories for department:', departmentId, err);
      setCategories(prev => ({
        ...prev,
        [departmentId]: []
      }));
    } finally {
      setCategoriesLoading(prev => ({ ...prev, [departmentId]: false }));
    }
  }, []);

  // Load departments from API
  useEffect(() => {
    const loadDepartments = async () => {
      if (!isOpen) return;

      setLoading(true);
      setError(null);
      setRequiresStoreSelection(false);
      setRequiresStoreChange(false);

      try {
        const response = await getActiveDepartments();
        if (response.success) {
          setDepartments(response.data || []);
        } else {
          // Check if store selection is required
          if (response.requiresStoreSelection) {
            setRequiresStoreSelection(true);
            setError(response.message || 'Please select a store to continue');
          } else if (response.requiresStoreChange) {
            setRequiresStoreChange(true);
            setError(response.message || 'No departments available for your store');
          } else {
            setError(response.message || 'Failed to load departments');
          }
        }
      } catch (err) {
        setError('Failed to load departments');
        console.error('Error loading departments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Modern Backdrop with Blur */}
      <div 
        className="fixed inset-0 backdrop-blur-sm z-40 transition-all duration-300 animate-fade-in"
        style={{
          background: `linear-gradient(to bottom right, ${hexToRgba(COLORS.black, 0.6)}, ${hexToRgba(COLORS.black, 0.5)}, ${hexToRgba(COLORS.black, 0.6)})`
        }}
        onClick={onClose}
      />
      
      {/* Modern Drawer - positioned below the header bar */}
      <div 
        className="fixed top-12 left-0 w-full z-50 shadow-2xl animate-slide-up" 
        style={{ 
          height: 'calc(100vh - 3rem)',
          background: `linear-gradient(to bottom right, ${COLORS.white}, ${COLORS.gray[50]}, ${COLORS.white})`,
          borderTop: `4px solid ${COLORS.primary[500]}`
        }}
      >
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          {/* Header Background Gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${hexToRgba(COLORS.primary[500], 0.1)}, ${hexToRgba(COLORS.success[500], 0.1)}, ${hexToRgba(COLORS.primary[400], 0.1)})`
            }}
          ></div>
          
          <div 
            className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b backdrop-blur-sm"
            style={{
              borderColor: hexToRgba(COLORS.gray[200], 0.5)
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(to bottom right, ${COLORS.primary[500]}, ${COLORS.success[500]})`
                }}
              >
                <span className="text-2xl">🛒</span>
              </div>
              <div>
                <h2 
                  className="text-lg sm:text-xl font-bold bg-clip-text text-transparent"
                  style={{
                    background: `linear-gradient(to right, ${COLORS.primary[600]}, ${COLORS.success[600]}, ${COLORS.primary[500]})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  All Categories
                </h2>
                <p className="text-xs hidden sm:block" style={{ color: COLORS.gray[500] }}>Explore our wide range of products</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="group p-2 rounded-xl transition-all duration-300 hover:scale-110"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.error[50];
                const icon = e.currentTarget.querySelector('svg');
                if (icon) icon.style.color = COLORS.error[500];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                const icon = e.currentTarget.querySelector('svg');
                if (icon) icon.style.color = COLORS.gray[500];
              }}
            >
              <XMarkIcon 
                className="w-6 h-6 transition-colors" 
                style={{ color: COLORS.gray[500] }}
              />
            </button>
          </div>
        </div>

        {/* Modern Categories Grid */}
        <div 
          className="h-full overflow-y-auto custom-scrollbar" 
          style={{ 
            height: 'calc(100vh - 6rem)',
            background: `linear-gradient(to bottom right, ${COLORS.white}, ${COLORS.gray[50]}, ${COLORS.white})`
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="relative">
                  <div 
                    className="w-16 h-16 border-4 border-transparent rounded-full animate-spin"
                    style={{
                      borderTopColor: COLORS.primary[500],
                      borderRightColor: COLORS.success[500],
                      borderBottomColor: COLORS.primary[400]
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0 w-16 h-16 rounded-full blur-lg animate-pulse"
                    style={{
                      background: `linear-gradient(to right, ${hexToRgba(COLORS.primary[400], 0.2)}, ${hexToRgba(COLORS.success[400], 0.2)})`
                    }}
                  ></div>
                </div>
                <p 
                  className="mt-4 text-base font-semibold bg-clip-text text-transparent"
                  style={{
                    color: COLORS.gray[600],
                    background: `linear-gradient(to right, ${COLORS.primary[600]}, ${COLORS.success[600]})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Loading categories...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div 
                className="text-center backdrop-blur-lg rounded-3xl p-8 shadow-2xl border mx-4"
                style={{
                  backgroundColor: hexToRgba(COLORS.white, 0.8),
                  borderColor: hexToRgba(COLORS.white, 0.6)
                }}
              >
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: requiresStoreSelection 
                      ? `linear-gradient(to bottom right, ${COLORS.secondary[100]}, ${COLORS.secondary[200]})`
                      : requiresStoreChange
                      ? `linear-gradient(to bottom right, ${COLORS.warning[100]}, ${COLORS.warning[200]})`
                      : `linear-gradient(to bottom right, ${COLORS.error[100]}, ${COLORS.error[200]})`
                  }}
                >
                  <span className="text-4xl">{
                    requiresStoreSelection ? '🏪' :
                    requiresStoreChange ? '📦' :
                    '⚠️'
                  }</span>
                </div>
                <p 
                  className="mb-2 text-base font-semibold"
                  style={{
                    color: requiresStoreSelection 
                      ? COLORS.secondary[600]
                      : requiresStoreChange
                      ? COLORS.warning[600]
                      : COLORS.error[600]
                  }}
                >
                  {requiresStoreSelection ? 'Store Selection Required' :
                   requiresStoreChange ? 'No Products Available' :
                   'Failed to load categories'}
                </p>
                <p className="text-sm mb-4" style={{ color: COLORS.gray[500] }}>{error}</p>
                {requiresStoreSelection || requiresStoreChange ? (
                  <button
                    onClick={() => {
                      openPincodeModal();
                      onClose();
                    }}
                    className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                    style={{
                      background: requiresStoreSelection
                        ? `linear-gradient(to right, ${COLORS.secondary[500]}, ${COLORS.secondary[400]})`
                        : `linear-gradient(to right, ${COLORS.warning[500]}, ${COLORS.warning[400]})`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {requiresStoreSelection ? 'Select Store' : 'Change Store'}
                  </button>
                ) : (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.primary[500]}, ${COLORS.success[500]})`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div 
              className="p-4 sm:p-6"
              style={{
                background: `linear-gradient(to bottom right, ${COLORS.gray[50]}, ${COLORS.white})`
              }}
            >
              {/* Redesigned Departments Layout with Better Bifurcation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {departments.map((department, index) => {
                  const departmentId = department.department_id;
                  const departmentName = department.department_name;
                  const departmentImage = department.image_link || getDefaultImage();
                  const departmentCategories = categories[departmentId] || [];
                  const isLoadingCategories = categoriesLoading[departmentId] || false;

                  // Load categories if not already loaded
                  if (!categories[departmentId] && !categoriesLoading[departmentId]) {
                    loadCategoriesForDepartment(departmentId);
                  }

                  return (
                    <div 
                      key={index} 
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border overflow-hidden"
                      style={{
                        borderColor: COLORS.gray[200]
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.08)';
                      }}
                    >
                      {/* Department Header Section */}
                      <div 
                        className="px-4 py-4 border-b-2"
                        style={{
                          background: `linear-gradient(to right, ${COLORS.primary[50]}, ${COLORS.success[50]}, ${COLORS.primary[100]})`,
                          borderColor: COLORS.primary[200]
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Department Icon/Image */}
                          <div 
                            className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-white rounded-lg flex items-center justify-center shadow-sm border"
                            style={{
                              borderColor: COLORS.gray[200]
                            }}
                          >
                            {department.image_link ? (
                              <img
                                src={departmentImage}
                                alt={departmentName}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const iconElement = e.target.parentElement.querySelector('.fallback-icon');
                                  if (iconElement) iconElement.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className={`fallback-icon ${department.image_link ? 'hidden' : 'flex'} items-center justify-center`}
                            >
                              <span className="text-3xl sm:text-4xl">
                                {getDepartmentIcon(departmentName)}
                              </span>
                            </div>
                          </div>

                          {/* Department Name */}
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="text-sm sm:text-base font-bold uppercase tracking-wide line-clamp-2"
                              style={{ color: COLORS.gray[900] }}
                            >
                              {departmentName}
                            </h3>
                            {departmentCategories.length > 0 && (
                              <p className="text-xs mt-1" style={{ color: COLORS.gray[500] }}>
                                {departmentCategories.length} {departmentCategories.length === 1 ? 'category' : 'categories'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Categories List Section */}
                      <div className="p-4">
                        {isLoadingCategories ? (
                          <div className="flex items-center justify-center py-6">
                            <div 
                              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                              style={{
                                borderColor: COLORS.primary[500]
                              }}
                            ></div>
                          </div>
                        ) : departmentCategories.length > 0 ? (
                          <div className="space-y-1.5">
                            {/* Filter out duplicate categories */}
                            {departmentCategories
                              .filter((category, index, self) => {
                                const identifier = category.idcategory_master || category.category_name;
                                return index === self.findIndex(c =>
                                  (c.idcategory_master || c.category_name) === identifier
                                );
                              })
                              .map((category) => (
                                <button
                                  key={category.idcategory_master || category.category_name}
                                  onClick={() => handleCategoryClick(category.category_name, departmentName, category)}
                                  className="w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2 group"
                                  style={{ color: COLORS.gray[700] }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = COLORS.primary[600];
                                    e.currentTarget.style.backgroundColor = COLORS.primary[50];
                                    const icon = e.currentTarget.querySelector('svg');
                                    if (icon) icon.style.color = COLORS.primary[600];
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = COLORS.gray[700];
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    const icon = e.currentTarget.querySelector('svg');
                                    if (icon) icon.style.color = COLORS.gray[400];
                                  }}
                                >
                                  <ChevronRightIcon 
                                    className="w-4 h-4 transition-colors flex-shrink-0" 
                                    style={{ color: COLORS.gray[400] }}
                                  />
                                  <span className="flex-1 truncate">{category.category_name || 'Not Available'}</span>
                                </button>
                              ))
                            }
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-xs" style={{ color: COLORS.gray[400] }}>No categories available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State if no categories */}
              {departments.length === 0 && !loading && !error && (
                <div className="flex items-center justify-center h-full">
                  <div 
                    className="text-center backdrop-blur-lg rounded-3xl p-8 shadow-2xl border"
                    style={{
                      backgroundColor: hexToRgba(COLORS.white, 0.8),
                      borderColor: hexToRgba(COLORS.white, 0.6)
                    }}
                  >
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: `linear-gradient(to bottom right, ${COLORS.gray[100]}, ${COLORS.gray[200]})`
                      }}
                    >
                      <span className="text-4xl">🛒</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.gray[800] }}>No Categories Found</h3>
                    <p className="text-sm" style={{ color: COLORS.gray[600] }}>Categories will appear here once they're available</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${COLORS.gray[100]};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, ${COLORS.primary[500]}, ${COLORS.success[500]});
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, ${COLORS.primary[600]}, ${COLORS.success[600]});
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </>
  );
};

export default CategoriesDrawer;
