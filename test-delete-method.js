/**
 * Test which method works for removing favorites
 * Copy and paste in browser console
 */

(async function() {
  console.log('🧪 Testing DELETE vs POST for remove-from-favorites\n');
  
  const token = localStorage.getItem('auth_token');
  const locationData = localStorage.getItem('confirmedLocation');
  const store_code = locationData ? JSON.parse(locationData)?.store?.store_code : 'AVB';
  
  const p_code = '9946'; // Your test product
  
  console.log('📋 Config:');
  console.log('   Store Code:', store_code);
  console.log('   P-Code:', p_code);
  console.log('   Token:', token ? 'Present ✅' : 'Missing ❌');
  
  const requestBody = {
    store_code,
    project_code: 'PROJ001',
    p_code
  };
  
  console.log('\n📦 Request Body:', requestBody);
  
  // Test 1: DELETE method
  console.log('\n🔄 Test 1: DELETE method');
  console.log('   URL: DELETE https://ecommerceapi-web.onrender.com/api/favorites/remove-from-favorites');
  
  try {
    const deleteResponse = await fetch('https://ecommerceapi-web.onrender.com/api/favorites/remove-from-favorites', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    
    const deleteData = await deleteResponse.json();
    console.log('   Status:', deleteResponse.status);
    console.log('   Response:', deleteData);
    
    if (deleteResponse.ok && deleteData.success) {
      console.log('   ✅ DELETE METHOD WORKS!');
      return { method: 'DELETE', success: true, data: deleteData };
    } else {
      console.log('   ❌ DELETE failed:', deleteData.error || deleteData.message);
    }
  } catch (error) {
    console.log('   ❌ DELETE error:', error.message);
  }
  
  // Test 2: POST method
  console.log('\n🔄 Test 2: POST method');
  console.log('   URL: POST https://ecommerceapi-web.onrender.com/api/favorites/remove-from-favorites');
  
  try {
    const postResponse = await fetch('https://ecommerceapi-web.onrender.com/api/favorites/remove-from-favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    
    const postData = await postResponse.json();
    console.log('   Status:', postResponse.status);
    console.log('   Response:', postData);
    
    if (postResponse.ok && postData.success) {
      console.log('   ✅ POST METHOD WORKS!');
      return { method: 'POST', success: true, data: postData };
    } else {
      console.log('   ❌ POST failed:', postData.error || postData.message);
    }
  } catch (error) {
    console.log('   ❌ POST error:', error.message);
  }
  
  console.log('\n❌ Neither method worked. Check backend logs.');
  return { success: false };
})();

