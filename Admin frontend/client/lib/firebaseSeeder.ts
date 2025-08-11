import { dbOperations, dbRefs } from '@/lib/firebase';
import { set, ref } from 'firebase/database';
import { database } from '@/lib/firebase';

// Sample data to seed your Firebase database
export const sampleData = {
  orders: [
    {
      id: 'order-001',
      orderNumber: 'ORD-2024-001',
      customerName: 'John Doe',
      productName: 'Fiber Broadband 100Mbps',
      status: 'In Progress',
      totalPrice: 2500,
      orderDate: new Date('2024-01-15').toISOString(),
      startedAt: new Date('2024-01-16').toISOString(),
      priority: '2',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'order-002',
      orderNumber: 'ORD-2024-002',
      customerName: 'Jane Smith',
      productName: 'ADSL Broadband 50Mbps',
      status: 'Completed',
      totalPrice: 1800,
      orderDate: new Date('2024-01-10').toISOString(),
      completedAt: new Date('2024-01-12').toISOString(),
      priority: '1',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'order-003',
      orderNumber: 'ORD-2024-003',
      customerName: 'Bob Johnson',
      productName: 'Fiber + ADSL Bundle',
      status: 'Acknowledged',
      totalPrice: 3500,
      orderDate: new Date('2024-01-20').toISOString(),
      priority: '3',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],

  products: [
    {
      id: 'prod-001',
      name: 'Fiber Broadband 100Mbps',
      category: 'Broadband',
      price: 2500,
      status: 'Active',
      createdAt: Date.now()
    },
    {
      id: 'prod-002',
      name: 'ADSL Broadband 50Mbps',
      category: 'Broadband',
      price: 1800,
      status: 'Active',
      createdAt: Date.now()
    },
    {
      id: 'prod-003',
      name: 'Fiber + ADSL Bundle',
      category: 'Bundle',
      price: 3500,
      status: 'Active',
      createdAt: Date.now()
    }
  ],

  offerings: [
    {
      id: 'off-001',
      name: 'Premium Fiber Package',
      description: 'High-speed fiber internet with premium support',
      price: 3000,
      category: 'Fiber',
      status: 'Available',
      createdAt: Date.now()
    },
    {
      id: 'off-002',
      name: 'Standard ADSL Package',
      description: 'Reliable ADSL internet service',
      price: 1500,
      category: 'ADSL',
      status: 'Available',
      createdAt: Date.now()
    }
  ],

  categories: [
    {
      id: 'cat-001',
      name: 'Fiber',
      description: 'Fiber optic internet services',
      productCount: 5,
      createdAt: Date.now()
    },
    {
      id: 'cat-002',
      name: 'ADSL',
      description: 'ADSL broadband services',
      productCount: 3,
      createdAt: Date.now()
    },
    {
      id: 'cat-003',
      name: 'Bundle',
      description: 'Combined service packages',
      productCount: 2,
      createdAt: Date.now()
    }
  ],

  qualifications: [
    {
      id: 'qual-001',
      location: 'Colombo 01',
      result: 'Qualified',
      services: ['Fiber', 'ADSL'],
      status: 'Completed',
      createdAt: Date.now()
    },
    {
      id: 'qual-002',
      location: 'Kandy',
      result: 'Qualified',
      services: ['ADSL'],
      status: 'Completed',
      createdAt: Date.now()
    },
    {
      id: 'qual-003',
      location: 'Galle',
      result: 'Conditional',
      services: ['Fiber'],
      status: 'In Progress',
      createdAt: Date.now()
    }
  ],

  events: [
    {
      id: 'evt-001',
      type: 'Order Created',
      description: 'New order ORD-2024-001 created',
      severity: 'Info',
      timestamp: Date.now(),
      createdAt: Date.now()
    },
    {
      id: 'evt-002',
      type: 'Service Down',
      description: 'Fiber service temporarily unavailable in Colombo',
      severity: 'Warning',
      timestamp: Date.now() - 3600000,
      createdAt: Date.now()
    }
  ],

  systemHealth: {
    status: 'OK',
    uptime: 99.97,
    lastCheck: Date.now(),
    services: {
      database: 'Healthy',
      api: 'Healthy',
      frontend: 'Healthy'
    },
    updatedAt: Date.now()
  },

  collectionStats: {
    collections: {
      orders: 3,
      products: 3,
      offerings: 2,
      categories: 3,
      qualifications: 3,
      events: 2
    },
    totalDocuments: 16,
    updatedAt: Date.now()
  },

  infrastructure: {
    fiberAvailable: 2,
    adslAvailable: 3,
    bothAvailable: 2,
    neitherAvailable: 0,
    totalLocations: 5,
    updatedAt: Date.now()
  }
};

// Function to seed the database
export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed orders
    for (const order of sampleData.orders) {
      await dbOperations.addOrder(order);
    }
    console.log('✅ Orders seeded');

    // Seed products
    for (const product of sampleData.products) {
      await set(ref(database, `products/${product.id}`), product);
    }
    console.log('✅ Products seeded');

    // Seed offerings
    for (const offering of sampleData.offerings) {
      await set(ref(database, `offerings/${offering.id}`), offering);
    }
    console.log('✅ Offerings seeded');

    // Seed categories
    for (const category of sampleData.categories) {
      await set(ref(database, `categories/${category.id}`), category);
    }
    console.log('✅ Categories seeded');

    // Seed qualifications
    for (const qualification of sampleData.qualifications) {
      await dbOperations.addQualification(qualification);
    }
    console.log('✅ Qualifications seeded');

    // Seed events
    for (const event of sampleData.events) {
      await set(ref(database, `events/${event.id}`), event);
    }
    console.log('✅ Events seeded');

    // Seed system health
    await dbOperations.updateSystemHealth(sampleData.systemHealth);
    console.log('✅ System health seeded');

    // Seed collection stats
    await dbOperations.updateCollectionStats(sampleData.collectionStats);
    console.log('✅ Collection stats seeded');

    // Seed infrastructure
    await set(dbRefs.infrastructure, sampleData.infrastructure);
    console.log('✅ Infrastructure seeded');

    console.log('🎉 Database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return false;
  }
};

// Function to clear the database
export const clearDatabase = async () => {
  try {
    console.log('🧹 Clearing database...');
    
    await Promise.all([
      set(dbRefs.orders, null),
      set(dbRefs.products, null),
      set(dbRefs.offerings, null),
      set(dbRefs.categories, null),
      set(dbRefs.qualifications, null),
      set(dbRefs.events, null),
      set(dbRefs.systemHealth, null),
      set(dbRefs.collectionStats, null),
      set(dbRefs.infrastructure, null)
    ]);

    console.log('✅ Database cleared successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    return false;
  }
};
