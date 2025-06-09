const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-transit', 'delivered', 'delayed'],
    default: 'pending'
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  expectedDeliveryDate: {
    type: Date,
    required: true
  },
  deliveredAt: {
    type: Date
  },
  delays: [{
    reason: String,
    reportedAt: Date,
    resolvedAt: Date,
    notes: String
  }],
  location: {
    current: {
      type: String,
      default: 'Origin'
    },
    history: [{
      location: String,
      timestamp: Date,
      status: String
    }]
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
shipmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment; 