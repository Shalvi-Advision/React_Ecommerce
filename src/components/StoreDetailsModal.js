import React, { useState, useEffect } from 'react';
import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
  TruckIcon,
  CurrencyRupeeIcon,
  TagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { COLORS } from '../constants/theme';

const StoreDetailsModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedPincode,
  selectedStore,
  isRequired
}) => {
  const [storeDetails, setStoreDetails] = useState(null);

  useEffect(() => {
    if (isOpen && selectedStore) {
      console.log('🏪 StoreDetailsModal received selectedStore:', selectedStore);
      setStoreDetails(selectedStore);
    }
  }, [isOpen, selectedStore]);

  const handleConfirm = () => {
    if (storeDetails) {
      onConfirm({
        pincode: selectedPincode,
        store: storeDetails
      });
    }
  };

  const handleClose = () => {
    if (!isRequired) {
      setStoreDetails(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRequired) {
          handleClose();
        }
      }}
    >
      <div
        className="rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col animate-slideUp"
        style={{
          backgroundColor: COLORS.white,
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.15)`
        }}
      >
        {/* Compact Header */}
        <div
          className="px-4 py-3 flex-shrink-0 flex items-center justify-between"
          style={{
            backgroundColor: COLORS.primary[600],
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircleSolid
              className="w-5 h-5"
              style={{ color: COLORS.white }}
            />
            <h3
              className="text-lg font-bold"
              style={{ color: COLORS.white }}
            >
              Store Details
            </h3>
          </div>
          {!isRequired && (
            <button
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              style={{ color: COLORS.white }}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Location Info - Compact */}
          <div className="px-4 pt-4 pb-3">
            <div
              className="rounded-lg p-3 border"
              style={{
                backgroundColor: COLORS.primary[50],
                borderColor: COLORS.primary[200]
              }}
            >
              <div className="flex items-start gap-2">
                <MapPinIcon
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: COLORS.primary[600] }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm mb-0.5"
                    style={{ color: COLORS.gray[900] }}
                  >
                    {selectedPincode?.pincode} - {selectedPincode?.area}
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: COLORS.gray[600] }}
                  >
                    {selectedPincode?.fullAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Details */}
          {storeDetails && (
            <div className="px-4 pb-4">
              {/* Store Name */}
              <div className="mb-3">
                <h4
                  className="font-bold text-sm mb-2"
                  style={{ color: COLORS.gray[900] }}
                >
                  {storeDetails.storeName || storeDetails.store_name || 'N/A'}
                </h4>
              </div>

              {/* Compact Info Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* Store Timings */}
                {(storeDetails.storeOpenTime || storeDetails.store_open_time) && (
                  <div
                    className="rounded-lg p-2.5 border"
                    style={{
                      backgroundColor: COLORS.gray[50],
                      borderColor: COLORS.gray[200]
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <ClockIcon
                        className="w-3.5 h-3.5"
                        style={{ color: COLORS.primary[600] }}
                      />
                      <p
                        className="text-xs font-medium"
                        style={{ color: COLORS.gray[500] }}
                      >
                        Hours
                      </p>
                    </div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: COLORS.gray[900] }}
                    >
                      {storeDetails.storeOpenTime || storeDetails.store_open_time}
                    </p>
                  </div>
                )}

                {/* Delivery Time */}
                {(storeDetails.storeDeliveryTime || storeDetails.delivery_time) && (
                  <div
                    className="rounded-lg p-2.5 border"
                    style={{
                      backgroundColor: COLORS.gray[50],
                      borderColor: COLORS.gray[200]
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <TruckIcon
                        className="w-3.5 h-3.5"
                        style={{ color: COLORS.primary[600] }}
                      />
                      <p
                        className="text-xs font-medium"
                        style={{ color: COLORS.gray[500] }}
                      >
                        Delivery
                      </p>
                    </div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: COLORS.gray[900] }}
                    >
                      {storeDetails.storeDeliveryTime || storeDetails.delivery_time}
                    </p>
                  </div>
                )}

                {/* Min Order */}
                {(storeDetails.minOrderAmount || storeDetails.min_order_amount) && (
                  <div
                    className="rounded-lg p-2.5 border"
                    style={{
                      backgroundColor: COLORS.gray[50],
                      borderColor: COLORS.gray[200]
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <CurrencyRupeeIcon
                        className="w-3.5 h-3.5"
                        style={{ color: COLORS.primary[600] }}
                      />
                      <p
                        className="text-xs font-medium"
                        style={{ color: COLORS.gray[500] }}
                      >
                        Min. Order
                      </p>
                    </div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: COLORS.gray[900] }}
                    >
                      ₹{storeDetails.minOrderAmount || storeDetails.min_order_amount}
                    </p>
                  </div>
                )}

                {/* Contact */}
                {(storeDetails.contactNumber || storeDetails.contact?.phone) && (
                  <div
                    className="rounded-lg p-2.5 border"
                    style={{
                      backgroundColor: COLORS.gray[50],
                      borderColor: COLORS.gray[200]
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <PhoneIcon
                        className="w-3.5 h-3.5"
                        style={{ color: COLORS.primary[600] }}
                      />
                      <p
                        className="text-xs font-medium"
                        style={{ color: COLORS.gray[500] }}
                      >
                        Contact
                      </p>
                    </div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: COLORS.gray[900] }}
                    >
                      {storeDetails.contactNumber || storeDetails.contact?.phone}
                    </p>
                  </div>
                )}
              </div>

              {/* Offers - Compact */}
              {(storeDetails.storeOfferName || storeDetails.offer) && (
                <div
                  className="rounded-lg p-2.5 border mb-3"
                  style={{
                    backgroundColor: COLORS.warning[50],
                    borderColor: COLORS.warning[300]
                  }}
                >
                  <div className="flex items-center gap-2">
                    <TagIcon
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: COLORS.warning[600] }}
                    />
                    <p
                      className="text-xs font-semibold"
                      style={{ color: COLORS.warning[800] }}
                    >
                      {storeDetails.storeOfferName || storeDetails.offer}
                    </p>
                  </div>
                </div>
              )}

              {/* Address - Compact */}
              <div
                className="rounded-lg p-2.5 border"
                style={{
                  backgroundColor: COLORS.gray[50],
                  borderColor: COLORS.gray[200]
                }}
              >
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: COLORS.gray[500] }}
                >
                  Address
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: COLORS.gray[700] }}
                >
                  {storeDetails.storeAddress || storeDetails.address || 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button - Compact */}
        <div
          className="px-4 py-3 flex-shrink-0 border-t"
          style={{
            borderColor: COLORS.gray[200],
            backgroundColor: COLORS.white
          }}
        >
          <button
            onClick={handleConfirm}
            disabled={!storeDetails}
            className="w-full font-semibold py-3 px-4 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              backgroundColor: storeDetails ? COLORS.primary[600] : COLORS.gray[300],
              color: COLORS.white,
              cursor: storeDetails ? 'pointer' : 'not-allowed',
              boxShadow: storeDetails ? `0 4px 12px ${COLORS.primary[600]}40` : 'none'
            }}
            onMouseEnter={(e) => {
              if (storeDetails) {
                e.currentTarget.style.backgroundColor = COLORS.primary[700];
                e.currentTarget.style.boxShadow = `0 6px 16px ${COLORS.primary[600]}50`;
              }
            }}
            onMouseLeave={(e) => {
              if (storeDetails) {
                e.currentTarget.style.backgroundColor = COLORS.primary[600];
                e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS.primary[600]}40`;
              }
            }}
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-sm">Confirm & Start Shopping</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StoreDetailsModal;
