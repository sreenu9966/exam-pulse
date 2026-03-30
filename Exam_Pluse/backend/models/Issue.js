const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  userCode: { type: String, required: true, uppercase: true },
  userName: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', issueSchema);
