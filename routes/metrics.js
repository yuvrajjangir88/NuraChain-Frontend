const express = require('express');
const router = express.Router();
const SystemMetric = require('../models/SystemMetric');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const Shipment = require('../models/Shipment');

// Root route - redirect to dashboard metrics
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    
    // Get dashboard metrics based on user role
    const dashboardMetrics = await SystemMetric.getDashboardMetrics(userId, role);
    
    // Get key metrics counts
    const [pendingShipments, deliveredProducts, delayedShipments] = await Promise.all([
      Transaction.countDocuments({ 
      status: { $in: ['pending', 'processing', 'in-transit'] } 
      }),
      Transaction.countDocuments({ 
      status: 'delivered',
      'shipmentDetails.actualDelivery': { $exists: true }
      }),
      Transaction.countDocuments({
      status: { $in: ['in-transit', 'processing'] },
      'shipmentDetails.delays': { $exists: true, $not: { $size: 0 } }
      })
    ]);
    
    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('fromUser', 'username company.name')
      .populate('toUser', 'username company.name')
      .populate('product', 'name trackingNumber category');
    
    // Get product distribution by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json({
      dashboardMetrics,
      keyMetrics: {
        pendingShipments,
        deliveredProducts,
        delayedShipments
      },
      recentTransactions,
      productsByCategory
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ 
      message: 'Error getting metrics',
      error: error.message 
    });
  }
});

// Get dashboard metrics
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalShipments = await Shipment.countDocuments();

    // Get monthly activity
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyActivity = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          transactions: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Get product distribution
    const productDistribution = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // Get shipment status distribution
    const shipmentStatus = await Shipment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // Calculate supply chain health score
    const totalDelivered = await Shipment.countDocuments({ status: 'delivered' });
    const totalDelayed = await Shipment.countDocuments({ status: 'delayed' });
    const totalInTransit = await Shipment.countDocuments({ status: 'in-transit' });
    const totalPending = await Shipment.countDocuments({ status: 'pending' });
    
    // Calculate total active shipments
    const totalActiveShipments = totalDelivered + totalDelayed + totalInTransit + totalPending;
    
    // Calculate supply chain health based on delivered vs total active shipments
    const supplyChainHealth = totalActiveShipments > 0 
      ? Math.round((totalDelivered / totalActiveShipments) * 100)
      : 100; // If no shipments, consider it 100% healthy

    // Calculate quality score based on product status
    const qualityIssues = await Product.countDocuments({ status: 'defective' });
    const qualityScore = totalProducts > 0
      ? Math.round(((totalProducts - qualityIssues) / totalProducts) * 100)
      : 100;

    // Calculate efficiency rate based on on-time deliveries
    const onTimeDeliveries = await Shipment.countDocuments({ 
      status: 'delivered',
      deliveredAt: { $exists: true }
    });
    const efficiency = totalDelivered > 0
      ? Math.round((onTimeDeliveries / totalDelivered) * 100)
      : 100;

    // Get delayed shipments
    const delayedShipments = await Shipment.countDocuments({ status: 'delayed' });

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('fromUser', 'username')
      .populate('toUser', 'username')
      .populate('product', 'name');

    // Format monthly activity data
    const formattedMonthlyActivity = monthlyActivity.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      transactions: item.transactions,
      shipments: Math.round(item.transactions * 0.8), // Placeholder calculation
      products: Math.round(item.transactions * 0.6) // Placeholder calculation
    }));

    res.json({
      totalUsers,
      totalProducts,
      totalTransactions,
      totalShipments,
      monthlyActivity: formattedMonthlyActivity,
      productDistribution,
      shipmentStatus: {
        pending: shipmentStatus.find(s => s.status === 'pending')?.count || 0,
        delivered: shipmentStatus.find(s => s.status === 'delivered')?.count || 0,
        delayed: shipmentStatus.find(s => s.status === 'delayed')?.count || 0
      },
      supplyChainHealth,
      qualityScore,
      efficiency,
      delayedShipments,
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ message: 'Error fetching metrics' });
  }
});

// Get supply chain metrics
router.get('/supply-chain', protect, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get supply chain efficiency metrics
    const supplyChainMetrics = await SystemMetric.find({
      type: 'supply_chain_efficiency',
      timestamp: { $gte: start, $lte: end },
      ...(category && { 'metadata.category': category })
    }).sort({ timestamp: -1 });
    
    // Get average delivery times
    const deliveryTimes = await Transaction.aggregate([
      {
        $match: {
          status: 'delivered',
          'shipmentDetails.actualDelivery': { $exists: true },
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $project: {
          deliveryTime: { 
            $subtract: ['$shipmentDetails.actualDelivery', '$createdAt'] 
          },
          category: 1
        }
      },
      {
        $group: {
          _id: null,
          averageDeliveryTime: { $avg: '$deliveryTime' },
          minDeliveryTime: { $min: '$deliveryTime' },
          maxDeliveryTime: { $max: '$deliveryTime' }
        }
      }
    ]);
    
    // Get delay statistics
    const delayStats = await Transaction.aggregate([
      {
        $match: {
          'shipmentDetails.delays': { $exists: true, $not: { $size: 0 } },
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $unwind: '$shipmentDetails.delays'
      },
      {
        $group: {
          _id: '$shipmentDetails.delays.reason',
          count: { $sum: 1 },
          averageResolutionTime: {
            $avg: {
              $cond: [
                { $ifNull: ['$shipmentDetails.delays.resolvedAt', false] },
                { $subtract: ['$shipmentDetails.delays.resolvedAt', '$shipmentDetails.delays.reportedAt'] },
                null
              ]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json({
      supplyChainMetrics,
      deliveryTimes: deliveryTimes[0] || {
        averageDeliveryTime: 0,
        minDeliveryTime: 0,
        maxDeliveryTime: 0
      },
      delayStats
    });
  } catch (error) {
    console.error('Error getting supply chain metrics:', error);
    res.status(500).json({ message: 'Error getting supply chain metrics' });
  }
});

// Get product analytics
router.get('/products', protect, async (req, res) => {
  try {
    const { startDate, endDate, category, subCategory } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Build match criteria
    const matchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    
    if (category) {
      matchCriteria.category = category;
    }
    
    if (subCategory) {
      matchCriteria.subCategory = subCategory;
    }
    
    // Get product distribution by category and subcategory
    const productDistribution = await Product.aggregate([
      {
        $match: matchCriteria
      },
      {
        $group: {
          _id: {
            category: '$category',
            subCategory: '$subCategory'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get product timeline statistics
    const productTimelines = await Product.aggregate([
      {
        $match: matchCriteria
      },
      {
        $unwind: '$timeline'
      },
      {
        $group: {
          _id: '$timeline.status',
          count: { $sum: 1 },
          averageDuration: {
            $avg: {
              $subtract: ['$timeline.date', '$createdAt']
            }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Get mechanical product metrics
    const mechanicalMetrics = await SystemMetric.find({
      type: 'mechanical_product_metrics',
      timestamp: { $gte: start, $lte: end },
      ...(category && { 'metadata.category': category })
    }).sort({ timestamp: -1 });
    
    res.json({
      productDistribution,
      productTimelines,
      mechanicalMetrics
    });
  } catch (error) {
    console.error('Error getting product analytics:', error);
    res.status(500).json({ message: 'Error getting product analytics' });
  }
});

// Get transaction analytics
router.get('/transactions', protect, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Build match criteria
    const matchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    
    if (status) {
      matchCriteria.status = status;
    }
    
    // Get transaction volume over time
    const transactionVolume = await Transaction.aggregate([
      {
        $match: matchCriteria
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);
    
    // Get transaction status distribution
    const statusDistribution = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get payment status distribution
    const paymentDistribution = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json({
      transactionVolume,
      statusDistribution,
      paymentDistribution
    });
  } catch (error) {
    console.error('Error getting transaction analytics:', error);
    res.status(500).json({ message: 'Error getting transaction analytics' });
  }
});

// Get user analytics (admin only)
router.get('/users', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get user registration over time
    const userRegistration = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);
    
    // Get user distribution by role
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get verification status distribution
    const verificationDistribution = await User.aggregate([
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get user activity metrics
    const userActivity = await SystemMetric.find({
      type: 'user_activity',
      timestamp: { $gte: start, $lte: end }
    }).sort({ timestamp: -1 });
    
    res.json({
      userRegistration,
      roleDistribution,
      verificationDistribution,
      userActivity
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ message: 'Error getting user analytics' });
  }
});

// Record a new metric
router.post('/', protect, async (req, res) => {
  try {
    const { type, name, value, metadata, source } = req.body;
    
    const newMetric = await SystemMetric.recordMetric({
      type,
      name,
      value,
      metadata,
      source,
      timestamp: new Date()
    });
    
    res.status(201).json(newMetric);
  } catch (error) {
    console.error('Error recording metric:', error);
    res.status(500).json({ message: 'Error recording metric' });
  }
});

// Get metrics by type and time range
router.get('/:type', protect, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, category, tags, limit, skip, sort, isAnomaly } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const options = {
      category,
      tags: tags ? tags.split(',') : undefined,
      limit: limit ? parseInt(limit) : 100,
      skip: skip ? parseInt(skip) : 0,
      sort: sort === 'asc' ? 1 : -1,
      isAnomaly: isAnomaly === 'true' ? true : undefined
    };
    
    const metrics = await SystemMetric.getMetrics(type, start, end, options);
    
    res.json(metrics);
  } catch (error) {
    console.error(`Error getting ${req.params.type} metrics:`, error);
    res.status(500).json({ message: `Error getting ${req.params.type} metrics` });
  }
});

// Get aggregated metrics
router.get('/:type/aggregated', protect, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, period, aggregationType } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const metrics = await SystemMetric.getAggregatedMetrics(
      type,
      period || 'daily',
      start,
      end,
      aggregationType || 'avg'
    );
    
    res.json(metrics);
  } catch (error) {
    console.error(`Error getting aggregated ${req.params.type} metrics:`, error);
    res.status(500).json({ message: `Error getting aggregated ${req.params.type} metrics` });
  }
});

module.exports = router;
