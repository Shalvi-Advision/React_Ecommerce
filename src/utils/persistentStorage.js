/**
 * Persistent Storage Utility
 * Handles secure storage with 30-day expiration for auth tokens and location data
 * Uses localStorage with expiry timestamps and IndexedDB for PWA compatibility
 */

// Storage key constants
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    AUTH_TOKEN_EXPIRY: 'auth_token_expiry',
    USER_DATA: 'user',
    USER_DATA_EXPIRY: 'user_data_expiry',
    CONFIRMED_LOCATION: 'confirmedLocation',
    CONFIRMED_LOCATION_EXPIRY: 'confirmedLocation_expiry',
    TOKEN_TIMESTAMP: 'token_timestamp',
    SESSION_ID: 'session_id'
};

// Default expiry durations in milliseconds
export const EXPIRY_DURATIONS = {
    AUTH_TOKEN: 30 * 24 * 60 * 60 * 1000,        // 30 days
    USER_DATA: 30 * 24 * 60 * 60 * 1000,          // 30 days
    CONFIRMED_LOCATION: 30 * 24 * 60 * 60 * 1000, // 30 days
    SESSION: 24 * 60 * 60 * 1000                   // 1 day for session-specific items
};

/**
 * Check if browser supports localStorage
 */
const isLocalStorageAvailable = () => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
};

/**
 * Check if browser supports IndexedDB
 */
const isIndexedDBAvailable = () => {
    return typeof window !== 'undefined' && window.indexedDB;
};

/**
 * Open IndexedDB for persistent storage
 */
const openPersistentDB = () => {
    return new Promise((resolve, reject) => {
        if (!isIndexedDBAvailable()) {
            reject(new Error('IndexedDB not available'));
            return;
        }

        const request = indexedDB.open('PersistentStorageDB', 2);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object store for tokens if not exists
            if (!db.objectStoreNames.contains('tokens')) {
                db.createObjectStore('tokens', { keyPath: 'id' });
            }

            // Create object store for location data if not exists
            if (!db.objectStoreNames.contains('locations')) {
                db.createObjectStore('locations', { keyPath: 'id' });
            }

            // Create object store for user data if not exists
            if (!db.objectStoreNames.contains('users')) {
                db.createObjectStore('users', { keyPath: 'id' });
            }
        };
    });
};

/**
 * Store item in IndexedDB with expiry
 */
const storeInIndexedDB = async (storeName, id, value, expiryMs) => {
    try {
        const db = await openPersistentDB();
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        const item = {
            id,
            value,
            timestamp: Date.now(),
            expiry: Date.now() + expiryMs
        };

        await new Promise((resolve, reject) => {
            const request = store.put(item);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        db.close();
        return true;
    } catch (error) {
        console.warn('IndexedDB store failed:', error);
        return false;
    }
};

/**
 * Get item from IndexedDB with expiry check
 */
const getFromIndexedDB = async (storeName, id) => {
    try {
        const db = await openPersistentDB();
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);

        const item = await new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        db.close();

        if (!item) return null;

        // Check if expired
        if (item.expiry && Date.now() > item.expiry) {
            // Item expired, delete it
            await deleteFromIndexedDB(storeName, id);
            return null;
        }

        return item.value;
    } catch (error) {
        console.warn('IndexedDB get failed:', error);
        return null;
    }
};

/**
 * Delete item from IndexedDB
 */
const deleteFromIndexedDB = async (storeName, id) => {
    try {
        const db = await openPersistentDB();
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        await new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        db.close();
        return true;
    } catch (error) {
        console.warn('IndexedDB delete failed:', error);
        return false;
    }
};

/**
 * Clear all items from IndexedDB store
 */
const clearIndexedDBStore = async (storeName) => {
    try {
        const db = await openPersistentDB();
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        await new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        db.close();
        return true;
    } catch (error) {
        console.warn('IndexedDB clear failed:', error);
        return false;
    }
};

// ============================================
// AUTH TOKEN STORAGE FUNCTIONS
// ============================================

/**
 * Store auth token with 30-day expiration
 * @param {string} token - The authentication token
 * @returns {Promise<boolean>} - Success status
 */
export const setAuthToken = async (token) => {
    const now = Date.now();
    const expiry = now + EXPIRY_DURATIONS.AUTH_TOKEN;

    // Store in localStorage
    if (isLocalStorageAvailable()) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRY, expiry.toString());
        localStorage.setItem(STORAGE_KEYS.TOKEN_TIMESTAMP, now.toString());
    }

    // Store in IndexedDB for PWA offline support
    if (isIndexedDBAvailable()) {
        await storeInIndexedDB('tokens', STORAGE_KEYS.AUTH_TOKEN, token, EXPIRY_DURATIONS.AUTH_TOKEN);
    }

    return true;
};

/**
 * Get auth token if not expired
 * @returns {string|null} - The token or null if expired/not found
 */
export const getAuthToken = () => {
    if (!isLocalStorageAvailable()) {
        return null;
    }

    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const expiry = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRY);

    if (!token) return null;

    // Check expiry
    if (expiry && Date.now() > parseInt(expiry, 10)) {
        // Token expired, clear it
        clearAuthToken();
        return null;
    }

    return token;
};

/**
 * Get auth token (async version with IndexedDB fallback)
 * @returns {Promise<string|null>} - The token or null if expired/not found
 */
export const getAuthTokenAsync = async () => {
    // Try localStorage first
    const localToken = getAuthToken();
    if (localToken) return localToken;

    // Fallback to IndexedDB
    if (isIndexedDBAvailable()) {
        return await getFromIndexedDB('tokens', STORAGE_KEYS.AUTH_TOKEN);
    }

    return null;
};

/**
 * Clear auth token from all storage
 */
export const clearAuthToken = () => {
    if (isLocalStorageAvailable()) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRY);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_TIMESTAMP);
    }

    if (isIndexedDBAvailable()) {
        deleteFromIndexedDB('tokens', STORAGE_KEYS.AUTH_TOKEN);
    }
};

/**
 * Check if auth token is valid (exists and not expired)
 * @returns {boolean}
 */
export const isAuthTokenValid = () => {
    return getAuthToken() !== null;
};

/**
 * Refresh token expiry (extend by 30 days from now)
 */
export const refreshTokenExpiry = async () => {
    const token = getAuthToken();
    if (token) {
        await setAuthToken(token);
    }
};

// ============================================
// USER DATA STORAGE FUNCTIONS
// ============================================

/**
 * Store user data with 30-day expiration
 * @param {Object} userData - The user data object
 * @returns {Promise<boolean>} - Success status
 */
export const setUserData = async (userData) => {
    const now = Date.now();
    const expiry = now + EXPIRY_DURATIONS.USER_DATA;

    // Store in localStorage
    if (isLocalStorageAvailable()) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        localStorage.setItem(STORAGE_KEYS.USER_DATA_EXPIRY, expiry.toString());
    }

    // Store in IndexedDB for PWA offline support
    if (isIndexedDBAvailable()) {
        await storeInIndexedDB('users', STORAGE_KEYS.USER_DATA, userData, EXPIRY_DURATIONS.USER_DATA);
    }

    return true;
};

/**
 * Get user data if not expired
 * @returns {Object|null} - The user data or null if expired/not found
 */
export const getUserData = () => {
    if (!isLocalStorageAvailable()) {
        return null;
    }

    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    const expiry = localStorage.getItem(STORAGE_KEYS.USER_DATA_EXPIRY);

    if (!userData) return null;

    // Check expiry
    if (expiry && Date.now() > parseInt(expiry, 10)) {
        // User data expired, clear it
        clearUserData();
        return null;
    }

    try {
        return JSON.parse(userData);
    } catch (e) {
        console.error('Error parsing user data:', e);
        clearUserData();
        return null;
    }
};

/**
 * Clear user data from all storage
 */
export const clearUserData = () => {
    if (isLocalStorageAvailable()) {
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA_EXPIRY);
    }

    if (isIndexedDBAvailable()) {
        deleteFromIndexedDB('users', STORAGE_KEYS.USER_DATA);
    }
};

// ============================================
// LOCATION/STORE CODE STORAGE FUNCTIONS
// ============================================

/**
 * Store confirmed location with 30-day expiration
 * @param {Object} locationData - The location data object
 * @returns {Promise<boolean>} - Success status
 */
export const setConfirmedLocation = async (locationData) => {
    const now = Date.now();
    const expiry = now + EXPIRY_DURATIONS.CONFIRMED_LOCATION;

    // Store in localStorage
    if (isLocalStorageAvailable()) {
        localStorage.setItem(STORAGE_KEYS.CONFIRMED_LOCATION, JSON.stringify(locationData));
        localStorage.setItem(STORAGE_KEYS.CONFIRMED_LOCATION_EXPIRY, expiry.toString());
    }

    // Store in IndexedDB for PWA offline support
    if (isIndexedDBAvailable()) {
        await storeInIndexedDB('locations', STORAGE_KEYS.CONFIRMED_LOCATION, locationData, EXPIRY_DURATIONS.CONFIRMED_LOCATION);
    }

    return true;
};

/**
 * Get confirmed location if not expired
 * @returns {Object|null} - The location data or null if expired/not found
 */
export const getConfirmedLocation = () => {
    if (!isLocalStorageAvailable()) {
        return null;
    }

    const locationData = localStorage.getItem(STORAGE_KEYS.CONFIRMED_LOCATION);
    const expiry = localStorage.getItem(STORAGE_KEYS.CONFIRMED_LOCATION_EXPIRY);

    if (!locationData) return null;

    // Check expiry
    if (expiry && Date.now() > parseInt(expiry, 10)) {
        // Location data expired, clear it
        clearConfirmedLocation();
        return null;
    }

    try {
        return JSON.parse(locationData);
    } catch (e) {
        console.error('Error parsing location data:', e);
        clearConfirmedLocation();
        return null;
    }
};

/**
 * Get store code from confirmed location
 * @returns {string|null} - The store code or null
 */
export const getStoreCode = () => {
    const location = getConfirmedLocation();
    return location?.store?.store_code || location?.store?.storeCode || null;
};

/**
 * Clear confirmed location from all storage
 */
export const clearConfirmedLocation = () => {
    if (isLocalStorageAvailable()) {
        localStorage.removeItem(STORAGE_KEYS.CONFIRMED_LOCATION);
        localStorage.removeItem(STORAGE_KEYS.CONFIRMED_LOCATION_EXPIRY);
    }

    if (isIndexedDBAvailable()) {
        deleteFromIndexedDB('locations', STORAGE_KEYS.CONFIRMED_LOCATION);
    }
};

/**
 * Check if location is valid (exists and not expired)
 * @returns {boolean}
 */
export const isLocationValid = () => {
    return getConfirmedLocation() !== null;
};

/**
 * Refresh location expiry (extend by 30 days from now)
 */
export const refreshLocationExpiry = async () => {
    const location = getConfirmedLocation();
    if (location) {
        await setConfirmedLocation(location);
    }
};

// ============================================
// LOGOUT / CLEAR ALL SESSION DATA
// ============================================

/**
 * Clear all auth-related data (for logout)
 * This preserves location/store data as per user requirement
 */
export const clearAuthSession = async () => {
    clearAuthToken();
    clearUserData();

    // Clear session ID
    if (isLocalStorageAvailable()) {
        localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    }

    // Clear user-specific data like cart and orders if user data exists
    const userData = getUserData();
    if (userData?.id && isLocalStorageAvailable()) {
        localStorage.removeItem(`cart_${userData.id}`);
        localStorage.removeItem(`orders_${userData.id}`);
    }
};

/**
 * Clear ALL cached data including location
 * Use when user explicitly wants to reset everything
 */
export const clearAllCachedData = async () => {
    await clearAuthSession();
    clearConfirmedLocation();

    // Clear IndexedDB stores
    if (isIndexedDBAvailable()) {
        await clearIndexedDBStore('tokens');
        await clearIndexedDBStore('users');
        await clearIndexedDBStore('locations');
    }
};

/**
 * Refresh all expiries on user activity (call periodically)
 * This extends the 30-day period when user is active
 */
export const refreshAllExpiries = async () => {
    await refreshTokenExpiry();
    await refreshLocationExpiry();

    // Also update user data expiry if exists
    const userData = getUserData();
    if (userData) {
        await setUserData(userData);
    }
};

// ============================================
// BACKWARD COMPATIBILITY FUNCTIONS
// ============================================

/**
 * Get stored token (backward compatible with existing code)
 * @returns {string|null}
 */
export const getStoredToken = () => {
    return getAuthToken();
};

/**
 * Set stored token (backward compatible with existing code)
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export const setStoredToken = async (token) => {
    return await setAuthToken(token);
};

/**
 * Clear stored token (backward compatible with existing code)
 */
export const clearStoredToken = () => {
    clearAuthToken();
};

// Export default object for convenience
export default {
    // Auth Token
    setAuthToken,
    getAuthToken,
    getAuthTokenAsync,
    clearAuthToken,
    isAuthTokenValid,
    refreshTokenExpiry,

    // User Data
    setUserData,
    getUserData,
    clearUserData,

    // Location
    setConfirmedLocation,
    getConfirmedLocation,
    getStoreCode,
    clearConfirmedLocation,
    isLocationValid,
    refreshLocationExpiry,

    // Session Management
    clearAuthSession,
    clearAllCachedData,
    refreshAllExpiries,

    // Backward Compatibility
    getStoredToken,
    setStoredToken,
    clearStoredToken,

    // Constants
    STORAGE_KEYS,
    EXPIRY_DURATIONS
};
