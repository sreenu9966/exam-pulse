const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  value: { type: Number, required: true },
  expiryDate: { type: Date },
  
  // Interlinking logic
  applicableTierLevels: [{ type: String, enum: ['BASIC', 'PRO', 'PREMIUM', 'LIFETIME'] }], 
  
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  minAmount: { type: Number, default: 0 },
  targetUsers: [{ type: String }], // Array of user codes
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coupon', couponSchema);
