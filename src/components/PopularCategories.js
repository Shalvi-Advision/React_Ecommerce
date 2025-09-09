import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const PopularCategories = () => {
  const categories = [
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
    <div className="bg-gray-100 py-6">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Popular Categories</h2>
          
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-28 h-15 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    <div className={`w-14 h-14 rounded-lg ${category.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200`}>
                      <span className={`text-2xl ${category.iconColor}`}>
                        {category.icon}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                      {category.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Scroll Arrow */}
            <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow duration-200">
              <ChevronRightIcon className="w-5 h-5 text-green-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularCategories;
