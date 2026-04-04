const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  // Exam Submissions
  userCode: { type: String, required: false, index: true },
  score: Number,
  total: Number,
  pct: Number,
  accuracy: { type: Number, default: 0 },
  speedScore: { type: Number, default: 0 },
  weightedScore: { type: Number, default: 0 },
  timeUsed: Number,
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', default: null },
  examType: String,
  topics: String,
  page: Number,
  answers: [{
    _id: String,
    qText: String,
    topic: String,
    options: [String],
    selected: Number,
    correct: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean
  }],
  
  // Payment Requests (Overloaded)
  name: String,
  email: String,
  utr: { type: String, index: true },
  phone: String,
  amount: Number,
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  generatedCode: String,
  planRequested: { type: String, default: 'Free Trial' },
  rejectionReason: String,
  processedAt: Date,

  date: { type: Date, default: Date.now, index: true },
  submittedAt: { type: Date, default: Date.now } // Form layout expects submittedAt
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
