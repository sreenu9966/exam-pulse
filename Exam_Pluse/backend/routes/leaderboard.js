const router = require('express').Router();
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');

// GET /api/leaderboard — Enhanced rankings for Admin/Wide view
router.get('/', async (req, res) => {
  try {
    const Submission = require('../models/Submission');

    // 1. Aggregate submission stats per user
    const stats = await Submission.aggregate([
      { $match: { score: { $exists: true } } }, // Only exam submissions
      { $group: {
        _id: "$userCode",
        attemptCount: { $sum: 1 },
        firstPct: { $max: "$pct" },
        bestTime: { $min: "$timeUsed" }
      }}
    ]);

    const statsMap = Object.fromEntries(stats.map(s => [s._id, s]));

    // 2. Fetch active users and merge with stats
    const users = await User.find({ status: 'active' })
      .select('name code totalPoints currentStreak lastStreakDate')
      .sort({ totalPoints: -1, currentStreak: -1, name: 1 })
      .limit(100);

    const ranked = users.map((u, i) => {
      const s = statsMap[u.code] || { attemptCount: 0, firstPct: 0, bestTime: 0 };
      return {
        rank: i + 1,
        name: u.name,
        code: u.code,
        points: Math.round(u.totalPoints || 0),
        streak: u.currentStreak || 0,
        attemptCount: s.attemptCount,
        firstPct: Math.round(s.firstPct || 0),
        bestTime: s.bestTime || 0
      };
    });

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leaderboard/student-view — Tailored ranking for students (Top 5 + Window)
router.get('/student-view', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);

    // 1. Fetch and sort all users by points & streak
    const allUsers = await User.find({ status: 'active' })
      .select('name code totalPoints currentStreak lastStreakDate')
      .sort({ totalPoints: -1, currentStreak: -1, name: 1 });

    const totalStudents = allUsers.length;
    let currentUserRankIdx = allUsers.findIndex(u => u.code === decoded.code);
    
    // 2. Prepare the Ranked list with privacy-aware objects
    const ranked = allUsers.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      code: u.code,
      points: Math.round(u.totalPoints || 0),
      streak: u.currentStreak || 0,
      isCurrentUser: u.code === decoded.code
    }));

    // 3. Extract Top 5
    const top5 = ranked.slice(0, 5);

    // 4. Extract Surrounding Window (if user not in top 5)
    let surrounding = [];
    if (currentUserRankIdx > 4) {
      // Start window 2-3 above and extend below
      const start = Math.max(5, currentUserRankIdx - 2);
      const end = Math.min(totalStudents, currentUserRankIdx + 3);
      surrounding = ranked.slice(start, end);
    } else if (currentUserRankIdx === -1) {
       // Handle case where user has no activity yet (not in allUsers)
       // This shouldn't happen if they are active, but safely return empty surrounding
    } else {
       // User is in Top 5, surrounding can show the next few
       surrounding = ranked.slice(5, 8);
    }

    res.json({
      top5,
      surrounding,
      userRank: currentUserRankIdx + 1,
      totalStudents
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leaderboard/daily/:examKey — Fetch official midnight results
router.get('/daily/:examKey', async (req, res) => {
  try {
    const { examKey } = req.params;
    const latest = await Leaderboard.findOne({ examKey, snapshotType: 'exam' })
      .sort({ snapshotDate: -1 });
    
    if (!latest) return res.status(404).json({ error: 'No official results found yet.' });
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leaderboard/global/snapshot — Fetch official midnight global stats
router.get('/global/snapshot', async (req, res) => {
  try {
    const latest = await Leaderboard.findOne({ snapshotType: 'global' })
      .sort({ snapshotDate: -1 });
    
    if (!latest) return res.status(404).json({ error: 'No global snapshot found yet.' });
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
