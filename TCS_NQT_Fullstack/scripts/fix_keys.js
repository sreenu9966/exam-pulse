const fs = require('fs');
const path = require('path');

const filePaths = [
  'f:\\TCS_NQT_2026\\TCS_NQT_Fullstack\\client\\src\\admin\\AdminDashboard.jsx',
  'f:\\TCS_NQT_2026\\TCS_NQT_Fullstack\\client\\src\\pages\\HomePage.jsx'
];

filePaths.forEach(f => {
  let content = fs.readFileSync(f, 'utf-8');
  // Simple regex to find option key={cat} and replace with key={`${cat}-${i}`} is dangerous without proper AST.
  // We can just log the exact matches, or replace carefully where we know string maps exist.
  console.log(`Scanning ${path.basename(f)}`);
});
console.log("AST processing could be better but simple regex might break things. I will log loop places.");
