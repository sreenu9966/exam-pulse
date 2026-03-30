const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const exportDir = path.join(__dirname, '..', 'data_exports', 'audit_files');

// Define Schema manually to avoid loading other models
const questionSchema = new mongoose.Schema({
  s: String,
  section: String,
  q: String,
  o: [String],
  a: String
});
const Question = mongoose.model('QuestionAudit', questionSchema, 'questions');

async function exportQuestions() {
  console.log('🚀 Starting Question Export (Audit Mode)...');
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create export directory
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
      console.log(`📁 Created directory: ${exportDir}`);
    }

    const categories = ['Aptitude', 'Reasoning', 'Verbal', 'Technical', 'Uncategorized'];
    const data = {
      'Aptitude': [],
      'Reasoning': [],
      'Verbal': [],
      'Technical': [],
      'Uncategorized': []
    };

    let count = 0;
    console.log('⏳ Fetching questions (this may take a minute for 155k+ records)...');

    const cursor = Question.find().cursor();
    
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      const section = doc.section || 'Uncategorized';
      const target = data[section] ? section : 'Uncategorized';
      
      data[target].push({
        id: doc._id,
        topic: doc.s,
        question: doc.q,
        options: doc.o,
        answer: doc.a
      });

      count++;
      if (count % 10000 === 0) {
        console.log(`📦 Processed ${count} questions...`);
      }
    }

    console.log(`✅ Total Questions Processed: ${count}`);
    console.log('💾 Writing files to disk...');

    for (const [category, questions] of Object.entries(data)) {
      if (questions.length === 0) continue;
      
      const fileName = `${category}.json`;
      const filePath = path.join(exportDir, fileName);
      
      fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
      console.log(`📄 Created ${fileName} (${questions.length} questions)`);
    }

    console.log('\n✨ EXPORT COMPLETE!');
    console.log(`📂 Find your files in: ${exportDir}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Export Failed:', err);
    process.exit(1);
  }
}

exportQuestions();
