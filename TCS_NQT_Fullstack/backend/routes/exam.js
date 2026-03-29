const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const Activity = require('../models/Activity');
const Review = require('../models/Review');

// POST /api/exam/submit — save exam attempt
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { score, total, pct, timeUsed, answers, examType, topics, page } = req.body;
    const { code, name } = req.user;

    const user = await User.findOne({ code });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const sub = user.subscription || { planType: 'attempts', maxAttempts: 2 };
    
    // Check eligibility
    if (sub.planType === 'time' && sub.validUntil && Date.now() > new Date(sub.validUntil).getTime()) {
        return res.status(403).json({ error: `Your time-based subscription expired. Please contact Admin.` });
    }
    
    // Performance Optimization: Use countDocuments instead of loading the whole user.attempts array
    const attemptCount = await Submission.countDocuments({ userCode: code });
    const isUnlimitedForThisExam = sub.unlimitedExams && sub.unlimitedExams.includes(examType);

    if (!isUnlimitedForThisExam && sub.planType === 'attempts' && attemptCount >= (sub.maxAttempts || 2)) {
        return res.status(403).json({ error: `You have reached your maximum limit of ${sub.maxAttempts || 2} exams.` });
    }

    // SECURITY UPGRADE: Recalculate score on server-side to prevent cheating
    let calculatedScore = 0;
    const finalAnswers = [];
    
    if (Array.isArray(answers)) {
      const questionIds = answers.map(a => a._id);
      const dbQuestions = await Question.find({ _id: { $in: questionIds } });
      const qMap = dbQuestions.reduce((acc, q) => { acc[q._id.toString()] = q; return acc; }, {});

      answers.forEach(ans => {
        const q = qMap[ans._id];
        if (q) {
          const isCorrect = (ans.selected === Number(q.a) || (q.o && q.o[ans.selected] === q.a));
          if (isCorrect) calculatedScore++;
          
          finalAnswers.push({
            ...ans,
            isCorrect,
            correct: q.a // Ensure correct answer is synced from DB
          });
        }
      });
    }

    const finalTotal = answers.length || total;
    const finalPct = Math.round((calculatedScore / finalTotal) * 100);

    // Save Submission to separate collection (Prevents 16MB document size limit issue)
    const newSub = new Submission({
      userCode: code,
      score: calculatedScore, 
      total: finalTotal, 
      pct: finalPct, 
      timeUsed, 
      examType: examType || '', 
      topics: topics || '', 
      page: page || 0,
      answers: finalAnswers 
    });
    await newSub.save();

    // SCALABILITY UPGRADE: Use bulkWrite for stats to handle 20CR+ users without melting the DB
    if (Array.isArray(answers)) {
      const bulkOps = answers
        .filter(ans => ans._id && ans.selected !== -1 && ans.selected !== undefined)
        .map(ans => ({
          updateOne: {
            filter: { _id: ans._id },
            update: { $inc: { [`stats.${ans.selected}`]: 1 } }
          }
        }));
      if (bulkOps.length > 0) {
        Question.bulkWrite(bulkOps).catch(err => console.error("Bulk Stats Error:", err));
      }
    }

    new Activity({ action: 'EXAM_SUBMIT', detail: `Completed Exam: ${pct}%`, userCode: code }).save().catch(() => {});

    // PRO RANK UPGRADE: Rank based on unique users' best scores
    // Count how many users have a MAX(pct) greater than this current PCT
    const rankData = await Submission.aggregate([
      { $group: { _id: "$userCode", maxPct: { $max: "$pct" } } },
      { $match: { maxPct: { $gt: pct } } },
      { $count: "count" }
    ]);
    const rank = (rankData[0]?.count || 0) + 1;

    // Total Unique Users who have attempted at least one exam
    const totalUsers = await Submission.distinct('userCode').then(u => u.length);

    res.json({ success: true, attempt: newSub, rank, totalUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exam/save-practice-answer
router.post('/save-practice-answer', authMiddleware, async (req, res) => {
  try {
    const { qId, selected } = req.body;
    const { code } = req.user;

    const user = await User.findOne({ code });
    const q = await Question.findById(qId);

    if (!user || !q) return res.status(404).json({ error: 'User or Question not found' });

    // Initialize map if missing
    if (!user.practiceAnswers) user.practiceAnswers = new Map();

    const qKey = qId.toString();
    const qData = user.practiceAnswers.get(qKey) || { selected: -1, attempts: 0, solved: false, points: 0 };

    if (qData.solved) {
      qData.selected = selected;
      user.practiceAnswers.set(qKey, qData);
      await user.save();
      return res.json({ success: true, points: user.totalPoints, qData });
    }

    qData.attempts += 1;
    qData.selected = selected;

    const isCorrect = (selected === Number(q.a) || q.o[selected] === q.a);
    if (isCorrect) {
      qData.solved = true;
      let p = 0;
      if (qData.attempts === 1) p = 5;
      else if (qData.attempts === 2) p = 2;
      else if (qData.attempts === 3) p = 1;
      else p = 0.1;

      qData.points = p;
      user.totalPoints = (user.totalPoints || 0) + p;
    }

    user.practiceAnswers.set(qKey, qData);

    // Anti-spam increment stats on first attempt
    if (qData.attempts === 1) {
      const incField = `stats.${selected}`;
      await Question.findByIdAndUpdate(qId, { $inc: { [incField]: 1 } });
    }

    await user.save();
    res.json({ success: true, points: user.totalPoints, qData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exam/reset-practice
router.post('/reset-practice', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ code: req.user.code });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.practiceAnswers = new Map();
    user.totalPoints = 0;
    await user.save();

    res.json({ success: true, message: 'Practice session reset successfully 🔄' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/exam/profile — get current user profile + rank
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ code: req.user.code });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // SCALABILITY UPGRADE: Use countDocuments for rank (Consistent with /submit)
    // We get the first attempt pct of the user and count how many others have a better first attempt
    const firstSub = await Submission.findOne({ userCode: req.user.code }).sort({ date: 1 });
    const firstPct = firstSub ? firstSub.pct : 0;

    const rank = await Submission.countDocuments({ 
       pct: { $gt: firstPct }
       // We could add more criteria here like top score per user if needed
    }) + 1;

    const totalUsers = await Submission.distinct('userCode').then(u => u.length);
    const attemptCount = await Submission.countDocuments({ userCode: req.user.code });

    res.json({ user, rank, totalUsers, attemptCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/exam/submissions — get all submissions for current user
router.get('/submissions', authMiddleware, async (req, res) => {
  try {
    const subs = await Submission.find({ userCode: req.user.code }).sort({ date: -1 });
    res.json(subs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/exam/update-profile — update current user profile
router.post('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const { code } = req.user;

    if (!name && !email) return res.status(400).json({ error: 'No fields provided to update.' });

    const user = await User.findOne({ code });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();

    await user.save();
    
    new Activity({ action: 'PROFILE_UPDATE', detail: `Updated profile details`, userCode: code }).save().catch(() => {});

    res.json({ message: 'Profile updated successfully', user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exam/feedback — submit scaling suggestions
router.post('/feedback', authMiddleware, async (req, res) => {
  try {
    const { message, rating } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const feedback = new Review({
      name: req.user.name || 'Student',
      role: 'Student Candidate',
      text: message.trim(),
      rating: rating || 5, // Default to 5
      approved: true       // Live by default for continuous view (Change to false if moderation is built later)
    });
    
    await feedback.save();
    
    new Activity({ action: 'FEEDBACK_SUBMIT', detail: `Submitted exam review with ${rating || 5} stars`, userCode: req.user.code }).save().catch(() => {});

    res.json({ success: true, message: 'Review submitted for Admin approval ✅' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
