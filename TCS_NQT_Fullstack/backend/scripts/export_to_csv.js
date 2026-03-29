require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Question = require('./models/Question');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqt');
  console.log("Connected to DB. Starting massive export stream...");
  
  // Use absolute path for output so it's easy to find
  const outPath = 'f:/TCS_NQT_2026/TCS_NQT_Fullstack/server/Questions_Database_Export.csv';
  const writeStream = fs.createWriteStream(outPath);
  
  writeStream.write('Topic,Question,Option_A,Option_B,Option_C,Option_D,Correct_Option_Index\n');
  
  const cursor = Question.find({}).cursor();
  let count = 0;
  
  for await (const doc of cursor) {
    // Safely escape CSV strings (wrap in quotes, double up internal quotes)
    const s = `"${String(doc.s || 'Other').replace(/"/g, '""')}"`;
    
    // Strip HTML tags for clean Excel viewing, replace newlines
    let rawQ = String(doc.q || '').replace(/<[^>]+>/g, ' ').replace(/"/g, '""').replace(/\n/g, ' ');
    const q = `"${rawQ}"`;
    
    const o = doc.o || ['', '', '', ''];
    const optA = `"${String(o[0] || '').replace(/<[^>]+>/g, ' ').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    const optB = `"${String(o[1] || '').replace(/<[^>]+>/g, ' ').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    const optC = `"${String(o[2] || '').replace(/<[^>]+>/g, ' ').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    const optD = `"${String(o[3] || '').replace(/<[^>]+>/g, ' ').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    
    const a = doc.a !== undefined ? doc.a : 0;
    
    writeStream.write(`${s},${q},${optA},${optB},${optC},${optD},${a}\n`);
    count++;
    
    if (count % 25000 === 0) {
       console.log(`>> Exported ${count} questions to CSV...`);
    }
  }
  
  writeStream.end();
  console.log(`\n✅ EXPORT COMPLETE! Successfully dumped ${count} questions.`);
  console.log(`📁 File saved at: ${outPath}`);
  process.exit(0);
}
run().catch(console.error);
