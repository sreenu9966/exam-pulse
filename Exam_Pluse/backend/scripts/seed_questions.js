require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const SEEDS =[
 
];

const { getSectionForTopic } = require('../config/mappings');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tcsnqt2026');
  console.log('✅ Connected to MongoDB');
  await Question.deleteMany({});
  console.log('🧹 Wiped database.');
  
  // Dynamically assign sections based on the centralized mapping engine
  const processedSeeds = SEEDS.map(s => ({
    ...s,
    section: getSectionForTopic(s.s)
  }));

  const result = await Question.insertMany(processedSeeds);
  console.log('🚀 Seeded ' + result.length + ' questions successfully.');
  mongoose.disconnect();
}

if (require.main === module) {
  run().catch(err => { console.error(err); process.exit(1); });
}

module.exports = { SEEDS };
