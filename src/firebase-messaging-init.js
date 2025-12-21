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
            console.log('FCM token:', token);
            // TODO: Send this token to your backend to store for this user
            // Example: await sendTokenToServer(token);
            return token;
        } else {
            console.warn('No FCM token available. Request permission first.');
            return null;
        }
    } catch (err) {
        console.error('Error getting FCM token:', err);
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
