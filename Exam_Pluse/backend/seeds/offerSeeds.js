const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Offer = require('../models/Offer');

const standardPlans = [
  {
    title: "FREE TASTER",
    tierLevel: "FREE",
    priceOriginal: 0,
    priceOffer: 0,
    discount: "100% OFF",
    durationDays: 7,
    active: true,
    features: [
      "10 Basic Mock Exams",
      "Standard Leaderboard View",
      "Community Q&A Access",
      "Email Support (24h Response)"
    ]
  },
  {
    title: "ESSENTIAL PASS",
    tierLevel: "BASIC",
    priceOriginal: 99,
    priceOffer: 49,
    discount: "50% OFF",
    durationDays: 15,
    active: true,
    features: [
      "30 Full Mock Exams",
      "Personal Performance Stats",
      "Section-wise Analytics",
      "All Aptitude & Reasoning PYQs"
    ]
  },
  {
    title: "PRO SUCCESS BUNDLE",
    tierLevel: "PRO",
    priceOriginal: 399,
    priceOffer: 149,
    discount: "62% OFF",
    durationDays: 30,
    active: true,
    features: [
      "Full 310+ PYQ Database",
      "Real Exam UI Simulator",
      "Predictive Score Modeling",
      "Unlimited Sectional Retakes",
      "Live Global Leaderboard"
    ]
  },
  {
    title: "ELITE CAREER PACK",
    tierLevel: "PREMIUM",
    priceOriginal: 699,
    priceOffer: 299,
    discount: "57% OFF",
    durationDays: 90,
    active: true,
    features: [
      "Everything in PRO Plan",
      "Exclusive Digital/Ninja Content",
      "One-on-One Priority Email",
      "Advanced DSA Mastery Module",
      "Downloadable Prep PDF Vault"
    ]
  },
  {
    title: "LIFETIME MASTERY",
    tierLevel: "LIFETIME",
    priceOriginal: 2499,
    priceOffer: 999,
    discount: "60% OFF",
    durationDays: 9999,
    active: true,
    features: [
      "Permanent Portal Access",
      "All Future Updates Free",
      "Lifetime Community Badge",
      "Priority Beta Access",
      "Direct Desktop App Access"
    ]
  }
];

const seedOffers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not found in .env");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing offers if needed? Or just add?
    // Let's check first
    const count = await Offer.countDocuments();
    if (count > 0) {
      console.log(`Found ${count} existing offers. Replacing them with the 5 standard tiers...`);
      await Offer.deleteMany({});
    }

    await Offer.insertMany(standardPlans);
    console.log("Successfully seeded 5 Standard Subscription Plans! 🚀💎✨");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedOffers();
