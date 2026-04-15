import api from '../services/api';

/**
 * Fetch applicable offers for the user's current cart.
 * @param {string} storeCode - Current store code
 * @param {number} cartTotal - Current cart total from frontend state
 * @returns {Promise<{cart_subtotal, offers, best_offer, product_deals}>}
 */
export const getOffersForCart = async (storeCode, cartTotal) => {
  const params = {};
  if (storeCode) params.store_code = storeCode;
  if (cartTotal !== undefined) params.cart_total = cartTotal;
  const response = await api.get('/offers/for-cart', { params });
  return response.data?.data || response.data;
};
