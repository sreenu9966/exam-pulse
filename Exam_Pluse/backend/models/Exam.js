const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  count: { type: Number, default: 5 },
  mode: { type: String, enum: ['AUTO', 'MANUAL'], default: 'AUTO' },
  selectedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topics: [topicSchema]
}, { _id: false });

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  startTime: { type: String, default: "08:30" },
  endTime: { type: String, default: "18:30" },
  resultTime: { type: String, default: "00:00" },
  duration: { type: Number, default: 60 },
  leaderboardEnabled: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  examKey: { type: String, unique: true, required: true },

  // ── Classification Layer ──
  category: { type: String, default: 'Mock' },       // IT, State, Central, Banks, Companies, Mock
  subCategory: { type: String, default: 'General' }, // e.g. "Andhra Pradesh", "SBI", "FAANG"
  mode: { type: String, enum: ['mock', 'final', 'practice'], default: 'mock' },

  // ── Question Architecture ──
  sections: [sectionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
