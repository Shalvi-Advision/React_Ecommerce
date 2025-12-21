import axios from 'axios';
import { API_BASE_URL } from '../constants';

/**
 * Save FCM token to backend
 * @param {string} fcmToken - Firebase Cloud Messaging token
 * @returns {Promise<Object>} Response from server
 */
export const saveFcmToken = async (fcmToken) => {
    try {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            throw new Error('User not authenticated');
        }

        const response = await axios.post(
            `${API_BASE_URL}/auth/save-fcm-token`,
            { fcmToken },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error saving FCM token:', error);
        throw error;
    }
};
