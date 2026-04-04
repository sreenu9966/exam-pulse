const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', default: null }, // Null for Global snapshots
  examKey: { type: String, default: 'GLOBAL' },
  snapshotDate: { type: Date, required: true },
  snapshotType: { type: String, enum: ['exam', 'global'], required: true },
  
  rankings: [{
    rank: Number,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    score: Number,
    accuracy: Number,
    speed: Number,
    pointsAwarded: { type: Number, default: 0 } // Base pts + Referral pts earned from this exam
  }]
}, { timestamps: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
