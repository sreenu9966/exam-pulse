const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const TrashQuestion = require('../models/TrashQuestion');
const Config = require('../models/Config');
const Review = require('../models/Review');
const Activity = require('../models/Activity');
const Issue = require('../models/Issue');
const Offer = require('../models/Offer');
const Coupon = require('../models/Coupon');
const GamifiedOffer = require('../models/GamifiedOffer');

// Generate access code: UTR-YYYYMMDD-RANDOMHASH
function genCode(utr) {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const hash = Math.random().toString(36).substring(2,14).toUpperCase().padEnd(12,'0');
  return `${String(utr).toUpperCase().trim()}-${dateStr}-${hash}`;
}

// GET /api/admin/mapping — Fetch centralized topic-to-section mapping
router.get('/mapping', adminAuth, async (req, res) => {
  try {
    const master = await getMasterMapping(Question, Config);
    res.json({ CATEGORY_MAP: master });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch mapping' });
  }
});

// Activity logging helper

function logActivity(action, detail, userCode = null, isAdmin = false) {
  new Activity({ action, detail, userCode, isAdmin }).save().catch(err => console.error("Log Error:", err));
}

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  const correct = process.env.ADMIN_PASS || 'ADMIN@NQT2026';
  if (password !== correct) return res.status(401).json({ error: 'Wrong password' });
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  logActivity('LOGIN', 'Admin logged in');
  res.json({ token });
});

// Admin auth middleware (inline)
function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Not admin' });
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ═══════════════ SUBMISSIONS ═══════════════

// GET /api/admin/submissions
router.get('/submissions', adminAuth, async (req, res) => {
  try {
    const subs = await Submission.find().sort({ submittedAt: -1 });
    res.json(subs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/approve/:id
router.post('/approve/:id', adminAuth, async (req, res) => {
  try {
    const { planType } = req.body; // 'basic' or 'premium'
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });

    const code = genCode(sub.utr);
    sub.status = 'approved';
    sub.generatedCode = code;
    sub.processedAt = new Date();
    await sub.save();

    const existing = await User.findOne({ code });
    if (!existing) {
      let maxExams = 1; let validUntil = null;
      if (planType === 'basic') { maxExams = 15; validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); }
      else if (planType === 'premium') { maxExams = 9999; validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); }

      await User.create({ 
        code, 
        name: sub.name || 'Pending User', 
        email: sub.email || `user_${code.slice(-6).toLowerCase()}@tcsnqt.test`,
        phone: (sub.phone && sub.phone !== 'N/A' && sub.phone.trim() !== '') ? sub.phone : 'N/A',
        utr: sub.utr, 
        status: 'active', 
        plan: planType || 'free',
        maxExams,
        validUntil,
        attempts: [] 
      });
    }

    logActivity('APPROVE', `Approved ${sub.name} (UTR: ${sub.utr})`, code);
    res.json({ success: true, code, submission: sub });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/reject/:id
router.post('/reject/:id', adminAuth, async (req, res) => {
  try {
    const sub = await Submission.findByIdAndUpdate(req.params.id, { status: 'rejected', processedAt: new Date() }, { new: true });
    logActivity('REJECT', `Rejected submission ${sub?.name || req.params.id}`);
    res.json({ success: true, submission: sub });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/submissions/:id
router.delete('/submissions/:id', adminAuth, async (req, res) => {
  try {
    const sub = await Submission.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });
    logActivity('DELETE_SUBMISSION', `Deleted submission ${sub.name || req.params.id} (UTR: ${sub.utr || 'N/A'})`);
    res.json({ success: true, message: 'Submission deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════ USERS ═══════════════

// GET /api/admin/users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    // SCALABILITY UPGRADE: Attach attempt counts from Submission collection
    const codes = users.map(u => u.code);
    const counts = await Submission.aggregate([
       { $match: { userCode: { $in: codes } } },
       { $group: { _id: "$userCode", count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id, c.count]));

    const usersWithCounts = users.map(u => ({
      ...u.toObject(),
      attemptCount: countMap[u.code] || 0
    }));

    res.json(usersWithCounts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/submissions/:userCode — Fetch submissions for a specific user
router.get('/submissions/:userCode', adminAuth, async (req, res) => {
  try {
    const subs = await Submission.find({ userCode: req.params.userCode }).sort({ date: -1 });
    res.json(subs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/user/:code — Edit user
router.put('/user/:code', adminAuth, async (req, res) => {
  try {
    const { name, email, phone, plan, status, subscription } = req.body;
    const update = {};
    if (name)  update.name  = name;
    if (email) update.email = email;
    if (phone) update.phone = phone;
    if (plan)  update.plan  = plan;
    if (status) update.status = status;
    if (subscription) update.subscription = subscription;
    const user = await User.findOneAndUpdate({ code: req.params.code.toUpperCase() }, update, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    logActivity('EDIT_USER', `Edited user ${user.name} (${user.code})`, user.code);
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/user/:code — Delete user permanently + cascade cleanup
router.delete('/user/:code', adminAuth, async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const user = await User.findOneAndDelete({ code });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // SCALABILITY UPGRADE: Cascade delete all related data to prevent orphaned records
    await Promise.all([
      Submission.deleteMany({ userCode: code }),
      Activity.deleteMany({ userCode: code }),
      Issue.deleteMany({ userCode: code })
    ]);

    logActivity('DELETE_USER', `Deleted user ${user.name} (${user.code}) and all associated data`, user.code);
    res.json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/reset/:code — Reset user progress and delete all exam history
router.post('/reset/:code', adminAuth, async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const user = await User.findOneAndUpdate({ code }, { attempts: [], moduleProgress: [], totalPoints: 0, practiceAnswers: new Map() }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // SCALABILITY UPGRADE: Clear the Submission collection for this user
    await Submission.deleteMany({ userCode: code });
    
    logActivity('RESET', `Reset all exams and progress for ${user.name}`, user.code);
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/revoke/:code
router.post('/revoke/:code', adminAuth, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ code: req.params.code.toUpperCase() }, { status: 'revoked' }, { new: true });
    logActivity('REVOKE', `Revoked access for ${user?.name}`, user?.code);
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/sections — List unique question sections
router.get('/sections', adminAuth, async (req, res) => {
  try {
    const sections = await Question.distinct('s');
    res.json(sections);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/questions — List questions with filters & pagination
router.get('/questions', adminAuth, async (req, res) => {
  try {
    const { topic, search, topics, page = 1, limit = 50 } = req.query;
    let query = {};
    
    // 1. Search Filter (Global) - Prioritize search over topic filters
    if (search) {
      query.$or = [
        { q: { $regex: search, $options: 'i' } },
        { s: { $regex: search, $options: 'i' } },
        { 'q.text': { $regex: search, $options: 'i' } }
      ];
    } else {
    // 2. Topic/Category Filter (Only apply if NOT searching globally)
    const getTopicQueryMatch = (tStr) => {
      const map = {
        'Number System, LCM & HCF': ['Numbers', 'Problems on Numbers', 'Problems on H.C.F and L.C.M', 'Number System, LCM & HCF'],
        'Percentages': ['Percentages', 'Percentage', 'Percentages'],
        'Profit and Loss': ['Profit and Loss', 'Simple Interest', 'Compound Interest', 'Profit and Loss'],
        'Numbers & Decimal Fractions': ['Decimal Fraction', 'Simplification', 'Square Root and Cube Root', 'Surds and Indices', 'Numbers & Decimal Fractions'],
        'Ratios, Proportion, and Averages': ['Ratio and Proportion', 'Average', 'Averages', 'Ratios, Proportion, and Averages'],
        'Speed Time and Distance': ['Speed Time and Distance', 'Time and Distance', 'Problems on Trains', 'Boats and Streams', 'Races and Games', 'Speed Time and Distance'],
        'Work and Time': ['Time and Work', 'Work and Time', 'Pipes and Cistern', 'Chain Rule', 'Work and Time'],
        'Geometry': ['Area', 'Volume and Surface Area', 'Geometry', 'Height and Distance', 'Areas, Shapes & Perimeter'],
        'Probability': ['Probability', 'Stocks and Shares'],
        'P&C': ['Permutation and Combination', 'P&C', 'P&C (Permutations & Combinations)'],
        'P&C (Permutations & Combinations)': ['Permutation and Combination', 'P&C', 'P&C (Permutations & Combinations)'],
        'Clocks & Calendar': ['Calendar', 'Calendar & Clock', 'Clock', 'Clocks & Calendar', 'Calendar & Clock'],
        'Ages': ['Ages', 'Problems on Ages'],
        'Allegations and Mixtures': ['Alligation or Mixture', 'Allegations and Mixtures', 'Partnership'],
        'Number Series': ['Number Series', 'Odd Man Out and Series', 'Odd Man Out'],
        'Data Sufficiency': ['Data Sufficiency'],
        'Statement and Conclusion': ['Statement & Conclusion', 'Statement and Conclusion'],
        'Coding-Decoding': ['Coding-Decoding'],
        'Blood Relations': ['Blood Relations'],
        'Mathematical Operations': ['Mathematical Operations', 'Symbols and Notations'],
        'Data Interpretation': ['Data Interpretation'],
        'Distance and Directions': ['Direction Sense', 'Distance and Directions']
      };
      return map[tStr] || [tStr];
    };

    if (!search) {
      if (topic && topic !== 'All') {
        const strictMatchArr = getTopicQueryMatch(topic);
        query.s = { $in: [...strictMatchArr, new RegExp(topic.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&'), 'i')] };
      } else if (topics) {
        try {
          const list = typeof topics === 'string' ? JSON.parse(topics) : topics;
          if (Array.isArray(list) && list.length > 0) {
            let expandedList = [];
            list.forEach(t => {
              if (t) {
                expandedList.push(...getTopicQueryMatch(t));
                expandedList.push(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
              }
            });
            query.s = { $in: [...new Set(expandedList)] }; // Ensure unique entries
          }
        } catch (err) {
          console.error("Topics parse error:", err);
        }
      }
    }
    }

    // 3. Pagination Logic
    const skipCount = (parseInt(page) - 1) * parseInt(limit);
    const [questions, total] = await Promise.all([
      Question.find(query).sort({ updatedAt: -1 }).skip(skipCount).limit(parseInt(limit)),
      Question.countDocuments(query)
    ]);

    res.json({
      questions,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const { CATEGORY_MAP, getMasterMapping } = require('../config/mappings');

// POST /api/admin/questions/recategorize — Sync/Link questions to subtopics
router.post('/questions/recategorize', adminAuth, async (req, res) => {
  try {
    const questions = await Question.find({});
    let updated = 0;

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const correctSection = getSectionForTopic(q.s);
        
        if (q.section !== correctSection) {
            await Question.findByIdAndUpdate(q._id, { section: correctSection });
            updated++;
        }
    }

    res.json({ success: true, updated, total: questions.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/questions/diagnostic — Return validation checklist rows
router.get('/questions/diagnostic', adminAuth, async (req, res) => {
  try {
    const { category } = req.query;
    const topicsList = CATEGORY_MAP[category] || [];
    const questions = await Question.find({ section: category }).limit(100); 

    res.json({ questions, topics: topicsList });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/questions/bulk — Bulk upload questions
router.post('/questions/bulk', adminAuth, async (req, res) => {
  try {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Payload must be an array of questions' });
    }

    const { getSectionForTopic } = require('../config/mappings');
    const processed = questions.map(q => {
      const topicString = q.s || q.topic || 'General';
      return {
        ...q,
        s: topicString,
        section: getSectionForTopic(topicString) || 'Other'
      };
    });

    const result = await Question.insertMany(processed);
    logActivity('BULK_ADD_Q', `Bulk added ${result.length} questions`);
    res.json({ success: true, count: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/question — Add new question
router.post('/question', adminAuth, async (req, res) => {
  try {
    const { s, q, o, a } = req.body;
    if (!s || !q || !o || a === undefined) return res.status(400).json({ error: 'All fields required' });
    const doc = await Question.create({ s, q, o, a });
    logActivity('ADD_Q', `Added question in ${s}`);
    res.json({ success: true, question: doc });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/question/:id — Edit question
router.put('/question/:id', adminAuth, async (req, res) => {
  try {
    const { s, q, o, a } = req.body;
    const doc = await Question.findByIdAndUpdate(req.params.id, { s, q, o, a }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Question not found' });
    logActivity('EDIT_Q', `Edited question in ${s}`);
    res.json({ success: true, question: doc });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/question/:id — Delete question
// DELETE /api/admin/question/:id — Soft Delete (Move to Trash)
router.delete('/question/:id', adminAuth, async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    
    // Create in Trash Collection
    const trashData = q.toObject();
    delete trashData._id; // remove id to allow new generation or keep if needed, but safe to strip for fresh re-insert in some mongo configs
    await TrashQuestion.create(trashData);
    
    // Delete from Question Collection
    await Question.findByIdAndDelete(req.params.id);
    
    logActivity('DEL_Q', `Moved question to Trash from ${q.s}`);
    res.json({ success: true, message: 'Moved to Trash' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/questions/bulk-transfer — Move questions to a new section/topic
router.post('/questions/bulk-transfer', adminAuth, async (req, res) => {
  try {
    const { ids, targetSection, targetTopic } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No question IDs provided' });
    if (!targetSection || !targetTopic) return res.status(400).json({ error: 'Target section and topic are required' });
    const { getSectionForTopic } = require('../config/mappings');
    const correctSection = getSectionForTopic(targetTopic);

    const result = await Question.updateMany(
      { _id: { $in: ids } },
      { $set: { s: targetTopic, subTopic: targetTopic, section: correctSection } }
    );
    logActivity('TRANSFER_Q', `Transferred ${ids.length} questions to ${correctSection} > ${targetTopic}`);
    res.json({ success: true, modifiedCount: result.modifiedCount, section: correctSection });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ═══════════════ STATS & ACTIVITY ═══════════════

// GET /api/admin/stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [pending, approved, rejected, activeUsersCount, totalAttempts, totalQuestions, totalUsers, unresolvedIssues, planStats] = await Promise.all([
      Submission.countDocuments({ status: 'pending' }),
      Submission.countDocuments({ status: 'approved' }),
      Submission.countDocuments({ status: 'rejected' }),
      User.countDocuments({ status: 'active' }),
      Submission.countDocuments({ date: { $exists: true } }), 
      Question.countDocuments(),
      User.countDocuments(),
      Issue.countDocuments({ status: { $ne: 'resolved' } }),
      User.aggregate([{ $group: { _id: "$plan", count: { $sum: 1 } } }])
    ]);

    const usersByPlan = { Basic: 0, Pro: 0, Enterprise: 0 };
    planStats.forEach(p => {
      if (p._id === 'basic') usersByPlan.Basic = p.count;
      if (p._id === 'pro') usersByPlan.Pro = p.count;
      if (p._id === 'premium' || p._id === 'enterprise') usersByPlan.Enterprise = p.count;
    });

    res.json({ pending, approved, rejected, activeUsers: activeUsersCount, totalAttempts, totalQuestions, totalUsers, unresolvedIssues, usersByPlan });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/stats/duplicates — Find duplicate questions (paginated)
router.get('/stats/duplicates', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const allDupes = await Question.aggregate([
      { $addFields: { qText: { $cond: [{ $eq: [{ $type: '$q' }, 'object'] }, { $ifNull: ['$q.text', ''] }, '$q'] } } },
      { $addFields: { qNorm: { $trim: { input: { $toLower: '$qText' } } } } },
      { $group: { _id: '$qNorm', count: { $sum: 1 }, section: { $first: '$section' }, topic: { $first: '$s' }, ids: { $push: '$_id' }, qText: { $first: '$qText' }, o: { $first: '$o' }, a: { $first: '$a' } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const totalGroups = allDupes.length;
    const totalExtras = allDupes.reduce((a, d) => a + (d.count - 1), 0);
    const totalInstances = allDupes.reduce((a, d) => a + d.count, 0);

    const bySection = {};
    allDupes.forEach(d => {
      const sec = d.section || 'Unknown';
      if (!bySection[sec]) bySection[sec] = { groups: 0, extras: 0 };
      bySection[sec].groups++;
      bySection[sec].extras += (d.count - 1);
    });

    const paginated = allDupes.slice(skip, skip + limit).map(d => ({
      questionText: d.qText || '(empty)',
      options: d.o || [],
      answer: d.a,
      count: d.count,
      section: d.section || '?',
      topic: d.topic || '?',
      ids: d.ids,
      keepId: d.ids[0],
      deleteIds: d.ids.slice(1)
    }));

    res.json({ totalGroups, totalExtras, totalInstances, bySection, dupes: paginated, page, totalPages: Math.ceil(allDupes.length / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/questions/purge-duplicates-group — Delete extras for one group (keep first)
router.post('/questions/purge-duplicates-group', adminAuth, async (req, res) => {
  try {
    const { deleteIds } = req.body;
    if (!deleteIds || deleteIds.length === 0) return res.status(400).json({ error: 'No IDs to delete' });
    const result = await Question.deleteMany({ _id: { $in: deleteIds } });
    logActivity('PURGE_DUPES', `Purged ${result.deletedCount} duplicate questions`);
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/questions/purge-all-duplicates — Delete ALL extras across entire DB
router.post('/questions/purge-all-duplicates', adminAuth, async (req, res) => {
  try {
    const allDupes = await Question.aggregate([
      { $addFields: { qNorm: { $trim: { input: { $toLower: { $cond: [{ $eq: [{ $type: '$q' }, 'object'] }, { $ifNull: ['$q.text', ''] }, '$q'] } } } } } },
      { $group: { _id: '$qNorm', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    const toDelete = allDupes.flatMap(d => d.ids.slice(1));
    const result = await Question.deleteMany({ _id: { $in: toDelete } });
    logActivity('PURGE_ALL_DUPES', `Purged ${result.deletedCount} duplicate questions from entire DB`);
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/stats/questions — Detailed breakdown
router.get('/stats/questions', adminAuth, async (req, res) => {
  try {
    const grouped = await Question.aggregate([
      { $group: { _id: '$section', count: { $sum: 1 } } }
    ]);
    const sections = {};
    grouped.forEach(g => { if (g._id) sections[g._id] = g.count; });
    res.json({ sections });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/analytics — Charts Data
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const submissions = await Submission.aggregate([
      { $match: { submittedAt: { $gte: startDate } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$submittedAt", new Date()] } } }, 
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, { $ifNull: ["$amount", 0] }, 0] } }
      } },
      { $sort: { _id: 1 } }
    ]);

    const users = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$createdAt", new Date()] } } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const attempts = await Submission.aggregate([
      { $match: { date: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$date", new Date()] } } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Consolidate into daily intervals for Recharts
    const datesMap = {};
    const d = new Date(startDate);
    const today = new Date();
    while (d <= today) {
      const dStr = d.toISOString().split('T')[0];
      datesMap[dStr] = { date: dStr, submissions: 0, registrations: 0, attempts: 0, revenue: 0 };
      d.setDate(d.getDate() + 1);
    }

    submissions.forEach(s => { if (datesMap[s._id]) { datesMap[s._id].submissions = s.count; datesMap[s._id].revenue = s.revenue; } });
    users.forEach(u => { if (datesMap[u._id]) datesMap[u._id].registrations = u.count; });
    attempts.forEach(a => { if (datesMap[a._id]) datesMap[a._id].attempts = a.count; });

    const [approved, rejected, pending] = await Promise.all([
      Submission.countDocuments({ status: 'approved', submittedAt: { $gte: startDate } }),
      Submission.countDocuments({ status: 'rejected', submittedAt: { $gte: startDate } }),
      Submission.countDocuments({ status: 'pending', submittedAt: { $gte: startDate } })
    ]);

    // SCALABILITY UPGRADE: Group performance by Exam Title for the breakdown widget
    const examBreakdown = await Submission.aggregate([
      { $match: { date: { $exists: true } } },
      { $group: { 
          _id: "$title", 
          avgScore: { $avg: { $cond: ["$answers.isCorrect", 100, 0] } },
          count: { $sum: 1 }
      } }
    ]);

    const strengthsRaw = await Submission.aggregate([
      { $match: { date: { $exists: true } } }, // Filter to exam submissions
      { $unwind: "$answers" },
      { $group: { 
          _id: "$answers.topic", 
          score: { $avg: { $cond: ["$answers.isCorrect", 100, 0] } } 
      } }
    ]);

    const strengths = [
      { subject: "Aptitude", A: Math.round(strengthsRaw.find(s => s._id === "Aptitude")?.score || 60), fullMark: 100 },
      { subject: "Reasoning", A: Math.round(strengthsRaw.find(s => s._id === "Reasoning")?.score || 75), fullMark: 100 },
      { subject: "Verbal", A: Math.round(strengthsRaw.find(s => s._id === "Verbal")?.score || 55), fullMark: 100 },
      { subject: "Technical", A: Math.round(strengthsRaw.find(s => s._id === "Technical")?.score || 85), fullMark: 100 },
      { subject: "Logic", A: Math.round(strengthsRaw.find(s => s._id === "Logic")?.score || 65), fullMark: 100 }
    ];

    res.json({ 
      timeline: Object.values(datesMap), 
      pie: [
        { name: 'Approved', value: approved },
        { name: 'Rejected', value: rejected },
        { name: 'Pending', value: pending }
      ],
      strengths,
      examBreakdown: examBreakdown.map(e => ({
        name: e._id || 'Standard',
        accuracy: Math.round(e.avgScore || 0),
        count: e.count
      }))
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/activity — Recent activity log
router.get('/activity', adminAuth, async (req, res) => {
  try {
    const logs = await Activity.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs.map(l => ({ action: l.action, detail: l.detail, time: l.createdAt })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/change-password — Change admin password
router.post('/change-password', adminAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const correct = process.env.ADMIN_PASS || 'ADMIN@NQT2026';
  if (currentPassword !== correct) return res.status(401).json({ error: 'Current password is incorrect' });
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
  process.env.ADMIN_PASS = newPassword;
  logActivity('PASSWORD', 'Admin password changed');
  res.json({ success: true, message: 'Password updated successfully' });
});

// ═══════════════ OFFERS ═══════════════
  // Offer is already imported at the top

// GET /api/admin/offers — List all offers
router.get('/offers', adminAuth, async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/offers — Create new offer
router.post('/offers', adminAuth, async (req, res) => {
  try {
    const { title, priceOriginal, priceOffer, discount } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const offer = new Offer({ title, priceOriginal, priceOffer, discount });
    await offer.save();
    logActivity('OFFER', `Created offer: ${title}`);
    res.json(offer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/offers/:id/toggle — Activate/Deactivate
router.post('/offers/:id/toggle', adminAuth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    if (!offer.active) await Offer.updateMany({ _id: { $ne: offer._id } }, { active: false });
    offer.active = !offer.active;
    await offer.save();
    logActivity('OFFER', `${offer.active ? 'Activated' : 'Deactivated'} offer: ${offer.title}`);
    res.json(offer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/offers/:id/delete — Delete offer
router.post('/offers/:id/delete', adminAuth, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    logActivity('OFFER', `Deleted offer: ${offer.title}`);
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════ SUPPORT ═══════════════
// Issue is already imported at the top


// POST /api/admin/support — Submit Issue (Public)
router.post('/support', async (req, res) => {
  try {
    const { userCode, userName, message } = req.body;
    if (!userCode || !userName || !message) return res.status(400).json({ error: 'All fields required' });
    const doc = await Issue.create({ userCode, userName, message });
    logActivity('SUPPORT_ADD', `New issue from ${userName} (${userCode})`);
    res.json({ success: true, issue: doc });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/issues — List all Support tickets (Admin)
router.get('/issues', adminAuth, async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/issues/:id/resolve — Mark resolved (Admin)
router.post('/issues/:id/resolve', adminAuth, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    logActivity('SUPPORT_RESOLVE', `Resolved issue from ${issue.userName}`);
    res.json({ success: true, issue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════ EXAMS & CONFIGURATIONS ═══════════════
const ExamConfig = require('../models/ExamConfig');
const ExamConfigsStatic = require('../config/ExamConfigs'); // Fallback seed configs

// GET /api/admin/exams — List all dynamic configurations
router.get('/exams', adminAuth, async (req, res) => {
  try {
    const exams = await ExamConfig.find().sort({ category: 1, title: 1 });
    res.json(exams);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/exam — Create new configuration
router.post('/exam', adminAuth, async (req, res) => {
  try {
    const { key, title, category, subCategory, examMode, duration, instructions, sections } = req.body;
    if (!key || !title || !category) return res.status(400).json({ error: 'Key, Title, and Category are required' });
    const exam = await ExamConfig.create({ key, title, category, subCategory, examMode, duration, instructions, sections });
    logActivity('ADD_EXAM', `Added exam config: ${title}`);
    res.json({ success: true, exam });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/exam/:id — Edit configuration
router.put('/exam/:id', adminAuth, async (req, res) => {
  try {
    const { title, category, subCategory, examMode, duration, instructions, sections } = req.body;
    const exam = await ExamConfig.findByIdAndUpdate(req.params.id, { title, category, subCategory, examMode, duration, instructions, sections }, { new: true });
    if (!exam) return res.status(404).json({ error: 'Exam configuration not found' });
    logActivity('EDIT_EXAM', `Edited exam config: ${title}`);
    res.json({ success: true, exam });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/exam/:id — Delete configuration
router.delete('/exam/:id', adminAuth, async (req, res) => {
  try {
    const exam = await ExamConfig.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam configuration not found' });
    logActivity('DEL_EXAM', `Deleted exam config: ${exam.title}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/exams/seed — Seeding Migrations Helper
router.post('/exams/seed', adminAuth, async (req, res) => {
  try {
    let count = 0;
    for (const [key, config] of Object.entries(ExamConfigsStatic)) {
      const existing = await ExamConfig.findOne({ key });
      if (!existing) {
        await ExamConfig.create({
          key,
          title: config.title,
          category: config.category,
          duration: config.duration || 60,
          instructions: "Standard Exam Rules apply.",
          sections: config.sections || []
        });
        count++;
      }
    }
    res.json({ success: true, seeded: count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/configs — Get all configurations
router.get('/configs', adminAuth, async (req, res) => {
  try {
    const configs = await Config.find({});
    const configMap = {};
    configs.forEach(c => { configMap[c.key] = c.value; });
    res.json(configMap);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/config — Update or create configuration
router.post('/config', adminAuth, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Key required' });
    const config = await Config.findOneAndUpdate({ key }, { value }, { new: true, upsert: true });
    logActivity('UPDATE_CONFIG', `Updated config: ${key}`);
    res.json({ success: true, config });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════ REVIEWS MODERATION ═══════════════

// GET /api/admin/reviews — List all reviews
router.get('/reviews', adminAuth, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/reviews/:id — Approve/Reject review
router.put('/reviews/:id', adminAuth, async (req, res) => {
  try {
    const { approved } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { approved }, { new: true });
    res.json({ success: true, review });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/reviews/:id — Delete review
router.delete('/reviews/:id', adminAuth, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════ TRASH QUESTIONS ═══════════════

// GET /api/admin/questions/trash — List all soft-deleted questions
router.get('/questions/trash', adminAuth, async (req, res) => {
  try {
    const questions = await TrashQuestion.find().sort({ s: 1 });
    res.json(questions);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/questions/restore/:id — Restore question from Trash
router.post('/questions/restore/:id', adminAuth, async (req, res) => {
  try {
    const q = await TrashQuestion.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found in Trash' });
    
    // Move Back to Questions
    const restoreData = q.toObject();
    delete restoreData._id; // strip and allow creation
    await Question.create(restoreData);
    await TrashQuestion.findByIdAndDelete(req.params.id);
    
    logActivity('RESTORE_Q', `Restored question to ${q.s}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/questions/purge/:id — Permanent Delete from Trash
router.delete('/questions/purge/:id', adminAuth, async (req, res) => {
  try {
    const q = await TrashQuestion.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found in Trash' });
    logActivity('PURGE_Q', `Permanently deleted question from ${q.s}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/questions/restore-bulk — Restore multiple questions from Trash
router.post('/questions/restore-bulk', adminAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'IDs array required' });
    
    const questions = await TrashQuestion.find({ _id: { $in: ids } });
    const restoreData = questions.map(q => {
        const doc = q.toObject();
        delete doc._id; // strip and allow creation
        return doc;
    });

    if (restoreData.length > 0) {
        await Question.insertMany(restoreData);
        await TrashQuestion.deleteMany({ _id: { $in: ids } });
    }

    logActivity('RESTORE_Q_BULK', `Restored ${restoreData.length} questions from Trash`);
    res.json({ success: true, count: restoreData.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/questions/purge-bulk — Permanent Delete multiple from Trash
router.post('/questions/purge-bulk', adminAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'IDs array required' });
    
    const result = await TrashQuestion.deleteMany({ _id: { $in: ids } });
    logActivity('PURGE_Q_BULK', `Permanently deleted ${result.deletedCount} questions from Trash`);
    res.json({ success: true, count: result.deletedCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ════════ MAINTENANCE & SCALABILITY (20CR+) ════════

// POST /api/admin/maintenance/migrate-attempts — Move user.attempts to Submissions
router.post('/maintenance/migrate-attempts', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ 'attempts.0': { $exists: true } });
    let movedCount = 0;

    for (const user of users) {
      if (user.attempts && user.attempts.length > 0) {
        const subs = user.attempts.map(at => ({
          userCode: user.code,
          score: at.score,
          total: at.total,
          pct: at.pct,
          timeUsed: at.timeUsed,
          examType: at.examType || '',
          topics: at.topics || '',
          page: at.page || 0,
          date: at.date || new Date(),
          answers: at.answers || []
        }));
        await Submission.insertMany(subs);
        movedCount += subs.length;
      }
    }

    logActivity('MAINTENANCE', `Migrated ${movedCount} legacy attempts to Submissions collection`, null, true);
    res.json({ success: true, moved: movedCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/maintenance/purge-legacy-arrays — Delete user.attempts to save space
router.post('/maintenance/purge-legacy-arrays', adminAuth, async (req, res) => {
  try {
    const result = await User.updateMany(
      { 'attempts.0': { $exists: true } },
      { $set: { attempts: [] } }
    );
    logActivity('MAINTENANCE', `Purged legacy attempts arrays for ${result.modifiedCount} users`, null, true);
    res.json({ success: true, cleaned: result.modifiedCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════ OFFERS & COUPONS (NEW) ═══════════════

// GET /api/admin/coupons
router.get('/coupons', adminAuth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/coupons
router.post('/coupons', adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    logActivity('CREATE_COUPON', `Created coupon: ${coupon.code}`);
    res.json(coupon);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/coupons/:id
router.delete('/coupons/:id', adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    logActivity('DELETE_COUPON', `Deleted coupon: ${coupon?.code}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/gamified
router.get('/gamified', adminAuth, async (req, res) => {
  try {
    const offers = await GamifiedOffer.find();
    res.json(offers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/gamified
router.post('/gamified', adminAuth, async (req, res) => {
  try {
    const { id, ...data } = req.body;
    let offer;
    if (id) {
       offer = await GamifiedOffer.findByIdAndUpdate(id, data, { new: true });
    } else {
       offer = await GamifiedOffer.create(data);
    }
    logActivity('UPDATE_GAMIFIED', `Updated ${offer.gameType} settings`);
    res.json(offer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/gamified/:id/toggle
router.post('/gamified/:id/toggle', adminAuth, async (req, res) => {
  try {
    const offer = await GamifiedOffer.findById(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Not found' });
    offer.active = !offer.active;
    await offer.save();
    logActivity('TOGGLE_GAMIFIED', `${offer.active ? 'Enabled' : 'Disabled'} ${offer.gameType}`);
    res.json({ success: true, active: offer.active });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
