// Firebase SDK initialization for Cloud Messaging
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { FIREBASE_CONFIG } from './constants';

// Initialize Firebase with configuration from constants
const app = initializeApp(FIREBASE_CONFIG);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

export { app, messaging, getToken, onMessage };
