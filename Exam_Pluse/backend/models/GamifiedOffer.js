const mongoose = require('mongoose');

const gamifiedOfferSchema = new mongoose.Schema({
  gameType: { type: String, enum: ['scratch', 'spin', 'daily'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  rewards: [{
    type: { type: String, enum: ['discount_coupon', 'token', 'access'], required: true },
    value: { type: String, required: true },
    probability: { type: Number, required: true, min: 0, max: 100 }
  }],
  active: { type: Boolean, default: true },
  autoRefreshEvery: { type: Number, default: 24 }, // hours
  targetSegment: { type: String, default: 'all' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GamifiedOffer', gamifiedOfferSchema);
