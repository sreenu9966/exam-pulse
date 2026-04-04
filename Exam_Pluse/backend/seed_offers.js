const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;

// Define Offer Schema
const offerSchema = new mongoose.Schema({
  title: String,
  priceOriginal: Number,
  priceOffer: Number,
  discount: String,
  tierLevel: String,
  features: [String],
  durationDays: Number,
  maxRedemptions: Number,
  usedCount: Number,
  targetSegment: String,
  active: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const Offer = mongoose.model('Offer', offerSchema);

const seedData = [
  {
    title: "FREE TASTER",
    priceOriginal: 399,
    priceOffer: 0,
    discount: "100% OFF",
    tierLevel: "FREE",
    features: ["10 Basic Mock Exams", "Standard Leaderboard View", "Community Q&A Access", "Email Support (24h Response)"],
    durationDays: 7,
    maxRedemptions: 1000,
    usedCount: 0,
    targetSegment: "all",
    active: true
  },
  {
    title: "ESSENTIAL PASS",
    priceOriginal: 499,
    priceOffer: 49,
    discount: "90% OFF",
    tierLevel: "BASIC",
    features: ["30 Full Mock Exams", "Personal Performance Stats", "Section-wise Analytics", "All Aptitude & Reasoning PYQs"],
    durationDays: 15,
    maxRedemptions: 1000,
    usedCount: 0,
    targetSegment: "all",
    active: true
  },
  {
    title: "PRO SUCCESS BUNDLE",
    priceOriginal: 999,
    priceOffer: 149,
    discount: "85% OFF",
    tierLevel: "PRO",
    features: ["Full 310+ PYQ Database", "Real Exam UI Simulator", "Predictive Score Modeling", "Unlimited Sectional Retakes", "Live Global Leaderboard"],
    durationDays: 30,
    maxRedemptions: 1000,
    usedCount: 0,
    targetSegment: "all",
    active: true
  },
  {
    title: "ELITE CAREER PACK",
    priceOriginal: 1999,
    priceOffer: 299,
    discount: "85% OFF",
    tierLevel: "PREMIUM",
    features: ["Everything in PRO Plan", "Exclusive Digital/Ninja Content", "One-on-One Priority Email", "Advanced DSA Mastery Module", "Downloadable Prep PDF Vault"],
    durationDays: 90,
    maxRedemptions: 1000,
    usedCount: 0,
    targetSegment: "all",
    active: true
  },
  {
    title: "LIFETIME MASTERY",
    priceOriginal: 4999,
    priceOffer: 999,
    discount: "80% OFF",
    tierLevel: "LIFETIME",
    features: ["Permanent Portal Access", "All Future Updates Free", "Lifetime Community Badge", "Priority Beta Access", "Direct Desktop App Access"],
    durationDays: 9999,
    maxRedemptions: 1000,
    usedCount: 0,
    targetSegment: "all",
    active: true
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected! Seeding 4 standard plans...');

    // Delete existing standard plans if they exist with same title (optional, but safer)
    // await Offer.deleteMany({ title: { $in: seedData.map(d => d.title) } });

    await Offer.insertMany(seedData);
    console.log('Successfully seeded 4 plans! 🚀');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
}

seed();
