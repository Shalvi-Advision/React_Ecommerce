/**
 * Debug Script - Run this in browser console to check favorites
 * 
 * Usage: Copy this entire script and paste in browser console on your app
 * Then run: debugFavorites()
 */

window.debugFavorites = async function() {
  console.log('🔍 Debugging Favorites...\n');
  
  // Get store code from localStorage
  const locationData = localStorage.getItem('confirmedLocation');
  let store_code = 'AVB';
  if (locationData) {
    try {
      const location = JSON.parse(locationData);
      store_code = location?.store?.store_code || 'AVB';
    } catch (e) {
      console.error('Error parsing location:', e);
    }
  }
  
  console.log('📋 Configuration:');
  console.log('   Store Code:', store_code);
  console.log('   Auth Token:', localStorage.getItem('auth_token') ? 'Present ✅' : 'Missing ❌');
  console.log('   Project Code: PROJ001 (assumed)');
  console.log('\n');
  
  // Get backend favorites
  console.log('📡 Fetching backend favorites...');
  try {
    const response = await fetch('https://ecommerceapi-web.onrender.com/api/favorites/get-favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        store_code,
        project_code: 'PROJ001'
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('✅ Backend Favorites:', data);
      console.log(`📊 Total favorites: ${data.data.length}`);
      console.log('\n📝 P-Codes in backend:');
      data.data.forEach((fav, index) => {
        console.log(`   ${index + 1}. P-Code: "${fav.p_code}" (type: ${typeof fav.p_code})`);
      });
      
      // Show localStorage favorites
      const localStorageFavs = localStorage.getItem('favorites');
      if (localStorageFavs) {
        console.log('\n💾 LocalStorage Favorites:');
        try {
          const localFavs = JSON.parse(localStorageFavs);
          console.log(`   Total: ${localFavs.length}`);
          localFavs.forEach((fav, index) => {
            const pcode = fav.p_code || fav._id;
            console.log(`   ${index + 1}. "${pcode}"`);
          });
        } catch (e) {
          console.log('   Could not parse:', e);
        }
      }
      
      // Return data for inspection
      return { backend: data, localStorage: localStorageFavs };
    } else {
      console.log('❌ API Error:', data);
      return { error: data };
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
    return { error: error.message };
  }
};

console.log('✅ Debug function loaded!');
console.log('Run: debugFavorites()');


