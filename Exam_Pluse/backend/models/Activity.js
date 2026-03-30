const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: { type: String, required: true }, // 'PAGE_VISIT', 'MODULE_COMPLETE'
  detail: { type: String }, 
  userCode: { type: String, index: true },
  category: { type: String }, // 'Aptitude'
  topic: { type: String },    // 'Numbers'
  duration: { type: Number, default: 0 }, // in seconds spent
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Activity', activitySchema);
