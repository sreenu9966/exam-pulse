const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./backend/models/Question');

dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tcs_nqt';

async function getStats() {
  try {
    await mongoose.connect(MONGO_URI);
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
      const section = s._id.section || 'Uncategorized';
      if (!result[section]) result[section] = [];
      result[section].push({ topic: s._id.topic, count: s.count });
    });

    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

getStats();
