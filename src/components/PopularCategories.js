import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const PopularCategories = () => {
  const categories = [
    {
      name: "Dals",
      icon: "🫘",
      color: "bg-orange-50",
      iconColor: "text-orange-600",
      link: "/category/dals"
    },
    {
      name: "Dairy",
      icon: "🥛",
      color: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      name: "Tea",
      icon: "🍵",
      color: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      name: "Soft Drinks",
      icon: "🥤",
      color: "bg-red-50",
      iconColor: "text-red-600"
    },
    {
      name: "Cleaners",
      icon: "🧽",
      color: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      name: "Bath Soaps",
      icon: "🧼",
      color: "bg-yellow-50",
      iconColor: "text-yellow-600"
    },
    {
      name: "Toothpaste",
      icon: "🦷",
      color: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      name: "Shampoos",
      icon: "🧴",
      color: "bg-pink-50",
      iconColor: "text-pink-600"
    },
    {
      name: "Pooja Needs",
      icon: "🕉️",
      color: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      name: "Towels",
      icon: "🛁",
      color: "bg-cyan-50",
      iconColor: "text-cyan-600"
    },
    {
      name: "Bath Utility",
      icon: "🪣",
      color: "bg-gray-50",
      iconColor: "text-gray-600"
    },
    {
      name: "Coffee",
      icon: "☕",
      color: "bg-amber-50",
      iconColor: "text-amber-600"
    }
  ];

  return (
    <div className="relative overflow-hidden py-4 sm:py-6 lg:py-8">
      {/* Modern Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-blue-50/50 to-indigo-50/50"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative container mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-semibold text-cyan-600 uppercase tracking-wider">Trending</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Popular Categories
                </span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">Shop from our most loved categories</p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span>Fresh & Fast Delivery</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {categories.map((category, index) => {
                const CategoryComponent = category.link ? Link : 'div';
                const categoryProps = category.link ? { to: category.link } : {};
                
                return (
                  <CategoryComponent
                    key={index}
                    {...categoryProps}
                    className="flex-shrink-0 w-32 h-32 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100/50 shadow-lg hover:shadow-2xl hover:border-cyan-300 hover:scale-110 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <div className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md`}>
                        <span className={`text-5xl ${category.iconColor} w-full h-full flex items-center justify-center`}>
                          {category.icon}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 text-center leading-tight group-hover:text-cyan-600 transition-colors duration-200">
                        {category.name}
                      </span>
                    </div>
                  </CategoryComponent>
                );
              })}
            </div>
            
            {/* Enhanced Scroll Arrow with Gradient */}
            <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 group">
              <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularCategories;
