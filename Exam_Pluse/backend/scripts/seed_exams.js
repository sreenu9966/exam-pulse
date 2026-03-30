const mongoose = require('mongoose');
const ExamConfig = require('./models/ExamConfig');
const ExamConfigsStatic = require('./config/ExamConfigs');

const uri = 'mongodb+srv://jspractice9_db_user:TCSNQTCODE2026@cluster0.0uw0bx3.mongodb.net/tcsnqt2026?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri).then(async () => {
    let count = 0;
    for (const [key, config] of Object.entries(ExamConfigsStatic)) {
      const existing = await ExamConfig.findOne({ key });
      if (!existing) {
        await ExamConfig.create({
          key,
          title: config.title,
          category: config.category,
          duration: config.duration || 60,
          instructions: "Standard Exam Rules apply. Each correct answer loads points score consecutives offsets.",
          sections: config.sections || []
        });
        count++;
      }
    }
    console.log(`Successfully seeded ${count} exams.`);
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
