const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  userCode: { type: String, required: true },
  userName: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
