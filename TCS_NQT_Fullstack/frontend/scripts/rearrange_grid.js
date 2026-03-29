const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'admin', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// We need to extract the 5 components:
// 1. Question Bank Distribution
// 2. Student Strengths Matrix
// 3. Daily Registrations
// 4. Plan Subscriptions
// 5. Top Popular Exams

function extractBlock(startMarker, endMarkerRegex) {
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return null;
    const rest = content.slice(startIndex);
    const match = rest.match(endMarkerRegex);
    if (!match) return null;
    const block = content.slice(startIndex, startIndex + match.index + match[0].length);
    // Erase it from original content
    content = content.replace(block, '');
    return block;
}

const qBankDist = extractBlock('{/* Category Distribution */}', /<\/div>\s*<\/div>\s*<\/div>/);
const studentMatrix = extractBlock('{/* Skills (Radar) */}', /<\/div>\s*<\/div>/);
const dailyReg = extractBlock('{/* Daily Traffic (Bar) */}', /<\/div>\s*<\/div>/);
const planSubs = extractBlock('{/* Application Status (Donut) */}', /<\/div>\s*<\/div>/);
const topExams = extractBlock('{/* Top Popular Exams */}', /<\/div>\s*<\/div>\s*<\/div>/);

if (!qBankDist || !studentMatrix || !dailyReg || !planSubs || !topExams) {
    console.log("Could not find all blocks:");
    console.log({
        qBankDist: !!qBankDist,
        studentMatrix: !!studentMatrix,
        dailyReg: !!dailyReg,
        planSubs: !!planSubs,
        topExams: !!topExams
    });
    process.exit(1);
}

// Now inject them into the respective columns
// Target right after {/* ── LEFT COLUMN ── */}
// <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

const leftColumnMarker = "{/* ── LEFT COLUMN ── */}\n                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>";
const rightColumnMarker = "{/* ── RIGHT COLUMN ── */}\n                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>\n                  {/* Top Right Header Card */}\n                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', paddingBottom: '24px' }}>\n                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>\n                      <span>System Status</span>\n                      <span>{new Date().toISOString().split('T')[0]}</span>\n                    </div>\n                    <div style={{ borderLeft: '4px solid #0ea5e9', paddingLeft: '12px', marginTop: '12px' }}>\n                      <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Operations Control</div>\n                      <div style={{ fontSize: '16px', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.5px' }}>TCS NQT 2026<br/>Live Database</div>\n                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>Interface: Admin Console</div>\n                    </div>\n                  </div>";

// Left side gets: Plan Subs, Top Exams, Q Bank Dist, Student Matrix
const newLeft = leftColumnMarker + "\n" + planSubs + "\n" + topExams + "\n" + qBankDist + "\n" + studentMatrix;

// Right side gets: Header card, Daily Traffic
const newRight = rightColumnMarker + "\n" + dailyReg;

content = content.replace(leftColumnMarker, newLeft);
content = content.replace(rightColumnMarker, newRight);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Dashboard layout rearranged successfully.");
