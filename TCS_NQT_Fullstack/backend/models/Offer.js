const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priceOriginal: { type: Number, default: 399 },
  priceOffer: { type: Number, default: 1 },
  discount: { type: String, default: '99.7%' },
  active: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Offer', offerSchema);
