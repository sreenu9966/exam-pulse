const mongoose = require('mongoose');
const Question = require('./backend/models/Question');
require('dotenv').config({ path: './backend/.env' });

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is not defined in backend/.env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const stats = await Question.aggregate([
      {
        $group: {
          _id: { section: "$section", topic: "$s" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.section": 1, "_id.topic": 1 }
      }
    ]);

    const result = {};
    stats.forEach(s => {
      const section = s._id.section || 'Other';
      const topic = s._id.topic;
      if (!result[section]) {
        result[section] = [];
      }
      result[section].push({ topic, count: s.count });
    });

    console.log('\n--- QUESTION STATS BY SECTION AND TOPIC ---');
    for (const [section, topics] of Object.entries(result)) {
      console.log(`\n📂 ${section.toUpperCase()}`);
      topics.forEach(t => {
        console.log(`  - ${t.topic}: ${t.count} questions`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('Error fetching stats:', err);
    process.exit(1);
  }
}

run();
