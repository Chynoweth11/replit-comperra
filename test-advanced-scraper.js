// Test the advanced scraping system with comprehensive specifications
const axios = require('axios');

async function testAdvancedScraper() {
  console.log('🔥 TESTING ADVANCED SCRAPER WITH COMPREHENSIVE SPECIFICATIONS');
  
  // Test with actual URL that should work
  const testUrl = 'https://httpbin.org/html';
  
  try {
    const response = await axios.post('http://localhost:5000/api/scrape/single', {
      url: testUrl
    });
    
    console.log('✅ Advanced scraper response:', JSON.stringify(response.data, null, 2));
    
    // Test direct API call to check materials
    const materialsResponse = await axios.get('http://localhost:5000/api/materials');
    const latestMaterial = materialsResponse.data[materialsResponse.data.length - 1];
    
    console.log('📋 Latest scraped material specifications:');
    console.log(JSON.stringify(latestMaterial.specifications, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdvancedScraper();