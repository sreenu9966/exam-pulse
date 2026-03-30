const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  score: Number,
  total: Number,
  pct: Number,
  timeUsed: Number,
  examType: { type: String, default: '' },
  topics: { type: String, default: '' },
  page: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  answers: [{
    qText: String,
    topic: String,
    selected: Number, // index selected, or -1 if skipped
    correct: Number,  // index correct
    isCorrect: Boolean
  }]
});

const userSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: false, default: '', lowercase: true, trim: true },
  phone: { type: String, default: 'N/A' },
  utr: { type: String, default: 'CONFIG' },
  status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  attempts: [attemptSchema],
  practiceAnswers: { 
    type: Map, 
    of: {
      selected: Number,
      attempts: { type: Number, default: 0 },
      solved: { type: Boolean, default: false },
      points: { type: Number, default: 0 }
    },
    default: {}
  },
  totalPoints: { type: Number, default: 0 },
  plan: { type: String, enum: ['free', 'basic', 'pro', 'premium', 'lifetime'], default: 'free' },
  subscription: {
    planType: { type: String, enum: ['attempts', 'time', 'unlimited', 'daily_limit'], default: 'attempts' },
    maxAttempts: { type: Number, default: 2 },
    dailyExamsLimit: { type: Number, default: 5 }, // For Free/Basic tiers
    validUntil: { type: Date, default: null },
    unlimitedExams: { type: [String], default: [] }
  },
  moduleProgress: [{
    category: String,
    section: String,
    level: String,
    topic: String,
    completedModules: [Number]
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
