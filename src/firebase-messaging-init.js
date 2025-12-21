// Firebase Cloud Messaging helper functions
import { messaging, getToken, onMessage } from './firebase';
import { FIREBASE_VAPID_KEY } from './constants';

/**
 * Request notification permission from the browser
 * @returns {Promise<void>}
 */
export const requestNotificationPermission = async () => {
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
        console.warn('Notification permission denied');
        throw new Error('Notification permission not granted');
    }

    console.log('Notification permission granted');
};

/**
 * Get FCM registration token for this device
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export const getFcmToken = async () => {
    try {
        // Check if we're on localhost or HTTPS (required for push notifications)
        const isSecureContext = window.isSecureContext;
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (!isSecureContext && !isLocalhost) {
            console.warn('⚠️ FCM: Push notifications require HTTPS or localhost.');
            console.warn('Current location:', window.location.href);
            console.warn('Please access the app via http://localhost:3000');
            return null;
        }

        // Get the service worker registration for FCM
        const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');

        if (!registration) {
            console.error('FCM service worker not registered');
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey: FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        if (token) {
            console.log('✅ FCM token obtained successfully');
            console.log('FCM token:', token);
            return token;
        } else {
            console.warn('No FCM token available. Request permission first.');
            return null;
        }
    } catch (err) {
        // Handle specific error types with helpful messages
        if (err.code === 'messaging/failed-service-worker-registration') {
            console.error('❌ FCM: Service worker registration failed:', err);
        } else if (err.name === 'AbortError' || err.message?.includes('push service')) {
            console.warn('⚠️ FCM: Unable to register for push notifications.');
            console.warn('This error typically occurs when:');
            console.warn('  1. Accessing via IP address (e.g., 192.168.x.x) instead of localhost');
            console.warn('  2. Browser restrictions on push notifications');
            console.warn('  3. Service worker registration issues');
            console.warn('');
            console.warn('Current URL:', window.location.href);
            console.warn('');
            console.warn('✅ Solution: Access the app via http://localhost:3000');
            console.warn('Push notifications will work once you use localhost URL');
        } else if (err.code === 'messaging/permission-blocked') {
            console.error('❌ FCM: Notification permission was blocked by user');
        } else {
            console.error('❌ FCM: Error getting token:', err);
        }
        return null;
    }
};

/**
 * Subscribe to foreground messages (when app is open and active)
 * @param {Function} callback - Function to call when a message is received
 */
export const subscribeForegroundMessages = (callback) => {
    onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);

        // Call the provided callback with the payload
        if (callback) {
            callback(payload);
        }

        // You can show custom in-app notification here
        // Example: Show a toast or custom notification UI
    });
};

/**
 * Listen for token refresh events
 * Note: Tokens can be rotated by FCM for security reasons
 * @param {Function} callback - Function to call when token is refreshed
 */
export const onTokenRefresh = (callback) => {
    // Monitor for token refresh
    messaging.onTokenRefresh = async () => {
        try {
            const newToken = await getFcmToken();
            if (newToken && callback) {
                callback(newToken);
            }
        } catch (err) {
            console.error('Error refreshing FCM token:', err);
        }
    };
};
