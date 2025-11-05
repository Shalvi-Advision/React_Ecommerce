/**
 * Final debug script - Copy and paste in browser console
 */

(async function() {
  console.log('🔍 Debugging Remove from Favorites\n');
  console.log('='.repeat(60));
  
  // Check localStorage
  console.log('\n📦 Checking localStorage...');
  console.log('   confirmedLocation:', localStorage.getItem('confirmedLocation'));
  console.log('   auth_token:', localStorage.getItem('auth_token') ? 'Present ✅' : 'Missing ❌');
  
  // Parse location
  let store_code = 'AVB'; // default
  
  try {
    const locationData = localStorage.getItem('confirmedLocation');
    if (locationData) {
      const location = JSON.parse(locationData);
      console.log('   Parsed location:', location);
      store_code = location?.store?.store_code || location?.store?.storeCode || 'AVB';
      console.log('   Store Code:', store_code);
    } else {
      console.log('   ⚠️ No confirmedLocation in localStorage');
    }
  } catch (error) {
    console.error('   ❌ Error parsing location:', error);
  }
  
  // Get token
  const token = localStorage.getItem('auth_token');
  console.log('\n🔑 Auth Token:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND ❌');
  
  if (!token) {
    console.log('\n❌ ERROR: No auth token found!');
    console.log('   You need to be logged in to see favorites.');
    return;
  }
  
  // Try to get favorites
  console.log('\n📡 Fetching favorites from backend...');
  console.log('   URL: https://ecommerceapi-web.onrender.com/api/favorites/get-favorites');
  console.log('   Store Code:', store_code);
  console.log('   Project Code: PROJ001');
  
  try {
    const response = await fetch('https://ecommerceapi-web.onrender.com/api/favorites/get-favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        store_code: store_code || 'AVB',
        project_code: 'PROJ001'
      })
    });
    
    console.log('   Status:', response.status);
    
    const data = await response.json();
    console.log('   Response:', data);
    
    if (data.success && data.data && data.data.length > 0) {
      console.log(`\n✅ Found ${data.data.length} favorites in backend:`);
      
      data.data.forEach((fav, index) => {
        console.log(`\n   ${index + 1}. P-Code: "${fav.p_code}" (${typeof fav.p_code})`);
        console.log(`      Store: ${fav.store_code}`);
        console.log(`      User: ${fav.mobile_no || 'N/A'}`);
      });
      
      // Check if "9946" exists
      const pcode9946 = data.data.find(fav => String(fav.p_code) === '9946');
      console.log(`\n🔍 Looking for p_code "9946":`);
      console.log(`   Found? ${pcode9946 ? '✅ YES' : '❌ NO'}`);
      
      if (pcode9946) {
        console.log('   Match details:', pcode9946);
        
        console.log('\n📡 Now trying to remove it...');
        console.log('   URL: https://ecommerceapi-web.onrender.com/api/favorites/remove-from-favorites');
        console.log('   Method: POST');
        console.log('   Body:', {
          store_code: store_code || 'AVB',
          project_code: 'PROJ001',
          p_code: '9946'
        });
        
        const removeResponse = await fetch('https://ecommerceapi-web.onrender.com/api/favorites/remove-from-favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            store_code: store_code || 'AVB',
            project_code: 'PROJ001',
            p_code: '9946'
          })
        });
        
        console.log('   Remove Status:', removeResponse.status);
        const removeData = await removeResponse.json();
        console.log('   Remove Response:', removeData);
        
        if (removeData.success) {
          console.log('\n✅ SUCCESS! Product removed!');
        } else {
          console.log('\n❌ FAILED:', removeData.error);
          console.log('\n💡 The backend received your request but said product not found.');
          console.log('   This means there\'s a mismatch in how the p_code is stored vs queried.');
        }
      } else {
        console.log('\n💡 Tip: P-code "9946" is not in your favorites list.');
        console.log('   Try a different p_code from the list above.');
      }
      
    } else if (data.success && !data.data) {
      console.log('\n📭 No favorites found in backend.');
      console.log('   Add some products to favorites first.');
    } else {
      console.log('\n❌ API Error:', data);
      if (data.error) {
        console.log('   Error:', data.error);
        console.log('\n💡 Common fixes:');
        console.log('   1. Make sure you\'re logged in');
        console.log('   2. Check that store_code is correct');
        console.log('   3. Verify backend endpoint exists');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Network Error:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Check if backend is accessible');
    console.log('   3. Check CORS settings on backend');
  }
  
  console.log('\n' + '='.repeat(60));
})();


