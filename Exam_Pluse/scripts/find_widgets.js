const fs = require('fs');

const f = 'f:\\TCS_NQT_2026\\TCS_NQT_Fullstack\\client\\src\\admin\\AdminDashboard.jsx';
const content = fs.readFileSync(f, 'utf-8');

const match = content.match(/const renderWidget = \((.*?)\) => {([\s\S]*?)}/);
if (match) {
  console.log("Found renderWidget:");
  const body = match[2];
  const cases = body.match(/case ['"](.*?)['"]/g);
  if (cases) {
    console.log(cases.map(c => c.replace(/['"]/g, '')));
  } else {
    console.log("No exact cases found with regex.");
  }
} else {
  console.log("renderWidget not found with regex.");
}
