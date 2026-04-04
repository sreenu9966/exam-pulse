const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27014/exam_pulse');
  const Question = require('./models/Question');
  // Find questions specifically where the topic is Quantitative Aptitude as in the screenshot
  const qs = await Question.find({ s: /Aptitude/i }).limit(5);
  console.log("Found questions:", qs.length);
  qs.forEach((q, i) => {
    console.log(`--- Question ${i+1} ---`);
    console.log(q.toObject());
  });
  process.exit(0);
}
check();
