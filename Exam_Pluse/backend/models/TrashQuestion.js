const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  s: { type: String, required: true, index: true },
  section: { type: String, index: true },
  subTopic: { type: String },
  q: { type: String, required: true },
  o: [{ type: String, required: true }],
  a: { type: String, required: true },
  stats: { type: [Number], default: [0, 0, 0, 0] }
}, { collection: 'trash_questions', timestamps: true });

module.exports = mongoose.model('TrashQuestion', questionSchema);

