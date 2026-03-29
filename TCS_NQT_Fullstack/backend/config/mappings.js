/**
 * Centralized Topic-to-Section Mapping
 * Single source of truth for automatic categorization.
 */

const CATEGORY_MAP = {
  'Aptitude': [
    'Numbers', 'Problems on Numbers', 'Decimal Fraction', 'Simplification', 
    'Square Root and Cube Root', 'Surds and Indices', 'Problems on H.C.F and L.C.M', 
    'Divisibility', 'Equations', 'Percentages', 'Percentage', 'Profit and Loss', 
    'Simple Interest', 'Compound Interest', 'True Discount', 'Banker\'s Discount', 
    'Ratio and Proportion', 'Average', 'Averages', 'Ages', 'Problems on Ages', 
    'Partnership', 'Alligation or Mixture', 'Allegations and Mixtures',
    'Time and Work', 'Work and Time', 'Pipes and Cistern', 'Chain Rule', 
    'Speed Time and Distance', 'Time and Distance', 'Problems on Trains', 
    'Boats and Streams', 'Races and Games', 'Area', 'Areas, Shapes & Perimeter', 
    'Volume and Surface Area', 'Geometry', 'Height and Distance',
    'Calendar', 'Calendar & Clock', 'Clock', 'Clocks & Calendar', 'Logarithm', 
    'Permutation and Combination', 'P&C', 'Probability', 'Stocks and Shares', 
    'Arrangements and Series', 'Ratios, Proportion, and Averages', 
    'Number System, LCM & HCF', 'Series and Progressions', 
    'Numbers & Decimal Fractions', 'P&C (Permutations & Combinations)', 
    'Quantitative Aptitude'
  ],
  'Reasoning': [
    'Number Series', 'Analogy', 'Odd Man Out', 'Odd Man Out and Series', 
    'Coding-Decoding', 'Mathematical Operations', 'Symbols and Notations',
    'Blood Relations', 'Direction Sense', 'Distance and Directions', 
    'Classification', 'Data Sufficiency', 'Seating Arrangement', 'Syllogism', 
    'Statement & Conclusion', 'Statement and Conclusion', 'Data Interpretation', 
    'Logical Sequence', 'Logical Reasoning'
  ],
  'Verbal': [
    'Spelling Test', 'Synonyms', 'Antonyms', 'Prepositions', 'Spotting Errors', 
    'Active and Passive Voice', 'Idioms & Phrases', 'Idioms and Phrases', 
    'Fill in the Blanks', 'Sentence Completion', 'Para Jumbles', 
    'Passage Completion', 'Cloze Test', 'Reading Comprehension', 
    'Sentence Improvement', 'Sentence Arrangement', 'Verbal Ability'
  ],
  'Technical': [
    'Data Types', 'Variables and Registers', 'Pointers', 'Recursion', 
    'HTML and CSS', 'JavaScript Basics', 'Searching Algorithms', 
    'Stacks and Queues', 'Trees and Graphs', 'Hashing', 'Process Scheduling', 
    'Memory Management', 'Deadlock', 'File Systems', 'SQL Queries', 
    'Normalization', 'Transactions', 'OSI Model', 'IP Addressing', 
    'Network Protocols', 'Network Security', 'REST APIs', 'Cloud Service Models',
    'Functions and Scope', 'Iteration', 'Inbuilt Libraries', 
    'Call by Value/Reference', 'Input-Output (C)', 'Joins and Relationships', 
    'DDL and DML Commands', 'DNS and HTTP', 'Subnetting', 'Semaphores', 
    'Arrays and Strings', 'Linked Lists', 'Sorting Algorithms', 
    'Greedy Algorithms', 'Dynamic Programming', 'Complexity Analysis', 
    'Number Systems', 'Boolean Logic', 'Computer Architecture', 
    'Input-Output Devices', 'Memory Hierarchy', 'SDLC Models', 
    'Software Testing', 'Design Patterns', 'Agile Methodology', 
    'HTTP Methods', 'Virtualization', 'Cloud Storage', 'Encryption', 
    'Authentication', 'Machine Learning Basics', 'Neural Networks', 
    'Data Preprocessing', 'Keys and Constraints', 'Algorithms', 
    'Computer Fundamentals', 'Cybersecurity', 'Data Structures', 
    'Database Management', 'Networking', 'Operating Systems', 
    'Programming Concepts', 'Software Engineering', 'Web Technologies'
  ]
};

// Helper to get section for a given topic
function getSectionForTopic(topic) {
  for (const [section, topics] of Object.entries(CATEGORY_MAP)) {
    if (topics.includes(topic)) return section;
  }
  return 'Other';
}

module.exports = { 
  CATEGORY_MAP,
  getMasterMapping: async (QuestionModel, ConfigModel) => {
    // Start with the base static mapping
    const master = JSON.parse(JSON.stringify(CATEGORY_MAP));
    
    // Fetch disabled topics from global config
    let disabledTopics = [];
    if (ConfigModel) {
      const config = await ConfigModel.findOne({ key: 'disabledTopics' });
      if (config && Array.isArray(config.value)) {
        disabledTopics = config.value;
      }
    }

    // Discover all unique topics (s) and their assigned sections
    const discovered = await QuestionModel.aggregate([
      { $group: { _id: "$s", section: { $first: "$section" } } }
    ]);
    
    // Merge discovered topics into the master map
    discovered.forEach(d => {
      if (d._id && d.section) {
        if (!master[d.section]) master[d.section] = []; // Dynamically create section if missing
        if (!master[d.section].includes(d._id)) {
          master[d.section].push(d._id);
        }
      }
    });

    // Final Global Clean: Remove disabled topics from all sections
    if (disabledTopics.length > 0) {
      for (const section in master) {
        master[section] = master[section].filter(t => !disabledTopics.includes(t));
      }
    }
    
    return master;
  },
  getSectionForTopic
};
