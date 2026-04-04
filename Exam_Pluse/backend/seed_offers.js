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
    title: "FREE TRIAL",
    priceOriginal: 399,
    priceOffer: 0,
    discount: "100% OFF",
    tierLevel: "FREE",
    features: ["5 Exams / day", "Basic Analytics", "Practice Mode"],
    durationDays: 7,
    maxRedemptions: 1000,
    usedCount: 0,
    targetSegment: "all",
    active: true
  },
  {
    title: "BASIC PLAN",
    priceOriginal: 399,
    priceOffer: 99,
    discount: "75% OFF",
    tierLevel: "BASIC",
    features: ["20 Exams / day", "Standard Analytics", "310 Authentic PYQs"],
    durationDays: 30,
    maxRedemptions: 1000,
    usedCount: 0,
    targetSegment: "all",
    active: true
  },
  {
    title: "PRO PLAN",
    priceOriginal: 1999,
    priceOffer: 299,
    discount: "85% OFF",
    tierLevel: "PRO",
    features: ["Unlimited Exams", "Full Analytics", "Performance Tracking"],
    durationDays: 30,
    maxRedemptions: 1000,
    usedCount: 0,
    targetSegment: "all",
    active: true
  },
  {
    title: "PREMIUM ACCESS",
    priceOriginal: 4999,
    priceOffer: 1999,
    discount: "60% OFF",
    tierLevel: "PREMIUM",
    features: ["Unlimited Access", "Advanced Reports", "Priority Support"],
    durationDays: 365,
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
