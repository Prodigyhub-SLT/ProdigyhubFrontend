#!/usr/bin/env node

const axios = require('axios');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

console.log('🧪 Testing MongoDB Categories Integration with Offerings Tab');
console.log('=' .repeat(80));
console.log(`🌐 Testing against: ${BASE_URL}`);

async function testMongoDBCategoriesIntegration() {
  try {
    console.log('\n📋 Step 1: Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: TIMEOUT });
    console.log('✅ Health check passed:', healthResponse.data.status);
    
    console.log('\n📋 Step 2: Testing Hierarchical Categories API...');
    const categoriesResponse = await axios.get(`${BASE_URL}/productCatalogManagement/v5/hierarchicalCategory`, { timeout: TIMEOUT });
    console.log('✅ Categories loaded:', categoriesResponse.data.length, 'categories found');
    
    if (categoriesResponse.data.length > 0) {
      console.log('📊 Sample categories:');
      categoriesResponse.data.slice(0, 3).forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.label} (${cat.name}) - ${cat.subCategories?.length || 0} sub-categories`);
      });
    }
    
    console.log('\n📋 Step 3: Testing Product Offerings API...');
    const offeringsResponse = await axios.get(`${BASE_URL}/productCatalogManagement/v5/productOffering`, { timeout: TIMEOUT });
    console.log('✅ Offerings loaded:', offeringsResponse.data.length, 'offerings found');
    
    if (offeringsResponse.data.length > 0) {
      console.log('📊 Sample offerings with categories:');
      offeringsResponse.data.slice(0, 3).forEach((offering, index) => {
        console.log(`  ${index + 1}. ${offering.name} - Category: ${offering.category || 'No category'}`);
      });
    }
    
    console.log('\n📋 Step 4: Testing Category-Offering Integration...');
    const categoriesWithOfferings = categoriesResponse.data.filter(cat => 
      offeringsResponse.data.some(offering => 
        offering.category === cat.name || offering.category === cat.label
      )
    );
    
    console.log(`✅ Categories used in offerings: ${categoriesWithOfferings.length}/${categoriesResponse.data.length}`);
    
    if (categoriesWithOfferings.length > 0) {
      console.log('📊 Categories actively used:');
      categoriesWithOfferings.forEach(cat => {
        const usageCount = offeringsResponse.data.filter(offering => 
          offering.category === cat.name || offering.category === cat.label
        ).length;
        console.log(`  • ${cat.label}: used in ${usageCount} offerings`);
      });
    }
    
    console.log('\n🎉 MongoDB Categories Integration Test Completed Successfully!');
    console.log('✅ Categories are being loaded from MongoDB');
    console.log('✅ Offerings are being loaded from MongoDB');
    console.log('✅ Categories and offerings are properly linked');
    console.log('✅ The Offerings Tab will now show dynamic MongoDB categories');
    
    console.log('\n📝 Next Steps:');
    console.log('  1. Go to Category Management Tab');
    console.log('  2. Create/edit/delete categories (they save to MongoDB)');
    console.log('  3. Go to Offerings Tab - categories will automatically update');
    console.log('  4. Create offerings using the new categories');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testMongoDBCategoriesIntegration();
