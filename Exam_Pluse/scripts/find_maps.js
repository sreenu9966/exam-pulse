const fs = require('fs');
const path = require('path');

const dir = 'f:\\TCS_NQT_2026\\TCS_NQT_Fullstack\\client\\src';

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('.map')) {
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      if (line.includes('.map') || line.includes('key=')) {
        console.log(`[${path.basename(filePath)}:${i+1}] ${line.trim()}`);
      }
    });
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (file.endsWith('.jsx') || file.endsWith('.js')) scanFile(full);
  });
}

walk(dir);
