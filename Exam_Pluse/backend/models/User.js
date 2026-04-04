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
  currentStreak: { type: Number, default: 0 },
  lastStreakDate: { type: Date, default: null },
  referralCode: { type: String, unique: true, uppercase: true, index: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  referralPath: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of up to 3 parent referrers
  pointsHistory: [{
    amount: Number,
    reason: String, // 'exam_rank', 'referral_l1', 'referral_l2', 'referral_l3'
    date: { type: Date, default: Date.now }
  }],
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
  featureAccess: {
    fullMocks: { type: Boolean, default: false },
    allowedExams: { type: [String], default: [] }, // Array of examKeys
    pyqDatabase: { type: Boolean, default: false },
    allowedPYQs: { type: [String], default: [] }, // Array of categories
    aiInsights: { type: Boolean, default: false },
    allowedAIModules: { type: [String], default: ['radar', 'trends', 'topicPerf', 'timeSpent'] }, 
    leaderboardRank: { type: Boolean, default: false },
    sectionalTests: { type: Boolean, default: false },
    allowedTopics: { type: [String], default: [] }, // Array of topic names
    maxPracticeModules: { type: Number, default: 5 }, // Granular module limit for Practice Mode
    supportHub: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
