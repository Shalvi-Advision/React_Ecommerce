import React, { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon, 
  XMarkIcon,
  PencilIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { getStoreDetails, formatStoreData } from '../api/pincodeService';

const StoreDetailsModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedPincode, 
  selectedStore 
}) => {
  const [storeDetails, setStoreDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && selectedStore) {
      loadStoreDetails();
    }
  }, [isOpen, selectedStore]);

  const loadStoreDetails = async () => {
    if (!selectedStore) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await getStoreDetails(selectedStore.storeCode);
      if (response.success && response.data) {
        const formattedStore = formatStoreData(response.data);
        setStoreDetails(formattedStore);
      } else {
        setError('Failed to load store details');
      }
    } catch (err) {
      console.error('Error loading store details:', err);
      setError('Failed to load store details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (storeDetails) {
      onConfirm({
        pincode: selectedPincode,
        store: storeDetails
      });
    }
  };

  const handleClose = () => {
    setStoreDetails(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            Confirm Location
          </h3>
        </div>

        {/* Location Display */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedPincode?.pincode}, {selectedPincode?.area}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedPincode?.fullAddress}
                </p>
              </div>
            </div>
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <PencilIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Serviceability Confirmation Card */}
        <div className="px-6 py-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            {/* Illustration */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center">
                {/* Shopping basket illustration */}
                <div className="relative">
                  <div className="w-12 h-8 bg-teal-500 rounded-t-lg"></div>
                  <div className="w-12 h-2 bg-teal-600 rounded-b-lg"></div>
                  {/* Grocery items in basket */}
                  <div className="absolute -top-1 left-1 w-2 h-2 bg-yellow-300 rounded"></div>
                  <div className="absolute -top-1 left-3 w-2 h-2 bg-green-300 rounded"></div>
                  <div className="absolute -top-1 left-5 w-2 h-2 bg-blue-300 rounded"></div>
                  <div className="absolute -top-1 left-7 w-2 h-2 bg-red-300 rounded"></div>
                  {/* D-Mart text */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-teal-600">
                    D-Mart
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Message */}
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-1">
                Great, We are available here!
              </h4>
              <p className="text-sm text-gray-500">
                Explore our wide range of products delivered straight to your home!
              </p>
            </div>
          </div>
        </div>

        {/* Store Details */}
        {isLoading ? (
          <div className="px-6 py-4">
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span className="ml-2 text-gray-600">Loading store details...</span>
            </div>
          </div>
        ) : error ? (
          <div className="px-6 py-4">
            <div className="text-center py-4">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button
                onClick={loadStoreDetails}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        ) : storeDetails ? (
          <div className="px-6 py-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3">Selected Store Details</h5>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Store:</span>
                  <span className="ml-2 text-gray-600">{storeDetails.storeName}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <span className="ml-2 text-gray-600">{storeDetails.storeAddress}</span>
                </div>
                
                {storeDetails.storeOpenTime && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{storeDetails.storeOpenTime}</span>
                  </div>
                )}
                
                {storeDetails.storeDeliveryTime && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Delivery: {storeDetails.storeDeliveryTime}</span>
                  </div>
                )}
                
                {storeDetails.minOrderAmount && (
                  <div>
                    <span className="font-medium text-gray-700">Min. Order:</span>
                    <span className="ml-2 text-gray-600">₹{storeDetails.minOrderAmount}</span>
                  </div>
                )}
                
                {storeDetails.storeOfferName && (
                  <div>
                    <span className="font-medium text-gray-700">Offers:</span>
                    <span className="ml-2 text-green-600 font-medium">{storeDetails.storeOfferName}</span>
                  </div>
                )}
                
                {storeDetails.contactNumber && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{storeDetails.contactNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleConfirm}
            disabled={!storeDetails}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            CONFIRM LOCATION
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailsModal;
