const mongoose = require('mongoose');
const ExamConfigs = require('./config/ExamConfigs');
const Question = require('./models/Question');

async function main() {
  const mongoUri = 'mongodb+srv://jspractice9_db_user:TCSNQTCODE2026@cluster0.0uw0bx3.mongodb.net/tcsnqt2026?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(mongoUri);

  console.log("--- Testing Template configs mapping ---");
  const config = ExamConfigs["SSC_CGL"];
  console.log("SSC CGL Sections:", config.sections.map(s => s.name));

  console.log("\n--- Running Aggregate for first section ---");
  const section = config.sections[0]; // Quant
  const sampled = await Question.aggregate([
    { $match: { s: { $in: section.topics } } },
    { $sample: { size: section.count } }
  ]);

  console.log(`Fetched ${sampled.length} items for ${section.name}`);
  if (sampled.length > 0) {
    console.log("Example:", { q: sampled[0].q, s: sampled[0].s });
  }

  await mongoose.disconnect();
}

main().catch(console.error);
