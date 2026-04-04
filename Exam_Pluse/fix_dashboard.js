const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'features', 'admin', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Pattern: Premature closure followed by misplaced checkbox div
// We look for the closing of the empty state div, then the premature ternary close,
// then the starting of the misplaced checkbox div.
const pattern = /<\/div>\s*\}\)\}\s*<div style=\{\{ width: \"40px\", display: \"flex\", justifyContent: \"center\" \}\}>\s*<input[^>]*\/>\s*<\/div>\s*<div\s*key=\{u\._id\}/g;

const replacement = `</div>
                    ) : (users || []).map((u, i) => (
                      <div 
                        key={u._id}`;

// Alternative approach if regex is too strict - direct string replace around the junction
const corruptedJunction = '</div>\n                   })}\n                          <div style={{ width: "40px", display: "flex", justifyContent: "center" }}>';
if (content.includes(corruptedJunction)) {
    console.log("Found corrupted junction via exact string. Replacing...");
    content = content.split(corruptedJunction).join('</div>\n                    ) : (users || []).map((u, i) => (\n                      <div ');
} else {
    console.log("Exact match failed. Attempting fuzzy regex...");
    // Just find the specific sequence of characters regardless of whitespace
    const fuzzyPattern = /<\/div>\s*\}\)\}\s*<div style=\{\{ width: \"40px\"/g;
    content = content.replace(fuzzyPattern, '</div>\n                    ) : (users || []).map((u, i) => (\n                      <div ');
}

// Final safety check: ensure we don't have dangling u._id or i references
content = content.replace(/<div\s+key=\{u\._id\}/g, '<div\n                        key={u._id}');

fs.writeFileSync(filePath, content);
console.log("Restoration attempt complete. Check AdminDashboard.jsx for syntax balance.");
