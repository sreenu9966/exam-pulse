const fs = require('fs');

const f = 'f:\\TCS_NQT_2026\\TCS_NQT_Fullstack\\client\src\\admin\\AdminDashboard.jsx';
const content = fs.readFileSync(f, 'utf-8');

const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('case ') && l.includes(':')) {
    console.log(`[${i+1}] ${l.trim()}`);
  }
});
