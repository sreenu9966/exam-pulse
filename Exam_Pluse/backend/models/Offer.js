const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priceOriginal: { type: Number, default: 399 },
  priceOffer: { type: Number, default: 1 },
  discount: { type: String, default: '99.7%' },
  
  tierLevel: { type: String, enum: ['FREE', 'BASIC', 'PRO', 'PREMIUM', 'LIFETIME'], default: 'PRO' },
  features: [{ type: String }], // e.g. ["Unlimited Exams", "Performance Tracking"]
  durationDays: { type: Number, default: 30 }, // 9999 for Lifetime
  
  // Rule-Based Logic Tracking
  usedCount: { type: Number, default: 0 },
  maxRedemptions: { type: Number, default: 1000 }, // "First 100" logic
  targetSegment: { type: String, enum: ['all', 'new', 'old'], default: 'all' },
  
  active: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Offer', offerSchema);
