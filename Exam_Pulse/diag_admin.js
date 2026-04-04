const fs = require('fs');
const path = 'c:\\Users\\C H SREENU\\EXAM_PLUSE\\exam-pulse\\Exam_Pulse\\frontend\\src\\features\\admin\\AdminDashboard.jsx';

try {
  const content = fs.readFileSync(path, 'utf8');
  const lines = content.split('\n');
  
  console.log("Analyzing AdminDashboard.jsx...");
  
  // Find the 'User Management' view block
  const userViewIdx = lines.findIndex(l => l.includes('{activeView === "users" && ('));
  console.log(`User View Start: Line ${userViewIdx + 1}`);
  
  // Find the 'No Students Found' logic
  const noStudentsIdx = lines.findIndex(l => l.includes('users.length === 0 ? ('));
  console.log(`No Students Ternary Start: Line ${noStudentsIdx + 1}`);

  // Find the 'corrupted' closing tag
  const corruptedIdx = lines.findIndex((l, i) => i > noStudentsIdx && l.includes('})}'));
  console.log(`Corrupted Closing Found at Line ${corruptedIdx + 1}: [${lines[corruptedIdx]?.trim()}]`);

  // Find the orphaned map item div
  const orphanDivIdx = lines.findIndex((l, i) => i > corruptedIdx && l.includes('key={u._id}'));
  console.log(`Orphaned Div 'key={u._id}' Found at Line ${orphanDivIdx + 1}`);

  // Output a small window around the orphan
  if (orphanDivIdx > -1) {
    console.log("\n--- Structural Window ---");
    for (let i = Math.max(0, orphanDivIdx - 10); i < Math.min(lines.length, orphanDivIdx + 10); i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }

} catch (err) {
  console.error("Diagnosis failed:", err.message);
}
