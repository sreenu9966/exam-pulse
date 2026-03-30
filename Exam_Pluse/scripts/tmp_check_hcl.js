const mongoose = require('mongoose');
const ExamConfig = require('./server/models/ExamConfig');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nqt_db');
  const hcl = await ExamConfig.findOne({ key: 'HCL' });
  console.log(JSON.stringify(hcl, null, 2));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
