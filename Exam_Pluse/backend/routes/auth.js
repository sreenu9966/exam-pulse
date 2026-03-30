const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Config = require('../models/Config');
const Coupon = require('../models/Coupon');
const GamifiedOffer = require('../models/GamifiedOffer');
const GENERIC_CODES = ['TCS2026', 'NQT2026', 'FREE2026', 'DEMO2026'];

// POST /api/auth/validate — validate access code
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });

    const upperCode = code.trim().toUpperCase();
    
    const user = await User.findOne({ code: upperCode, status: 'active' });
    if (!user) return res.status(401).json({ error: 'Invalid or inactive access code' });

    const token = jwt.sign({ code: user.code, userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { code: user.code, name: user.name, email: user.email, attempts: user.attempts || [] }, isNew: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/setup — first-time profile creation
router.post('/setup', async (req, res) => {
  try {
    const { code, name, email } = req.body;
    if (!code || !name || !email) return res.status(400).json({ error: 'All fields required' });

    const upperCode = code.trim().toUpperCase();
    let finalCode = upperCode;

    // If generic code, generate a unique child-code so DB unique constraint doesn't break
    if (GENERIC_CODES.includes(upperCode)) {
      finalCode = `${upperCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    }

    let user = await User.findOne({ code: finalCode });
    if (user && user.name) return res.status(400).json({ error: 'Profile already set up. Use /validate instead.' });

    if (!user) {
      user = new User({ code: finalCode, name, email, status: 'active', utr: 'GENERIC_CODE' });
    } else {
      user.name = name; user.email = email;
    }
    await user.save();

    const token = jwt.sign({ code: user.code, userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { code: user.code, name: user.name, email: user.email, attempts: [] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/payment — submit UTR payment request
router.post('/payment', async (req, res) => {
  try {
    const { name, email, utr, phone, amount, planRequested } = req.body;
    if (!name || !email || !utr || !phone) {
      return res.status(400).json({ error: 'Name, Email, Phone with Country Code, and Transaction ID are required.' });
    }

    if (!phone.startsWith('+')) {
      return res.status(400).json({ error: 'Phone number must include Country Code (e.g., +91...)' });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const existing = await Submission.findOne({ utr: utr.trim().toUpperCase() });
    if (existing) return res.status(400).json({ error: 'Transaction ID (UTR) already submitted' });

    const sub = await Submission.create({ 
      name, email, utr: utr.trim().toUpperCase(), phone, amount: amount || 1, 
      planRequested: planRequested || 'Free Trial' 
    });
    res.json({ success: true, submissionId: sub._id, message: 'Payment submitted, awaiting admin approval.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/payment/status/:utr — check payment approval status
router.get('/payment/status/:utr', async (req, res) => {
  try {
    const { utr } = req.params;
    if (!utr) return res.status(400).json({ error: 'UTR required' });

    const submission = await Submission.findOne({ utr: utr.trim().toUpperCase() });
    if (!submission) return res.status(404).json({ error: 'No submission found for this UTR.' });

    res.json({ 
      status: submission.status, 
      generatedCode: submission.status === 'approved' ? submission.generatedCode : null,
      message: submission.status === 'approved' ? 'Payment Approved! 🎉' : submission.status === 'rejected' ? 'Payment Rejected. Please contact support.' : 'Payment is still Pending approval. ✅'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const Offer = require('../models/Offer');

// GET /api/auth/offer — Fetch active offer with Config Fallback
router.get('/offer', async (req, res) => {
  try {
    const configs = await Config.find({ key: { $in: ['offer_price_original', 'offer_price_deal', 'offer_discount_text'] } });
    const configMap = {};
    configs.forEach(c => { configMap[c.key] = c.value; });

    const offer = {
      title: "Premium Full Access",
      priceOriginal: configMap.offer_price_original || 399,
      priceOffer: configMap.offer_price_deal || 1,
      discount: configMap.offer_discount_text || "99.7%"
    };
    res.json(offer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const Review = require('../models/Review');

// GET /api/auth/reviews — Fetch approved reviews for Landing page
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
    
    // Calculate Average Rating Aggregate
    const avg = await Review.aggregate([
      { $match: { approved: true } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, totalCount: { $sum: 1 } } }
    ]);

    // Calculate Breakdown Distribution [5, 4, 3, 2, 1]
    const dist = await Review.aggregate([
      { $match: { approved: true } },
      { $group: { _id: "$rating", count: { $sum: 1 } } }
    ]);

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    dist.forEach(d => { if (d._id) breakdown[d._id] = d.count; });

    const scrollSpeedConfig = await Config.findOne({ key: 'scroll_speed' });
    const scrollSpeed = scrollSpeedConfig ? scrollSpeedConfig.value : '20s';

    const stats = {
      avgRating: avg[0] ? Math.round(avg[0].avgRating * 10) / 10 : 5.0, // eg 4.4
      totalReviews: avg[0] ? avg[0].totalCount : 0,
      breakdown,
      scrollSpeed
    };

    res.json({ reviews, stats });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/activity', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Activity = require('../models/Activity');
    const logs = await Activity.find({ userCode: decoded.code }).sort({ createdAt: -1 }).limit(10);
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/progress — Update module ticks for users
router.post('/progress', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { category, section, level, topic, moduleIndex } = req.body;
    if (!category || !level || moduleIndex === undefined) return res.status(400).json({ error: 'Invalid payload' });

    let user = await User.findOne({ code: decoded.code });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Subscription Limit Validation
    const sub = user.subscription || { planType: 'attempts', maxAttempts: 2 };
    if (sub.planType === 'time' && sub.validUntil && Date.now() > new Date(sub.validUntil).getTime()) {
        return res.status(403).json({ error: `Your time-based subscription expired on ${new Date(sub.validUntil).toLocaleString()}. Please contact Admin.` });
    }
    if (sub.planType === 'attempts' && user.attempts.length >= (sub.maxAttempts || 2)) {
        return res.status(403).json({ error: `You have reached your maximum limit of ${sub.maxAttempts || 2} exams. Please contact Admin.` });
    }

    const pIdx = user.moduleProgress.findIndex(p => 
       p.category === category && p.section === section && p.level === level && p.topic === topic
    );

    if (pIdx > -1) {
       if (!user.moduleProgress[pIdx].completedModules.includes(moduleIndex)) {
          user.moduleProgress[pIdx].completedModules.push(moduleIndex);
       }
    } else {
       user.moduleProgress.push({
          category, section, level, topic, completedModules: [moduleIndex]
       });
    }

    await user.save();
    res.json({ success: true, moduleProgress: user.moduleProgress });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/delete-attempt — Delete a specific exam attempt securely
router.post('/delete-attempt', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { attemptId } = req.body;
    if (!attemptId) return res.status(400).json({ error: 'Attempt ID required' });

    // SCALABILITY UPGRADE: Delete from the correct collection with security check
    const sub = await Submission.findOneAndDelete({ _id: attemptId, userCode: decoded.code });
    if (!sub) return res.status(404).json({ error: 'Attempt not found or unauthorized' });

    res.json({ success: true, message: 'Attempt deleted successfully 🗑️' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 📈 ADVANCED ANALYTICS & LOGGING
const Activity = require('../models/Activity');

// POST /api/auth/log — Save granular activity/heartbeat
router.post('/log', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { action, category, topic, duration, detail } = req.body;
    await Activity.create({
      action,
      userCode: decoded.code,
      category: category || null,
      topic: topic || null,
      duration: duration || 0,
      detail: detail || `Page Viewed: ${action}`
    });

    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/auth/analytics/advanced — Rich aggregated trends
router.get('/analytics/advanced', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { hours } = req.query;
    let matchQuery = { userCode: decoded.code };

    if (hours && hours !== 'lifetime') {
      const gteDate = new Date(Date.now() - parseInt(hours) * 3600 * 1000);
      matchQuery.createdAt = { $gte: gteDate };
    }

    const stats = await Activity.aggregate([
      { $match: matchQuery },
      { $group: { 
          _id: { category: "$category", topic: "$topic", action: "$action" }, 
          totalDuration: { $sum: "$duration" },
          visitCount: { $sum: 1 }
      } }
    ]);

    res.json(stats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/auth/config/:key — Fetch configuration
router.get('/config/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const config = await Config.findOne({ key });
    
    // Legacy mapping for LandingPage.jsx (which expects { upiId: '...' } for upi_details)
    if (key === 'upi_details') {
       const upiId = await Config.findOne({ key: 'upi_id' });
       return res.json({ upiId: upiId ? upiId.value : 'vhs@ptyes' });
    }

    res.json(config ? config.value : null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/reviews/public — submit rating as a visitor
router.post('/reviews/public', async (req, res) => {
  try {
    const { rating, id } = req.body;
    if (!rating) return res.status(400).json({ error: 'Rating required' });

    if (id && id !== 'null' && id !== 'undefined') {
      const updated = await Review.findByIdAndUpdate(id, { rating: parseInt(rating) }, { new: true });
      if (updated) {
        return res.json({ success: true, message: 'Rating updated! ✅', id: updated._id });
      }
    }

    const review = new Review({
      name: 'User',
      role: 'Website Visitor',
      text: 'Rated from Landing Page',
      rating: parseInt(rating) || 5,
      approved: true // Live instantly for Easy verification!
    });
    
    const saved = await review.save();
    res.json({ success: true, message: 'Rating saved! ✅', id: saved._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/gamified/play — Play a scratch/spin game and win rewards
router.post('/gamified/play', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { gameType } = req.body;

    const offer = await GamifiedOffer.findOne({ gameType, active: true });
    if (!offer) return res.status(404).json({ error: 'No active game found' });

    // Weighted Probability Logic
    const rand = Math.random() * 100;
    let cumulative = 0;
    let selectedReward = null;

    for (const r of offer.rewards) {
      cumulative += r.probability;
      if (rand <= cumulative) {
        selectedReward = r;
        break;
      }
    }

    if (!selectedReward) return res.json({ win: false, message: 'Better luck next time! 🍀' });

    let finalPrize = { type: selectedReward.type, value: selectedReward.value };

    // If it's a coupon, find a matching code
    if (selectedReward.type === 'discount_coupon') {
      const coupon = await Coupon.findOne({ active: true, value: parseInt(selectedReward.value) || { $gt: 0 } }).sort({ createdAt: -1 });
      if (coupon) {
        finalPrize.code = coupon.code;
        finalPrize.message = `Congratulations! You won a ${coupon.value}% discount! 🎁`;
      } else {
        return res.json({ win: false, message: 'Better luck next time! 🍀' });
      }
    } else {
      finalPrize.message = `You won: ${selectedReward.value}! 🎉`;
    }

    res.json({ win: true, prize: finalPrize });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/coupon/apply — Apply a coupon code to upgrade plan
router.post('/coupon/apply', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ error: 'Invalid or expired coupon code' });

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) return res.status(400).json({ error: 'Coupon has expired' });
    if (coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ error: 'Coupon usage limit reached' });

    const user = await User.findOne({ code: decoded.code });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Upgrade logic: coupons upgrade to premium for 30 days by default (or unlimited based on value)
    user.plan = 'premium';
    user.subscription = {
      planType: 'time',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      unlimitedExams: []
    };

    coupon.usedCount += 1;
    await Promise.all([user.save(), coupon.save()]);

    res.json({ success: true, message: `Coupon applied! Your plan is now PREMIUM until ${user.subscription.validUntil.toLocaleDateString()}. 👑`, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/auth/submission/:id — Fetch submission for correction (Public)
router.get('/submission/:id', async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });
    if (sub.status === 'approved') return res.status(400).json({ error: 'This payment is already approved.' });
    
    // Return only necessary fields for the form
    res.json({
      name: sub.name,
      email: sub.email,
      phone: sub.phone,
      utr: sub.utr,
      amount: sub.amount,
      status: sub.status,
      rejectionReason: sub.rejectionReason
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/auth/submission/:id — Resubmit updated payment details (Public)
router.put('/submission/:id', async (req, res) => {
  try {
    const { name, email, phone, utr, amount } = req.body;
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });
    if (sub.status === 'approved') return res.status(400).json({ error: 'Cannot edit an approved submission.' });

    // Update and RESET to pending
    sub.name = name || sub.name;
    sub.email = email || sub.email;
    sub.phone = phone || sub.phone;
    sub.utr = (utr || sub.utr).trim().toUpperCase();
    sub.amount = amount || sub.amount;
    sub.status = 'pending';
    sub.rejectionReason = ''; // Clear reason on resubmit
    
    await sub.save();
    res.json({ success: true, message: 'Details updated! Admin will re-verify shortly. ⏳' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
