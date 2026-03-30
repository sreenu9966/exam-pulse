const router = require('express').Router();
const User = require('../models/User');
const Submission = require('../models/Submission');

// GET /api/leaderboard — top 100 by highest recorded percentage
router.get('/', async (req, res) => {
  try {
    const topSubmissions = await Submission.aggregate([
      { $match: { pct: { $exists: true, $ne: null } } },
      { $sort: { pct: -1, timeUsed: 1, date: 1, submittedAt: 1 } },
      { $group: { 
          _id: "$userCode", 
          maxPct: { $first: "$pct" },
          bestTime: { $first: "$timeUsed" },
          count: { $sum: 1 },
          lastDate: { $first: { $ifNull: ["$submittedAt", "$date", "$createdAt"] } }
      }},
      { $sort: { maxPct: -1, bestTime: 1, lastDate: 1 } },
      { $limit: 100 }
    ]);

    const codes = topSubmissions.map(s => s._id);
    const users = await User.find({ code: { $in: codes } }).select('name code plan');
    const userMap = Object.fromEntries(users.map(u => [u.code, { name: u.name, plan: u.plan }]));

    const ranked = topSubmissions.map((s, i) => {
      const uInfo = userMap[s._id] || { name: 'Anonymous', plan: 'free' };
      return {
        rank: i + 1,
        name: uInfo.name,
        code: s._id,
        firstPct: s.maxPct,
        bestTime: s.bestTime,
        attemptCount: s.count,
        lastDate: s.lastDate,
        plan: uInfo.plan
      };
    });

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
