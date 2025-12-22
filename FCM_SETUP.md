# 🚀 Firebase Cloud Messaging - Quick Configuration Guide

## ✅ What's Already Done

- Firebase SDK installed
- FCM configuration files created
- Service worker implemented
- App integration complete

## 📋 What You Need to Do

### 1️⃣ Get Your Firebase Credentials

**From Firebase Console ([console.firebase.google.com](https://console.firebase.google.com/)):**

1. **Project Settings → General Tab:**
   - Copy your `firebaseConfig` object

2. **Project Settings → Cloud Messaging Tab:**
   - Click "Generate key pair" under Web Push certificates
   - Copy the Public key (VAPID key)

### 2️⃣ Update These 3 Files

| File | What to Replace | Line Numbers |
|------|----------------|--------------|
| `src/firebase.js` | Firebase config object | Lines 6-12 |
| `public/firebase-messaging-sw.js` | Firebase config object | Lines 11-17 |
| `src/firebase-messaging-init.js` | VAPID public key | Line 6 |

### 3️⃣ Test It

```bash
cd /Users/gauravpawar/Documents/Development/code/Shalvi/shalvi_web_Setup/React_Ecommerce
npm start
```

1. Open app in browser → Grant notification permission
2. Check console for "FCM token: ..." → Copy the token
3. Go to Firebase Console → Cloud Messaging → Send test message
4. Paste your token → Send → You should receive a notification!

---

## 📍 Files to Update

### File 1: [src/firebase.js](file:///Users/gauravpawar/Documents/Development/code/Shalvi/shalvi_web_Setup/React_Ecommerce/src/firebase.js#L6-L12)

```javascript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',              // ← Add your value
  authDomain: 'YOUR_AUTH_DOMAIN',      // ← Add your value
  projectId: 'YOUR_PROJECT_ID',        // ← Add your value
  storageBucket: 'YOUR_STORAGE_BUCKET', // ← Add your value
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID', // ← Add your value
  appId: 'YOUR_APP_ID',                // ← Add your value
};
```

### File 2: [public/firebase-messaging-sw.js](file:///Users/gauravpawar/Documents/Development/code/Shalvi/shalvi_web_Setup/React_Ecommerce/public/firebase-messaging-sw.js#L11-L17)

```javascript
firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',              // ← Same values as File 1
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
});
```

### File 3: [src/firebase-messaging-init.js](file:///Users/gauravpawar/Documents/Development/code/Shalvi/shalvi_web_Setup/React_Ecommerce/src/firebase-messaging-init.js#L6)

```javascript
const VAPID_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // ← From Cloud Messaging → Web Push certificates
```

---

## 🎯 After Configuration

Once configured, your app will:
- ✅ Request notification permission on load
- ✅ Generate an FCM token
- ✅ Handle foreground messages (app active)
- ✅ Handle background messages (app closed/minimized)
- ✅ Show browser notifications

**Next step:** Integrate the FCM token with your backend to send notifications from your server.

See [walkthrough.md](file:///Users/gauravpawar/.gemini/antigravity/brain/1c890cb1-49bb-4142-b3bd-6e32e92010b3/walkthrough.md) for detailed testing guide and backend integration steps.
