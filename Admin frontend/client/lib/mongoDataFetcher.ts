import { dbOperations, dbRefs } from '@/lib/firebase';
import { set } from 'firebase/database';
import { database } from '@/lib/firebase';

// MongoDB API endpoints from your backend
const MONGO_ENDPOINTS = {
  orders: '/productOrderingManagement/v4/productOrder',
  products: '/tmf-api/product',
  offerings: '/productCatalogManagement/v5/productOffering',
  categories: '/productCatalogManagement/v5/category',
  qualifications: '/productOfferingQualification/v5/checkProductOfferingQualification',
  events: '/tmf-api/event/v4/event',
  systemHealth: '/health',
  collectionStats: '/debug/storage'
};

// Base URL for your backend
const BASE_URL = 'http://localhost:3000'; // Your backend server runs on port 3000

// Test function to check backend connectivity
export const testBackendConnection = async () => {
  try {
    console.log('🧪 Testing backend connection...');
    console.log('📍 Backend URL:', BASE_URL);
    
    const testResponse = await fetch(`${BASE_URL}/health`);
    console.log('🔍 Health endpoint response:', testResponse.status, testResponse.ok);
    
    if (testResponse.ok) {
      const healthData = await testResponse.json();
      console.log('📦 Health data received:', healthData);
      return true;
    } else {
      console.log('❌ Health endpoint failed:', testResponse.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return false;
  }
};

// Fetch data from MongoDB endpoints and update Firebase
export const fetchAndUpdateMongoData = async () => {
  try {
    console.log('🔄 Fetching data from MongoDB endpoints...');
    console.log('📍 Backend URL:', BASE_URL);

    // Fetch all data in parallel
    const [
      ordersResponse,
      productsResponse,
      offeringsResponse,
      categoriesResponse,
      qualificationsResponse,
      eventsResponse,
      systemHealthResponse,
      collectionStatsResponse
    ] = await Promise.allSettled([
      fetch(`${BASE_URL}${MONGO_ENDPOINTS.orders}`),
      fetch(`${BASE_URL}${MONGO_ENDPOINTS.products}`),
      fetch(`${BASE_URL}${MONGO_ENDPOINTS.offerings}`),
      fetch(`${BASE_URL}${MONGO_ENDPOINTS.categories}`),
      fetch(`${BASE_URL}${MONGO_ENDPOINTS.qualifications}`),
      fetch(`${BASE_URL}${MONGO_ENDPOINTS.events}`),
      fetch(`${BASE_URL}${MONGO_ENDPOINTS.systemHealth}`),
      fetch(`${BASE_URL}${MONGO_ENDPOINTS.collectionStats}`)
    ]);

    // Process orders
    if (ordersResponse.status === 'fulfilled' && ordersResponse.value.ok) {
      const orders = await ordersResponse.value.json();
      console.log('📦 Orders data received:', orders);
      await set(dbRefs.orders, orders);
      console.log('✅ Orders updated from MongoDB');
    } else {
      console.log('⚠️ Orders endpoint failed:', ordersResponse.status, ordersResponse.status === 'fulfilled' ? ordersResponse.value?.status : 'rejected');
    }

    // Process products
    if (productsResponse.status === 'fulfilled' && productsResponse.value.ok) {
      const products = await productsResponse.value.json();
      console.log('📦 Products data received:', products);
      await set(dbRefs.products, products);
      console.log('✅ Products updated from MongoDB');
    } else {
      console.log('⚠️ Products endpoint failed:', productsResponse.status, productsResponse.status === 'fulfilled' ? productsResponse.value?.status : 'rejected');
    }

    // Process offerings
    if (offeringsResponse.status === 'fulfilled' && offeringsResponse.value.ok) {
      const offerings = await offeringsResponse.value.json();
      console.log('📦 Offerings data received:', offerings);
      await set(dbRefs.offerings, offerings);
      console.log('✅ Offerings updated from MongoDB');
    } else {
      console.log('⚠️ Offerings endpoint failed:', offeringsResponse.status, offeringsResponse.status === 'fulfilled' ? offeringsResponse.value?.status : 'rejected');
    }

    // Process categories
    if (categoriesResponse.status === 'fulfilled' && categoriesResponse.value.ok) {
      const categories = await categoriesResponse.value.json();
      console.log('📦 Categories data received:', categories);
      await set(dbRefs.categories, categories);
      console.log('✅ Categories updated from MongoDB');
    } else {
      console.log('⚠️ Categories endpoint failed:', categoriesResponse.status, categoriesResponse.status === 'fulfilled' ? categoriesResponse.value?.status : 'rejected');
    }

    // Process qualifications
    if (qualificationsResponse.status === 'fulfilled' && qualificationsResponse.value.ok) {
      const qualifications = await qualificationsResponse.value.json();
      console.log('📦 Qualifications data received:', qualifications);
      await set(dbRefs.qualifications, qualifications);
      console.log('✅ Qualifications updated from MongoDB');
    } else {
      console.log('⚠️ Qualifications endpoint failed:', qualificationsResponse.status, qualificationsResponse.status === 'fulfilled' ? qualificationsResponse.value?.status : 'rejected');
    }

    // Process events
    if (eventsResponse.status === 'fulfilled' && eventsResponse.value.ok) {
      const events = await eventsResponse.value.json();
      console.log('📦 Events data received:', events);
      await set(dbRefs.events, events);
      console.log('✅ Events updated from MongoDB');
    } else {
      console.log('⚠️ Events endpoint failed:', eventsResponse.status, eventsResponse.status === 'fulfilled' ? eventsResponse.value?.status : 'rejected');
    }

    // Process system health
    if (systemHealthResponse.status === 'fulfilled' && systemHealthResponse.value.ok) {
      const systemHealth = await systemHealthResponse.value.json();
      console.log('📦 System health data received:', systemHealth);
      await set(dbRefs.systemHealth, systemHealth);
      console.log('✅ System health updated from MongoDB');
    } else {
      console.log('⚠️ System health endpoint failed:', systemHealthResponse.status, systemHealthResponse.status === 'fulfilled' ? systemHealthResponse.value?.status : 'rejected');
    }

    // Process collection stats
    if (collectionStatsResponse.status === 'fulfilled' && collectionStatsResponse.value.ok) {
      const collectionStats = await collectionStatsResponse.value.json();
      console.log('📦 Collection stats data received:', collectionStats);
      await set(dbRefs.collectionStats, collectionStats);
      console.log('✅ Collection stats updated from MongoDB');
    } else {
      console.log('⚠️ Collection stats endpoint failed:', collectionStatsResponse.status, collectionStatsResponse.status === 'fulfilled' ? collectionStatsResponse.value?.status : 'rejected');
    }

    console.log('🎉 All MongoDB data fetched and Firebase updated successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error fetching MongoDB data:', error);
    return false;
  }
};

// Auto-refresh data every 30 seconds
export const startAutoRefresh = () => {
  const interval = setInterval(() => {
    fetchAndUpdateMongoData();
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
};

// Manual refresh function
export const refreshMongoData = () => {
  return fetchAndUpdateMongoData();
};
