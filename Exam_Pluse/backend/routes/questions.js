const router = require('express').Router();
const Question = require('../models/Question');
const ExamConfig = require('../models/ExamConfig');
const Submission = require('../models/Submission');
const Config = require('../models/Config');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const { CATEGORY_MAP, getMasterMapping } = require('../config/mappings');

// GET /api/questions/mapping — Public topic-to-section mapping
router.get('/mapping', async (req, res) => {
  try {
    const config = await Config.findOne({ key: 'disabledTopics' });
    const master = await getMasterMapping(Question, Config);
    res.json({ CATEGORY_MAP: master, disabledTopics: config?.value || [] });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch mapping' });
  }
});

function parseTopics(str) {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed;
  } catch(e) {}
  return str.split(',');
}

async function getExpandedTopics(topicStr) {
  if (!topicStr) return [];
  const master = await getMasterMapping(Question);
  if (topicStr === 'All') return Object.values(master).flat();
  
  const requestedTopics = topicStr.split(',');
  let expandedList = [];
  requestedTopics.forEach(topic => {
      if (master[topic]) {
          expandedList.push(...master[topic]);
      } else {
          expandedList.push(topic);
      }
  });
  return [...new Set(expandedList)];
}

// GET /api/questions/count — Count docs matching topics for Module Pagination
router.get('/count', async (req, res) => {
  try {
    const { topics } = req.query;
    if (!topics) return res.json({ count: 0 });
    
    let count;
    if (topics === 'All' || topics === 'undefined') {
       count = await Question.countDocuments({});
    } else {
       count = await Question.countDocuments({ s: { $in: parseTopics(topics) } });
    }
    
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/questions — Fetch questions with optional exam type sampling
router.get('/', async (req, res) => {
    const { examType, topics, difficulty } = req.query;

    try {
      // 1. Custom Topic Filtering (Practice Modules)
      if (topics) {
        let list = parseTopics(topics);
        const page = parseInt(req.query.page);
        const limit = 25; 

        const config = await Config.findOne({ key: 'disabledTopics' });
        const disabled = config?.value || [];
        
        let query = (topics === 'All' || topics === 'undefined') ? {} : { s: { $in: list } };
        if (disabled.length > 0) {
          query.s = { ...query.s, $nin: disabled };
          if (topics === 'All' || topics === 'undefined') {
            query.s = { $nin: disabled };
          }
        }
        
        if (page) {
           let offsetPage = page - 1;
           if (difficulty) {
               const totalCount = await Question.countDocuments(query);
               const maxPages = Math.ceil(totalCount / limit);
               if (difficulty === 'Medium') offsetPage += Math.floor(maxPages * 0.25);
               else if (difficulty === 'Hard') offsetPage += Math.floor(maxPages * 0.50);
               else if (difficulty === 'Advanced') offsetPage += Math.floor(maxPages * 0.75);
           }

           const qs = await Question.find(query)
                                   .sort({ _id: 1 })
                                   .skip(offsetPage * limit)
                                   .limit(limit)
                                   .lean();
           const formatted = qs.map(q => ({
             _id: q._id,
             s: q.s,
             q: q.q,
             o: q.o,
             a: q.a
           }));
           return res.json(formatted);
        } else {
           const qs = await Question.aggregate([
             { $match: query },
             { $sample: { size: 30 } }
           ]);
           return res.json(qs);
        }
      }

      // 2. Configuration-Based Exam Generation
      if (examType) {
        const config = await ExamConfig.findOne({ key: examType });
        if (config) {
          let generatedQuestions = [];
          const usedIds = new Set(); 
          const mongoose = require('mongoose');

          // Pre-scan all manual selections across all sections/topics first
          (config.sections || []).forEach(sec => {
            (sec.topics || []).forEach(t => {
              if (typeof t === 'object' && t !== null && (t.mode === 'manual' || t.mode === 'specific')) {
                const selected = t.selectedQuestions || t.questionIds || [];
                selected.forEach(id => {
                  if (mongoose.Types.ObjectId.isValid(id)) usedIds.add(id.toString());
                });
              }
            });
          });

          for (const section of config.sections) {
            let sectionQuestions = [];
            for (const t of (section.topics || [])) {
              const isObj = typeof t === 'object' && t !== null && t.name;
              const topicName = isObj ? t.name : t;
              const count = isObj ? (t.count || 5) : Math.max(1, Math.floor((section.count || 25) / section.topics.length));
              const mode = isObj ? (t.mode || 'auto') : 'auto';
              const selected = isObj ? (t.selectedQuestions || t.questionIds || []) : [];

              let sampled = [];
              if (mode === 'manual' || mode === 'specific') {
                const mongoose = require('mongoose');
                const validIds = (selected || []).filter(id => mongoose.Types.ObjectId.isValid(id));
                if (validIds.length > 0) {
                  sampled = await Question.find({ _id: { $in: validIds } }).lean();
                }

                // Hybrid Logic: Pick extra questions if requested count > manual selection
                const targetCount = Number(count) || 0;
                if (targetCount > sampled.length) {
                  const extraCount = targetCount - sampled.length;
                  const dbConf = await Config.findOne({ key: 'disabledTopics' });
                  const disabled = dbConf?.value || [];
                  const topicsList = (await getExpandedTopics(topicName)).filter(t => !disabled.includes(t));
                  
                  // Ensure we don't pick already picked ones
                  sampled.forEach(q => usedIds.add(q._id.toString()));

                  const extraQs = await Question.aggregate([
                    { $match: { _id: { $nin: Array.from(usedIds) }, s: { $in: topicsList } } },
                    { $sample: { size: extraCount } }
                  ]);
                  sampled = [...sampled, ...extraQs];
                }
              } else {
                const dbConf = await Config.findOne({ key: 'disabledTopics' });
                const disabled = dbConf?.value || [];
                const topicsList = (await getExpandedTopics(topicName)).filter(t => !disabled.includes(t));
                
                const sampleSize = Math.floor(Number(count)) || 5;
                if (topicsList.length === 0) {
                  sampled = []; 
                } else {
                  sampled = await Question.aggregate([
                    { $match: { _id: { $nin: Array.from(usedIds) }, s: { $in: topicsList } } },
                    { $sample: { size: sampleSize } }
                  ]);
                }
              }

              sampled.forEach(q => {
                usedIds.add(q._id.toString());
                sectionQuestions.push({
                  _id: q._id,
                  s: section.name,
                  topic: q.s, 
                  q: q.q,
                  o: q.o,
                  a: q.a
                });
              });
            }
            generatedQuestions.push(...sectionQuestions);
          }
          return res.json(generatedQuestions);
        }
      }

      // 3. Default Random Fallback
      const questions = await Question.aggregate([{ $sample: { size: 100 } }]);
      const formatted = questions.map(q => ({
        _id: q._id,
        s: q.s || q.section || 'General',
        q: q.q,
        o: q.o,
        a: q.a
      }));
      res.json(formatted);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// GET /api/questions/configs — List available exams
router.get('/configs', async (req, res) => {
  try {
    const configs = await ExamConfig.find().sort({ category: 1, title: 1 });
    res.json(configs.map(c => ({
      key: c.key,
      title: c.title,
      category: c.category,
      duration: c.duration,
      sections: c.sections,
      instructions: c.instructions,
      totalQuestions: c.sections ? c.sections.reduce((sum, s) => sum + (s.count || 0), 0) : 0
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/questions/user-exams
router.get('/user-exams', auth, async (req, res) => {
  try {
     const user = await User.findOne({ code: req.user.code });
     const unlimitedExams = user?.subscription?.unlimitedExams || [];
     const exams = await ExamConfig.find().sort({ createdAt: -1 });
     const submissions = await Submission.find({ userCode: req.user.code }).select('examType');
     const completedKeys = submissions.map(s => s.examType);

     res.json({
        unattempted: exams.filter(e => !completedKeys.includes(e.key) || unlimitedExams.includes(e.key)),
        completed: exams.filter(e => completedKeys.includes(e.key))
     });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
