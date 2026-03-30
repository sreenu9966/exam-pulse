/**
 * Question Audit Report Generator
 * Scans the database for duplicates and formatting issues and generates an HTML report.
 */

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Question = require('../models/Question');

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);

    // 1. Find Sample Duplicates
    console.log('Fetching sample duplicates...');
    const duplicates = await Question.aggregate([
      {
        $group: {
          _id: { q: "$q", o: "$o" },
          count: { $sum: 1 },
          ids: { $push: "$_id" }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $limit: 100 } // Sample 100 duplicate sets
    ]);

    // 2. Find Sample Formatting Issues (Extra enters and spaces)
    console.log('Fetching sample formatting issues...');
    const formattingIssues = [];
    const cursor = Question.find().cursor();
    
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      const cleanQ = doc.q.trim().replace(/\n{2,}/g, '\n');
      if (cleanQ !== doc.q && formattingIssues.length < 100) {
        formattingIssues.push({
          id: doc._id,
          topic: doc.s,
          old: doc.q,
          new: cleanQ
        });
      }
      if (formattingIssues.length >= 100) break;
    }

    // 3. Generate HTML
    console.log('Generating Audit_Report.html...');
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Question Bank Audit Report - TCS NQT 2026</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0f172a;
            --surface: #1e293b;
            --accent: #00f5d4;
            --danger: #ef4444;
            --text: #f8fafc;
        }
        body { 
            background: var(--bg); 
            color: var(--text); 
            font-family: 'Outfit', sans-serif; 
            padding: 40px; 
            line-height: 1.6;
        }
        .header { 
            text-align: center; 
            margin-bottom: 60px; 
            border-bottom: 1px solid rgba(255,255,255,0.1); 
            padding-bottom: 30px; 
        }
        h1 { font-size: 42px; font-weight: 800; color: var(--accent); margin: 0; }
        .stats { 
            display: flex; gap: 20px; justify-content: center; margin-top: 20px; 
        }
        .stat-card { 
            background: var(--surface); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); 
            min-width: 150px; text-align: center;
        }
        .section-title { font-size: 24px; font-weight: 800; color: #fff; margin: 40px 0 20px; border-left: 4px solid var(--accent); padding-left: 15px; }
        table { width: 100%; border-collapse: collapse; background: var(--surface); border-radius: 12px; overflow: hidden; margin-bottom: 40px; }
        th, td { padding: 20px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }
        th { background: rgba(0,245,212,0.05); color: var(--accent); font-weight: 800; }
        .diff { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .old { background: rgba(239, 68, 68, 0.1); padding: 10px; border-radius: 6px; color: #fda4af; font-family: 'JetBrains Mono', monospace; font-size: 13px; white-space: pre-wrap; }
        .new { background: rgba(0, 245, 212, 0.1); padding: 10px; border-radius: 6px; color: #99f6e4; font-family: 'JetBrains Mono', monospace; font-size: 13px; white-space: pre-wrap; }
        .tag { font-size: 11px; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.1); text-transform: uppercase; margin-bottom: 10px; display: inline-block; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Audit Report: Question Bank Integrity</h1>
        <p>Representative sample of database cleanup (Total Questions: 155,000+)</p>
        <div class="stats">
            <div class="stat-card">
                <div style="font-size: 12px; color: var(--accent);">DUPLICATE SETS</div>
                <div style="font-size: 24px; font-weight: 800;">${duplicates.length}</div>
            </div>
            <div class="stat-card">
                <div style="font-size: 12px; color: var(--accent);">FORMATTING ISSUES</div>
                <div style="font-size: 24px; font-weight: 800;">${formattingIssues.length}</div>
            </div>
        </div>
    </div>

    <div class="section-title">📦 Duplicate Removal Samples</div>
    <table>
        <thead>
            <tr>
                <th>Topic</th>
                <th>Duplicated Question (Sample Text)</th>
                <th>Duplicates to Delete</th>
            </tr>
        </thead>
        <tbody>
            ${duplicates.map(d => `
                <tr>
                    <td><span class="tag">${d.ids[0]}</span></td>
                    <td style="font-size: 14px; max-width: 500px;">${d._id.q}</td>
                    <td style="color: var(--danger); font-weight: 800;">${d.count - 1} copies</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="section-title">🧹 Formatting Refinement Samples ("No Enters")</div>
    <table>
        <thead>
            <tr>
                <th>Change Overview</th>
            </tr>
        </thead>
        <tbody>
            ${formattingIssues.map(i => `
                <tr>
                    <td>
                        <div class="tag">${i.topic}</div>
                        <div class="diff">
                            <div>
                                <div style="font-size: 11px; margin-bottom: 5px; opacity: 0.5;">ORIGINAL (WITH "ENTERS")</div>
                                <div class="old">${i.old}</div>
                            </div>
                            <div>
                                <div style="font-size: 11px; margin-bottom: 5px; opacity: 0.5;">CLEANED (NO EXTRA ENTERS)</div>
                                <div class="new">${i.new}</div>
                            </div>
                        </div>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div style="text-align: center; color: var(--accent); margin-top: 60px; font-size: 12px; opacity: 0.5;">
        &copy; 2026 TCS NQT Fullstack - System Integrity Audit
    </div>
</body>
</html>
    `;

    fs.writeFileSync('./Audit_Report.html', html);
    console.log('Audit_Report.html has been generated successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
