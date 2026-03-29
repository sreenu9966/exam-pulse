/**
 * Database Cleanup Script: Deduplication & Formatting Refinement
 * This script identifies identical questions and cleans up extra "enters" or whitespace.
 * 
 * Usage: node backend/scripts/cleanup_questions.js [--apply]
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Question = require('../models/Question');

const BATCH_SIZE = 500;
const APPLY_CHANGES = process.argv.includes('--apply');

async function cleanup() {
  try {
    console.log(`Connecting to: ${process.env.MONGO_URI}`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.\n');

    if (!APPLY_CHANGES) {
      console.log('--- DRY RUN MODE: No changes will be saved. Use --apply to execute. ---');
    }

    // 1. Identify Duplicates (Same Question Text AND Same Options)
    console.log('Searching for duplicates...');
    const duplicates = await Question.aggregate([
      {
        $group: {
          _id: { q: "$q", o: "$o" }, // Match Question Text and Options Array
          count: { $sum: 1 },
          ids: { $push: "$_id" }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    let totalDeleted = 0;
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} sets of duplicate questions.`);
      for (const group of duplicates) {
        const [original, ...extras] = group.ids;
        if (APPLY_CHANGES) {
          await Question.deleteMany({ _id: { $in: extras } });
          totalDeleted += extras.length;
        } else {
          console.log(`[DRY RUN] Would delete ${extras.length} duplicates for question starting with: "${group._id.q.substring(0, 30)}..."`);
        }
      }
    } else {
      console.log('No duplicates found.');
    }

    // 2. Clean Formatting ("No Enters" and Trim Whitespace)
    console.log('\nCleaning formatting for all questions...');
    let processedCount = 0;
    let modifiedCount = 0;
    const totalCount = await Question.countDocuments();

    const cursor = Question.find().cursor();

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      let isModified = false;

      // Clean Question Text: Trim and collapse multiple newlines -> Single newline
      const cleanQ = doc.q.trim().replace(/\n{2,}/g, '\n').replace(/[ \t]{2,}/g, ' ');
      if (cleanQ !== doc.q) {
        doc.q = cleanQ;
        isModified = true;
      }

      // Clean Options
      const cleanO = doc.o.map(opt => opt.trim().replace(/\s+/g, ' '));
      if (JSON.stringify(cleanO) !== JSON.stringify(doc.o)) {
        doc.o = cleanO;
        isModified = true;
      }

      // Clean Answer
      const cleanA = doc.a.trim();
      if (cleanA !== doc.a) {
        doc.a = cleanA;
        isModified = true;
      }

      if (isModified) {
        modifiedCount++;
        if (APPLY_CHANGES) {
          await doc.save();
        }
      }

      processedCount++;
      if (processedCount % BATCH_SIZE === 0) {
        console.log(`Processed ${processedCount}/${totalCount}... (${modifiedCount} found for cleaning)`);
      }
    }

    console.log('\n--- CLEANUP COMPLETE ---');
    console.log(`Total Sets of Duplicates Removed: ${totalDeleted}`);
    console.log(`Total Questions Formatted: ${modifiedCount}`);
    
    if (APPLY_CHANGES) {
      console.log('All changes have been committed to the database.');
    } else {
      console.log('No changes were made. Use --apply to execute the cleanup.');
    }

    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR DURING CLEANUP:', err);
    process.exit(1);
  }
}

cleanup();
