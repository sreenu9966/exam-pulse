const mongoose = require('mongoose');
require('dotenv').config();
const Review = require('./models/Review');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const count = await Review.countDocuments();
    console.log(`Total Reviews: ${count}`);
    const sample = await Review.find().limit(5);
    console.log('Sample Reviews:', JSON.stringify(sample, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
