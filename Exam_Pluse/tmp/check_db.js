const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const Submission = require('../backend/models/Submission');
const User = require('../backend/models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const totalSubmissions = await Submission.countDocuments();
    const examSubmissions = await Submission.countDocuments({ score: { $exists: true } });
    const paymentRequests = await Submission.countDocuments({ score: { $exists: false } });
    const users = await User.countDocuments();
    
    console.log(`Total Submissions: ${totalSubmissions}`);
    console.log(`Exam Submissions (with score): ${examSubmissions}`);
    console.log(`Payment Requests (no score): ${paymentRequests}`);
    console.log(`Total Users: ${users}`);

    if (examSubmissions > 0) {
      const sample = await Submission.findOne({ score: { $exists: true } });
      console.log("Sample Exam Submission Fields:", Object.keys(sample.toObject()));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
