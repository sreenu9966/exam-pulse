const router = require('express').Router();
const User = require('../models/User');

const Submission = require('../models/Submission');

// GET /api/leaderboard — top 50 by highest recorded percentage
router.get('/', async (req, res) => {
  try {
    const topSubmissions = await Submission.aggregate([
      { $group: { 
          _id: "$userCode", 
          maxPct: { $max: "$pct" },
          count: { $sum: 1 },
          lastDate: { $max: "$date" }
      }},
      { $sort: { maxPct: -1, lastDate: -1 } },
      { $limit: 50 }
    ]);

    const codes = topSubmissions.map(s => s._id);
    const users = await User.find({ code: { $in: codes } }).select('name code');
    const userMap = Object.fromEntries(users.map(u => [u.code, u.name]));

    const ranked = topSubmissions.map((s, i) => ({
      rank: i + 1,
      name: userMap[s._id] || 'Anonymous',
      code: s._id,
      firstPct: s.maxPct,
      attemptCount: s.count
    }));

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
