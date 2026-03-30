require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

const { getMasterMapping } = require('./config/mappings');

async function verifyTotals() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const master = await getMasterMapping(Question);
        
        const stats = await Question.aggregate([
            { $group: { _id: '$s', count: { $sum: 1 } } }
        ]);
        
        const statsMap = Object.fromEntries(stats.map(s => [s._id, s.count]));
        
        console.log('--- Category Totals (Expected in UI) ---');
        let grandTotal = 0;
        for (const [cat, topics] of Object.entries(master)) {
            const catTotal = topics.reduce((acc, t) => acc + (statsMap[t] || 0), 0);
            console.log(`${cat}: ${catTotal}`);
            grandTotal += catTotal;
        }
        
        const totalInDb = await Question.countDocuments();
        console.log(`\nGrand Total Mapped: ${grandTotal}`);
        console.log(`Total in Database: ${totalInDb}`);
        
        if (grandTotal === totalInDb) {
            console.log('\n✅ SUCCESS: All questions are correctly mapped!');
        } else {
            console.log('\n❌ WARNING: Some questions are still outliers!');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

verifyTotals();
