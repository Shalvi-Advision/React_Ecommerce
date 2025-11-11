/**
 * Test script to debug the remove favorites issue
 * Run this in browser console
 */

window.testRemove = async function(p_code = '9946') {
  console.log('🧪 Testing Remove from Favorites\n');
  console.log('='.repeat(50));
  
  // Get store code
  const locationData = localStorage.getItem('confirmedLocation');
  const store_code = locationData ? JSON.parse(locationData)?.store?.store_code : 'KHP';
  
  console.log('\n📋 Configuration:');
  console.log('   Store Code:', store_code);
  console.log('   Project Code: PROJ001');
  console.log('   P-Code to remove:', p_code);
  console.log('   Auth Token:', localStorage.getItem('auth_token') ? '✅' : '❌');
  
  // First, get current favorites
  console.log('\n📡 Step 1: Fetching current favorites...');
  try {
    const getFavResponse = await fetch('https://ecommerceapi-web.onrender.com/api/favorites/get-favorites', {
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
    
    const favData = await getFavResponse.json();
    
    if (favData.success && favData.data) {
      console.log(`✅ Found ${favData.data.length} favorites in backend`);
      
      console.log('\n📝 P-Codes in backend:');
      favData.data.forEach((fav, index) => {
        console.log(`   ${index + 1}. "${fav.p_code}" (type: ${typeof fav.p_code}, length: ${String(fav.p_code).length})`);
        
        // Check if this matches what we're trying to remove
        if (fav.p_code == p_code || String(fav.p_code) === String(p_code)) {
          console.log(`      → ⭐ THIS IS A MATCH for "${p_code}"`);
          console.log(`      → Store: ${fav.store_code}`);
          console.log(`      → Created: ${fav.createdAt || 'N/A'}`);
          console.log(`      → Check: '"${fav.p_code}" === "${p_code}" ? ${fav.p_code === p_code}`);
          console.log(`      → Check: fav.p_code == p_code ? ${fav.p_code == p_code}`);
        }
      });
      
      const exactMatch = favData.data.find(fav => fav.p_code === p_code);
      const looseMatch = favData.data.find(fav => fav.p_code == p_code);
      const stringMatch = favData.data.find(fav => String(fav.p_code) === String(p_code));
      
      console.log('\n🔍 Match Analysis:');
      console.log(`   Exact match (===): ${exactMatch ? 'YES ✅' : 'NO ❌'}`);
      console.log(`   Loose match (==): ${looseMatch ? 'YES ✅' : 'NO ❌'}`);
      console.log(`   String match: ${stringMatch ? 'YES ✅' : 'NO ❌'}`);
      
      if (!exactMatch && !looseMatch && !stringMatch) {
        console.log(`\n❌ ERROR: P-code "${p_code}" is NOT in backend favorites!`);
        console.log('   That\'s why you\'re getting "Product not found"');
        return { error: 'P-code not in favorites' };
      }
      
      // Now try to remove
      console.log('\n📡 Step 2: Attempting to remove from favorites...');
      console.log('   Sending p_code:', JSON.stringify(p_code));
      
      try {
        const removeResponse = await fetch('https://ecommerceapi-web.onrender.com/api/favorites/remove-from-favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            store_code: store_code,
            project_code: 'PROJ001',
            p_code: String(p_code).trim()
          })
        });
        
        const removeData = await removeResponse.json();
        console.log('   Status:', removeResponse.status);
        console.log('   Response:', removeData);
        
        if (removeData.success) {
          console.log('\n✅ SUCCESS! Product removed from favorites');
        } else {
          console.log('\n❌ FAILED:', removeData.error || removeData.message);
        }
        
        return removeData;
      } catch (removeError) {
        console.error('\n❌ Network Error:', removeError);
        return { error: removeError.message };
      }
      
    } else {
      console.error('❌ Failed to get favorites:', favData);
      return { error: favData };
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return { error: error.message };
  }
};

console.log('✅ Test function loaded! Run: testRemove("9946")');



