const fs = require("fs");
const path = "c:\\Users\\C H SREENU\\EXAM_PLUSE\\exam-pulse\\Exam_Pluse\\frontend\\src\\features\\admin\\AdminDashboard.jsx";
let content = fs.readFileSync(path, "utf8");

// Update PINS button labeling and add CLEAR button
// We look for the button with openManualSelection and replace it
const pinBtnRegex = /<button\s+onClick=\{\(\)\s+=>\s+openManualSelection\(sec\.name,\s+top\.name\)\}\s+style=\{\{\s+background:\s+"rgba\(0,\s+245,\s+212,\s+0\.08\)",\s+color:\s+"var\(--accent\)",\s+border:\s+"1px\s+solid\s+rgba\(0,\s+245,\s+212,\s+0\.2\)",\s+padding:\s+"8px\s+16px",\s+borderRadius:\s+"10px",\s+fontSize:\s+"11px",\s+fontWeight:\s+800,\s+cursor:\s+"pointer"\s+\}\}\s+>\s+PINS\s+<\/button>/g;

// Since regex is hard with exact formatting, let's use a simpler match for the critical parts
const searchStr = `onClick={() => openManualSelection(sec.name, top.name)}`;
const targetStyle = `padding: "8px 16px"`;

// We'll replace the padding first to make it shorter
content = content.split(targetStyle).join(`padding: "8px 12px"`);

// Replace PINS with emoji
content = content.replace(/>PINS<\/button>/g, `>📍 PINS</button>`);

// Add CLEAR button after the PINS button
// We look for the end of the PINS button and inject the CLEAR button block
content = content.split(`📍 PINS</button>`).join(`📍 PINS</button>\n                                                        {manualCount > 0 && (\n                                                          <button \n                                                            onClick={() => clearManualPins(sec.name, top.name)}\n                                                            title="Clear Manual Selection"\n                                                            style={{ background: "rgba(255, 255, 255, 0.05)", color: "var(--muted)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "8px", borderRadius: "10px", cursor: "pointer", marginLeft: "4px" }}\n                                                          >\n                                                            🧼 CLEAR\n                                                          </button>\n                                                        )}`);

fs.writeFileSync(path, content, "utf8");
console.log("Admin Dashboard UI Fixed! 🚀");
