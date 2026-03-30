const mongoose = require('mongoose');
const Review = require('./models/Review');
require('dotenv').config();

const sampleReviews = [
  { name: 'Kiran Sai', role: 'Placed @ TCS Ninja', text: 'The interface was exactly like the real exam. Helped me manage my time perfectly!', rating: 5 },
  { name: 'Megha R.', role: 'TCS Digital Achiever', text: 'Authentic previous year questions are extremely useful. Cracking the logic was easier.', rating: 5 },
  { name: 'Rohan Sharma', role: 'System Engineer', text: 'The detailed speed performance analytics are a game-changer. Loved the leaderboard!', rating: 5 },
  { name: 'Divya P.', role: 'Cracked NQT 2025', text: 'From Aptitude to Technical rounds, topics cover the full latest 2026 syllabus accurately.', rating: 5 }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Clear existing to avoid bloat on repeated runs
    await Review.deleteMany({});
    await Review.insertMany(sampleReviews);
    console.log('✅ Reviews seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
