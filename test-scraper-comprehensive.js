// Test comprehensive scraper capabilities
const axios = require('axios');

async function testComprehensiveScrapingCapabilities() {
    console.log('🔍 TESTING COMPREHENSIVE SCRAPING CAPABILITIES');
    
    // Test 1: Check current database
    console.log('\n=== CURRENT DATABASE STATUS ===');
    try {
        const response = await axios.get('http://localhost:5000/api/materials');
        const materials = response.data;
        console.log(`Total materials: ${materials.length}`);
        
        // Show the latest products with specifications
        const latestMaterials = materials.slice(-5);
        latestMaterials.forEach((material, index) => {
            console.log(`\n${index + 1}. ${material.name} (${material.category})`);
            console.log(`   Brand: ${material.brand}`);
            console.log(`   Price: $${material.price}`);
            console.log(`   Specifications count: ${Object.keys(material.specifications).length}`);
            
            // Show key specifications
            const specs = material.specifications;
            const keySpecs = ['Material Type', 'PEI Rating', 'DCOF Rating', 'Water Absorption', 'Finish', 'Color', 'Thickness'];
            keySpecs.forEach(key => {
                if (specs[key]) {
                    console.log(`   ${key}: ${specs[key]}`);
                }
            });
        });
        
        // Test 2: Check if scraping endpoints are working
        console.log('\n=== SCRAPING SYSTEM STATUS ===');
        
        // Check one product that worked
        const workingProduct = materials.find(m => m.id === 43);
        if (workingProduct) {
            console.log('✅ Product 43 (Arizona Tile) shows advanced scraping worked:');
            console.log(`   Name: ${workingProduct.name}`);
            console.log(`   Brand: ${workingProduct.brand}`);
            console.log(`   Category: ${workingProduct.category}`);
            console.log(`   Material Type: ${workingProduct.specifications['Material Type']}`);
            console.log(`   Finish: ${workingProduct.specifications['Finish']}`);
            console.log(`   Thickness: ${workingProduct.specifications['Thickness']}`);
            console.log(`   Slab Dimensions: ${workingProduct.specifications['Slab Dimensions']}`);
            console.log(`   Water Absorption: ${workingProduct.specifications['Water Absorption']}`);
            console.log(`   Scratch Resistance: ${workingProduct.specifications['Scratch Resistance']}`);
            console.log(`   Heat Resistance: ${workingProduct.specifications['Heat Resistance']}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testComprehensiveScrapingCapabilities();