// Mock data for development and testing purposes
export const mockData = {
  products: [
    {
      id: 'p1',
      name: 'Hex Bolt M10x50',
      trackingNumber: 'MECH-12345ABC',
      category: 'Fasteners',
      subCategory: 'Bolts',
      status: 'in-distribution',
      manufacturer: 'NuraBolt Industries',
      currentOwner: 'Midwest Distribution Center',
      description: 'High-strength hex bolt with metric thread, suitable for industrial applications.',
      createdAt: '2024-03-15T08:30:00Z',
      updatedAt: '2024-04-01T14:22:00Z',
      specifications: {
        material: 'Stainless Steel 304',
        finish: 'Zinc Plated',
        dimensions: {
          length: 50,
          diameter: 10
        },
        threadSpecifications: {
          type: 'Metric',
          pitch: 1.5,
          class: '6g'
        },
        standards: ['ISO 4014', 'DIN 931']
      },
      timeline: [
        {
          status: 'manufactured',
          date: '2024-03-15T08:30:00Z',
          description: 'Product manufactured at NuraBolt Industries facility.',
          updatedBy: 'system',
          updatedByName: 'Manufacturing System'
        },
        {
          status: 'quality-check',
          date: '2024-03-16T10:15:00Z',
          description: 'Quality check completed. Product meets all specifications.',
          updatedBy: 'user123',
          updatedByName: 'Quality Inspector'
        },
        {
          status: 'in-supply',
          date: '2024-03-18T09:45:00Z',
          description: 'Product added to supply inventory.',
          updatedBy: 'user456',
          updatedByName: 'Inventory Manager'
        },
        {
          status: 'in-distribution',
          date: '2024-04-01T14:22:00Z',
          description: 'Product shipped to Midwest Distribution Center.',
          updatedBy: 'user789',
          updatedByName: 'Logistics Coordinator'
        }
      ]
    },
    {
      id: 'p2',
      name: 'Ball Bearing 6205',
      trackingNumber: 'MECH-67890XYZ',
      category: 'Industrial Components',
      subCategory: 'Bearings',
      status: 'delivered',
      manufacturer: 'NuraBearing Solutions',
      currentOwner: 'Precision Machinery Inc.',
      description: 'Deep groove ball bearing for general industrial applications.',
      createdAt: '2024-03-10T11:20:00Z',
      updatedAt: '2024-04-02T16:45:00Z',
      specifications: {
        material: 'Chrome Steel',
        finish: 'Polished',
        dimensions: {
          innerDiameter: 25,
          outerDiameter: 52,
          width: 15
        },
        standards: ['ISO 15', 'DIN 625']
      },
      timeline: [
        {
          status: 'manufactured',
          date: '2024-03-10T11:20:00Z',
          description: 'Product manufactured at NuraBearing facility.',
          updatedBy: 'system',
          updatedByName: 'Manufacturing System'
        },
        {
          status: 'quality-check',
          date: '2024-03-11T13:30:00Z',
          description: 'Quality check completed. Product meets all specifications.',
          updatedBy: 'user123',
          updatedByName: 'Quality Inspector'
        },
        {
          status: 'in-supply',
          date: '2024-03-12T09:15:00Z',
          description: 'Product added to supply inventory.',
          updatedBy: 'user456',
          updatedByName: 'Inventory Manager'
        },
        {
          status: 'in-distribution',
          date: '2024-03-25T10:40:00Z',
          description: 'Product shipped to Precision Machinery Inc.',
          updatedBy: 'user789',
          updatedByName: 'Logistics Coordinator'
        },
        {
          status: 'delivered',
          date: '2024-04-02T16:45:00Z',
          description: 'Product delivered to customer.',
          updatedBy: 'user101',
          updatedByName: 'Delivery Agent'
        }
      ]
    }
  ],
  transactions: [
    {
      _id: 't1',
      transactionId: 'TRX-12345',
      productId: 'p1',
      productName: 'Hex Bolt M10x50',
      fromUserId: 'user456',
      fromUserName: 'NuraBolt Industries',
      fromUserRole: 'manufacturer',
      toUserId: 'user789',
      toUserName: 'Midwest Distribution Center',
      toUserRole: 'distributor',
      status: 'in-transit',
      createdAt: '2024-04-01T14:22:00Z',
      updatedAt: '2024-04-01T14:22:00Z',
      notes: [
        {
          timestamp: '2024-04-01T14:22:00Z',
          status: 'in-transit',
          text: 'Shipment initiated from manufacturing facility',
          updatedBy: 'user456',
          updatedByName: 'Inventory Manager'
        }
      ],
      metadata: {
        estimatedDelivery: '2024-04-05T00:00:00Z',
        shippingMethod: 'Ground',
        trackingNumber: 'SHIP-987654'
      }
    },
    {
      _id: 't2',
      transactionId: 'TRX-67890',
      productId: 'p2',
      productName: 'Ball Bearing 6205',
      fromUserId: 'user456',
      fromUserName: 'NuraBearing Solutions',
      fromUserRole: 'manufacturer',
      toUserId: 'user101',
      toUserName: 'Precision Machinery Inc.',
      toUserRole: 'customer',
      status: 'delivered',
      createdAt: '2024-03-25T10:40:00Z',
      updatedAt: '2024-04-02T16:45:00Z',
      notes: [
        {
          timestamp: '2024-03-25T10:40:00Z',
          status: 'in-transit',
          text: 'Shipment initiated from manufacturing facility',
          updatedBy: 'user456',
          updatedByName: 'Inventory Manager'
        },
        {
          timestamp: '2024-04-02T16:45:00Z',
          status: 'delivered',
          text: 'Product delivered to customer',
          updatedBy: 'user101',
          updatedByName: 'Delivery Agent'
        }
      ],
      metadata: {
        shippingMethod: 'Express',
        trackingNumber: 'SHIP-123456',
        signedBy: 'John Smith'
      }
    }
  ]
};
