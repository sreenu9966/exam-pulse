require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

const CATEGORY_MAP = {
  Aptitude: ['Number System, LCM & HCF', 'Percentages', 'Profit and Loss', 'Speed Time and Distance', 'Work and Time', 'Ratios, Proportion, and Averages', 'Probability', 'P&C', 'Geometry', 'Clocks & Calendar', 'Equations', 'Divisibility', 'Areas, Shapes & Perimeter', 'Averages', 'Arrangements and Series', 'Calendar & Clock', 'Ages', 'Allegations and Mixtures', 'P&C (Permutations & Combinations)', 'Series and Progressions', 'Numbers & Decimal Fractions'],
  Reasoning: ['Number Series', 'Coding-Decoding', 'Blood Relations', 'Distance and Directions', 'Seating Arrangement', 'Statement and Conclusion', 'Analogy', 'Odd Man Out', 'Data Sufficiency', 'Mathematical Operations', 'Symbols and Notations', 'Meaningful Word Creation', 'Syllogism', 'Direction Sense', 'Statement & Conclusion', 'Classification', 'Logical Sequence', 'Data Interpretation'],
  Verbal: ['Synonyms', 'Antonyms', 'Sentence Completion', 'Spotting Errors', 'Fill in the Blanks', 'Active and Passive Voice', 'Idioms and Phrases', 'Prepositions', 'Spelling Test', 'Sentence Improvement', 'Passage Completion', 'Sentence Arrangement', 'Reading Comprehension', 'Para Jumbles', 'Cloze Test', 'Idioms & Phrases'],
  Technical: ['Data Types', 'Functions and Scope', 'Pointers', 'Iteration', 'Recursion', 'Inbuilt Libraries', 'Call by Value/Reference', 'Variables and Registers', 'Input-Output (C)', 'SQL Queries', 'Normalization', 'Joins and Relationships', 'Transactions', 'DDL and DML Commands', 'IP Addressing', 'OSI Model', 'Network Protocols', 'Process Scheduling', 'Memory Management', 'Deadlock', 'File Systems', 'Arrays and Strings', 'Linked Lists', 'Stacks and Queues', 'Trees and Graphs', 'Hashing', 'Sorting Algorithms', 'Searching Algorithms', 'Complexity Analysis', 'Number Systems', 'Boolean Logic', 'Computer Architecture', 'Memory Hierarchy', 'HTML and CSS', 'JavaScript Basics', 'REST APIs', 'SDLC Models', 'Software Testing', 'Design Patterns', 'Agile Methodology', 'Cloud Service Models', 'Encryption', 'Network Security', 'Authentication', 'Machine Learning Basics', 'Neural Networks', 'Data Preprocessing', 'Greedy Algorithms', 'Dynamic Programming', 'Keys and Constraints', 'Semaphores', 'Subnetting', 'DNS and HTTP', 'Input-Output Devices', 'HTTP Methods']
};

async function findOrphanTopics() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const dbTopics = await Question.distinct('s');
        const mappedTopics = new Set(Object.values(CATEGORY_MAP).flat());
        
        console.log('--- Orphan Topics (In DB but NOT in Mapped Topics) ---');
        const orphans = [];
        for (const topic of dbTopics) {
            if (!mappedTopics.has(topic)) {
                const count = await Question.countDocuments({ s: topic });
                console.log(`Topic: "${topic}", Count: ${count}`);
                orphans.push({ topic, count });
            }
        }
        
        console.log('\n--- Mapped Topics Missing from DB ---');
        for (const topic of mappedTopics) {
            if (!dbTopics.includes(topic)) {
                // console.log(`Topic: "${topic}"`);
            }
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

findOrphanTopics();
