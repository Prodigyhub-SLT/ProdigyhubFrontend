import type { ProductOrder } from '@shared/product-order-types';

export const mockOrders: ProductOrder[] = [
  {
    id: "sample-123",
    href: "http://localhost:8080/api/tmf-api/productOrderingManagement/v5/productOrder/sample-123",
    category: "B2C product order",
    description: "Premium mobile plan subscription for new customer",
    creationDate: new Date().toISOString(),
    completionDate: new Date(Date.now() + 86400000).toISOString(),
    expectedCompletionDate: new Date(Date.now() + 86400000).toISOString(),
    requestedCompletionDate: new Date(Date.now() + 86400000).toISOString(),
    requestedStartDate: new Date(Date.now() + 43200000).toISOString(),
    priority: "1",
    state: "acknowledged",
    productOrderItem: [{
      id: "item-1",
      action: "add",
      quantity: 1,
      product: {
        "@type": "Product",
        productOffering: {
          id: "mobile-premium-plan-001",
          name: "Premium Mobile Plan",
          "@type": "ProductOfferingRef"
        }
      },
      productOffering: {
        id: "mobile-premium-plan-001",
        href: "http://localhost:8080/productCatalogManagement/v5/productOffering/mobile-premium-plan-001",
        name: "Premium Mobile Plan - 5G Unlimited",
        "@type": "ProductOfferingRef",
        "@referredType": "ProductOffering"
      },
      state: "acknowledged",
      "@type": "ProductOrderItem"
    }],
    relatedParty: [{
      role: "customer",
      partyOrPartyRole: {
        id: "customer-123",
        href: "http://localhost:8080/partyManagement/v5/individual/customer-123",
        name: "John Smith",
        "@type": "PartyRef",
        "@referredType": "Individual"
      },
      "@type": "RelatedPartyRefOrPartyRoleRef"
    }],
    note: [{
      id: "note-1",
      author: "Customer Service",
      date: new Date().toISOString(),
      text: "Customer requested activation within 24 hours",
      "@type": "Note"
    }],
    "@type": "ProductOrder"
  },
  {
    id: "order-456",
    href: "http://localhost:8080/api/tmf-api/productOrderingManagement/v5/productOrder/order-456",
    category: "B2B product order",
    description: "Enterprise internet connection upgrade",
    creationDate: new Date(Date.now() - 86400000).toISOString(),
    completionDate: new Date(Date.now() + 172800000).toISOString(),
    expectedCompletionDate: new Date(Date.now() + 172800000).toISOString(),
    requestedCompletionDate: new Date(Date.now() + 172800000).toISOString(),
    requestedStartDate: new Date(Date.now() + 86400000).toISOString(),
    priority: "2",
    state: "inProgress",
    productOrderItem: [{
      id: "item-2",
      action: "modify",
      quantity: 1,
      product: {
        "@type": "Product",
        productOffering: {
          id: "enterprise-internet-001",
          name: "Enterprise Internet",
          "@type": "ProductOfferingRef"
        }
      },
      productOffering: {
        id: "enterprise-internet-001",
        href: "http://localhost:8080/productCatalogManagement/v5/productOffering/enterprise-internet-001",
        name: "Enterprise Internet - 1Gb Fiber",
        "@type": "ProductOfferingRef",
        "@referredType": "ProductOffering"
      },
      state: "inProgress",
      "@type": "ProductOrderItem"
    }],
    relatedParty: [{
      role: "customer",
      partyOrPartyRole: {
        id: "company-789",
        href: "http://localhost:8080/partyManagement/v5/organization/company-789",
        name: "TechCorp Solutions",
        "@type": "PartyRef",
        "@referredType": "Organization"
      },
      "@type": "RelatedPartyRefOrPartyRoleRef"
    }],
    note: [{
      id: "note-2",
      author: "Technical Support",
      date: new Date(Date.now() - 43200000).toISOString(),
      text: "Site survey completed, installation scheduled",
      "@type": "Note"
    }],
    "@type": "ProductOrder"
  },
  {
    id: "order-789",
    href: "http://localhost:8080/api/tmf-api/productOrderingManagement/v5/productOrder/order-789",
    category: "B2C product order",
    description: "Smart home package installation",
    creationDate: new Date(Date.now() - 172800000).toISOString(),
    completionDate: new Date(Date.now() - 86400000).toISOString(),
    expectedCompletionDate: new Date(Date.now() - 86400000).toISOString(),
    requestedCompletionDate: new Date(Date.now() - 86400000).toISOString(),
    requestedStartDate: new Date(Date.now() - 172800000).toISOString(),
    priority: "3",
    state: "completed",
    productOrderItem: [
      {
        id: "item-3a",
        action: "add",
        quantity: 1,
        product: {
          "@type": "Product",
          productOffering: {
            id: "smart-home-hub-001",
            name: "Smart Home Hub",
            "@type": "ProductOfferingRef"
          }
        },
        productOffering: {
          id: "smart-home-hub-001",
          href: "http://localhost:8080/productCatalogManagement/v5/productOffering/smart-home-hub-001",
          name: "Smart Home Hub - Control Center",
          "@type": "ProductOfferingRef",
          "@referredType": "ProductOffering"
        },
        state: "completed",
        "@type": "ProductOrderItem"
      },
      {
        id: "item-3b",
        action: "add",
        quantity: 4,
        product: {
          "@type": "Product",
          productOffering: {
            id: "smart-sensor-001",
            name: "Smart Sensors",
            "@type": "ProductOfferingRef"
          }
        },
        productOffering: {
          id: "smart-sensor-001",
          href: "http://localhost:8080/productCatalogManagement/v5/productOffering/smart-sensor-001",
          name: "Smart Security Sensors",
          "@type": "ProductOfferingRef",
          "@referredType": "ProductOffering"
        },
        state: "completed",
        "@type": "ProductOrderItem"
      }
    ],
    relatedParty: [{
      role: "customer",
      partyOrPartyRole: {
        id: "customer-456",
        href: "http://localhost:8080/partyManagement/v5/individual/customer-456",
        name: "Sarah Johnson",
        "@type": "PartyRef",
        "@referredType": "Individual"
      },
      "@type": "RelatedPartyRefOrPartyRoleRef"
    }],
    note: [
      {
        id: "note-3a",
        author: "Installation Team",
        date: new Date(Date.now() - 86400000).toISOString(),
        text: "Installation completed successfully. Customer training provided.",
        "@type": "Note"
      },
      {
        id: "note-3b",
        author: "Customer",
        date: new Date(Date.now() - 43200000).toISOString(),
        text: "Very satisfied with the service. Everything works perfectly!",
        "@type": "Note"
      }
    ],
    "@type": "ProductOrder"
  },
  {
    id: "order-999",
    href: "http://localhost:8080/api/tmf-api/productOrderingManagement/v5/productOrder/order-999",
    category: "B2C product order",
    description: "Mobile phone upgrade request",
    creationDate: new Date(Date.now() - 3600000).toISOString(),
    expectedCompletionDate: new Date(Date.now() + 259200000).toISOString(),
    requestedCompletionDate: new Date(Date.now() + 259200000).toISOString(),
    requestedStartDate: new Date(Date.now() + 86400000).toISOString(),
    priority: "2",
    state: "pending",
    productOrderItem: [{
      id: "item-4",
      action: "add",
      quantity: 1,
      product: {
        "@type": "Product",
        productOffering: {
          id: "smartphone-pro-001",
          name: "Smartphone Pro",
          "@type": "ProductOfferingRef"
        }
      },
      productOffering: {
        id: "smartphone-pro-001",
        href: "http://localhost:8080/productCatalogManagement/v5/productOffering/smartphone-pro-001",
        name: "Smartphone Pro - Latest Model",
        "@type": "ProductOfferingRef",
        "@referredType": "ProductOffering"
      },
      state: "pending",
      "@type": "ProductOrderItem"
    }],
    relatedParty: [{
      role: "customer",
      partyOrPartyRole: {
        id: "customer-789",
        href: "http://localhost:8080/partyManagement/v5/individual/customer-789",
        name: "Mike Wilson",
        "@type": "PartyRef",
        "@referredType": "Individual"
      },
      "@type": "RelatedPartyRefOrPartyRoleRef"
    }],
    note: [{
      id: "note-4",
      author: "Sales Representative",
      date: new Date(Date.now() - 1800000).toISOString(),
      text: "Awaiting credit check approval for device financing",
      "@type": "Note"
    }],
    "@type": "ProductOrder"
  }
];

export const mockHealth = {
  status: 'UP',
  timestamp: new Date().toISOString(),
  service: 'TMF622 ProductOrdering API (Mock)',
  version: 'v5.0.0',
  endpoints: {
    productOrders: mockOrders.length
  },
  '@type': 'Health'
};
