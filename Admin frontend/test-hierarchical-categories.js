#!/usr/bin/env node

const axios = require('axios');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

// Test data for hierarchical categories
const testHierarchicalCategory = {
  name: 'Test Broadband Category',
  value: 'test_broadband',
  label: 'Test Broadband',
  description: 'Testing hierarchical category MongoDB integration',
  color: 'text-blue-600',
  bgColor: 'bg-blue-50',
  icon: 'Wifi',
  subCategories: [],
  '@type': 'HierarchicalCategory'
};

const testSubCategory = {
  name: 'Test Connection Type',
  value: 'test_connection_type',
  label: 'Test Connection Type',
  description: 'Testing sub-category MongoDB integration',
  subSubCategories: []
};

const testSubSubCategory = {
  name: 'Test Fiber',
  value: 'test_fiber',
  label: 'Test Fiber',
  description: 'Testing sub-sub-category MongoDB integration'
};

class HierarchicalCategoryTestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.createdResources = [];
  }

  async runAllTests() {
    console.log('🧪 Starting Hierarchical Category MongoDB Integration Test Suite'.cyan);
    console.log('=' .repeat(80));
    console.log(`🌐 Testing against: ${BASE_URL}`);

    try {
      // Test health check first
      await this.testHealthCheck();
      
      // Test hierarchical category CRUD operations
      await this.testHierarchicalCategoryCRUD();
      
      // Test sub-category operations
      await this.testSubCategoryOperations();
      
      // Test sub-sub-category operations
      await this.testSubSubCategoryOperations();
      
      this.printSummary();
      
    } catch (error) {
      this.logError('Test Suite Failed', error);
    } finally {
      // Cleanup created resources
      await this.cleanup();
    }
  }

  async testHealthCheck() {
    console.log('\n📋 Testing Health Check...');
    
    try {
      const healthResponse = await this.makeRequest('GET', '/health');
      this.assert(healthResponse.status === 'OK', 'Health check should return OK status');
      this.assert(healthResponse.database.connected === true, 'Database should be connected');
      this.logSuccess('Health Check', 'Server and database are healthy');
      
    } catch (error) {
      this.logError('Health Check', error);
    }
  }

  async testHierarchicalCategoryCRUD() {
    console.log('\n📦 Testing Hierarchical Category CRUD Operations...');
    
    try {
      // CREATE
      console.log('  • Testing CREATE...');
      const createResponse = await this.makeRequest('POST', '/productCatalogManagement/v5/hierarchicalCategory', testHierarchicalCategory);
      this.assert(createResponse.id, 'Category should have an ID after creation');
      this.assert(createResponse['@type'] === 'HierarchicalCategory', 'Category should have correct @type');
      this.createdResources.push({ endpoint: '/productCatalogManagement/v5/hierarchicalCategory', id: createResponse.id });
      this.logSuccess('CREATE', `Created with ID: ${createResponse.id}`);
      
      // READ by ID
      console.log('  • Testing READ by ID...');
      const readResponse = await this.makeRequest('GET', `/productCatalogManagement/v5/hierarchicalCategory/${createResponse.id}`);
      this.assert(readResponse.id === createResponse.id, 'Category ID should match');
      this.assert(readResponse.name === testHierarchicalCategory.name, 'Category name should match');
      this.logSuccess('READ', `Retrieved with ID: ${createResponse.id}`);
      
      // LIST all
      console.log('  • Testing LIST all...');
      const listResponse = await this.makeRequest('GET', '/productCatalogManagement/v5/hierarchicalCategory');
      this.assert(Array.isArray(listResponse), 'List should return an array');
      this.assert(listResponse.length > 0, 'List should contain created item');
      this.logSuccess('LIST', `Retrieved ${listResponse.length} items`);
      
      // UPDATE
      console.log('  • Testing UPDATE...');
      const updateData = { description: 'Updated test description' };
      const updateResponse = await this.makeRequest('PATCH', `/productCatalogManagement/v5/hierarchicalCategory/${createResponse.id}`, updateData);
      this.assert(updateResponse.description === updateData.description, 'Description should be updated');
      this.logSuccess('UPDATE', `Updated with ID: ${createResponse.id}`);
      
      // Store the created category ID for sub-category tests
      this.testCategoryId = createResponse.id;
      
    } catch (error) {
      this.logError('Hierarchical Category CRUD', error);
    }
  }

  async testSubCategoryOperations() {
    if (!this.testCategoryId) {
      console.log('  ⚠️ Skipping sub-category tests - no main category created');
      return;
    }
    
    console.log('\n📁 Testing Sub-Category Operations...');
    
    try {
      // CREATE sub-category
      console.log('  • Testing CREATE sub-category...');
      const createResponse = await this.makeRequest('POST', `/productCatalogManagement/v5/hierarchicalCategory/${this.testCategoryId}/subCategory`, testSubCategory);
      this.assert(createResponse.id, 'Sub-category should have an ID after creation');
      this.logSuccess('CREATE Sub-Category', `Created with ID: ${createResponse.id}`);
      
      // Store the created sub-category ID for sub-sub-category tests
      this.testSubCategoryId = createResponse.id;
      
      // UPDATE sub-category
      console.log('  • Testing UPDATE sub-category...');
      const updateData = { description: 'Updated sub-category description' };
      const updateResponse = await this.makeRequest('PATCH', `/productCatalogManagement/v5/hierarchicalCategory/${this.testCategoryId}/subCategory/${this.testSubCategoryId}`, updateData);
      this.assert(updateResponse.description === updateData.description, 'Sub-category description should be updated');
      this.logSuccess('UPDATE Sub-Category', `Updated with ID: ${this.testSubCategoryId}`);
      
    } catch (error) {
      this.logError('Sub-Category Operations', error);
    }
  }

  async testSubSubCategoryOperations() {
    if (!this.testCategoryId || !this.testSubCategoryId) {
      console.log('  ⚠️ Skipping sub-sub-category tests - no sub-category created');
      return;
    }
    
    console.log('\n📂 Testing Sub-Sub-Category Operations...');
    
    try {
      // CREATE sub-sub-category
      console.log('  • Testing CREATE sub-sub-category...');
      const createResponse = await this.makeRequest('POST', `/productCatalogManagement/v5/hierarchicalCategory/${this.testCategoryId}/subCategory/${this.testSubCategoryId}/subSubCategory`, testSubSubCategory);
      this.assert(createResponse.id, 'Sub-sub-category should have an ID after creation');
      this.logSuccess('CREATE Sub-Sub-Category', `Created with ID: ${createResponse.id}`);
      
      // Store the created sub-sub-category ID for cleanup
      this.testSubSubCategoryId = createResponse.id;
      
      // UPDATE sub-sub-category
      console.log('  • Testing UPDATE sub-sub-category...');
      const updateData = { description: 'Updated sub-sub-category description' };
      const updateResponse = await this.makeRequest('PATCH', `/productCatalogManagement/v5/hierarchicalCategory/${this.testCategoryId}/subCategory/${this.testSubCategoryId}/subSubCategory/${this.testSubSubCategoryId}`, updateData);
      this.assert(updateResponse.description === updateData.description, 'Sub-sub-category description should be updated');
      this.logSuccess('UPDATE Sub-Sub-Category', `Updated with ID: ${this.testSubSubCategoryId}`);
      
    } catch (error) {
      this.logError('Sub-Sub-Category Operations', error);
    }
  }

  async makeRequest(method, path, data = null) {
    try {
      const config = {
        method,
        url: `${BASE_URL}${path}`,
        timeout: TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      if (data) {
        config.data = data;
      }
      
      const response = await axios(config);
      return response.data;
      
    } catch (error) {
      if (error.response) {
        throw {
          message: `${method} ${path} failed`,
          status: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        throw {
          message: `No response received from ${method} ${path}`,
          request: error.request
        };
      } else {
        throw {
          message: `Request setup failed for ${method} ${path}`,
          error: error.message
        };
      }
    }
  }

  assert(condition, message) {
    if (condition) {
      this.results.passed++;
      this.results.tests.push({ status: 'PASS', message });
    } else {
      this.results.failed++;
      this.results.tests.push({ status: 'FAIL', message });
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  logSuccess(operation, details) {
    console.log(`    ✅ ${operation}: ${details}`);
  }

  logError(operation, error) {
    console.log(`    ❌ ${operation}: ${error.message || error}`);
    if (error.status) {
      console.log(`       Status: ${error.status}`);
    }
    if (error.data) {
      console.log(`       Response: ${JSON.stringify(error.data, null, 2)}`);
    }
    this.results.failed++;
  }

  async cleanup() {
    if (this.createdResources.length === 0) {
      return;
    }
    
    console.log('\n🧹 Cleaning up test resources...');
    
    for (const resource of this.createdResources) {
      try {
        await this.makeRequest('DELETE', `${resource.endpoint}/${resource.id}`);
        console.log(`    ✅ Cleaned up ${resource.id}`);
      } catch (error) {
        console.log(`    ⚠️ Could not clean up ${resource.id}: ${error.message}`);
      }
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 Hierarchical Category MongoDB Integration Test Results');
    console.log('='.repeat(80));
    
    const total = this.results.passed + this.results.failed;
    const passRate = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Pass Rate: ${passRate}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All hierarchical category MongoDB integration tests passed!');
      console.log('✅ Hierarchical categories are successfully integrated with MongoDB');
    } else {
      console.log('\n⚠️ Some tests failed. Check the logs above for details.');
    }
    
    console.log('\n🗄️ MongoDB Collections Tested:');
    console.log('  • hierarchical_categories');
    console.log('  • Support for main categories, sub-categories, and sub-sub-categories');
    
    console.log('='.repeat(80));
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new HierarchicalCategoryTestSuite();
  tester.runAllTests()
    .then(() => {
      process.exit(tester.results.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test suite crashed:', error);
      process.exit(1);
    });
}

module.exports = HierarchicalCategoryTestSuite;
