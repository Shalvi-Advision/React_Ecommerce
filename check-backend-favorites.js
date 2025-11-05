/**
 * Quick script to check what's in backend favorites
 * 
 * Run this in browser console ON YOUR APP
 */

async function checkBackendFavorites() {
  console.log('🔍 Checking backend favorites...\n');
  
  // Get store code
  const locationData = localStorage.getItem('confirmedLocation');
  const store_code = locationData ? JSON.parse(locationData)?.store?.store_code : 'KHP';
  
  console.log('📋 Config:');
  console.log('   Store Code:', store_code);
  console.log('   Token:', localStorage.getItem('auth_token') ? '✅ Present' : '❌ Missing');
  console.log('\n');
  
  try {
    const response = await fetch('https://ecommerceapi-web.onrender.com/api/favorites/get-favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        store_code: store_code,
        project_code: 'PROJ001'
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('✅ Backend Favorites Retrieved!');
      console.log(`📊 Total: ${data.data.length} favorites\n`);
      
      console.log('📝 P-Codes in backend:');
      data.data.forEach((fav, index) => {
        console.log(`   ${index + 1}. P-Code: "${fav.p_code}" (${typeof fav.p_code})`);
        console.log(`      Store: ${fav.store_code}, Added: ${fav.createdAt || 'N/A'}`);
      });
      
      // Check if "445" is in the list
      const has445 = data.data.some(fav => fav.p_code === '445' || fav.p_code === 445);
      console.log(`\n🔍 Does backend have p_code "445"? ${has445 ? '✅ YES' : '❌ NO'}`);
      
      if (!has445) {
        console.log('\n❌ That\'s why you\'re getting "Product not found"!');
        console.log('   The backend doesn\'t have p_code "445" in favorites.');
        console.log('   Check what p_code you\'re actually trying to remove.');
      }
      
      return data;
    } else {
      console.error('❌ API Error:', data);
      return data;
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
    return { error: error.message };
  }
}

// Auto-run
checkBackendFavorites();

console.log('\n💡 Tip: You can also run checkBackendFavorites() manually');


