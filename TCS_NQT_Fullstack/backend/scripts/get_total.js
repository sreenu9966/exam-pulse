const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Question = require('../models/Question');

async function getTotal() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- Database Verification ---');
    const total = await Question.countDocuments();
    console.log(`\nTotal Questions in DB: ${total}`);

    const breakdown = await Question.aggregate([
      { $group: { _id: "$section", count: { $sum: 1 } } }
    ]);

    console.log('\n--- Section Breakdown ---');
    breakdown.forEach(b => {
      console.log(`${b._id || 'Uncategorized'}: ${b.count}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

getTotal();
