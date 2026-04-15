import React, { useState, useEffect, useRef } from 'react';
import { getOffersForCart } from '../api/offersApi';
import { useCart } from '../context/CartContext';
import { getAuthToken } from '../utils/persistentStorage';
import { usePincode } from '../context/PincodeContext';
import { COLORS } from '../constants/theme';
import {
  LockClosedIcon,
  CheckCircleIcon,
  GiftIcon,
  TagIcon,
} from '@heroicons/react/24/solid';

/**
 * OffersSection — Shows cart discount tiers + steal deals on the cart page.
 * Props:
 *   onOfferSelect(offer) — called when user selects a cart discount offer
 *   onDealAdd(dealProduct, offerId) — called when user wants to add a steal deal product
 *   selectedOfferId — currently selected offer ID
 */
const OffersSection = ({ onOfferSelect, onDealAdd, selectedOfferId }) => {
  const { totalPrice, items } = useCart();
  const isAuthenticated = !!getAuthToken();
  const { confirmedLocation } = usePincode();
  const [offersData, setOffersData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lastFetchedTotal = useRef(null);

  const storeCode = confirmedLocation?.store?.store_code || confirmedLocation?.store?.storeCode;

  // Fetch offers when cart total changes (debounced 800ms)
  // Passes cart_total directly so backend doesn't need to read stale DB cart
  useEffect(() => {
    if (!storeCode || !isAuthenticated) return;
    if (lastFetchedTotal.current === totalPrice) return;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await getOffersForCart(storeCode, totalPrice);
        setOffersData(data);
        lastFetchedTotal.current = totalPrice;
      } catch (err) {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [storeCode, isAuthenticated, totalPrice]);

  // Auto-select the best offer whenever offers data refreshes
  useEffect(() => {
    if (!offersData) return;
    const best = offersData.best_offer;
    onOfferSelect?.(best || null);
  }, [offersData]); // intentionally exclude onOfferSelect to avoid loops

  if (loading && !offersData) return null;
  if (!offersData) return null;

  const { offers = [], best_offer, product_deals = [] } = offersData;
  const hasOffers = offers.length > 0;
  const hasDeals = product_deals.length > 0;

  if (!hasOffers && !hasDeals) return null;

  // Show the nearest unlocked or the closest locked offer in the collapsed bar
  const activeOffer = selectedOfferId
    ? offers.find(o => o._id === selectedOfferId)
    : best_offer || offers[0];

  return (
    <div className="mb-4">
      {/* Cart Discount Offers */}
      {hasOffers && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Collapsed bar — always visible */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: best_offer ? '#f0fdf4' : '#fefce8' }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TagIcon className="w-5 h-5 flex-shrink-0" style={{ color: best_offer ? COLORS.success[600] : COLORS.warning[600] }} />
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {activeOffer?.title || 'Offers available'}
                </p>
                {activeOffer && !activeOffer.unlocked && (
                  <p className="text-xs text-gray-500">
                    Shop for ₹{activeOffer.remaining_amount} more
                  </p>
                )}
                {activeOffer?.unlocked && (
                  <p className="text-xs font-medium" style={{ color: COLORS.success[600] }}>
                    Saving ₹{activeOffer.effective_discount}
                  </p>
                )}
              </div>
            </div>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0"
              style={{
                color: COLORS.primary[700],
                borderColor: COLORS.primary[200],
                backgroundColor: COLORS.primary[50],
              }}
            >
              {offers.length} Offer{offers.length > 1 ? 's' : ''} {expanded ? '▲' : '▼'}
            </span>
          </button>

          {/* Expanded — all offers */}
          {expanded && (
            <div className="px-4 pb-4 pt-2 space-y-3">
              {offers.map((offer) => {
                const isSelected = selectedOfferId === offer._id;
                const isUnlocked = offer.unlocked;

                return (
                  <div
                    key={offer._id}
                    onClick={() => isUnlocked && onOfferSelect?.(isSelected ? null : offer)}
                    className={`relative rounded-xl border-2 p-3 transition-all ${
                      isUnlocked ? 'cursor-pointer' : 'opacity-75'
                    }`}
                    style={{
                      borderColor: isSelected
                        ? COLORS.success[500]
                        : isUnlocked
                        ? COLORS.success[200]
                        : COLORS.gray[200],
                      backgroundColor: isSelected
                        ? '#f0fdf4'
                        : isUnlocked
                        ? '#fafffe'
                        : COLORS.gray[50],
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Lock/Unlock icon */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          backgroundColor: isUnlocked ? COLORS.success[100] : COLORS.gray[200],
                        }}
                      >
                        {isUnlocked ? (
                          <CheckCircleIcon className="w-5 h-5" style={{ color: COLORS.success[600] }} />
                        ) : (
                          <LockClosedIcon className="w-4 h-4" style={{ color: COLORS.gray[500] }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{offer.title}</p>
                        {!isUnlocked && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Shop for ₹{offer.remaining_amount} more
                          </p>
                        )}
                        {isUnlocked && isSelected && (
                          <p className="text-xs font-medium mt-0.5" style={{ color: COLORS.success[600] }}>
                            ✓ Applied — saving ₹{offer.effective_discount}
                          </p>
                        )}
                        {isUnlocked && !isSelected && (
                          <p className="text-xs mt-0.5" style={{ color: COLORS.success[600] }}>
                            Tap to apply
                          </p>
                        )}
                      </div>

                      {/* Status badge */}
                      <span
                        className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: isUnlocked ? COLORS.success[100] : COLORS.gray[100],
                          color: isUnlocked ? COLORS.success[700] : COLORS.gray[600],
                        }}
                      >
                        {isSelected ? 'Applied' : isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>

                    {/* Progress bar */}
                    {!isUnlocked && (
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.gray[200] }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${offer.progress}%`,
                            backgroundColor: COLORS.success[500],
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Steal Deals (Product Deals) */}
      {hasDeals && (
        <div className="mt-3">
          <h3 className="text-sm font-bold text-gray-900 mb-2 px-1">Steal deals for you</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
            {product_deals.map((deal) =>
              (deal.deal_products || []).map((dp) => {
                const isUnlocked = deal.unlocked;
                const isInCart = items.some(item => item.p_code === dp.p_code);

                return (
                  <div
                    key={`${deal._id}-${dp.p_code}`}
                    className="flex-shrink-0 snap-start rounded-xl overflow-hidden shadow-sm border"
                    style={{
                      width: 160,
                      borderColor: isUnlocked ? COLORS.success[300] : COLORS.gray[200],
                    }}
                  >
                    {/* Deal banner */}
                    <div
                      className="px-3 py-1.5 flex items-center gap-1.5"
                      style={{
                        backgroundColor: isUnlocked ? COLORS.success[500] : COLORS.gray[400],
                      }}
                    >
                      {isUnlocked ? (
                        <CheckCircleIcon className="w-4 h-4 text-white" />
                      ) : (
                        <LockClosedIcon className="w-3.5 h-3.5 text-white" />
                      )}
                      <span className="text-xs font-semibold text-white">
                        {isUnlocked ? 'Deal unlocked!' : `₹${deal.remaining_amount} more`}
                      </span>
                    </div>

                    {/* Product card */}
                    <div className="p-3 bg-white">
                      {dp.pcode_img && (
                        <img
                          src={dp.pcode_img}
                          alt={dp.product_name}
                          className="w-full h-20 object-contain mb-2 rounded"
                        />
                      )}
                      <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">
                        {dp.product_name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-sm font-bold px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: COLORS.success[50],
                            color: COLORS.success[700],
                          }}
                        >
                          ₹{dp.deal_price}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{dp.original_price}
                        </span>
                      </div>

                      {/* Add button */}
                      {isUnlocked && !isInCart && (
                        <button
                          onClick={() => onDealAdd?.(dp, deal._id)}
                          className="w-full mt-2 py-1.5 text-xs font-semibold rounded-lg border-2 transition-colors"
                          style={{
                            borderColor: COLORS.primary[500],
                            color: COLORS.primary[600],
                          }}
                        >
                          + ADD
                        </button>
                      )}
                      {isInCart && (
                        <p className="w-full mt-2 py-1.5 text-xs font-medium text-center rounded-lg"
                          style={{ backgroundColor: COLORS.success[50], color: COLORS.success[700] }}
                        >
                          ✓ In Cart
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersSection;
