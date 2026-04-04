const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userCode: { type: String, required: false },
  role: { type: String, default: 'Student' },
  text: { type: String, required: true },
  rating: { type: Number, default: 5 },
  approved: { type: Boolean, default: true },
  plan: { type: String, default: 'Website Visitor' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
