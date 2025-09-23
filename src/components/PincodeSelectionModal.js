import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getAllPincodes, searchPincodes, formatPincodeData } from '../api/pincodeService';

const PincodeSelectionModal = ({ isOpen, onClose, onPincodeSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pincodeList, setPincodeList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all pincodes on component mount
  useEffect(() => {
    if (isOpen) {
      loadPincodes();
    }
  }, [isOpen]);

  // Handle search as user types
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchPincodes(searchQuery, pincodeList);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, pincodeList]);

  const loadPincodes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPincodes();
      if (response.success && response.data) {
        const formattedPincodes = response.data.map(formatPincodeData);
        setPincodeList(formattedPincodes);
      } else {
        setError('Failed to load pincodes');
      }
    } catch (err) {
      console.error('Error loading pincodes:', err);
      setError('Failed to load pincodes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePincodeSelect = (pincode) => {
    onPincodeSelect(pincode);
    onClose();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Choose delivery location
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for area, street name or pincode.."
              className="w-full pl-10 pr-4 py-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-2 text-gray-600">Loading pincodes...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button
                onClick={loadPincodes}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* Search Results */}
              {searchQuery && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    SEARCH RESULTS
                  </h4>
                  <div className="space-y-3">
                    {searchResults.length > 0 ? (
                      searchResults.map((pincode) => (
                        <button
                          key={pincode._id}
                          onClick={() => handlePincodeSelect(pincode)}
                          className="w-full flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {pincode.pincode}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {pincode.fullAddress}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">No locations found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try searching with a different term
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Default Content - Location Icon */}
              {!searchQuery && (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      {/* Map pin icon with circular background */}
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <MapPinIcon className="w-8 h-8 text-red-500" />
                      </div>
                      {/* Decorative lines around the pin */}
                      <div className="absolute -top-2 -left-2 w-20 h-20 border border-gray-200 rounded-full"></div>
                      <div className="absolute -top-4 -left-4 w-24 h-24 border border-gray-100 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Enter your pincode or area name to find available stores
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Promotional Banner */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
            {/* Left Side - Illustration */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                {/* Phone illustration */}
                <div className="w-8 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                </div>
                {/* Building illustration */}
                <div className="flex flex-col items-center">
                  <div className="w-6 h-4 bg-green-500 rounded-t"></div>
                  <div className="w-6 h-2 bg-gray-300 rounded-b"></div>
                  <div className="text-xs text-gray-600 font-medium">D Mart</div>
                </div>
                {/* Tree illustration */}
                <div className="w-2 h-4 bg-green-600 rounded-full"></div>
              </div>
            </div>
            
            {/* Right Side - Text */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Your <span className="text-red-600 font-bold">Shopping & Savings'</span> Partner
              </p>
              <p className="text-xs text-gray-600 mt-1">
                One-stop shop for your family needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PincodeSelectionModal;
