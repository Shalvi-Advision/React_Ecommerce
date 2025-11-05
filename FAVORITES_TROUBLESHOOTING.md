# Troubleshooting: "Product not found in favorites"

## The Error
```json
{
  "success": false,
  "error": "Product not found in favorites"
}
```

But you know the product IS in your backend favorites list.

## Common Causes

### 1. P-Code Format Mismatch ⚠️ **MOST COMMON**

The p_code sent doesn't match exactly what's stored in backend.

**Check:**
```javascript
// In browser console
console.log('Product:', product);
console.log('P-Code being sent:', product.p_code);
console.log('Type:', typeof product.p_code);
console.log('Length:', product.p_code?.length);
```

**Common issues:**
- `"123"` vs `"  123  "` (whitespace)
- `"123"` vs `123` (string vs number)
- `"ABC"` vs `"abc"` (case sensitivity)
- Extra characters or encoding issues

### 2. Store Code Mismatch

The product was added with different store_code than you're using to remove.

**Check:**
```javascript
// In console
const location = JSON.parse(localStorage.getItem('confirmedLocation'));
console.log('Current Store Code:', location?.store?.store_code);
```

### 3. User/Token Mismatch

The product is in favorites but for a different user.

**Check:**
```javascript
console.log('Auth Token:', localStorage.getItem('auth_token'));
console.log('Token exists:', !!localStorage.getItem('auth_token'));
```

### 4. Backend Query Issue

Backend might not be querying correctly.

## Debugging Steps

### Step 1: Check What You're Sending

Run this in your browser console:

```javascript
// Get the product you're trying to remove
const product = { /* your product object */ };
console.log('🔍 Sending this p_code:', product.p_code);
console.log('   Type:', typeof product.p_code);
console.log('   Stringified:', JSON.stringify(product.p_code));
console.log('   Trimmed:', String(product.p_code).trim());
```

### Step 2: Check What's in Backend

**Option A: Use our debug script**

1. Copy `debug-favorites.js` content
2. Paste in browser console
3. Run: `debugFavorites()`

**Option B: Manual API call**

Open browser console and run:

```javascript
fetch('YOUR_BASE_URL/api/favorites/get-favorites', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  },
  body: JSON.stringify({
    store_code: 'AVB',
    project_code: 'PROJ001'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Backend favorites:', data);
  if (data.data && data.data.length > 0) {
    console.log('P-Codes in backend:');
    data.data.forEach(fav => {
      console.log(`  - "${fav.p_code}" (${typeof fav.p_code})`);
    });
  }
});
```

### Step 3: Compare

Compare the p_code you're sending with the ones in backend:

```javascript
const sending = "YOUR_P_CODE";
const inBackend = ["2380", "ABC", "123"];

console.log('Sending:', sending);
console.log('In backend:', inBackend);
console.log('Match?', inBackend.includes(sending));
console.log('Exact match test:', inBackend.some(p => p === sending));
console.log('Trimmed match test:', inBackend.some(p => String(p).trim() === String(sending).trim()));
```

## Quick Fixes

### Fix 1: Normalize P-Code Before Sending

Update your API call to normalize the p_code:

```javascript
const normalizedPcode = String(p_code).trim();
const response = await api.delete('/favorites/remove-from-favorites', {
  data: {
    store_code,
    project_code: PROJECT_CODE,
    p_code: normalizedPcode  // Use normalized version
  }
});
```

### Fix 2: Check Backend Expectations

Verify your backend is looking for the right field. It might be:
- `p_code` vs `pcode`
- `product_id` vs `p_code`
- Case sensitivity

### Fix 3: Add Logging

The enhanced logging I added will show you exactly what's being sent:

```
🗑️ Removing from favorites:
   📦 Request: {store_code: "AVB", project_code: "PROJ001", p_code: "..."}
   🔍 P-Code Type: string
   🔍 P-Code Value: "2380"
   🔍 Store Code: AVB
   🔍 Project Code: PROJ001
```

Compare this with what's in your backend.

## Backend Investigation

### Check Backend Logs

Look at your backend logs when you send the DELETE request:

```
DELETE /api/favorites/remove-from-favorites
Body: { store_code: "AVB", project_code: "PROJ001", p_code: "2380" }
```

Check what your backend receives and how it queries the database.

### Test the DELETE Endpoint Directly

```bash
# Test with curl
curl -X DELETE 'https://your-api.com/api/favorites/remove-from-favorites' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "store_code": "AVB",
    "project_code": "PROJ001",
    "p_code": "2380"
  }'
```

## What to Check

### In Frontend (Browser Console):

1. **What p_code is being sent?**
   ```javascript
   console.log('P-Code:', product.p_code);
   ```

2. **What's in backend favorites?**
   ```javascript
   // Run debug script
   debugFavorites();
   ```

3. **Are they the same?**
   ```javascript
   const sending = "2380";  // What you're sending
   const inBackend = "2380"; // What's in backend
   console.log('Exact match:', sending === inBackend);
   ```

### In Backend (Server Logs):

1. **What p_code is being received?**
   ```javascript
   console.log('Received p_code:', req.body.p_code);
   console.log('Type:', typeof req.body.p_code);
   ```

2. **What does the database query return?**
   ```javascript
   console.log('Querying for p_code:', p_code);
   const favorite = await Favorite.findOne({ p_code, user_id: req.user.id });
   console.log('Found favorite:', favorite);
   ```

3. **How is it being queried?**
   ```javascript
   // Check your database query
   // Is it case-sensitive? Exact match? Trimmed?
   ```

## Specific Issues to Fix

### Issue 1: String vs Number

**Problem**: Sending `"2380"` but backend has `2380` (number)

**Solution**: Normalize types
```javascript
// In API call
p_code: String(p_code)  // Ensure it's a string
```

### Issue 2: Whitespace

**Problem**: Sending `"  2380  "` but backend has `"2380"`

**Solution**: Trim before sending
```javascript
p_code: String(p_code).trim()
```

### Issue 3: Case Sensitivity

**Problem**: Sending `"ABC"` but backend has `"abc"`

**Solution**: Backend should query case-insensitive
```javascript
// Backend query
Favorite.findOne({ 
  p_code: { $regex: new RegExp(`^${p_code}$`, 'i') },
  user_id: userId 
})
```

### Issue 4: Different Field Name

**Problem**: Using `p_code` but backend expects `product_code`

**Solution**: Update frontend to match backend
```javascript
// Check backend schema
// Update request body to match
```

## Action Plan

1. ✅ **Run the debug script** to see what's in backend
2. ✅ **Check console logs** when clicking remove
3. ✅ **Compare** p_code being sent vs p_code in backend
4. ✅ **Check** if types match (string vs number)
5. ✅ **Check** for whitespace differences
6. ✅ **Check** backend logs to see what it receives
7. ✅ **Verify** database query in backend

## Expected Console Output

When you click remove, you should see:

```
🗑️ Removing from favorites:
   📦 Request: {store_code: "AVB", project_code: "PROJ001", p_code: "2380"}
   🔍 P-Code Type: string
   🔍 P-Code Value: "2380"
   🔍 Store Code: AVB
   🔍 Project Code: PROJ001
```

**Compare this `p_code: "2380"` with what's in your backend favorites!**

## Most Likely Issue

**90% chance**: The p_code format doesn't match exactly.

**Solution**: 
1. Run debug script to see backend p_codes
2. Check console logs to see what you're sending
3. Normalize the p_code (trim, ensure string type)
4. Update API call to use normalized version

## Next Steps

1. Click to remove a favorite
2. Copy the console logs showing the p_code being sent
3. Run `debugFavorites()` in console
4. Compare the two
5. Share the results and we'll fix the exact issue!


