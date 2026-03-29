const mongoose = require('mongoose');
require('dotenv').config();

// Official TCS NQT Topic mapping by category
const TOPIC_MAP = {
  'Quantitative Aptitude': [
    'Number System, LCM & HCF',
    'Percentages',
    'Profit and Loss',
    'Speed Time and Distance',
    'Work and Time',
    'Ratios, Proportion, and Averages',
    'Probability',
    'P&C',
    'Allegations and Mixtures',
    'Geometry',
    'Clocks & Calendar',
    'Areas, Shapes & Perimeter',
    'Series and Progressions',
    'Equations',
    'Divisibility',
    'Numbers & Decimal Fractions',
    'Ages',
    'Averages',
    'Arrangements and Series'
  ],
  'Logical Reasoning': [
    'Number Series',
    'Coding-Decoding',
    'Blood Relations',
    'Distance and Directions',
    'Seating Arrangement',
    'Statement and Conclusion',
    'Analogy',
    'Odd Man Out',
    'Data Sufficiency',
    'Ages',
    'Symbols and Notations',
    'Mathematical Operations',
    'Meaningful Word Creation'
  ],
  'Verbal Ability': [
    'Synonyms',
    'Antonyms',
    'Sentence Completion',
    'Spotting Errors',
    'Fill in the Blanks',
    'Active and Passive Voice',
    'Idioms and Phrases',
    'Prepositions',
    'Spelling Test',
    'Sentence Improvement',
    'Passage Completion',
    'Sentence Arrangement'
  ],
  'Programming Concepts': [
    'Data Types',
    'Functions and Scope',
    'Pointers',
    'Iteration',
    'Recursion',
    'Inbuilt Libraries',
    'Call by Value/Reference',
    'Variables and Registers',
    'Input-Output (C)'
  ],
  'Database Management': [
    'SQL Queries',
    'Normalization',
    'Joins and Relationships',
    'Keys and Constraints',
    'Transactions',
    'DDL and DML Commands'
  ],
  'Networking': [
    'IP Addressing',
    'OSI Model',
    'Network Protocols',
    'DNS and HTTP',
    'Subnetting'
  ],
  'Operating Systems': [
    'Process Scheduling',
    'Memory Management',
    'Deadlock',
    'Semaphores',
    'File Systems'
  ],
  'Data Structures': [
    'Arrays and Strings',
    'Linked Lists',
    'Stacks and Queues',
    'Trees and Graphs',
    'Hashing'
  ],
  'Algorithms': [
    'Sorting Algorithms',
    'Searching Algorithms',
    'Greedy Algorithms',
    'Dynamic Programming',
    'Complexity Analysis'
  ],
  'Computer Fundamentals': [
    'Number Systems',
    'Boolean Logic',
    'Computer Architecture',
    'Input-Output Devices',
    'Memory Hierarchy'
  ],
  'Software Engineering': [
    'SDLC Models',
    'Software Testing',
    'Design Patterns',
    'Agile Methodology'
  ],
  'Web Technologies': [
    'HTML and CSS',
    'JavaScript Basics',
    'HTTP Methods',
    'REST APIs'
  ],
  'Cloud Computing': [
    'Cloud Service Models',
    'Virtualization',
    'Cloud Storage'
  ],
  'Cybersecurity': [
    'Encryption',
    'Network Security',
    'Authentication'
  ],
  'AI & Machine Learning': [
    'Machine Learning Basics',
    'Neural Networks',
    'Data Preprocessing'
  ],
  'Puzzles & Brain Teasers': [
    'Logical Puzzles',
    'Pattern Recognition',
    'Mathematical Puzzles'
  ]
};

// Flatten into a list: [{oldSection, newTopic}, ...]
const SECTION_TOPICS = [];
for (const [oldSec, topics] of Object.entries(TOPIC_MAP)) {
  topics.forEach(t => SECTION_TOPICS.push({ oldSec, newTopic: t }));
}

// Question schema (mirror from app)
const questionSchema = new mongoose.Schema({
  s: String, q: String, o: [String], a: Number
}, { strict: false });
const Question = mongoose.model('Question', questionSchema);

async function reCategorize() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const questions = await Question.find({});
  console.log(`📋 Found ${questions.length} questions to re-categorize`);

  // Group questions by their current section
  const bySec = {};
  for (const q of questions) {
    const sec = q.s || 'Puzzles & Brain Teasers';
    if (!bySec[sec]) bySec[sec] = [];
    bySec[sec].push(q);
  }

  // For each section, distribute questions across the official sub-topics
  let updated = 0;
  for (const [sec, qs] of Object.entries(bySec)) {
    const topics = TOPIC_MAP[sec] || ['General'];
    for (let i = 0; i < qs.length; i++) {
      const newTopic = topics[i % topics.length];
      await Question.findByIdAndUpdate(qs[i]._id, { s: newTopic });
      updated++;
    }
    console.log(`  ✓ ${sec}: ${qs.length} questions → distributed across ${topics.length} topics`);
  }

  console.log(`\n🎉 Done! Updated ${updated}/${questions.length} questions with official TCS NQT topics.`);
  process.exit(0);
}

reCategorize().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
