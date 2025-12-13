# 30-Day Token & Location Caching Implementation

## Overview
This document describes the implementation of 30-day persistent caching for authentication tokens and store/location data in the frontend application.

## Features Implemented

### 1. **Persistent Storage Utility** (`/src/utils/persistentStorage.js`)
A new comprehensive storage utility that handles:
- **Auth Token**: 30-day expiry with automatic cleanup
- **User Data**: 30-day expiry synced with auth token
- **Location/Store Code**: 30-day expiry independent of auth session
- **PWA Support**: IndexedDB fallback for offline persistence

### 2. **Key Functions**

#### Auth Token Management
```javascript
import { setAuthToken, getAuthToken, clearAuthToken } from './utils/persistentStorage';

// Store token with 30-day expiry
await setAuthToken(token);

// Get token (returns null if expired)
const token = getAuthToken();

// Clear token on logout
clearAuthToken();
```

#### Location/Store Code Management
```javascript
import { setConfirmedLocation, getConfirmedLocation, getStoreCode } from './utils/persistentStorage';

// Store location with 30-day expiry
await setConfirmedLocation(locationData);

// Get location (returns null if expired)
const location = getConfirmedLocation();

// Get store code directly
const storeCode = getStoreCode();
```

#### Session Management
```javascript
import { clearAuthSession, clearAllCachedData, refreshAllExpiries } from './utils/persistentStorage';

// Clear auth data on logout (preserves location data)
await clearAuthSession();

// Clear everything including location
await clearAllCachedData();

// Refresh all expiries on user activity
await refreshAllExpiries();
```

## How It Works

### Token Caching (30 Days)
1. When user logs in via OTP, token is stored with a 30-day expiry timestamp
2. On app load, token expiry is checked before use
3. If token is valid, the 30-day window is refreshed on each successful verification
4. On logout, only auth data is cleared - location persists

### Location/Store Code Caching (30 Days)
1. When user selects a store, location is stored with 30-day expiry
2. Location persists independently of auth session
3. Location is preserved even after logout
4. Only cleared when:
   - User explicitly changes location
   - 30 days have passed
   - User calls `clearAllCachedData()`

### Expiry Refresh Logic
- **On Login**: Token and user data expiries are set to 30 days from now
- **On App Load**: If valid data exists, expiries are refreshed (extends 30-day window)
- **On User Activity**: Expiries can be manually refreshed via `refreshAllExpiries()`

## Files Modified

1. **`/src/utils/persistentStorage.js`** (NEW)
   - Complete storage utility with 30-day expiry logic

2. **`/src/services/api.js`**
   - Updated to use persistent storage for token and location
   - Backward compatible exports maintained

3. **`/src/context/AuthContext.js`**
   - Uses persistent storage for token and user data
   - `initializeAuth` checks expiry on app load
   - `validateOtp` stores with 30-day expiry
   - `logout` uses `clearAuthSession` (preserves location)

4. **`/src/context/PincodeContext.js`**
   - Uses persistent storage for location data
   - Auto-migrates old localStorage data
   - Refreshes expiry on successful load

## Backward Compatibility

All existing code continues to work:
- `getStoredToken()`, `setStoredToken()`, `clearStoredToken()` still exported from `api.js`
- `localStorage.getItem('confirmedLocation')` still works (kept for compatibility)
- Components reading from localStorage will still function

## Storage Keys Used

| Key | Purpose | Expiry |
|-----|---------|--------|
| `auth_token` | JWT authentication token | 30 days |
| `auth_token_expiry` | Token expiry timestamp | N/A |
| `user` | User profile data | 30 days |
| `user_data_expiry` | User data expiry timestamp | N/A |
| `confirmedLocation` | Selected store/location | 30 days |
| `confirmedLocation_expiry` | Location expiry timestamp | N/A |
| `token_timestamp` | Last token verification time | N/A |
| `session_id` | Current session identifier | Session |

## IndexedDB Stores

For PWA offline support:
- `PersistentStorageDB` database
  - `tokens` store - Auth tokens
  - `users` store - User data
  - `locations` store - Location data

## Testing

1. **Token Persistence**:
   - Login → Close browser → Reopen → Should remain logged in (within 30 days)

2. **Location Persistence**:
   - Select location → Logout → Close browser → Reopen → Location should persist

3. **Expiry Check**:
   - Manually set expiry to past date in localStorage → Refresh → Should trigger re-login/location selection

## Notes

- The 30-day period refreshes on successful authentication/location load
- This effectively means "30 days of inactivity" triggers expiry
- Active users will never experience unexpected logouts due to expiry
