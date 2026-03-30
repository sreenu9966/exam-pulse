const ExamConfigs = {
  // CENTRAL
  SSC_CGL: {
    title: "SSC CGL (Tier-1)",
    category: "Central",
    duration: 60,
    sections: [
      { name: "Quantitative Aptitude", topics: ["Percentages", "Profit and Loss", "Ratios, Proportion, and Averages", "Speed Time and Distance", "Work and Time", "P&C", "Probability", "Equations", "Divisibility", "Geometry"], count: 25 },
      { name: "General Intelligence & Reasoning", topics: ["Number Series", "Odd Man Out", "Seating Arrangement", "Syllogism", "Mathematical Operations", "Statement & Conclusion"], count: 25 },
      { name: "English Comprehension", topics: ["Fill in the Blanks", "Idioms & Phrases", "Prepositions", "Reading Comprehension", "Synonyms", "Spelling Test", "Spotting Errors"], count: 25 },
      { name: "General Awareness", topics: ["General Awareness", "GK", "History", "Economy", "Polity"], count: 25 }
    ]
  },
  SSC_CHSL: {
    title: "SSC CHSL (Tier-1)",
    category: "Central",
    duration: 60,
    sections: [
      { name: "Quantitative Aptitude", topics: ["Percentages", "Profit and Loss", "Ratios", "Work and Time", "Divisibility"], count: 25 },
      { name: "General Intelligence", topics: ["Number Series", "Odd Man Out", "Syllogism", "Mathematical Operations"], count: 25 },
      { name: "English Language", topics: ["Fill in the Blanks", "Prepositions", "Synonyms", "Spelling Test"], count: 25 },
      { name: "General Awareness", topics: ["GK", "Polity", "History"], count: 25 }
    ]
  },
  IBPS_PO: {
    title: "IBPS PO (Prelims)",
    category: "Central",
    duration: 60,
    sections: [
      { name: "Quantitative Aptitude", topics: ["Percentages", "Probability", "P&C", "Equations", "Ratios, Proportion, and Averages"], count: 35 },
      { name: "Reasoning Ability", topics: ["Seating Arrangement", "Syllogism", "Number Series", "Statement & Conclusion"], count: 35 },
      { name: "English Language", topics: ["Reading Comprehension", "Fill in the Blanks", "Para Jumbles", "Spotting Errors", "Sentence Completion"], count: 30 }
    ]
  },
  SBI_PO: {
    title: "SBI PO (Prelims)",
    category: "Central",
    duration: 60,
    sections: [
      { name: "Quantitative Aptitude", topics: ["Percentages", "Probability", "P&C", "Ratios"], count: 35 },
      { name: "Reasoning Ability", topics: ["Seating Arrangement", "Syllogism", "Number Series"], count: 35 },
      { name: "English Language", topics: ["Reading Comprehension", "Fill in the Blanks", "Synonyms", "Spotting Errors"], count: 30 }
    ]
  },
  RRB_NTPC: {
    title: "RRB NTPC (CBT 1)",
    category: "Central",
    duration: 90,
    sections: [
      { name: "Mathematics", topics: ["Divisibility", "Geometry", "Percentages", "Speed Time and Distance", "Ratios"], count: 30 },
      { name: "General Intelligence", topics: ["Number Series", "Odd Man Out", "Mathematical Operations", "Syllogism"], count: 30 },
      { name: "General Awareness", topics: ["GK", "General Awareness"], count: 40 }
    ]
  },

  // STATE
  APPSC_GROUP2: {
    title: "APPSC Group 2 (Prelims)",
    category: "State",
    duration: 150,
    sections: [
      { name: "Mental Ability", topics: ["Percentages", "Ratios, Proportion, and Averages", "Number Series", "Statement & Conclusion"], count: 30 },
      { name: "General Mental Ability", topics: ["Mathematical Operations", "Syllogism"], count: 30 },
      { name: "General Science & Technology", topics: ["Science", "Tech"], count: 30 },
      { name: "General Knowledge & Current Affairs", topics: ["GK", "Current Affairs"], count: 60 }
    ]
  },
  APPSC_GROUP1: {
    title: "APPSC Group 1 (Prelims)",
    category: "State",
    duration: 120,
    sections: [
      { name: "General Studies", topics: ["History", "Polity", "Economy", "GK"], count: 60 },
      { name: "General Mental Ability", topics: ["Percentages", "Speed Time and Distance", "Syllogism", "Number Series"], count: 60 }
    ]
  },
  AP_POLICE_CONSTABLE: {
    title: "AP Police Constable",
    category: "State",
    duration: 180,
    sections: [
      { name: "Arithmetic & Mental Ability", topics: ["Percentages", "Divisibility", "Number Series", "Odd Man Out", "Statement & Conclusion"], count: 100 },
      { name: "General Studies", topics: ["Polity", "History", "Economy", "GK", "General Awareness"], count: 100 }
    ]
  },

  // IT
  TCS_NQT: {
    title: "TCS NQT",
    category: "IT",
    duration: 90,
    sections: [
      { name: "Numerical Ability", topics: ["Percentages", "Profit and Loss", "Ratios, Proportion, and Averages", "Speed Time and Distance", "Work and Time", "Divisibility", "Equations"], count: 26 },
      { name: "Verbal Ability", topics: ["Reading Comprehension", "Synonyms", "Fill in the Blanks", "Idioms & Phrases", "Prepositions", "Spotting Errors"], count: 24 },
      { name: "Reasoning Ability", topics: ["Number Series", "Odd Man Out", "Seating Arrangement", "Syllogism", "Statement & Conclusion"], count: 30 },
      { name: "Technical Concepts", topics: ["SQL Queries", "JavaScript Basics", "Recursion", "Data Structures", "Pointers", "HTML and CSS", "REST APIs", "OSI Model"], count: 12 }
    ]
  },
  INFOSYS: {
    title: "Infosys Assessment",
    category: "IT",
    duration: 100,
    sections: [
      { name: "Mathematical Ability", topics: ["Percentages", "Probability", "Ratios, Proportion, and Averages"], count: 10 },
      { name: "Analytical Reasoning", topics: ["Odd Man Out", "Seating Arrangement", "Syllogism"], count: 15 },
      { name: "Verbal Ability", topics: ["Reading Comprehension", "Synonyms", "Spotting Errors"], count: 20 },
      { name: "Pseudo Code / Tech", topics: ["Recursion", "Data Structures", "Pointers"], count: 10 }
    ]
  },
  ACCENTURE: {
    title: "Accenture Assessment",
    category: "IT",
    duration: 90,
    sections: [
      { name: "Cognitive Ability", topics: ["Number Series", "Reading Comprehension", "Synonyms", "Percentages", "Ratios"], count: 50 },
      { name: "Technical Assessment", topics: ["SQL Queries", "HTML and CSS", "REST APIs", "Pointers", "Recursion"], count: 40 }
    ]
  },
  WIPRO: {
    title: "Wipro (Elite NTH)",
    category: "IT",
    duration: 60,
    sections: [
      { name: "Quantitative Ability", topics: ["Percentages", "Equations", "Ratios"], count: 16 },
      { name: "Logical Reasoning", topics: ["Syllogism", "Number Series", "Odd Man Out"], count: 14 },
      { name: "Verbal Ability", topics: ["Fill in the Blanks", "Synonyms", "Spotting Errors"], count: 18 }
    ]
  }
};

module.exports = ExamConfigs;
