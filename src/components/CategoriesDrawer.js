import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getActiveDepartments, getActiveCategories } from '../services/groceryApi';
import { APP_CONSTANTS } from '../constants';

const CategoriesDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState({});
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState({});
  const [error, setError] = useState(null);
  
  const handleCategoryClick = (categoryName) => {
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/category/${categorySlug}`);
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
  const getDefaultImage = () => '/images/placeholder-category.png';
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
      
      try {
        const response = await getActiveDepartments();
        if (response.success) {
          setDepartments(response.data || []);
        } else {
          setError(response.message || 'Failed to load departments');
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

  // Fallback categories for when API fails
  const fallbackCategories = [
    {
      name: "GROCERY & STAPLES",
      icon: "🛒",
      subcategories: [
        "Dals & Pulses", "Rice & Rice Products", "Wheat & Other Grains",
        "Cooking Oil", "Ghee & Vanaspati", "Masala & Spices", "Salt & Sugar",
        "Jaggery & Sweeteners", "Flours & Atta", "Cereals & Muesli",
        "Dry Fruits & Nuts", "Seeds & Nuts", "Organic Staples"
      ]
    },
    {
      name: "FRUITS & VEGETABLES",
      icon: "🥕",
      subcategories: [
        "Fresh Fruits", "Fresh Vegetables", "Exotic Fruits", "Exotic Vegetables",
        "Leafy Vegetables", "Cut Fruits & Veggies", "Frozen Vegetables",
        "Frozen Fruits", "Seasonal Fruits", "Organic Fruits & Vegetables",
        "Hydroponic Vegetables", "Sprouts", "Herbs & Spices"
      ]
    },
    {
      name: "DAIRY & BEVERAGES",
      icon: "🥛",
      subcategories: [
        "Milk & Milk Products", "Cheese & Butter", "Yogurt & Curd",
        "Ice Cream & Frozen Desserts", "Soft Drinks", "Juices & Nectars",
        "Energy Drinks", "Tea & Coffee", "Health Drinks", "Water & Soda",
        "Sports Drinks", "Alcoholic Beverages"
      ]
    },
    {
      name: "PACKAGED FOOD",
      icon: "📦",
      subcategories: [
        "Biscuits & Cookies", "Snacks & Namkeen", "Breakfast Cereals",
        "Chocolates & Candies", "Ketchup & Sauces", "Jams & Spreads",
        "Pasta & Noodles", "Ready To Cook", "Gourmet Food", "Sweets & Mithai",
        "Pickles & Chutneys", "Health Food", "Mukhwas & Supari",
        "Bakery Products", "Canned Food", "Frozen Foods", "Instant Mixes"
      ]
    },
    {
      name: "PERSONAL CARE",
      icon: "💄",
      subcategories: [
        "Skin Care", "Hair Care", "Bath & Body", "Makeup & Cosmetics",
        "Personal Hygiene", "Oral Care", "Men's Grooming", "Fragrances",
        "Baby Care", "Feminine Care", "Health & Wellness", "Shaving & Grooming"
      ]
    },
    {
      name: "HOME & KITCHEN",
      icon: "🏠",
      subcategories: [
        "Cookware", "Serveware", "Cutlery", "Kitchen Tools", "Storage & Organizers",
        "Kitchen Appliances", "Bakeware", "Drinkware", "Tableware", "Jars & Containers",
        "Kitchen Accessories", "Dining & Serving", "Pooja Needs"
      ]
    },
    {
      name: "CLEANING SUPPLIES",
      icon: "🧽",
      subcategories: [
        "Detergent & Fabric Care", "Floor Cleaners", "Utensil Cleaners",
        "Bathroom Cleaners", "Glass Cleaners", "Disinfectants", "Fresheners",
        "Tissue Paper & Napkins", "Cleaning Tools", "Trash Bags", "Air Fresheners"
      ]
    },
    {
      name: "BABY CARE",
      icon: "👶",
      subcategories: [
        "Baby Food", "Baby Care", "Diapers & Wipes", "Baby Clothes",
        "Baby Toys", "Feeding Accessories", "Baby Health", "Nursing & Feeding"
      ]
    },
    {
      name: "PET CARE",
      icon: "🐕",
      subcategories: [
        "Pet Food", "Pet Care", "Pet Toys", "Pet Accessories", "Pet Health",
        "Pet Grooming", "Pet Litter", "Pet Treats"
      ]
    },
    {
      name: "HEALTH & WELLNESS",
      icon: "💊",
      subcategories: [
        "Vitamins & Supplements", "Health Monitors", "First Aid", "Medical Supplies",
        "Fitness & Sports", "Yoga & Meditation", "Health Drinks", "Protein Supplements"
      ]
    },
    {
      name: "STATIONERY & OFFICE",
      icon: "✏️",
      subcategories: [
        "Pens & Pencils", "Notebooks & Diaries", "Art & Craft", "Office Supplies",
        "Gift Bags & Boxes", "School Supplies", "Computer Accessories", "Filing & Storage"
      ]
    },
    {
      name: "AUTOMOTIVE",
      icon: "🚗",
      subcategories: [
        "Car Care", "Motor Oil", "Car Accessories", "Tire Care", "Car Cleaning",
        "Car Maintenance", "Car Electronics", "Car Safety"
      ]
    },
    {
      name: "ELECTRONICS",
      icon: "📱",
      subcategories: [
        "Mobile Accessories", "Computer Accessories", "Audio & Video", "Gaming",
        "Home Appliances", "Kitchen Appliances", "Personal Care Appliances",
        "Chargers & Cables", "Storage Devices"
      ]
    },
    {
      name: "FASHION & CLOTHING",
      icon: "👕",
      subcategories: [
        "Men's Clothing", "Women's Clothing", "Kids Clothing", "Footwear",
        "Accessories", "Jewelry", "Watches", "Bags & Luggage", "Underwear",
        "Sleepwear", "Activewear", "Traditional Wear"
      ]
    },
    {
      name: "HOME FURNISHING",
      icon: "🛏️",
      subcategories: [
        "Bedsheets & Bedding", "Bath Range", "Curtains & Blinds", "Home Decor",
        "Door Mats & Carpets", "Table Covers", "Home Furniture", "Lighting",
        "Wall Decor", "Garden & Outdoor", "Storage Solutions"
      ]
    },
    {
      name: "BOOKS & MEDIA",
      icon: "📚",
      subcategories: [
        "Fiction Books", "Non-Fiction Books", "Children's Books", "Educational Books",
        "Cookbooks", "Magazines", "Newspapers", "E-books", "Audiobooks",
        "Music & Movies", "Gaming", "Art & Photography"
      ]
    },
    {
      name: "SPORTS & FITNESS",
      icon: "⚽",
      subcategories: [
        "Outdoor Sports", "Indoor Sports", "Fitness Equipment", "Sports Clothing",
        "Sports Accessories", "Water Sports", "Winter Sports", "Adventure Sports",
        "Team Sports", "Individual Sports", "Fitness Supplements"
      ]
    },
    {
      name: "GARDEN & OUTDOOR",
      icon: "🌱",
      subcategories: [
        "Plants & Seeds", "Garden Tools", "Outdoor Furniture", "BBQ & Grilling",
        "Outdoor Lighting", "Pest Control", "Plant Care", "Garden Decor",
        "Outdoor Storage", "Landscaping", "Watering & Irrigation"
      ]
    },
    {
      name: "TOYS & GAMES",
      icon: "🎮",
      subcategories: [
        "Action Figures", "Board Games", "Puzzles", "Educational Toys",
        "Outdoor Toys", "Electronic Toys", "Arts & Crafts", "Building Sets",
        "Dolls & Accessories", "Sports Toys", "Baby Toys"
      ]
    },
    {
      name: "JEWELRY & WATCHES",
      icon: "💍",
      subcategories: [
        "Rings", "Necklaces", "Earrings", "Bracelets", "Watches",
        "Jewelry Boxes", "Jewelry Care", "Fashion Jewelry", "Precious Metals",
        "Gemstones", "Vintage Jewelry"
      ]
    }
  ];

  // Use API data if available, otherwise fallback to hardcoded categories
  const displayCategories = departments.length > 0 ? departments : fallbackCategories;

  if (!isOpen) return null;

  return (
    <>
      {/* Modern Backdrop with Blur */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm z-40 transition-all duration-300 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modern Drawer - positioned below the header bar */}
      <div className="fixed top-12 left-0 w-full bg-gradient-to-br from-white via-gray-50 to-white z-50 shadow-2xl border-t-4 border-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-slide-up" style={{ height: 'calc(100vh - 3rem)' }}>
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          {/* Header Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10"></div>
          
          <div className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-gray-200/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🛒</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  All Categories
                </h2>
                <p className="text-xs text-gray-500 hidden sm:block">Explore our wide range of products</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="group p-2 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Modern Categories Grid */}
        <div className="h-full overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-white custom-scrollbar" style={{ height: 'calc(100vh - 6rem)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-transparent border-t-emerald-500 border-r-teal-500 border-b-cyan-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-lg animate-pulse"></div>
                </div>
                <p className="mt-4 text-gray-600 text-base font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  Loading categories...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/60 mx-4">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">⚠️</span>
                </div>
                <p className="text-red-600 mb-2 text-base font-semibold">Failed to load categories</p>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Departments Grid - Modern Card Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
                {displayCategories.map((department, index) => {
                  const departmentId = department.department_id || department.name;
                  const departmentName = department.department_name || department.name;
                  const departmentImage = department.image_link || getDefaultImage();
                  const isExpanded = expandedDepartment === departmentId;
                  const departmentCategories = categories[departmentId] || [];
                  const isLoadingCategories = categoriesLoading[departmentId] || false;
                  
                  return (
                    <div key={index} className="flex flex-col">
                      {/* Modern Department Card */}
                      <div 
                        className="group cursor-pointer"
                        onClick={() => handleDepartmentClick(departmentId)}
                      >
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100/50 hover:border-emerald-300 hover:scale-105">
                          {/* Image Container with Gradient Background */}
                          <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl sm:rounded-2xl mb-3 overflow-hidden aspect-square group-hover:shadow-inner transition-all duration-300">
                            {/* Decorative Corner Gradient */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 z-0"></div>
                            
                            {department.image_link ? (
                              <img 
                                src={departmentImage} 
                                alt={departmentName}
                                className="relative z-10 w-full h-full object-cover drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const iconElement = e.target.parentElement.querySelector('.fallback-icon');
                                  if (iconElement) iconElement.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`fallback-icon absolute inset-0 z-10 bg-gradient-to-br from-white to-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${department.image_link ? 'hidden' : 'flex'}`}
                            >
                              <span className="text-4xl sm:text-5xl lg:text-6xl">
                                {getDepartmentIcon(departmentName)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Expand Indicator */}
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
                            <ChevronRightIcon 
                              className={`w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 transition-all duration-300 ${
                                isExpanded ? 'rotate-90 text-teal-600' : ''
                              }`} 
                            />
                          </div>
                          
                          {/* Active State Indicator */}
                          {isExpanded && (
                            <div className="absolute inset-0 border-2 border-emerald-500 rounded-2xl sm:rounded-3xl pointer-events-none animate-pulse"></div>
                          )}
                        </div>
                      </div>

                      {/* Expanded Categories - Modern Dropdown */}
                      {isExpanded && (
                        <div className="mt-3 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-200/50 p-3 sm:p-4 animate-scale-in">
                          {isLoadingCategories ? (
                            <div className="flex items-center justify-center py-6">
                              <div className="relative">
                                <div className="w-10 h-10 border-3 border-transparent border-t-emerald-500 border-r-teal-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 w-10 h-10 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-lg animate-pulse"></div>
                              </div>
                            </div>
                          ) : departmentCategories.length > 0 ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                                <div className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Subcategories
                                </span>
                              </div>
                              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                                {/* Filter out duplicate categories based on category_id or category_name */}
                                {departmentCategories
                                  .filter((category, index, self) => {
                                    // Remove duplicates by checking if this is the first occurrence
                                    // Use category_id if available, otherwise use category_name
                                    const identifier = category.category_id || category.category_name;
                                    return index === self.findIndex(c => 
                                      (c.category_id || c.category_name) === identifier
                                    );
                                  })
                                  .map((category) => (
                                    <button 
                                      key={category.category_id || category.category_name}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCategoryClick(category.category_name);
                                      }}
                                      className="group w-full text-left py-2.5 px-3 rounded-xl transition-all duration-300 flex items-center gap-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:shadow-md hover:scale-102"
                                    >
                                      {category.image_link && (
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-1.5 group-hover:scale-110 transition-transform duration-300">
                                          <img 
                                            src={category.image_link} 
                                            alt={category.category_name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                            }}
                                          />
                                        </div>
                                      )}
                                      <span className="flex-1 text-xs sm:text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">
                                        {category.category_name || 'Not Available'}
                                      </span>
                                      <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                                    </button>
                                  ))
                                }
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="text-2xl">📦</span>
                              </div>
                              <p className="text-xs text-gray-500">No categories available</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Empty State if no categories */}
              {displayCategories.length === 0 && !loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/60">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">🛒</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No Categories Found</h3>
                    <p className="text-sm text-gray-600">Categories will appear here once they're available</p>
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
    </>
  );
};

export default CategoriesDrawer;
