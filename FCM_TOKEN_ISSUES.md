# FCM Token Management Issues - Audit Report

## Critical Issues Found

### 1. **Race Condition in fcmApi.js** ⚠️ CRITICAL
**File**: `React_Ecommerce/src/api/fcmApi.js`
**Line**: 11

**Problem**:
```javascript
const token = localStorage.getItem('auth_token');
```

The FCM save API directly reads from `localStorage` instead of using the `AuthContext` state. This creates a race condition:

1. User logs in → AuthContext updates state
2. FCM initialization tries to save token immediately  
3. `localStorage` might not be updated yet when fcmApi reads it
4. Save fails with "User not authenticated"

**Impact**: FCM tokens are not being saved reliably, especially on first login.

---

###2. **No Logout Cleanup** ⚠️ HIGH
**File**: `React_Ecommerce/src/App.js`
**Lines**: 69-70

**Problem**:
```javascript
const fcmTokenRef = useRef(null);
const fcmTokenSavedRef = useRef(false);
```

These refs are never reset when user logs out. If a user:
1. Logs in → saves FCM token → `fcmTokenSavedRef = true`
2. Logs out
3. Logs in as different user → `fcmTokenSavedRef` is still `true`
4. New user's FCM token is NEVER saved

**Impact**: Multi-user devices will fail to save FCM tokens after first user.

---

### 3. **No Token Refresh Handling** ⚠️ MEDIUM
**File**: `React_Ecommerce/src/App.js`
**Lines**: 107-187

**Problem**:
FCM tokens can expire or be refreshed by Firebase. There's no mechanism to:
- Detect when FCM token changes
- Update the backend with new token
- Handle token deletion requests

**Impact**: Notifications may stop working after token expires.

---

### 4. **Missing Error Recovery** ⚠️ MEDIUM  
**File**: `React_Ecommerce/src/App.js`
**Lines**: 196-206

**Problem**:
```javascript
if (isAuthenticated && fcmTokenRef.current && !fcmTokenSavedRef.current) {
  // ... save token
} catch (error) {
  console.error('❌ FCM: Failed to save token after login:', error);
}
```

If saving fails (network error, backend down), there's no retry mechanism. The error is logged but token save is abandoned.

**Impact**: Temporary network issues cause permanent notification failure.

---

### 5. **Inconsistent Storage Usage** ⚠️ LOW
**File**: `React_Ecommerce/src/api/fcmApi.js` vs `AuthContext.js`

**Problem**:
- `AuthContext` uses `setStoredToken()`/`getAuthToken()` from `persistentStorage.js` 
- `fcmApi.js` uses `localStorage.getItem('auth_token')` directly

This inconsistency can cause issues if storage implementation changes.

**Impact**: Maintenance burden, potential bugs if storage changes.

---

## Proposed Fixes

### Fix 1: Update fcmApi.js to Use getAuthToken()
**Priority**: CRITICAL

```javascript
// fcmApi.js
import { getAuthToken } from '../utils/persistentStorage';

export const saveFcmToken = async (fcmToken) => {
    try {
        const token = getAuthToken(); // Use persistent storage helper

        if (!token) {
            throw new Error('User not authenticated');
        }
        
        // ... rest of code
    }
}
```

**Better Solution**: Pass token as parameter instead of reading from storage:
```javascript
export const saveFcmToken = async (fcmToken, authToken) => {
    if (!authToken) {
        throw new Error('User not authenticated');
    }
    
    const response = await axios.post(
        `${API_BASE_URL}/auth/save-fcm-token`,
        { fcmToken },
        {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        }
    );
    
    return response.data;
};
```

Then call it from App.js:
```javascript
await saveFcmToken(token, state.token); // Pass both tokens explicitly
```

---

### Fix 2: Reset Refs on Logout
**Priority**: HIGH

```javascript
// App.js - Add logout handler
useEffect(() => {
    if (!isAuthenticated) {
        // Reset FCM state when user logs out
        fcmTokenSavedRef.current = false;
        console.log('🔄 FCM: Reset token saved flag (user logged out)');
    }
}, [isAuthenticated]);
```

---

### Fix 3: Add Token Refresh Listener
**Priority**: MEDIUM

```javascript
// App.js - In FCM initialization
import { onTokenRefresh } from './firebase-messaging-init';

// Subscribe to token refresh
onTokenRefresh(async (newToken) => {
    console.log('🔄 FCM: Token refreshed:', newToken);
    fcmTokenRef.current = newToken;
    
    if (isAuthenticated) {
        try {
            await saveFcmToken(newToken, authToken);
            console.log('✅ FCM: New token saved to backend');
        } catch (error) {
            console.error('❌ FCM: Failed to save refreshed token:', error);
        }
    }
});
```

---

### Fix 4: Add Retry Mechanism
**Priority**: MEDIUM

```javascript
// App.js - Retry logic with exponential backoff
const saveFcmTokenWithRetry = async (fcmToken, authToken, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await saveFcmToken(fcmToken, authToken);
            fcmTokenSavedRef.current = true;
            console.log(`✅ FCM: Token saved (attempt ${attempt})`);
            return;
        } catch (error) {
            console.error(`❌ FCM: Save failed (attempt ${attempt}/${maxRetries}):`, error);
            
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                console.log(`⏳ FCM: Retrying in ${delay/1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error('❌ FCM: All retry attempts failed');
            }
        }
    }
};
```

---

### Fix 5: Centralize Storage Access
**Priority**: LOW

Update `fcmApi.js` to use the same storage utilities as `AuthContext`:

```javascript
import { getAuthToken } from '../utils/persistentStorage';

export const saveFcmToken = async (fcmToken) => {
    const token = getAuthToken();
    // ... rest
}
```

---

## Implementation Priority

1. **CRITICAL - Fix 1**: Update fcmApi to pass authToken explicitly (prevents race condition)
2. **HIGH - Fix 2**: Reset refs on logout (prevents multi-user bugs)
3. **MEDIUM - Fix 3**: Add token refresh listener (long-term reliability)
4. **MEDIUM - Fix 4**: Add retry mechanism (network resilience)
5. **LOW - Fix 5**: Centralize storage (code quality)

---

## Testing Checklist

After implementing fixes, test:

- [ ] Fresh login → FCM token saved successfully
- [ ] Logout → Login as different user → FCM token saved for new user
- [ ] Network failure during save → Retries and succeeds
- [ ] FCM token expires → New token generated and saved
- [ ] Multiple devices logged in → Each gets correct token

---

## Root Cause Summary

The main issue is **state synchronization** between:
1. React state (`isAuthenticated` in AuthContext)
2. localStorage (`auth_token`)  
3. FCM token save API call

The current implementation has a race condition where FCM tries to save before localStorage is updated, causing sporadic failures.

**Best fix**: Pass `authToken` explicitly from App.js context rather than reading from storage in fcmApi.
