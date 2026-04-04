const mongoose = require('mongoose');
const { getSectionForTopic } = require('../config/mappings');

const questionSchema = new mongoose.Schema({
  s: { type: String, required: true, index: true },
  section: { type: String, index: true },
  subTopic: { type: String },
  q: { type: String, required: true },
  o: [{ type: String, required: true }],
  a: { type: String, required: true },
  explanation: { type: String },
  stats: { type: [Number], default: [0, 0, 0, 0] }
});

// Enable High-Speed Keyword Search (Text Index)
questionSchema.index({ q: 'text', s: 'text' });

// Automatic Section Assignment Middleware
questionSchema.pre('save', function(next) {
  if (this.isModified('s') || !this.section) {
    this.section = getSectionForTopic(this.s);
  }
  next();
});

module.exports = mongoose.model('Question', questionSchema);
