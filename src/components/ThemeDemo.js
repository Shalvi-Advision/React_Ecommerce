// Theme Demo Component
// Demonstrates the new Green Theme

import React from 'react';
import { COLORS } from '../constants/theme';

const ThemeDemo = () => {
  const colorShades = [
    { shade: 50, name: '50' },
    { shade: 100, name: '100' },
    { shade: 200, name: '200' },
    { shade: 300, name: '300' },
    { shade: 400, name: '400' },
    { shade: 500, name: '500' },
    { shade: 600, name: '600' },
    { shade: 700, name: '700' },
    { shade: 800, name: '800' },
    { shade: 900, name: '900' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary-700">
        🌿 Green Theme Demo
      </h1>

      {/* Primary Green Colors */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-primary-800">
          Primary Green Colors
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {colorShades.map(({ shade, name }) => (
            <div
              key={shade}
              className="p-6 rounded-lg shadow-md text-center"
              style={{ backgroundColor: COLORS.primary[shade] }}
            >
              <div className="text-white font-medium">
                Primary {name}
              </div>
              <div className="text-white text-sm opacity-80 mt-1">
                {COLORS.primary[shade]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Components with Green Theme */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-primary-800">
          Component Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Buttons */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Buttons</h3>
            <button className="btn-primary w-full">Primary Button</button>
            <button className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 w-full">
              Custom Green Button
            </button>
            <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 w-full">
              Outlined Button
            </button>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Cards</h3>
            <div className="card">
              <h4 className="font-semibold text-primary-700 mb-2">Green Themed Card</h4>
              <p className="text-gray-600 text-sm">
                This card uses the new green theme colors for a fresh, natural look.
              </p>
            </div>
          </div>

          {/* Form Elements */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Form Elements</h3>
            <input
              type="text"
              placeholder="Green themed input"
              className="input-field"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="demo-checkbox"
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="demo-checkbox" className="ml-2 text-sm text-gray-700">
                Green checkbox
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Color Usage Examples */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-primary-800">
          Color Usage Examples
        </h2>
        <div className="space-y-6">
          {/* Status Examples */}
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span className="text-sm text-gray-700">Active Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary-600"></div>
              <span className="text-sm text-gray-700">Primary Action</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary-700"></div>
              <span className="text-sm text-gray-700">Hover State</span>
            </div>
          </div>

          {/* Text Examples */}
          <div className="space-y-2">
            <p className="text-primary-700 font-semibold">Primary Text (700)</p>
            <p className="text-primary-600">Secondary Text (600)</p>
            <p className="text-primary-500">Accent Text (500)</p>
            <p className="text-primary-200">Light Accent (200)</p>
          </div>

          {/* Background Examples */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-primary-50 rounded text-primary-800 text-sm font-medium">
              Light Background (50)
            </div>
            <div className="p-4 bg-primary-100 rounded text-primary-800 text-sm font-medium">
              Very Light (100)
            </div>
            <div className="p-4 bg-primary-200 rounded text-primary-900 text-sm font-medium">
              Light (200)
            </div>
            <div className="p-4 bg-primary-300 rounded text-white text-sm font-medium">
              Medium Light (300)
            </div>
          </div>
        </div>
      </div>

      {/* Theme Summary */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">🌿 Green Theme Applied!</h2>
        <p className="mb-4">
          Your e-commerce application now features a beautiful green theme that's both professional and approachable.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">50+</div>
            <div className="text-primary-100">Color Shades</div>
          </div>
          <div>
            <div className="text-2xl font-bold">100%</div>
            <div className="text-primary-100">Responsive</div>
          </div>
          <div>
            <div className="text-2xl font-bold">∞</div>
            <div className="text-primary-100">Customizable</div>
          </div>
          <div>
            <div className="text-2xl font-bold">🎨</div>
            <div className="text-primary-100">Beautiful</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
