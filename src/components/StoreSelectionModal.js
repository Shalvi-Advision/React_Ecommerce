import React, { useState, useEffect } from 'react';
import { MapPinIcon, ClockIcon, PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getPincodeStores, formatStoreData } from '../api/pincodeService';

const StoreSelectionModal = ({ isOpen, onClose, onStoreSelect, selectedPincode }) => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && selectedPincode) {
      loadStores();
    }
  }, [isOpen, selectedPincode]);

  const loadStores = async () => {
    if (!selectedPincode) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPincodeStores(selectedPincode.pincode);
      if (response.success && response.data) {
        const formattedStores = response.data.map(formatStoreData);
        setStores(formattedStores);
      } else {
        setError('No stores found for this location');
      }
    } catch (err) {
      console.error('Error loading stores:', err);
      setError('Failed to load stores. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreSelect = (store) => {
    onStoreSelect(store);
  };

  const handleClose = () => {
    setStores([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Select Store
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Location Info */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Delivering to: {selectedPincode?.pincode}, {selectedPincode?.area}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-2 text-gray-600">Loading stores...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button
                onClick={loadStores}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No stores available in this area</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stores.map((store) => (
                <div
                  key={store._id}
                  onClick={() => handleStoreSelect(store)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {store.storeName}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {store.storeAddress}
                      </p>
                      
                      {/* Store Details */}
                      <div className="space-y-1">
                        {store.storeOpenTime && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <ClockIcon className="w-3 h-3" />
                            <span>{store.storeOpenTime}</span>
                          </div>
                        )}
                        
                        {store.storeDeliveryTime && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPinIcon className="w-3 h-3" />
                            <span>Delivery: {store.storeDeliveryTime}</span>
                          </div>
                        )}
                        
                        {store.minOrderAmount && (
                          <div className="text-xs text-gray-500">
                            Min. order: ₹{store.minOrderAmount}
                          </div>
                        )}
                        
                        {store.storeOfferName && (
                          <div className="text-xs text-green-600 font-medium">
                            {store.storeOfferName}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Store Status */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        {store.homeDelivery && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Home Delivery
                          </span>
                        )}
                        {store.selfPickup && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Self Pickup
                          </span>
                        )}
                      </div>
                      
                      {store.contactNumber && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <PhoneIcon className="w-3 h-3" />
                          <span>{store.contactNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Store Message */}
                  {store.storeMessage && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      {store.storeMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreSelectionModal;
