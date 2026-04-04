const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27014/exam_pulse');
  const Question = require('./models/Question');
  const qs = await Question.find().limit(5);
  console.log(JSON.stringify(qs, null, 2));
  process.exit(0);
}
check();
