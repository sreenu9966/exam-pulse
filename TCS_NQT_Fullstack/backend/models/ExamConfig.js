const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topics: [mongoose.Schema.Types.Mixed],
  count: { type: Number, default: 25 },
  mode: { type: String, enum: ['auto', 'manual', 'specific'], default: 'auto' },
  topicCounts: { type: Map, of: Number, default: {} },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: [] }]
});

const examConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, default: '' },
  examMode: { type: String, enum: ['Final', 'Mock', 'Practice'], default: 'Mock' },
  duration: { type: Number, required: true, default: 60 }, // in minutes
  instructions: { type: String, default: "" }, // Instructions Alarm Note Template
  sections: [sectionSchema]
}, { timestamps: true });

module.exports = mongoose.model('ExamConfig', examConfigSchema);
